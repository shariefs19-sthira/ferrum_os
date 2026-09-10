from __future__ import annotations

import json
import hashlib
import subprocess
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Sequence


@dataclass(frozen=True)
class EvidenceState:
    authored: bool
    pushed: bool
    landed: bool
    deployed: bool
    live: bool
    branch_sha: str | None
    remote_sha: str | None
    landing_sha: str | None
    deployed_sha: str | None
    missing_tree_paths: tuple[str, ...]
    live_evidence: tuple[str, ...]
    notes: tuple[str, ...]

    def to_dict(self) -> dict:
        return asdict(self)


def _git(repo: Path, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ("git", "-C", str(repo), *args), capture_output=True, text=True,
        encoding="utf-8", errors="replace", check=False, timeout=45,
    )


def verify_evidence(
    repo: Path,
    branch: str,
    expected_paths: Sequence[str] = (),
    live_evidence_paths: Sequence[str] = (),
    *,
    base_sha: str | None = None,
    task_id: str | None = None,
) -> EvidenceState:
    notes: list[str] = []
    local = _git(repo, "rev-parse", "--verify", branch)
    branch_sha = local.stdout.strip() if local.returncode == 0 else None
    remote = _git(repo, "ls-remote", "--heads", "origin", branch)
    remote_sha = remote.stdout.split()[0] if remote.returncode == 0 and remote.stdout.strip() else None
    if remote.returncode != 0:
        notes.append("remote branch verification failed")

    marker = _git(repo, "log", "origin/main", "--format=%H", "--fixed-strings", f"--grep=[land:{branch}]", "-1")
    landing_sha = marker.stdout.strip() if marker.returncode == 0 and marker.stdout.strip() else None
    missing: list[str] = []
    for path in expected_paths:
        probe = _git(repo, "diff", "--quiet", branch, "origin/main", "--", path)
        if probe.returncode != 0:
            missing.append(path)
    authored = bool(branch_sha and base_sha and branch_sha != base_sha and _git(repo, "diff", "--quiet", base_sha, branch_sha).returncode == 1)
    landed = bool(authored and landing_sha and expected_paths and not missing)

    deploy_file = repo / ".fleet-deploy-state.json"
    deployed_sha = None
    if deploy_file.exists():
        try:
            deployed_sha = json.loads(deploy_file.read_text(encoding="utf-8-sig")).get("LastDeployedSha")
        except (OSError, json.JSONDecodeError):
            notes.append("deploy state unreadable")
    main = _git(repo, "rev-parse", "origin/main")
    main_sha = main.stdout.strip() if main.returncode == 0 else None
    deployed = bool(landed and deployed_sha and main_sha and deployed_sha == main_sha)

    found_live: list[str] = []
    live = False
    if deployed and task_id and live_evidence_paths:
        attestation = repo / ".fleet-runtime" / "live-attestations" / f"{task_id}.json"
        try:
            record = json.loads(attestation.read_text(encoding="utf-8"))
            if record.get("task_id") == task_id and record.get("deployed_sha") == deployed_sha and record.get("landing_sha") == landing_sha:
                for path in live_evidence_paths:
                    evidence = repo / path
                    expected_hash = record.get("evidence_sha256", {}).get(path)
                    if evidence.is_file() and expected_hash == hashlib.sha256(evidence.read_bytes()).hexdigest():
                        found_live.append(path)
                live = len(found_live) == len(live_evidence_paths)
        except (OSError, json.JSONDecodeError):
            notes.append("live attestation missing or unreadable")
    elif deployed:
        notes.append("task-bound live attestation requirements not supplied")
    return EvidenceState(
        authored=authored, pushed=bool(authored and remote_sha and remote_sha == branch_sha),
        landed=landed, deployed=deployed, live=live, branch_sha=branch_sha,
        remote_sha=remote_sha, landing_sha=landing_sha, deployed_sha=deployed_sha,
        missing_tree_paths=tuple(missing), live_evidence=tuple(found_live), notes=tuple(notes),
    )
