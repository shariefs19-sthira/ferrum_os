import json
import tempfile
import unittest
from pathlib import Path

from fleet.adapters import build_invocation, classify_failure, extract_session_id


class AdapterTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.schema = self.root / "schema.json"
        self.schema.write_text('{"type":"object"}', encoding="utf-8")

    def tearDown(self):
        self.tmp.cleanup()

    def test_codex_uses_structured_supported_flags_without_shell(self):
        invocation = build_invocation("codex", self.root, "do work", self.schema, self.root / "last.json")
        self.assertEqual(invocation.argv[:2], ("codex", "exec"))
        self.assertIn("--json", invocation.argv)
        self.assertIn("--output-schema", invocation.argv)
        self.assertIn("--approve-for-me", invocation.argv)
        self.assertNotIn("--sandbox", invocation.argv)
        self.assertNotIn("--ask-for-approval", invocation.argv)
        self.assertEqual(invocation.stdin_text, "do work")

    def test_codex_canary_can_be_forced_read_only(self):
        invocation = build_invocation("codex", self.root, "inspect", self.schema, self.root / "last.json", sandbox="read-only")
        self.assertEqual(invocation.argv[invocation.argv.index("--sandbox") + 1], "read-only")
        self.assertNotIn("--approve-for-me", invocation.argv)

    def test_claude_has_explicit_resumable_session(self):
        invocation = build_invocation("claude", self.root, "do work", self.schema, self.root / "last.json", session_id="12345678-1234-1234-1234-123456789abc")
        self.assertIn("--session-id", invocation.argv)
        self.assertIn("stream-json", invocation.argv)

    def test_extract_codex_thread_id(self):
        line = json.dumps({"type": "thread.started", "thread_id": "abc"})
        self.assertEqual(extract_session_id("codex", [line], "fallback"), "abc")

    def test_failure_categories_are_not_conflated(self):
        self.assertEqual(classify_failure(1, "", "proxy connection reset"), "network")
        self.assertEqual(classify_failure(1, "usage limit reached", ""), "provider_limit")
        self.assertEqual(classify_failure(1, "protected path", ""), "governance_hold")
        self.assertEqual(classify_failure(2, "", "option cannot be used with another"), "adapter_configuration")


if __name__ == "__main__":
    unittest.main()
