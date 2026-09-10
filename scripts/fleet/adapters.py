from __future__ import annotations

import json
import re
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


@dataclass(frozen=True)
class AdapterInvocation:
    adapter: str
    argv: tuple[str, ...]
    session_id: str
    stdin_text: str
    output_format: str


def new_session_id() -> str:
    return str(uuid.uuid4())


def build_invocation(
    adapter: str,
    worktree: Path,
    prompt: str,
    result_schema: Path,
    last_message: Path,
    session_id: str | None = None,
    resume: bool = False,
    sandbox: str = "workspace-write",
) -> AdapterInvocation:
    """Build argv using options verified against local CLI help on 2026-09-10."""
    adapter = adapter.lower().strip()
    session_id = session_id or new_session_id()
    if adapter == "codex":
        if resume:
            argv = (
                "codex", "exec", "resume", "--json",
                "--output-schema", str(result_schema),
                "--output-last-message", str(last_message),
                session_id, "-",
            )
        else:
            if sandbox not in {"workspace-write", "read-only"}:
                raise ValueError(f"unsupported Codex automation sandbox: {sandbox}")
            access = ("--approve-for-me",) if sandbox == "workspace-write" else ("--sandbox", "read-only")
            argv = (
                "codex", "exec", *access, "--json", "--output-schema",
                str(result_schema), "--output-last-message", str(last_message),
                "--cd", str(worktree), "-",
            )
        return AdapterInvocation(adapter, argv, session_id, prompt, "jsonl")
    if adapter == "claude":
        argv = [
            "claude", "--print", "--permission-mode", "auto",
            "--output-format", "stream-json", "--verbose",
            "--json-schema", result_schema.read_text(encoding="utf-8"),
        ]
        if resume:
            argv.extend(("--resume", session_id))
        else:
            argv.extend(("--session-id", session_id))
        argv.append(prompt)
        return AdapterInvocation(adapter, tuple(argv), session_id, "", "jsonl")
    raise ValueError(f"Unsupported adapter: {adapter}")


def extract_session_id(adapter: str, lines: Iterable[str], fallback: str) -> str:
    """Extract the provider session identifier from structured event output."""
    keys = ("thread_id", "session_id", "sessionId")
    for line in lines:
        try:
            event = json.loads(line)
        except (json.JSONDecodeError, TypeError):
            continue
        stack = [event]
        while stack:
            value = stack.pop()
            if isinstance(value, dict):
                for key in keys:
                    found = value.get(key)
                    if isinstance(found, str) and found:
                        return found
                stack.extend(value.values())
            elif isinstance(value, list):
                stack.extend(value)
    return fallback


_PATTERNS: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("adapter_configuration", ("cannot be used with", "unexpected argument", "unrecognized option", "unknown option")),
    ("provider_limit", ("rate limit", "usage limit", "quota", "try again at")),
    ("authentication", ("not logged in", "authentication", "unauthorized", "invalid api key")),
    ("network", ("proxy", "timed out", "timeout", "could not resolve", "connection reset")),
    ("governance_hold", ("permission denied", "protected path", "approval required", "misdirected")),
    ("test_failure", ("test failed", "tests failed", "type-check failed", "build failed")),
)


def classify_failure(exit_code: int, stdout: str, stderr: str) -> str:
    if exit_code == 0:
        return "process_success"
    text = re.sub(r"\s+", " ", f"{stdout}\n{stderr}").lower()
    for category, needles in _PATTERNS:
        if any(needle in text for needle in needles):
            return category
    return "agent_failure"


RETRY_LIMITS = {
    "network": 2,
    "test_failure": 1,
    "agent_failure": 1,
    "provider_limit": 0,
    "authentication": 0,
    "governance_hold": 0,
    "adapter_configuration": 0,
}
