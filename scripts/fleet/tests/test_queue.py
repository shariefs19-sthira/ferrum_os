from __future__ import annotations

import multiprocessing
import tempfile
import unittest
from pathlib import Path

from fleet.queue import (
    BoardCompileError,
    LeaseBusy,
    LeaseStore,
    PathValidationError,
    StaleLeaseToken,
    compile_board,
    compile_board_result,
    normalize_scope_path,
    paths_overlap,
)


HEADER = """# Board
| ID | Title | Envelope (files) | Eligible seats | Acceptance | Deps | Status |
|----|-------|------------------|----------------|------------|------|--------|
"""


def _claim_worker(database: str, start, output, index: int) -> None:
    store = LeaseStore(Path(database), process_checker=lambda _host, _pid: True)
    start.wait()
    try:
        lease = store.claim("W-9", "CRANE", "worktree", "branch", owner_pid=1000 + index)
        output.put(("claimed", lease.token))
    except LeaseBusy:
        output.put(("busy", None))


class CompilerTests(unittest.TestCase):
    def write_board(self, root: Path, rows: str) -> Path:
        path = root / "docs" / "TASK_BOARD.md"
        path.parent.mkdir(parents=True)
        path.write_text(HEADER + rows, encoding="utf-8")
        return path

    def test_compiles_exact_assignment_and_json_safe_record(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            self.write_board(root, "| W-1 | Build | `apps/web/a.ts` | CRANE | Acceptance: tested | — | READY |\n")
            tasks = compile_board(root)
            self.assertEqual(tasks[0].assignee, "CRANE")
            self.assertTrue(tasks[0].dispatchable)
            self.assertEqual(tasks[0].to_dict()["allowed_paths"], ["apps/web/a.ts"])
            self.assertEqual(len(tasks[0].board_revision), 64)

    def test_owner_agnostic_w78_is_rejected(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            self.write_board(root, "| W-78 | Concept | `docs/concept.md` | (any seat — owner-agnostic) | Acceptance: exists | W-31 | READY |\n")
            result = compile_board_result(root)
            self.assertEqual(result.rejected[0].task_id, "W-78")
            with self.assertRaises(BoardCompileError):
                compile_board(root)

    def test_historical_assignee_text_w79g_is_rejected(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            self.write_board(root, "| W-79g | Flythrough | `apps/web/fly.ts` | MASON [reassigned; RIVET earlier] | Acceptance: playable | — | READY |\n")
            result = compile_board_result(root)
            self.assertIn("exactly one seat", " ".join(result.rejected[0].reasons))

    def test_dependency_requires_board_or_supplied_evidence(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            self.write_board(root, "| W-2 | Consumer | `apps/web/b.ts` | MASON | Acceptance: tested | W-1 | READY |\n")
            task = compile_board(root, strict=False)[0]
            self.assertFalse(task.dispatchable)
            self.assertIn("missing from board", task.hold_reasons[0])
            task = compile_board(root, strict=False, evidence={"W-1": True})[0]
            self.assertTrue(task.dispatchable)

    def test_done_dependency_is_evidence(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            self.write_board(
                root,
                "| W-1 | Base | `apps/web/a.ts` | CRANE | Acceptance: tested | — | DONE — abc |\n"
                "| W-2 | Consumer | `apps/web/b.ts` | MASON | Acceptance: tested | W-1 | READY |\n",
            )
            tasks = {task.task_id: task for task in compile_board(root)}
            self.assertTrue(tasks["W-2"].dispatchable)

    def test_later_ready_scope_collision_is_held(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            self.write_board(
                root,
                "| W-1 | First | `apps/web/a.ts` | CRANE | Acceptance: tested | — | READY |\n"
                "| W-2 | Second | `apps/web/a.ts` | MASON | Acceptance: tested | — | READY |\n",
            )
            tasks = {task.task_id: task for task in compile_board(root)}
            self.assertTrue(tasks["W-1"].dispatchable)
            self.assertFalse(tasks["W-2"].dispatchable)
            self.assertIn("overlaps", tasks["W-2"].hold_reasons[0])

    def test_existing_remote_branch_requires_reconciliation(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            self.write_board(root, "| W-1 | Resume | `apps/web/a.ts` | CRANE | Acceptance: use origin/crane/w1-existing | — | READY |\n")
            task = compile_board(root)[0]
            self.assertFalse(task.dispatchable)
            self.assertIn("existing remote branch", task.hold_reasons[0])

    def test_paths_overlap_is_conservative_and_traversal_rejected(self):
        self.assertTrue(paths_overlap("apps/web/*/page.tsx", "apps/web/foo/page.tsx"))
        self.assertTrue(paths_overlap("apps/web", "apps/web/foo.ts"))
        self.assertFalse(paths_overlap("apps/mobile/**", "docs/readme.md"))
        with self.assertRaises(PathValidationError):
            normalize_scope_path("apps/web/../secrets")
        with self.assertRaises(PathValidationError):
            normalize_scope_path("D:/outside")


class LeaseTests(unittest.TestCase):
    def test_two_processes_cannot_claim_same_dimensions(self):
        with tempfile.TemporaryDirectory() as td:
            database = str(Path(td) / "leases.sqlite3")
            context = multiprocessing.get_context("spawn")
            start = context.Event()
            output = context.Queue()
            workers = [context.Process(target=_claim_worker, args=(database, start, output, i)) for i in range(2)]
            for worker in workers:
                worker.start()
            start.set()
            results = [output.get(timeout=15)[0] for _ in workers]
            for worker in workers:
                worker.join(timeout=15)
                self.assertEqual(worker.exitcode, 0)
            self.assertEqual(sorted(results), ["busy", "claimed"])

    def test_stale_token_cannot_complete_after_confirmed_dead_reclaim(self):
        with tempfile.TemporaryDirectory() as td:
            store = LeaseStore(Path(td) / "leases.sqlite3", process_checker=lambda _host, _pid: False)
            first = store.claim("W-1", "CRANE", "one", "branch-one", ttl_seconds=1, now=10, owner_pid=111)
            second = store.claim("W-1", "MASON", "two", "branch-two", ttl_seconds=10, now=12, owner_pid=222)
            self.assertNotEqual(first.token, second.token)
            with self.assertRaises(StaleLeaseToken):
                store.complete(first.token)
            store.complete(second.token, result_sha="abc")

    def test_expiry_does_not_reclaim_live_or_unknown_process(self):
        for state in (True, None):
            with self.subTest(state=state), tempfile.TemporaryDirectory() as td:
                store = LeaseStore(Path(td) / "leases.sqlite3", process_checker=lambda _host, _pid: state)
                store.claim("W-1", "CRANE", "one", "branch-one", ttl_seconds=1, now=10, owner_pid=111)
                with self.assertRaises(LeaseBusy):
                    store.claim("W-1", "MASON", "two", "branch-two", now=12, owner_pid=222)

    def test_seat_worktree_and_branch_are_exclusive(self):
        with tempfile.TemporaryDirectory() as td:
            store = LeaseStore(Path(td) / "leases.sqlite3", process_checker=lambda _host, _pid: True)
            store.claim("W-1", "CRANE", "one", "branch-one")
            for args in (
                ("W-2", "CRANE", "two", "branch-two"),
                ("W-2", "MASON", "one", "branch-two"),
                ("W-2", "MASON", "two", "branch-one"),
            ):
                with self.assertRaises(LeaseBusy):
                    store.claim(*args)


if __name__ == "__main__":
    multiprocessing.freeze_support()
    unittest.main()
