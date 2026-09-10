"""Strict task-board compiler and fenced SQLite execution leases.

Markdown is treated as an authoring format.  Only rows that pass the
validation in this module are eligible for an automated runner.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import socket
import sqlite3
import time
import uuid
from contextlib import closing
from dataclasses import asdict, dataclass, replace
from pathlib import Path, PurePosixPath
from typing import Callable, Iterable, Mapping, Optional, Sequence


SEATS = frozenset({"CRANE", "MASON", "RIVET", "ATLAS", "SCRIBE", "FERRITE", "PI"})
ACTIONABLE_STATES = frozenset({"READY", "CLAIMED", "IN_PROGRESS", "HALFWAY"})
COMPLETE_STATES = frozenset({"DONE", "SUPERSEDED", "ABANDONED"})
_ROW_RE = re.compile(r"^\|\s*(W(?:2)?-\d+[a-z]?)\s*\|", re.IGNORECASE)
_DEP_RE = re.compile(r"\bW(?:2)?-\d+[a-z]?\b", re.IGNORECASE)
_CODE_RE = re.compile(r"`([^`]+)`")
_WILDCARD_RE = re.compile(r"[*?[]")


class BoardCompileError(ValueError):
    def __init__(self, issues: Sequence["RejectedRow"]):
        self.issues = tuple(issues)
        summary = "; ".join(f"line {x.source_line} {x.task_id or '?'}: {', '.join(x.reasons)}" for x in issues)
        super().__init__(f"task board contains {len(issues)} rejected actionable row(s): {summary}")


class PathValidationError(ValueError):
    pass


class LeaseBusy(RuntimeError):
    pass


class StaleLeaseToken(RuntimeError):
    pass


@dataclass(frozen=True)
class TaskRecord:
    task_id: str
    title: str
    assignee: str
    status: str
    raw_status: str
    dependencies: tuple[str, ...]
    allowed_paths: tuple[str, ...]
    acceptance: str
    product: Optional[str]
    dependency_evidence: Mapping[str, bool]
    dispatchable: bool
    hold_reasons: tuple[str, ...]
    board_revision: str
    row_hash: str
    source_line: int

    @property
    def id(self) -> str:
        return self.task_id

    @property
    def deps(self) -> tuple[str, ...]:
        return self.dependencies

    @property
    def paths(self) -> tuple[str, ...]:
        return self.allowed_paths

    def to_dict(self) -> dict:
        value = asdict(self)
        value["dependencies"] = list(self.dependencies)
        value["allowed_paths"] = list(self.allowed_paths)
        value["hold_reasons"] = list(self.hold_reasons)
        value["dependency_evidence"] = dict(self.dependency_evidence)
        return value


@dataclass(frozen=True)
class RejectedRow:
    task_id: Optional[str]
    source_line: int
    reasons: tuple[str, ...]
    row_hash: str

    def to_dict(self) -> dict:
        value = asdict(self)
        value["reasons"] = list(self.reasons)
        return value


@dataclass(frozen=True)
class BoardCompilation:
    board_revision: str
    tasks: tuple[TaskRecord, ...]
    rejected: tuple[RejectedRow, ...]

    def to_dict(self) -> dict:
        return {
            "schema_version": 1,
            "board_revision": self.board_revision,
            "tasks": [task.to_dict() for task in self.tasks],
            "rejected": [row.to_dict() for row in self.rejected],
        }

    def write_json(self, destination: Path) -> None:
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(json.dumps(self.to_dict(), indent=2, sort_keys=True) + "\n", encoding="utf-8")


def _split_markdown_row(line: str) -> list[str]:
    """Split a pipe table row while respecting escaped pipes and code spans."""
    cells: list[str] = []
    current: list[str] = []
    escaped = False
    in_code = False
    for char in line.strip():
        if escaped:
            current.append(char)
            escaped = False
        elif char == "\\":
            current.append(char)
            escaped = True
        elif char == "`":
            current.append(char)
            in_code = not in_code
        elif char == "|" and not in_code:
            cells.append("".join(current).strip())
            current = []
        else:
            current.append(char)
    cells.append("".join(current).strip())
    if cells and not cells[0]:
        cells.pop(0)
    if cells and not cells[-1]:
        cells.pop()
    return cells


def normalize_task_id(value: str) -> str:
    value = value.strip().upper()
    if not re.fullmatch(r"W(?:2)?-\d+[A-Z]?", value):
        raise ValueError(f"invalid task id: {value!r}")
    return value


def normalize_scope_path(value: str) -> str:
    value = value.strip().replace("\\", "/")
    while value.startswith("./"):
        value = value[2:]
    if not value or value in {".", ".."}:
        raise PathValidationError("empty scope path")
    if value.startswith("/") or re.match(r"^[A-Za-z]:", value):
        raise PathValidationError(f"absolute scope path is forbidden: {value!r}")
    parts = value.split("/")
    if any(part in {"", ".", ".."} for part in parts):
        raise PathValidationError(f"scope traversal or empty component is forbidden: {value!r}")
    if any("\x00" in part for part in parts):
        raise PathValidationError("NUL in scope path")
    return "/".join(parts)


def paths_overlap(left: str, right: str) -> bool:
    """Conservatively report whether two repository-relative scopes can overlap."""
    a, b = normalize_scope_path(left), normalize_scope_path(right)
    if a == b:
        return True
    a_glob, b_glob = bool(_WILDCARD_RE.search(a)), bool(_WILDCARD_RE.search(b))
    if not a_glob and not b_glob:
        return a.startswith(b.rstrip("/") + "/") or b.startswith(a.rstrip("/") + "/")
    if a_glob and PurePosixPath(b).match(a):
        return True
    if b_glob and PurePosixPath(a).match(b):
        return True

    def prefix(pattern: str) -> tuple[str, ...]:
        answer = []
        for part in pattern.split("/"):
            if _WILDCARD_RE.search(part):
                break
            answer.append(part)
        return tuple(answer)

    pa, pb = prefix(a), prefix(b)
    common = min(len(pa), len(pb))
    if pa[:common] != pb[:common]:
        return False
    # Once a wildcard is reached, absence of proof of disjointness is overlap.
    return a_glob or b_glob


def overlapping_tasks(candidate: TaskRecord, active: Iterable[TaskRecord]) -> tuple[str, ...]:
    conflicts = []
    for other in active:
        if any(paths_overlap(a, b) for a in candidate.allowed_paths for b in other.allowed_paths):
            conflicts.append(other.task_id)
    return tuple(sorted(set(conflicts)))


def _status(raw: str) -> str:
    upper = raw.strip().upper().replace("-", "_").replace(" ", "_")
    for status in ("IN_PROGRESS", "SUPERSEDED", "ABANDONED", "HALFWAY", "CLAIMED", "READY", "DONE", "STUCK", "BLOCKED", "ROADMAP_LABEL"):
        if upper.startswith(status):
            return status
    return "UNKNOWN"


def _assignee(cell: str) -> tuple[Optional[str], Optional[str]]:
    upper = cell.upper()
    found = sorted(seat for seat in SEATS if re.search(rf"\b{seat}\b", upper))
    if re.search(r"OWNER[- ]AGNOSTIC|ANY\s+SEAT|UNASSIGNED|\(NONE\)", upper):
        return None, "owner-agnostic or unassigned assignee is forbidden"
    if len(found) != 1:
        return None, f"assignee must contain exactly one seat; found {found}"
    # Historical prose naming another seat is caught by len(found) above.
    return found[0], None


def _scope_paths(cell: str) -> tuple[tuple[str, ...], list[str]]:
    reasons: list[str] = []
    if not cell.strip() or re.search(r"(?i)^\s*n/?a\b|no envelope|none claimed", cell):
        return (), ["missing concrete scope"]
    candidates = []
    for token in _CODE_RE.findall(cell):
        token = token.strip().strip(".,;:")
        if "/" in token or "\\" in token:
            candidates.append(token)
    paths: list[str] = []
    for candidate in candidates:
        try:
            paths.append(normalize_scope_path(candidate))
        except PathValidationError as exc:
            reasons.append(str(exc))
    if not paths:
        reasons.append("scope has no explicit repository-relative path")
    return tuple(dict.fromkeys(paths)), reasons


def compile_board_result(
    repo_root: Path,
    board_path: Optional[Path] = None,
    *,
    landed_task_ids: Iterable[str] = (),
    evidence: Optional[Mapping[str, bool]] = None,
) -> BoardCompilation:
    repo_root = Path(repo_root).resolve()
    path = Path(board_path) if board_path else repo_root / "docs" / "TASK_BOARD.md"
    if not path.is_absolute():
        path = repo_root / path
    raw = path.read_bytes()
    revision = hashlib.sha256(raw).hexdigest()
    lines = raw.decode("utf-8-sig").splitlines()
    landed = {normalize_task_id(x) for x in landed_task_ids}
    supplied_evidence = {normalize_task_id(k): bool(v) for k, v in (evidence or {}).items()}

    parsed: list[tuple[int, str, list[str]]] = []
    known_states: dict[str, str] = {}
    for line_no, line in enumerate(lines, 1):
        if not _ROW_RE.match(line):
            continue
        cells = _split_markdown_row(line)
        if len(cells) != 7:
            parsed.append((line_no, line, cells))
            continue
        try:
            known_states[normalize_task_id(cells[0])] = _status(cells[6])
        except ValueError:
            pass
        parsed.append((line_no, line, cells))

    tasks: list[TaskRecord] = []
    rejected: list[RejectedRow] = []
    for line_no, line, cells in parsed:
        row_hash = hashlib.sha256(line.encode("utf-8")).hexdigest()
        task_id = None
        reasons: list[str] = []
        if len(cells) != 7:
            match = _ROW_RE.match(line)
            task_id = match.group(1).upper() if match else None
            rejected.append(RejectedRow(task_id, line_no, (f"expected 7 columns, found {len(cells)}",), row_hash))
            continue
        try:
            task_id = normalize_task_id(cells[0])
        except ValueError as exc:
            reasons.append(str(exc))
        title, scope_cell, assignee_cell, acceptance, deps_cell, raw_status = cells[1:]
        status = _status(raw_status)
        assignee, assignee_error = _assignee(assignee_cell)
        if assignee_error:
            reasons.append(assignee_error)
        allowed_paths, path_reasons = _scope_paths(scope_cell)
        reasons.extend(path_reasons)
        if not acceptance.strip() or re.fullmatch(r"(?i)n/?a|none|—|-", acceptance.strip()):
            reasons.append("missing acceptance criteria")
        deps = tuple(dict.fromkeys(normalize_task_id(x) for x in _DEP_RE.findall(deps_cell)))
        if deps_cell.strip() not in {"", "—", "-"} and not deps:
            reasons.append("malformed dependencies")
        if status == "UNKNOWN":
            reasons.append("unknown status")

        actionable = status in ACTIONABLE_STATES
        if reasons:
            if actionable:
                rejected.append(RejectedRow(task_id, line_no, tuple(dict.fromkeys(reasons)), row_hash))
            continue
        assert task_id is not None and assignee is not None
        dep_evidence: dict[str, bool] = {}
        holds: list[str] = []
        for dep in deps:
            proven = supplied_evidence.get(dep, dep in landed or known_states.get(dep) in COMPLETE_STATES)
            dep_evidence[dep] = proven
            if dep not in known_states and dep not in landed and dep not in supplied_evidence:
                holds.append(f"dependency {dep} missing from board and evidence")
            elif not proven:
                holds.append(f"dependency {dep} lacks completion evidence")
        dispatchable = status == "READY" and not holds and task_id not in landed
        if task_id in landed:
            holds.append("task already has landing evidence")
        if status == "READY" and re.search(r"\borigin/[A-Za-z0-9._/-]+", raw_status + " " + acceptance):
            holds.append("existing remote branch is referenced; reconcile it before creating a new task worktree")
            dispatchable = False
        product_match = re.search(r"\[PRODUCT:\s*([A-Za-z]+)\]", title + " " + acceptance, re.IGNORECASE)
        tasks.append(TaskRecord(
            task_id=task_id,
            title=title.strip(),
            assignee=assignee,
            status=status,
            raw_status=raw_status.strip(),
            dependencies=deps,
            allowed_paths=allowed_paths,
            acceptance=acceptance.strip(),
            product=product_match.group(1) if product_match else None,
            dependency_evidence=dep_evidence,
            dispatchable=dispatchable,
            hold_reasons=tuple(holds),
            board_revision=revision,
            row_hash=row_hash,
            source_line=line_no,
        ))
    reserved = [task for task in tasks if task.status in {"CLAIMED", "IN_PROGRESS", "HALFWAY"}]
    reconciled: list[TaskRecord] = []
    for task in tasks:
        if task.dispatchable:
            conflicts = overlapping_tasks(task, reserved)
            if conflicts:
                task = replace(
                    task,
                    dispatchable=False,
                    hold_reasons=task.hold_reasons + ("scope overlaps earlier or active task(s): " + ", ".join(conflicts),),
                )
            else:
                reserved.append(task)
        reconciled.append(task)
    return BoardCompilation(revision, tuple(reconciled), tuple(rejected))


def compile_board(
    repo_root: Path,
    board_path: Optional[Path] = None,
    *,
    landed_task_ids: Iterable[str] = (),
    evidence: Optional[Mapping[str, bool]] = None,
    strict: bool = True,
) -> list[TaskRecord]:
    result = compile_board_result(repo_root, board_path, landed_task_ids=landed_task_ids, evidence=evidence)
    if strict and result.rejected:
        raise BoardCompileError(result.rejected)
    return list(result.tasks)


@dataclass(frozen=True)
class Lease:
    task_id: str
    seat: str
    worktree: str
    branch: str
    token: str
    owner_pid: int
    owner_host: str
    acquired_at: float
    heartbeat_at: float
    expires_at: float
    state: str
    allowed_paths: tuple[str, ...]


ProcessChecker = Callable[[str, int], Optional[bool]]


def _default_process_checker(host: str, pid: int) -> Optional[bool]:
    if host != socket.gethostname() or pid <= 0:
        return None
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    except OSError:
        return None
    return True


class LeaseStore:
    """SQLite-backed leases with transactional collision checks and fencing."""

    def __init__(self, database: Path, process_checker: ProcessChecker = _default_process_checker):
        self.database = Path(database)
        self.process_checker = process_checker
        self.database.parent.mkdir(parents=True, exist_ok=True)
        self._initialize()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(str(self.database), timeout=10, isolation_level=None)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA busy_timeout=10000")
        return connection

    def _initialize(self) -> None:
        for attempt in range(5):
            try:
                with closing(self._connect()) as db:
                    db.execute("PRAGMA journal_mode=WAL")
                    db.executescript(
                        """
                        CREATE TABLE IF NOT EXISTS leases (
                            task_id TEXT NOT NULL,
                            seat TEXT NOT NULL,
                            worktree TEXT NOT NULL,
                            branch TEXT NOT NULL,
                            token TEXT PRIMARY KEY,
                            owner_pid INTEGER NOT NULL,
                            owner_host TEXT NOT NULL,
                            acquired_at REAL NOT NULL,
                            heartbeat_at REAL NOT NULL,
                            expires_at REAL NOT NULL,
                            state TEXT NOT NULL CHECK(state IN ('ACTIVE','EXPIRED','COMPLETED','RELEASED')),
                            completed_at REAL,
                            result_sha TEXT,
                            paths_json TEXT NOT NULL DEFAULT '[]'
                        );
                        CREATE UNIQUE INDEX IF NOT EXISTS lease_active_task ON leases(task_id) WHERE state='ACTIVE';
                        CREATE UNIQUE INDEX IF NOT EXISTS lease_active_seat ON leases(seat) WHERE state='ACTIVE';
                        CREATE UNIQUE INDEX IF NOT EXISTS lease_active_worktree ON leases(worktree) WHERE state='ACTIVE';
                        CREATE UNIQUE INDEX IF NOT EXISTS lease_active_branch ON leases(branch) WHERE state='ACTIVE';
                        """
                    )
                return
            except sqlite3.OperationalError as error:
                if "locked" not in str(error).lower() or attempt == 4:
                    raise
                time.sleep(0.05 * (attempt + 1))

    @staticmethod
    def _lease(row: sqlite3.Row) -> Lease:
        values = {name: row[name] for name in Lease.__dataclass_fields__ if name != "allowed_paths"}
        values["allowed_paths"] = tuple(json.loads(row["paths_json"]))
        return Lease(**values)

    def claim(
        self,
        task_id: str,
        seat: str,
        worktree: str,
        branch: str,
        *,
        ttl_seconds: float = 300,
        owner_pid: Optional[int] = None,
        owner_host: Optional[str] = None,
        now: Optional[float] = None,
        allowed_paths: Sequence[str] = (),
    ) -> Lease:
        task_id = normalize_task_id(task_id)
        seat = seat.strip().upper()
        if seat not in SEATS:
            raise ValueError(f"unknown seat: {seat!r}")
        if ttl_seconds <= 0:
            raise ValueError("ttl_seconds must be positive")
        worktree = str(Path(worktree).resolve())
        branch = branch.strip()
        if not branch:
            raise ValueError("branch is required")
        instant = time.time() if now is None else float(now)
        pid = os.getpid() if owner_pid is None else int(owner_pid)
        host = socket.gethostname() if owner_host is None else owner_host
        token = uuid.uuid4().hex
        scopes = tuple(normalize_scope_path(path) for path in allowed_paths)
        with closing(self._connect()) as db:
            db.execute("BEGIN IMMEDIATE")
            conflicts = db.execute("SELECT * FROM leases WHERE state='ACTIVE'").fetchall()
            for row in conflicts:
                active_paths = tuple(json.loads(row["paths_json"]))
                dimension_conflict = row["task_id"] == task_id or row["seat"] == seat or row["worktree"] == worktree or row["branch"] == branch
                scope_conflict = any(paths_overlap(left, right) for left in scopes for right in active_paths)
                if not dimension_conflict and not scope_conflict:
                    continue
                if row["expires_at"] <= instant:
                    alive = self.process_checker(row["owner_host"], row["owner_pid"])
                    if alive is False:
                        db.execute("UPDATE leases SET state='EXPIRED' WHERE token=? AND state='ACTIVE'", (row["token"],))
                        continue
                    state = "live" if alive else "unknown"
                    db.rollback()
                    raise LeaseBusy(f"expired lease owner is {state}; explicit reconciliation required for token {row['token']}")
                db.rollback()
                raise LeaseBusy(f"active lease conflict with task {row['task_id']} token {row['token']}")
            db.execute(
                "INSERT INTO leases(task_id,seat,worktree,branch,token,owner_pid,owner_host,acquired_at,heartbeat_at,expires_at,state,paths_json) VALUES(?,?,?,?,?,?,?,?,?,?, 'ACTIVE',?)",
                (task_id, seat, worktree, branch, token, pid, host, instant, instant, instant + ttl_seconds, json.dumps(scopes)),
            )
            row = db.execute("SELECT * FROM leases WHERE token=?", (token,)).fetchone()
            db.commit()
        return self._lease(row)

    def heartbeat(self, token: str, *, ttl_seconds: float = 300, now: Optional[float] = None) -> Lease:
        if ttl_seconds <= 0:
            raise ValueError("ttl_seconds must be positive")
        instant = time.time() if now is None else float(now)
        with closing(self._connect()) as db:
            db.execute("BEGIN IMMEDIATE")
            changed = db.execute(
                "UPDATE leases SET heartbeat_at=?, expires_at=? WHERE token=? AND state='ACTIVE'",
                (instant, instant + ttl_seconds, token),
            ).rowcount
            if changed != 1:
                db.rollback()
                raise StaleLeaseToken("lease token is stale or inactive")
            row = db.execute("SELECT * FROM leases WHERE token=?", (token,)).fetchone()
            db.commit()
        return self._lease(row)

    def complete(self, token: str, *, result_sha: Optional[str] = None, now: Optional[float] = None) -> None:
        instant = time.time() if now is None else float(now)
        with closing(self._connect()) as db:
            db.execute("BEGIN IMMEDIATE")
            changed = db.execute(
                "UPDATE leases SET state='COMPLETED', completed_at=?, result_sha=? WHERE token=? AND state='ACTIVE'",
                (instant, result_sha, token),
            ).rowcount
            if changed != 1:
                db.rollback()
                raise StaleLeaseToken("completion rejected: lease token is stale or inactive")
            db.commit()

    def release(self, token: str) -> None:
        with closing(self._connect()) as db:
            db.execute("BEGIN IMMEDIATE")
            changed = db.execute("UPDATE leases SET state='RELEASED' WHERE token=? AND state='ACTIVE'", (token,)).rowcount
            if changed != 1:
                db.rollback()
                raise StaleLeaseToken("release rejected: lease token is stale or inactive")
            db.commit()

    def active(self) -> list[Lease]:
        with closing(self._connect()) as db:
            rows = db.execute("SELECT * FROM leases WHERE state='ACTIVE' ORDER BY acquired_at, task_id").fetchall()
        return [self._lease(row) for row in rows]
