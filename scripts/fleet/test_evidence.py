import json
import subprocess
import tempfile
import unittest
from pathlib import Path

from fleet.evidence import verify_evidence


class EvidenceTests(unittest.TestCase):
    def test_states_remain_distinct(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            subprocess.run(("git", "init", "-b", "main"), cwd=repo, check=True, capture_output=True)
            subprocess.run(("git", "config", "user.email", "test@example.invalid"), cwd=repo, check=True)
            subprocess.run(("git", "config", "user.name", "Test"), cwd=repo, check=True)
            (repo / "file.txt").write_text("x", encoding="utf-8")
            subprocess.run(("git", "add", "file.txt"), cwd=repo, check=True)
            subprocess.run(("git", "commit", "-m", "seed"), cwd=repo, check=True, capture_output=True)
            subprocess.run(("git", "remote", "add", "origin", str(repo)), cwd=repo, check=True)
            subprocess.run(("git", "fetch", "origin", "main:refs/remotes/origin/main"), cwd=repo, check=True, capture_output=True)
            state = verify_evidence(repo, "main", ("file.txt",), base_sha=subprocess.run(("git", "rev-parse", "HEAD"), cwd=repo, check=True, capture_output=True, text=True).stdout.strip())
            self.assertFalse(state.authored)
            self.assertFalse(state.landed)
            self.assertFalse(state.deployed)
            self.assertFalse(state.live)


if __name__ == "__main__":
    unittest.main()
