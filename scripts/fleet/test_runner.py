import tempfile
import unittest
import subprocess
from pathlib import Path

from fleet.runner import read_structured_result, record_runtime_hold, validate_worker_result


class RunnerTests(unittest.TestCase):
    def test_reads_schema_shaped_last_message(self):
        with tempfile.TemporaryDirectory() as directory:
            result = Path(directory) / "result.json"
            result.write_text('{"task_id":"W-1","status":"completed","changed_paths":[]}', encoding="utf-8")
            self.assertEqual(read_structured_result(result, "")["task_id"], "W-1")

    def test_runtime_hold_is_bound_to_row_hash(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            record_runtime_hold(root, {"task_id": "W-1", "row_hash": "abc", "board_revision": "def"}, "blocked")
            hold = root / ".fleet-runtime" / "holds" / "W-1.json"
            self.assertIn('"row_hash": "abc"', hold.read_text(encoding="utf-8"))

    def test_worker_result_must_match_git_and_allowed_paths(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            subprocess.run(("git", "init", "-b", "main"), cwd=root, check=True, capture_output=True)
            subprocess.run(("git", "config", "user.email", "test@example.invalid"), cwd=root, check=True)
            subprocess.run(("git", "config", "user.name", "Test"), cwd=root, check=True)
            (root / "allowed").mkdir()
            (root / "allowed" / "a.txt").write_text("base", encoding="utf-8")
            subprocess.run(("git", "add", "."), cwd=root, check=True)
            subprocess.run(("git", "commit", "-m", "base"), cwd=root, check=True, capture_output=True)
            base = subprocess.run(("git", "rev-parse", "HEAD"), cwd=root, check=True, capture_output=True, text=True).stdout.strip()
            subprocess.run(("git", "switch", "-c", "crane/w-1"), cwd=root, check=True, capture_output=True)
            (root / "allowed" / "a.txt").write_text("changed", encoding="utf-8")
            subprocess.run(("git", "add", "."), cwd=root, check=True)
            subprocess.run(("git", "commit", "-m", "change"), cwd=root, check=True, capture_output=True)
            head = subprocess.run(("git", "rev-parse", "HEAD"), cwd=root, check=True, capture_output=True, text=True).stdout.strip()
            task = {"task_id": "W-1", "allowed_paths": ["allowed/**"]}
            result = {"task_id": "W-1", "status": "completed", "commit_sha": head, "changed_paths": ["allowed/a.txt"]}
            changed, reported_head = validate_worker_result(root, root, "crane/w-1", base, task, result)
            self.assertEqual(changed, ["allowed/a.txt"])
            self.assertEqual(reported_head, head)

    def test_worker_result_rejects_report_git_mismatch(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            subprocess.run(("git", "init", "-b", "main"), cwd=root, check=True, capture_output=True)
            subprocess.run(("git", "config", "user.email", "test@example.invalid"), cwd=root, check=True)
            subprocess.run(("git", "config", "user.name", "Test"), cwd=root, check=True)
            (root / "a.txt").write_text("base", encoding="utf-8")
            subprocess.run(("git", "add", "."), cwd=root, check=True)
            subprocess.run(("git", "commit", "-m", "base"), cwd=root, check=True, capture_output=True)
            base = subprocess.run(("git", "rev-parse", "HEAD"), cwd=root, check=True, capture_output=True, text=True).stdout.strip()
            subprocess.run(("git", "switch", "-c", "crane/w-1"), cwd=root, check=True, capture_output=True)
            (root / "a.txt").write_text("changed", encoding="utf-8")
            subprocess.run(("git", "add", "."), cwd=root, check=True)
            subprocess.run(("git", "commit", "-m", "change"), cwd=root, check=True, capture_output=True)
            head = subprocess.run(("git", "rev-parse", "HEAD"), cwd=root, check=True, capture_output=True, text=True).stdout.strip()
            result = {"task_id": "W-1", "status": "completed", "commit_sha": head, "changed_paths": []}
            with self.assertRaisesRegex(RuntimeError, "differ from Git"):
                validate_worker_result(root, root, "crane/w-1", base, {"task_id": "W-1", "allowed_paths": ["a.txt"]}, result)


if __name__ == "__main__":
    unittest.main()
