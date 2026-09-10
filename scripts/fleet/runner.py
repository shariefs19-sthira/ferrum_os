from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import time
from dataclasses import asdict, is_dataclass
from datetime import datetime, timezone
from pathlib import Path

from .adapters import RETRY_LIMITS, build_invocation, classify_failure, extract_session_id
from .evidence import verify_evidence
from .queue import BoardCompilation, LeaseBusy, LeaseStore, StaleLeaseToken, compile_board_result, paths_overlap


AUTOMATION_DIR = ".fleet-runtime"
STOP_FILE = Path("docs/FLEET_WATCH_STOP")


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def atomic_json(path: Path, value: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, indent=2, sort_keys=True), encoding="utf-8")
    os.replace(temporary, path)


def stopped(repo: Path) -> bool:
    return (repo / STOP_FILE).exists()


def task_value(task, *names, default=None):
    for name in names:
        if isinstance(task, dict) and name in task:
            return task[name]
        if hasattr(task, name):
            return getattr(task, name)
    return default


def task_dict(task) -> dict:
    if hasattr(task, "to_dict"):
        return task.to_dict()
    if is_dataclass(task):
        return asdict(task)
    return dict(task)


def load_queue(repo: Path):
    log = run_git(repo, "log", "origin/main", "--format=%s")
    landed = set()
    for marker in re.findall(r"\[land:([^\]]+)\]", log.stdout, re.IGNORECASE):
        landed.update(re.findall(r"\bW(?:2)?-\d+[A-Za-z]?\b", marker, re.IGNORECASE))
    compiled: BoardCompilation = compile_board_result(repo, landed_task_ids=landed)
    manifest = repo / AUTOMATION_DIR / "compiled-board.json"
    compiled.write_json(manifest)
    ready = [task for task in compiled.tasks if task.dispatchable]
    holds = [*compiled.rejected, *[task for task in compiled.tasks if task.hold_reasons]]
    runtime_holds = repo / AUTOMATION_DIR / "holds"
    filtered = []
    for task in ready:
        hold_file = runtime_holds / f"{task.task_id}.json"
        try:
            hold = json.loads(hold_file.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            filtered.append(task)
            continue
        if hold.get("row_hash") == task.row_hash:
            holds.append({"task_id": task.task_id, "runtime_hold": hold})
        else:
            filtered.append(task)
    return filtered, holds


def record_runtime_hold(repo: Path, task, reason: str, category: str = "execution_hold") -> None:
    path = repo / AUTOMATION_DIR / "holds" / f"{task_value(task, 'id', 'task_id')}.json"
    atomic_json(path, {
        "task_id": task_value(task, "id", "task_id"),
        "row_hash": task_value(task, "row_hash", default=""),
        "board_revision": task_value(task, "board_revision", default=""),
        "category": category,
        "reason": reason,
        "held_at": utc_now(),
    })


def select_task(tasks, task_id: str | None, seat: str | None):
    candidates = []
    for task in tasks:
        if task_id and task_value(task, "id", "task_id") != task_id:
            continue
        if seat and str(task_value(task, "assignee", default="")).upper() != seat.upper():
            continue
        candidates.append(task)
    return candidates[0] if candidates else None


def seat_config(repo: Path, seat: str) -> dict:
    config = json.loads((repo / "docs" / "FLEET_SEATS.json").read_text(encoding="utf-8-sig"))
    for item in config.get("seats", []):
        if item.get("id", "").upper() == seat.upper():
            return item
    raise ValueError(f"No FLEET_SEATS configuration for {seat}")


def slug(value: str, limit: int = 38) -> str:
    result = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return (result or "task")[:limit].rstrip("-")


def run_git(repo: Path, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(("git", "-C", str(repo), *args), capture_output=True,
                          text=True, encoding="utf-8", errors="replace", check=False, timeout=45)


def process_alive(pid: int | None) -> bool:
    if not pid:
        return False
    try:
        os.kill(pid, 0)
        return True
    except OSError:
        return False


def manual_session_conflicts(repo: Path, seat: str, target: Path) -> list[str]:
    """Conservative check for active markers and recently touched dirty seat trees."""
    conflicts: list[str] = []
    automation = repo / AUTOMATION_DIR / "sessions"
    if automation.exists():
        for metadata in automation.glob("*/metadata.json"):
            try:
                item = json.loads(metadata.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError):
                continue
            if item.get("seat", "").upper() == seat.upper() and item.get("state") == "running" and process_alive(item.get("pid")):
                conflicts.append(f"active managed session {item.get('dispatch_id')} pid={item.get('pid')}")
    listing = run_git(repo, "worktree", "list", "--porcelain")
    current_path = None
    for line in listing.stdout.splitlines() + [""]:
        if line.startswith("worktree "):
            current_path = Path(line[9:])
        elif not line and current_path:
            if current_path != target and current_path.name.lower().startswith(seat.lower() + "-"):
                status = run_git(current_path, "status", "--porcelain")
                age = time.time() - current_path.stat().st_mtime
                if status.stdout.strip() and age < 6 * 3600:
                    conflicts.append(f"recent dirty {seat} worktree: {current_path}")
            current_path = None
    return conflicts


def ensure_worktree(repo: Path, task, seat: str) -> tuple[Path, str]:
    task_id = task_value(task, "id", "task_id")
    title = task_value(task, "title", default=task_id)
    digest = hashlib.sha256(f"{task_id}:{task_value(task, 'row_hash', default='')}".encode()).hexdigest()[:8]
    branch = f"{seat.lower()}/{slug(task_id)}-{slug(title, 24)}-{digest}"
    root = Path(os.environ.get("FERRUM_WORKTREE_ROOT", r"D:\ferrum_os.worktrees"))
    path = root / f"{seat.lower()}-{slug(task_id)}-{digest}"
    if path.exists():
        current = run_git(path, "branch", "--show-current").stdout.strip()
        if current != branch:
            raise RuntimeError(f"worktree {path} is on {current}, expected {branch}")
        return path, branch
    conflicts = manual_session_conflicts(repo, seat, path)
    if conflicts:
        raise RuntimeError("manual-session guard: " + "; ".join(conflicts))
    result = run_git(repo, "worktree", "add", str(path), "-b", branch, "origin/main")
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or result.stdout.strip())
    return path, branch


def build_prompt(repo: Path, task, seat: str, worktree: Path, branch: str) -> str:
    info = task_dict(task)
    task_id = task_value(task, "id", "task_id")
    paths = task_value(task, "paths", "allowed_paths", "envelope", default=[])
    deps = task_value(task, "deps", "dependencies", default=[])
    acceptance = task_value(task, "acceptance", default="")
    origin = run_git(repo, "rev-parse", "origin/main").stdout.strip()
    return f"""You are Ferrum seat {seat}. Execute exactly one compiled task.

DISPATCH CONTRACT
- Task: {task_id} — {task_value(task, 'title', default='')}
- Board row hash: {task_value(task, 'row_hash', default='')}
- Verified origin/main at dispatch: {origin}
- Worktree: {worktree}
- Branch: {branch}
- Allowed paths: {json.dumps(paths, ensure_ascii=False)}
- Dependencies verified by compiler: {json.dumps(deps, ensure_ascii=False)}
- Acceptance: {acceptance}

OBJECTIVE
{task_value(task, 'objective', 'description', default=acceptance)}

OPERATING RULES
1. Read AGENTS.md, your docs/seats/{seat}.md contract, the exact current board row, and only the latest materially applicable available skill before editing.
2. Reuse cited SHA, deployment, packet, and test evidence. Inspect the task diff and allowed paths first; do not reread unrelated history or rerun unchanged broad checks unless acceptance requires them.
3. If disk state, assignment, dependencies, or allowed paths disagree with this contract, make no edits and return blocked with the exact discrepancy.
4. Stay inside the allowed paths. Do not modify protected paths unless this contract explicitly lists them.
5. Choose the implementation method and record the reasoning. Run the smallest verification that can disprove the changed behavior, plus every check explicitly required by acceptance.
6. Commit and push only this feature branch. Do not run scripts/land.ps1, deploy, edit main, or start another agent; the runner owns landing and deployment.
7. Return only the structured result required by the supplied schema. Include every changed path, verification command, commit SHA, and blocker; omit repeated narrative and unrelated suggestions.

Compiled row:
{json.dumps(info, indent=2, ensure_ascii=False)}
"""


def read_structured_result(last_message: Path, stdout: str) -> dict:
    """Read a schema-shaped final result from Codex or Claude output."""
    candidates: list[object] = []
    if last_message.is_file():
        try:
            candidates.append(json.loads(last_message.read_text(encoding="utf-8")))
        except (OSError, json.JSONDecodeError):
            pass
    for line in reversed(stdout.splitlines()):
        try:
            event = json.loads(line)
        except json.JSONDecodeError:
            continue
        candidates.extend((event.get("structured_output"), event.get("result"), event.get("message")))
    for value in candidates:
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                continue
        if isinstance(value, dict) and {"task_id", "status", "changed_paths"}.issubset(value):
            return value
    raise RuntimeError("worker exited without a valid structured result")


def validate_worker_result(repo: Path, worktree: Path, branch: str, base_sha: str, task, result: dict) -> tuple[list[str], str]:
    task_id = str(task_value(task, "id", "task_id"))
    if result.get("task_id", "").upper() != task_id.upper():
        raise RuntimeError(f"result task mismatch: expected {task_id}, got {result.get('task_id')}")
    if result.get("status") != "completed":
        raise RuntimeError(f"worker result is {result.get('status')}: {result.get('blocker') or result.get('summary')}")
    branch_head = run_git(worktree, "rev-parse", "HEAD").stdout.strip()
    if not branch_head or branch_head == base_sha:
        raise RuntimeError("worker reported completion without an authored commit")
    if result.get("commit_sha") != branch_head:
        raise RuntimeError(f"reported commit {result.get('commit_sha')} does not match branch HEAD {branch_head}")
    changed = [line.strip().replace("\\", "/") for line in run_git(worktree, "diff", "--name-only", f"{base_sha}..{branch_head}").stdout.splitlines() if line.strip()]
    allowed = list(task_value(task, "paths", "allowed_paths", default=[]))
    outside = [path for path in changed if not any(paths_overlap(path, scope) for scope in allowed)]
    if outside:
        raise RuntimeError("worker changed paths outside lease: " + ", ".join(outside))
    reported = sorted(str(path).replace("\\", "/") for path in result.get("changed_paths", []))
    if sorted(changed) != reported:
        raise RuntimeError(f"reported changed paths differ from Git: reported={reported}, git={sorted(changed)}")
    dirty = run_git(worktree, "status", "--porcelain").stdout.strip()
    if dirty:
        raise RuntimeError("worker left the task worktree dirty")
    return changed, branch_head


def _execute_unprotected(repo: Path, task, seat: str, allow_land: bool, allow_deploy: bool) -> dict:
    if stopped(repo):
        raise RuntimeError(f"kill switch present: {repo / STOP_FILE}")
    if allow_land and run_git(repo, "branch", "--show-current").stdout.strip() != "main":
        raise RuntimeError("automated landing is permitted only from the main checkout")
    config = seat_config(repo, seat)
    worktree, branch = ensure_worktree(repo, task, seat)
    base_sha = run_git(repo, "rev-parse", "origin/main").stdout.strip()
    if not base_sha:
        raise RuntimeError("cannot resolve origin/main")
    store = LeaseStore(repo / AUTOMATION_DIR / "fleet.sqlite3")
    lease = store.claim(
        task_value(task, "id", "task_id"), seat, str(worktree), branch,
        owner_pid=os.getpid(), ttl_seconds=120,
        allowed_paths=task_value(task, "paths", "allowed_paths", default=[]),
    )
    prompt = build_prompt(repo, task, seat, worktree, branch)
    dispatch_id = f"{task_value(task, 'id', 'task_id')}-{hashlib.sha256(prompt.encode()).hexdigest()[:12]}"
    session_dir = repo / AUTOMATION_DIR / "sessions" / dispatch_id
    session_dir.mkdir(parents=True, exist_ok=True)
    (session_dir / "prompt.md").write_text(prompt, encoding="utf-8")
    schema = Path(__file__).with_name("result.schema.json")
    metadata = {
        "dispatch_id": dispatch_id, "task_id": task_value(task, "id", "task_id"),
        "seat": seat, "adapter": config["adapter"], "worktree": str(worktree),
        "branch": branch, "base_sha": base_sha, "lease_token": lease.token,
        "state": "prepared", "created_at": utc_now(), "attempts": [],
    }
    atomic_json(session_dir / "metadata.json", metadata)

    session_id = None
    attempt = 0
    while True:
        if stopped(repo):
            metadata["state"] = "killed"
            atomic_json(session_dir / "metadata.json", metadata)
            store.release(lease.token)
            return metadata
        invocation = build_invocation(
            config["adapter"], worktree, prompt, schema, session_dir / "last-message.json",
            session_id=session_id, resume=attempt > 0,
        )
        session_id = invocation.session_id
        stdout_path = session_dir / f"stdout-{attempt}.jsonl"
        stderr_path = session_dir / f"stderr-{attempt}.log"
        started = utc_now()
        with stdout_path.open("w", encoding="utf-8") as stdout_file, stderr_path.open("w", encoding="utf-8") as stderr_file:
            proc = subprocess.Popen(invocation.argv, cwd=worktree, stdin=subprocess.PIPE if invocation.stdin_text else subprocess.DEVNULL,
                                    stdout=stdout_file, stderr=stderr_file, text=True, encoding="utf-8", errors="replace")
            metadata.update({"state": "running", "pid": proc.pid, "provider_session_id": session_id})
            atomic_json(session_dir / "metadata.json", metadata)
            input_text = invocation.stdin_text or None
            while True:
                try:
                    proc.communicate(input_text, timeout=30)
                    break
                except subprocess.TimeoutExpired:
                    input_text = None
                    store.heartbeat(lease.token, ttl_seconds=120)
                    if stopped(repo):
                        proc.terminate()
                        proc.wait(timeout=15)
                        metadata["state"] = "killed"
                        atomic_json(session_dir / "metadata.json", metadata)
                        store.release(lease.token)
                        return metadata
        stdout = stdout_path.read_text(encoding="utf-8", errors="replace")
        stderr = stderr_path.read_text(encoding="utf-8", errors="replace")
        session_id = extract_session_id(config["adapter"], stdout.splitlines(), session_id)
        category = classify_failure(proc.returncode, stdout, stderr)
        metadata["attempts"].append({"attempt": attempt + 1, "started_at": started, "ended_at": utc_now(),
                                     "exit_code": proc.returncode, "classification": category,
                                     "stdout": str(stdout_path), "stderr": str(stderr_path)})
        metadata["provider_session_id"] = session_id
        atomic_json(session_dir / "metadata.json", metadata)
        if proc.returncode == 0 or attempt >= RETRY_LIMITS.get(category, 0):
            break
        attempt += 1

    metadata["state"] = "worker_exited"
    metadata["worker_exit_code"] = proc.returncode
    result = None
    if proc.returncode == 0:
        try:
            result = read_structured_result(session_dir / "last-message.json", stdout)
            changed_paths, branch_head = validate_worker_result(repo, worktree, branch, base_sha, task, result)
            metadata["worker_result"] = result
            metadata["validated_changed_paths"] = changed_paths
        except RuntimeError as error:
            proc.returncode = 1
            metadata["worker_exit_code"] = 1
            metadata["validation_error"] = str(error)
    metadata["evidence"] = verify_evidence(repo, branch, task_value(task, "paths", "allowed_paths", default=[]), base_sha=base_sha).to_dict()
    # Worker land/deploy is forbidden in the prompt. These explicit runner flags
    # are reviewed activation gates and serialize the only mutating control path.
    if allow_land and proc.returncode == 0 and metadata["evidence"]["pushed"]:
        with exclusive_lock(repo / AUTOMATION_DIR / "landing.lock"):
            land = subprocess.run(("powershell", "-NoProfile", "-File", str(repo / "scripts" / "land.ps1"), "-Branch", branch),
                                  cwd=repo, capture_output=True, text=True, encoding="utf-8", errors="replace", check=False)
            (session_dir / "landing.stdout.log").write_text(land.stdout, encoding="utf-8")
            (session_dir / "landing.stderr.log").write_text(land.stderr, encoding="utf-8")
            metadata["landing_exit_code"] = land.returncode
    metadata["evidence"] = verify_evidence(repo, branch, task_value(task, "paths", "allowed_paths", default=[]),
                                            task_value(task, "live_evidence", default=[]), base_sha=base_sha,
                                            task_id=task_value(task, "id", "task_id")).to_dict()
    if allow_deploy:
        metadata["deploy_requested"] = True
        metadata["deploy_held"] = "deployment remains held until landed evidence is true and a reviewed deploy adapter is invoked"
    metadata["state"] = "complete" if proc.returncode == 0 else "failed"
    atomic_json(session_dir / "metadata.json", metadata)
    if proc.returncode == 0:
        store.complete(lease.token, result_sha=metadata["evidence"].get("branch_sha"))
    else:
        store.release(lease.token)
    return metadata


def execute(repo: Path, task, seat: str, allow_land: bool, allow_deploy: bool) -> dict:
    """Execute while guaranteeing that a runner exception cannot strand its lease."""
    try:
        return _execute_unprotected(repo, task, seat, allow_land, allow_deploy)
    except Exception:
        store = LeaseStore(repo / AUTOMATION_DIR / "fleet.sqlite3")
        task_id = str(task_value(task, "id", "task_id"))
        for lease in store.active():
            if lease.task_id == task_id and lease.owner_pid == os.getpid():
                try:
                    store.release(lease.token)
                except StaleLeaseToken:
                    pass
        raise


class exclusive_lock:
    def __init__(self, path: Path):
        self.path = path
        self.handle = None

    def __enter__(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        try:
            self.handle = os.open(self.path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        except FileExistsError as error:
            raise RuntimeError(f"serialized operation already active: {self.path}") from error
        os.write(self.handle, f"pid={os.getpid()} at={utc_now()}".encode())
        return self

    def __exit__(self, exc_type, exc, tb):
        if self.handle is not None:
            os.close(self.handle)
        self.path.unlink(missing_ok=True)


def plan(repo: Path) -> dict:
    tasks, holds = load_queue(repo)
    return {"repo": str(repo), "origin_main": run_git(repo, "rev-parse", "origin/main").stdout.strip(),
            "execution_enabled": False, "kill_switch": stopped(repo),
            "ready": [task_dict(task) for task in tasks],
            "held": [task_dict(item) if not isinstance(item, str) else item for item in holds]}


def run_canary(repo: Path) -> dict:
    """Exercise the installed Codex adapter without granting filesystem writes."""
    directory = repo / AUTOMATION_DIR / "canary"
    directory.mkdir(parents=True, exist_ok=True)
    schema = Path(__file__).with_name("result.schema.json")
    last_message = directory / "last-message.json"
    prompt = (
        "Read no files, run no tools, and make no changes. Return the supplied JSON schema with "
        "task_id CANARY, status no_change, summary read-only adapter canary, empty changed_paths "
        "and tests, null commit_sha, and null blocker."
    )
    invocation = build_invocation("codex", repo, prompt, schema, last_message, sandbox="read-only")
    completed = subprocess.run(
        invocation.argv, cwd=repo, input=invocation.stdin_text, capture_output=True,
        text=True, encoding="utf-8", errors="replace", timeout=180, check=False,
    )
    (directory / "stdout.jsonl").write_text(completed.stdout, encoding="utf-8")
    (directory / "stderr.log").write_text(completed.stderr, encoding="utf-8")
    category = classify_failure(completed.returncode, completed.stdout, completed.stderr)
    result = None
    if completed.returncode == 0:
        result = read_structured_result(last_message, completed.stdout)
        if result.get("task_id") != "CANARY" or result.get("status") != "no_change" or result.get("changed_paths"):
            raise RuntimeError(f"canary returned an unexpected result: {result}")
    outcome = {
        "state": "passed" if completed.returncode == 0 else "failed",
        "exit_code": completed.returncode,
        "classification": category,
        "provider_session_id": extract_session_id("codex", completed.stdout.splitlines(), invocation.session_id),
        "result": result,
        "stdout": str(directory / "stdout.jsonl"),
        "stderr": str(directory / "stderr.log"),
    }
    atomic_json(directory / "result.json", outcome)
    return outcome


def cycle(repo: Path, *, allow_land: bool, allow_deploy: bool, max_tasks: int, seat: str | None = None) -> dict:
    counts = {"processed": 0, "dispatched": 0, "skipped": 0, "held": 0, "succeeded": 0, "failed": 0}
    outcomes = []
    seen: set[str] = set()
    while counts["processed"] < max_tasks and not stopped(repo):
        tasks, _ = load_queue(repo)
        task = next((item for item in tasks if item.task_id not in seen and (not seat or item.assignee == seat.upper())), None)
        if not task:
            break
        seen.add(task.task_id)
        counts["processed"] += 1
        try:
            counts["dispatched"] += 1
            outcome = execute(repo, task, task.assignee, allow_land, allow_deploy)
            outcomes.append(outcome)
            if outcome.get("state") == "complete" and outcome.get("worker_exit_code") == 0:
                counts["succeeded"] += 1
            else:
                counts["failed"] += 1
                reason = outcome.get("validation_error") or f"worker exit {outcome.get('worker_exit_code')}"
                record_runtime_hold(repo, task, reason, "worker_failure")
        except (LeaseBusy, RuntimeError, OSError, subprocess.SubprocessError) as error:
            counts["held"] += 1
            record_runtime_hold(repo, task, str(error))
            outcomes.append({"task_id": task.task_id, "state": "held", "reason": str(error)})
    return {"state": "stopped" if stopped(repo) else "cycle_complete", "counts": counts, "outcomes": outcomes}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Structured Ferrum fleet runner; planning is the default and is read-only.")
    parser.add_argument("command", choices=("plan", "canary", "run", "cycle", "daemon"), nargs="?", default="plan")
    parser.add_argument("--repo-root", type=Path, default=Path(r"D:\ferrum_os_recovered"))
    parser.add_argument("--task-id")
    parser.add_argument("--seat")
    parser.add_argument("--execute", action="store_true", help="Required for worker execution; omitted means plan only")
    parser.add_argument("--land", action="store_true", help="Reviewed runner-only targeted landing gate")
    parser.add_argument("--deploy", action="store_true", help="Records deploy intent; deployment adapter remains held")
    parser.add_argument("--max-tasks", type=int, default=1)
    parser.add_argument("--interval-seconds", type=int, default=300)
    args = parser.parse_args(argv)
    repo = args.repo_root.resolve()
    if args.command == "canary":
        result = run_canary(repo)
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return 0 if result.get("state") == "passed" else 6
    if args.command == "plan" or not args.execute:
        print(json.dumps(plan(repo), indent=2, ensure_ascii=False))
        return 0
    if stopped(repo):
        print(json.dumps({"state": "killed", "path": str(repo / STOP_FILE)}))
        return 3
    if args.command in {"cycle", "daemon"}:
        if args.max_tasks < 1 or args.interval_seconds < 10:
            parser.error("--max-tasks must be positive and --interval-seconds must be at least 10")
        while True:
            outcome = cycle(repo, allow_land=args.land, allow_deploy=args.deploy, max_tasks=args.max_tasks, seat=args.seat)
            print(json.dumps(outcome, indent=2, ensure_ascii=False), flush=True)
            if args.command == "cycle" or stopped(repo):
                return 0 if outcome["counts"]["failed"] == 0 else 5
            time.sleep(args.interval_seconds)
    if args.command != "run" or not args.task_id or not args.seat:
        parser.error("execution requires: run --execute --task-id ID --seat SEAT")
    tasks, _ = load_queue(repo)
    task = select_task(tasks, args.task_id, args.seat)
    if not task:
        print(json.dumps({"state": "held", "reason": "task is not compiled READY for this exact seat"}))
        return 4
    print(json.dumps(execute(repo, task, args.seat.upper(), args.land, args.deploy), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
