#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Case-study integrity note (BASE-02).

The four /case-studies/ pages describe specific jobs with a customer quote,
a "recently completed ... (Month Year)" claim, and a published cost range.
`growth-engine/APPROVED_CLAIMS.md` FORBIDS fabricated case studies and marks
published price ranges as RESTRICTED (owner confirmation required), and the
growth-engine knowledge base cannot confirm these four jobs were real.

This patch does NOT delete or rewrite the case studies and does NOT change the
business's own copy. It adds ONE honest disclosure line to each page so the
pages do not assert unverified specifics or a quote as fact while the owner
confirms the source. Fully reversible (delete the inserted <p>).

Owner action: confirm each case study reflects a real completed job. If real,
restore/keep the specifics and this note can be removed. If illustrative, keep
the note and remove the fabricated specifics.

Idempotent. Run from project root:  python3 scripts/patch_case_study_integrity.py
"""
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CS = os.path.join(ROOT, "case-studies")

NOTE = (
    '<p class="muted" style="font-size:0.85rem;margin-top:8px;">'
    'Illustrative example of the kind of work we perform in this area. '
    'Individual results, timelines, and pricing vary by home, and pricing is '
    'confirmed only after on-site diagnosis.'
    '</p>'
)

# Insert immediately after the hero-sub paragraph that introduces the job.
HERO_SUB_RE = re.compile(r'(<p class="hero-sub">Straight Flush Plumbing recently completed[^<]*</p>)')

changed = 0
for fn in sorted(os.listdir(CS)):
    if not fn.endswith(".html") or fn == "index.html":
        continue
    path = os.path.join(CS, fn)
    src = open(path, encoding="utf-8").read()
    if "Illustrative example of the kind of work" in src:
        print(f"  =  already noted: {fn}")
        continue
    new, n = HERO_SUB_RE.subn(lambda m: m.group(1) + "\n    " + NOTE, src, count=1)
    if n != 1:
        print(f"  !! hero-sub not matched: {fn}")
        continue
    open(path, "w", encoding="utf-8", newline="").write(new)
    changed += 1
    print(f"  \u2714 note added: {fn}")

print(f"\n{changed} case-study page(s) updated.")
