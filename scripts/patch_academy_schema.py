#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""One-off: mirror Article schema from legacy root copies to canonical academy pages.

The noindexed root copies of two articles carry full Article/Breadcrumb JSON-LD
while the canonical academy/ pages (the indexed ones) carry none. This copies the
blocks, rewriting any self-referential URL/@id to the academy path. Idempotent:
skips pages that already contain application/ld+json.
"""
import json
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOMAIN = "https://straightflushplumbingoc.com"

PAIRS = [
    ("acoustic-leak-detection-explained.html", "academy/acoustic-leak-detection-explained.html"),
    ("annual-plumbing-checkup-checklist.html", "academy/annual-plumbing-checkup-checklist.html"),
]

LD_RE = re.compile(r'<script type="application/ld\+json">\s*(.*?)\s*</script>', re.S)


def extract_blocks(path):
    with open(path, encoding="utf-8") as fh:
        src = fh.read()
    return LD_RE.findall(src)


def rewrite_urls(blob, old_path, new_path):
    old_url = f"{DOMAIN}/{old_path}"
    new_url = f"{DOMAIN}/{new_path}"
    blob = blob.replace(old_url, new_url)
    # also catch extensionless or @id variants pointing at the same doc
    blob = blob.replace(f"{DOMAIN}/{old_path[:-5]}", f"{DOMAIN}/{new_path[:-5]}")
    return blob


for src_rel, dst_rel in PAIRS:
    dst_path = os.path.join(ROOT, dst_rel)
    with open(dst_path, encoding="utf-8") as fh:
        dst = fh.read()
    if "application/ld+json" in dst:
        print(f"  = already has schema: {dst_rel}")
        continue
    blocks = extract_blocks(os.path.join(ROOT, src_rel))
    if not blocks:
        print(f"  !! no source schema blocks: {src_rel}")
        continue
    rewritten = []
    for b in blocks:
        b = rewrite_urls(b, src_rel, dst_rel)
        try:
            json.loads(b)  # must remain valid JSON
        except Exception as e:
            print(f"  !! invalid JSON after rewrite in {src_rel}: {e}")
            break
        rewritten.append(b)
    else:
        inject = "".join(
            f'<script type="application/ld+json">\n{b}\n</script>\n' for b in rewritten
        )
        # insert before </head>
        idx = dst.find("</head>")
        assert idx > 0
        dst = dst[:idx] + inject + dst[idx:]
        with open(dst_path, "w", encoding="utf-8", newline="") as fh:
            fh.write(dst)
        print(f"  ✔ injected {len(rewritten)} schema block(s): {dst_rel}")

print("done")
