"""Tests for scripts/merge_append_only.py.

The failure this guards against is silent data loss: a merge resolution that
keeps one side of an append-only file and discards entries that exist only on
the other. That already happened once on a real branch, so every test asserts
that content from BOTH sides survives.
"""

import json
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scripts"))

import merge_append_only as m


def rec(ts, q):
    return json.dumps({"ts": ts, "query": q})


class TestJsonlUnion(unittest.TestCase):
    def test_keeps_entries_from_both_sides(self):
        ours = [{"ts": "2026-10-12T10:00:00Z", "q": "a"}]
        theirs = [{"ts": "2026-10-11T10:00:00Z", "q": "b"}]
        out = m.union_jsonl(ours, theirs)
        lines = [json.loads(l) for l in out.splitlines()]
        self.assertEqual({r["q"] for r in lines}, {"a", "b"})

    def test_sorts_by_ts_ascending(self):
        ours = [{"ts": "2026-10-12T10:00:00Z", "q": "later"}]
        theirs = [{"ts": "2026-10-10T10:00:00Z", "q": "earlier"}]
        out = m.union_jsonl(ours, theirs)
        self.assertEqual([json.loads(l)["q"] for l in out.splitlines()], ["earlier", "later"])

    def test_deduplicates_identical_records(self):
        same = {"ts": "2026-10-12T10:00:00Z", "q": "dup"}
        out = m.union_jsonl([same], [dict(same)])
        self.assertEqual(len(out.splitlines()), 1)

    def test_keeps_same_ts_different_content(self):
        """Two records can share a timestamp; neither may be dropped."""
        ours = [{"ts": "2026-10-12T10:00:00Z", "q": "one"}]
        theirs = [{"ts": "2026-10-12T10:00:00Z", "q": "two"}]
        out = m.union_jsonl(ours, theirs)
        self.assertEqual(len(out.splitlines()), 2)

    def test_skips_conflict_markers_and_bad_lines(self, tmp_path=None):
        import tempfile

        body = (
            "<<<<<<< HEAD\n"
            + rec("2026-10-12T10:00:00Z", "a")
            + "\n=======\n"
            + rec("2026-10-11T10:00:00Z", "b")
            + "\n>>>>>>> origin/x\n"
            + "not json\n"
        )
        with tempfile.NamedTemporaryFile("w", suffix=".jsonl", delete=False) as fh:
            fh.write(body)
            path = fh.name
        try:
            rows = m.load_jsonl(path)
            self.assertEqual({r["query"] for r in rows}, {"a", "b"})
        finally:
            os.unlink(path)


class TestMarkdownUnion(unittest.TestCase):
    OURS = (
        "# Log\n\n"
        "## 2026-10-15 (third run) - newest entry\n\nours newest body\n\n"
        "## 2026-10-12 (Phase 2) - shared heading\n\nours shared body\n"
    )
    THEIRS = (
        "# Log\n\n"
        "## 2026-10-12 (Phase 2) - shared heading\n\ntheirs shared body\n\n"
        "## 2026-10-12 (HQ-D run #2) - only on theirs\n\ntheirs unique body\n"
    )

    def test_keeps_sections_unique_to_either_side(self):
        out = m.union_markdown(self.OURS, self.THEIRS)
        self.assertIn("ours newest body", out)
        self.assertIn("theirs unique body", out)

    def test_orders_newest_first(self):
        out = m.union_markdown(self.OURS, self.THEIRS)
        self.assertLess(out.index("2026-10-15"), out.index("2026-10-12"))

    def test_ours_wins_on_heading_collision(self):
        out = m.union_markdown(self.OURS, self.THEIRS)
        self.assertIn("ours shared body", out)
        self.assertNotIn("theirs shared body", out)

    def test_preamble_is_not_duplicated(self):
        out = m.union_markdown(self.OURS, self.THEIRS)
        self.assertEqual(out.count("# Log"), 1)

    def test_no_conflict_markers_survive(self):
        out = m.union_markdown(self.OURS, self.THEIRS)
        for marker in ("<<<<<<<", "=======", ">>>>>>>"):
            self.assertNotIn(marker, out)


if __name__ == "__main__":
    unittest.main()
