#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Correct business hours sitewide (owner-confirmed):
  Mon–Fri 8am–7pm · Sat 9am–6pm · Sun closed (24/7 for EMERGENCY calls only).

An earlier version of the site said "Sat–Sun 9am–6pm", which conflicts with the
generator template in scripts/build.py (already correct: "Sun Closed"). This
patcher brings every shipped HTML file, the homepage JSON-LD, and llms.txt in
line — matching, never inventing, phrasing that already exists in build.py.

Idempotent: re-running is a no-op once all patterns are replaced.
Run from project root:  python3 scripts/fix_hours.py
"""
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# (old, new, expected_count_note)
HTML_SUBS = [
    # Footer / hours list — matches the exact markup used on all pages.
    ("Mon&ndash;Fri 8am&ndash;7pm &middot; Sat&ndash;Sun 9am&ndash;6pm<br>24/7 for emergencies",
     "Mon&ndash;Fri 8am&ndash;7pm &middot; Sat 9am&ndash;6pm &middot; Sun closed<br>24/7 for emergency calls"),
    # homepage JSON-LD "description" (compact ASCII form)
    ("Open Mon-Fri 8am-7pm and Sat-Sun 9am-6pm.",
     "Open Mon-Fri 8am-7pm, Sat 9am-6pm; closed Sunday (24/7 for emergency calls)."),
]

LLMS_SUBS = [
    ("Monday\u2013Friday 8:00 a.m.\u20137:00 p.m.; Saturday\u2013Sunday 9:00 a.m.\u20136:00 p.m.; 24/7 for emergencies",
     "Monday\u2013Friday 8:00 a.m.\u20137:00 p.m.; Saturday 9:00 a.m.\u20136:00 p.m.; closed Sunday; 24/7 for emergency calls"),
]

def main():
    html_changed = 0
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if not d.startswith(".") and d not in ("node_modules",)]
        for fn in filenames:
            if not fn.endswith(".html"):
                continue
            path = os.path.join(dirpath, fn)
            with open(path, encoding="utf-8") as fh:
                raw = fh.read()
            new = raw
            for old, repl in HTML_SUBS:
                new = new.replace(old, repl)
            if new != raw:
                with open(path, "w", encoding="utf-8") as fh:
                    fh.write(new)
                html_changed += 1

    llms = os.path.join(ROOT, "llms.txt")
    llms_changed = False
    if os.path.exists(llms):
        with open(llms, encoding="utf-8") as fh:
            raw = fh.read()
        new = raw
        for old, repl in LLMS_SUBS:
            new = new.replace(old, repl)
        if new != raw:
            with open(llms, "w", encoding="utf-8") as fh:
                fh.write(new)
            llms_changed = True

    print(f"HTML files updated: {html_changed}")
    print(f"llms.txt updated:   {llms_changed}")

    # ---- verification pass: nothing stale may remain ----
    stale = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if not d.startswith(".")]
        for fn in filenames:
            if not fn.endswith((".html", ".txt")):
                continue
            path = os.path.join(dirpath, fn)
            with open(path, encoding="utf-8", errors="replace") as fh:
                content = fh.read()
            if "Sat&ndash;Sun 9am" in content or "Sat-Sun 9am" in content or "Saturday\u2013Sunday" in content:
                stale.append(os.path.relpath(path, ROOT))
    if stale:
        print(f"STALE HOURS REMAIN in {len(stale)} file(s): {stale}")
        raise SystemExit(1)
    print("Verification: no stale 'Sat-Sun 9am-6pm' hours remain anywhere.")

if __name__ == "__main__":
    main()
