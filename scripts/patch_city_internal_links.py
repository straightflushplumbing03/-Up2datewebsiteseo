#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
City-to-city internal linking fix (BASE-10).

Seven "Also serving communities near {City}" chips pointed at
`../service-areas.html#<slug>`, but service-areas.html contains no matching
`id="<slug>"` anchors, so every one of them landed at the top of the hub page
(a dead fragment) instead of the city page that actually exists.

Each of the target cities has a real sibling page in cities/. Rewriting the chip
to `<slug>.html` strengthens the city<->city link graph (helps the "nearby city"
relevance signal for local search) and removes the dead fragment. No content or
fact change.

Idempotent. Run from project root:  python3 scripts/patch_city_internal_links.py
"""
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CITIES = os.path.join(ROOT, "cities")

# only rewrite inside a city-chip anchor, and only when the target city page exists
CHIP_RE = re.compile(r'(<a class="city-chip" href=")\.\./service-areas\.html#([a-z-]+)(">)')

changed_files = 0
changed_links = 0
for fn in sorted(os.listdir(CITIES)):
    if not fn.endswith(".html") or fn == "index.html":
        continue
    path = os.path.join(CITIES, fn)
    src = open(path, encoding="utf-8").read()

    def repl(m):
        global changed_links
        slug = m.group(2)
        if not os.path.exists(os.path.join(CITIES, f"{slug}.html")):
            return m.group(0)  # leave untouched if there is no city page
        changed_links += 1
        return f'{m.group(1)}{slug}.html{m.group(3)}'

    new = CHIP_RE.sub(repl, src)
    if new != src:
        open(path, "w", encoding="utf-8", newline="").write(new)
        changed_files += 1
        print(f"  \u2714 {fn}")

print(f"\n{changed_links} chip link(s) fixed across {changed_files} file(s).")
