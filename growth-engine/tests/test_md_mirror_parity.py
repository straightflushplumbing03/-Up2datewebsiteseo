"""The md/ mirrors and llms-full.txt must match the HTML they are generated from.

AI engines and llms.txt readers get these files instead of the HTML. When a PR edits a
mirrored page and does not re-run `python3 scripts/gen_llms_md.py`, the AI-readable copy
keeps the old text. That happened after the 2026-11-09 merge batch (10 stale mirrors,
fixed in #154) and again in open PRs: #166 removes an unapproved "Same-day diagnosis"
claim from services/water-heater-services.html, but md/services/water-heater-services.md
and llms-full.txt still carry it. validate_llms_md.py checks links and secrets, not parity.

Fix for a failure: run `python3 scripts/gen_llms_md.py` and commit md/ and llms-full.txt.
This test renders in memory; it never writes files.
"""
import importlib.util
import os
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_spec = importlib.util.spec_from_file_location("gen_llms_md", os.path.join(ROOT, "scripts", "gen_llms_md.py"))
gen = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(gen)


def _render():
    """Mirror of gen_llms_md.main(), returning {relative path: text} instead of writing."""
    out, full_parts = {}, []
    for src, slug, section in gen.PAGES:
        path = os.path.join(ROOT, src)
        if not os.path.exists(path):
            continue
        h = open(path, encoding="utf-8").read()
        title, desc, canonical = gen.extract_head(h)
        if not canonical:
            canonical = f"{gen.DOMAIN}/{src}"
        md = gen.front_matter(title, desc, canonical, section) + gen.to_markdown(gen.extract_body(h), src)
        out["md/" + slug] = md.rstrip() + "\n"
        full_parts.append(f"\n\n<!-- ===== {canonical} ===== -->\n\n" + md.rstrip() + "\n")
    header = (
        "# Straight Flush Plumbing & Leak Detection - Full AI-readable content\n\n"
        f"> Complete Markdown mirror of key public pages. Canonical site: {gen.DOMAIN}/\n"
        "> Contact: (949) 374-6524. This file is generated from the site HTML; the\n"
        "> HTML pages remain canonical.\n"
    )
    out["llms-full.txt"] = header + "".join(full_parts)
    return out


class MdMirrorParity(unittest.TestCase):
    def test_mirrors_match_html(self):
        expected = _render()
        stale = []
        for rel, text in expected.items():
            p = os.path.join(ROOT, rel)
            cur = open(p, encoding="utf-8").read() if os.path.exists(p) else None
            if cur != text:
                stale.append(rel)
        self.assertEqual(stale, [], "AI-readable mirrors are stale; run `python3 scripts/gen_llms_md.py` "
                         "and commit md/ and llms-full.txt: " + ", ".join(stale))

    def test_render_matches_generator(self):
        # Guard against this test's copy of main() drifting from the script itself.
        src = open(os.path.join(ROOT, "scripts", "gen_llms_md.py"), encoding="utf-8").read()
        for needle in ('md.rstrip() + "\\n"', '<!-- ===== {canonical} ===== -->',
                       "Full AI-readable content", "HTML pages remain canonical"):
            self.assertIn(needle, src, "gen_llms_md.py output format changed; update _render() here")


if __name__ == "__main__":
    unittest.main()
