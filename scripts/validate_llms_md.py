#!/usr/bin/env python3
"""Validate the AI-readable files: /md/**, /llms-full.txt, /llms.txt, robots.txt.

Stdlib only. Checks:
  1. Every link in md/** that points at our domain resolves to a real file.
  2. llms-full.txt exists and contains each mirrored page.
  3. No secret-looking strings leaked into the public AI files.
  4. robots.txt does not Disallow / and does not block the sitemap or /md/.
Exit 0 if OK, 1 otherwise.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOMAIN = "https://straightflushplumbingoc.com"
MD = os.path.join(ROOT, "md")

SECRET_PATTERNS = [
    r"cfast_[A-Za-z0-9_-]{10,}",          # Cloudflare Access service token
    r"gh[pousr]_[A-Za-z0-9]{20,}",        # GitHub tokens
    r"sk-[A-Za-z0-9]{20,}",               # generic API keys
    r"Bearer\s+[A-Za-z0-9._-]{20,}",
    r"[a-f0-9]{32}\.access",              # Access client id
]

errors = []


def local_path_for(url: str):
    if not url.startswith(DOMAIN):
        return None
    p = url[len(DOMAIN):].split("#")[0].split("?")[0]
    if p in ("", "/"):
        return os.path.join(ROOT, "index.html")
    p = p.lstrip("/")
    cand = os.path.join(ROOT, p)
    if os.path.isdir(cand):
        cand = os.path.join(cand, "index.html")
    if not os.path.exists(cand) and not p.endswith(".html"):
        alt = os.path.join(ROOT, p + ".html")
        if os.path.exists(alt):
            return alt
    return cand


md_files = []
for base, _, files in os.walk(MD):
    for fn in files:
        if fn.endswith(".md"):
            md_files.append(os.path.join(base, fn))

for path in md_files:
    text = open(path, encoding="utf-8").read()
    rel = os.path.relpath(path, ROOT)
    for url in re.findall(r"\]\((https?://[^)\s]+)\)", text):
        lp = local_path_for(url)
        if lp is not None and not os.path.exists(lp):
            errors.append(f"{rel}: link target missing on disk: {url}")
    for pat in SECRET_PATTERNS:
        if re.search(pat, text):
            errors.append(f"{rel}: possible secret leaked (pattern {pat})")

full = os.path.join(ROOT, "llms-full.txt")
if not os.path.exists(full):
    errors.append("llms-full.txt missing")
else:
    ftxt = open(full, encoding="utf-8").read()
    for path in md_files:
        canonical = None
        m = re.search(r"canonical HTML page: (\S+)", open(path, encoding="utf-8").read())
        if m:
            canonical = m.group(1)
        if canonical and canonical not in ftxt:
            errors.append(f"llms-full.txt missing page: {canonical}")
    for pat in SECRET_PATTERNS:
        if re.search(pat, ftxt):
            errors.append(f"llms-full.txt: possible secret leaked (pattern {pat})")

robots = open(os.path.join(ROOT, "robots.txt"), encoding="utf-8").read()
for line in robots.splitlines():
    s = line.strip().lower()
    if s.startswith("disallow:") and s.split(":", 1)[1].strip() in ("/", ""):
        errors.append("robots.txt: Disallow / would block the whole site")
    if s.startswith("disallow:") and "sitemap" in s:
        errors.append("robots.txt: sitemap disallowed")
for need in ("/llms.txt", "/llms-full.txt", "/md/", "/sitemap.xml"):
    if need not in robots:
        errors.append(f"robots.txt: expected reference to {need}")

print(f"Validated {len(md_files)} markdown mirrors + llms-full.txt + robots.txt")
if errors:
    print("FAIL:")
    for e in errors[:50]:
        print("  -", e)
    sys.exit(1)
print("OK: AI-readable files valid (links resolve, no secrets, robots sane).")
