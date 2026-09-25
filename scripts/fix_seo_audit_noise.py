#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
One-shot modernizer for scripts/seo_audit.py:

The site's deliberate SEO architecture keeps a noindex stub of every real page
at the repo root (e.g. /aliso-viejo.html -> noindex, canonical -> /cities/…)
so old inbound links keep working without creating duplicate indexed content.
The audit script counted those stubs as duplicate titles, orphan pages, and
canonical anomalies, drowning the signal.

This patch adds a noindex-aware "effective set" so the duplicate/orphan/canonical
checks evaluate the 74 indexable pages that actually compete in search, while
still listing stub health separately (correct noindex + canonical presence).

Idempotent: safe to re-run (patches are applied only once).
Run from project root:  python3 scripts/fix_seo_audit_noise.py
"""
import re
import sys

PATH = "scripts/seo_audit.py"

with open(PATH, encoding="utf-8") as fh:
    src = fh.read()

if "STUB-AWARE" in src:
    print("Already patched — nothing to do.")
    sys.exit(0)

# 1. teach parse_page to record noindex status
src = src.replace(
    """    p.rel = rel
    p.raw = raw
    p.title = p.title.strip()
    return p""",
    """    p.rel = rel
    p.raw = raw
    p.title = p.title.strip()
    # STUB-AWARE: noindex stubs are canonicalized duplicates by design
    p.is_stub = bool(p.meta_robots and "noindex" in p.meta_robots.lower())
    return p""",
    1,
)

# 2. duplicate titles -> evaluate indexable set only
src = src.replace(
    """    dt = {t: c for t, c in dup_titles.items() if c > 1 and t}
    print(f"  duplicate titles:         {len(dt)} clusters")
    for t, c in list(dt.items())[:10]:
        files = [r for r, p in pages.items() if p.title.lower() == t]
        print(f"     x{c}: {t[:70]}  ->  {files}")""",
    """    live_titles = Counter(p.title.lower() for p in pages.values() if not p.is_stub)
    dt = {t: c for t, c in live_titles.items() if c > 1 and t}
    print(f"  duplicate titles (indexable pages): {len(dt)} clusters")
    for t, c in list(dt.items())[:10]:
        files = [r for r, p in pages.items() if p.title.lower() == t and not p.is_stub]
        print(f"     x{c}: {t[:70]}  ->  {files}")
    stubs = sorted(r for r, p in pages.items() if p.is_stub)
    print(f"  noindex stub pages (by design):       {len(stubs)}")""",
    1,
)

# 3. canonical anomalies -> skip stubs in the self-canonical check
src = src.replace(
    """    canon_issues = []
    for r, p in pages.items():
        if not p.canonical:
            continue""",
    """    canon_issues = []
    for r, p in pages.items():
        if p.is_stub:
            continue  # STUB-AWARE: stubs intentionally canonicalize elsewhere
        if not p.canonical:
            continue""",
    1,
)

# 4. orphans -> indexable set only
src = src.replace(
    """    orphans = [r for r in pages if inbound[r] == 0]""",
    """    orphans = [r for r in pages if inbound[r] == 0 and not pages[r].is_stub]""",
    1,
)

# 5. canonical integrity: add explicit stub-health summary
src = src.replace(
    """    print(f"  canonical anomalies: {len(canon_issues)}")""",
    """    stub_no_canon = [r for r, p in pages.items() if p.is_stub and not p.canonical]
    print(f"  canonical anomalies (indexable pages): {len(canon_issues)}")
    print(f"  stubs missing a canonical (should be 0): {len(stub_no_canon)} {stub_no_canon[:5]}")""",
    1,
)

with open(PATH, "w", encoding="utf-8") as fh:
    fh.write(src)

print("Patched scripts/seo_audit.py: audit now evaluates the indexable page set,")
print("with stub health (noindex + canonical present) reported separately.")
