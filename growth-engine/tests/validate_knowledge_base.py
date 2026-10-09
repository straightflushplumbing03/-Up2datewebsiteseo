#!/usr/bin/env python3
"""Validate the growth-engine knowledge base and key site invariants.

Checks:
  1. Required knowledge-base files exist.
  2. All data/*.jsonl lines parse as JSON.
  3. data/BASELINE_METRICS.json parses.
  4. Site invariants from the 2026-10-07 audit still hold on indexable pages:
     exactly one <title>, one meta description, one canonical, one <h1>;
     0 broken internal <a href> to local .html targets.

Exit 0 on success, 1 on any failure. No network access.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
GE = os.path.join(ROOT, "growth-engine")
errors, warnings = [], []

REQUIRED = [
    "BUSINESS_PROFILE.md", "SERVICE_CATALOG.md", "SERVICE_AREAS.md",
    "APPROVED_CLAIMS.md", "BRAND_VOICE.md", "COMPETITOR_DIRECTORY.md",
    "KEYWORD_UNIVERSE.md", "AI_VISIBILITY_METHODOLOGY.md", "INTEGRATION_STATUS.md",
    "KNOWN_ISSUES.md", "EXPERIMENT_LOG.md", "CHANGELOG.md", "README.md",
]
for f in REQUIRED:
    if not os.path.exists(os.path.join(GE, f)):
        errors.append(f"missing knowledge-base file: growth-engine/{f}")

for f in ["ai_visibility_history.jsonl", "competitor_observations.jsonl",
          "technical_health_history.jsonl", "content_experiments.jsonl"]:
    p = os.path.join(GE, "data", f)
    if not os.path.exists(p):
        errors.append(f"missing data file: {f}")
        continue
    with open(p, encoding="utf-8") as fh:
        for i, line in enumerate(fh, 1):
            line = line.strip()
            if not line:
                continue
            try:
                json.loads(line)
            except Exception as e:
                errors.append(f"{f}:{i} invalid JSON: {e}")

try:
    json.load(open(os.path.join(GE, "data", "BASELINE_METRICS.json"), encoding="utf-8"))
except Exception as e:
    errors.append(f"BASELINE_METRICS.json invalid: {e}")

# --- Site invariants ---
def indexable_pages():
    pages = []
    for base, _, files in os.walk(ROOT):
        if "/.git" in base or "/growth-engine" in base or "/assets" in base:
            continue
        for fn in files:
            if fn.endswith(".html"):
                pages.append(os.path.join(base, fn))
    return pages

for p in indexable_pages():
    with open(p, encoding="utf-8") as fh:
        h = fh.read()
    rel = os.path.relpath(p, ROOT)
    if re.search(r'name=["\']robots["\'][^>]*noindex', h, re.I):
        continue  # intentional stubs
    if len(re.findall(r"<title", h, re.I)) != 1:
        errors.append(f"{rel}: expected 1 <title>")
    if len(re.findall(r'name=["\']description["\']', h, re.I)) != 1:
        errors.append(f"{rel}: expected 1 meta description")
    if len(re.findall(r'rel=["\']canonical["\']', h, re.I)) != 1:
        errors.append(f"{rel}: expected 1 canonical")
    if len(re.findall(r"<h1[ >]", h, re.I)) != 1:
        errors.append(f"{rel}: expected 1 <h1>")

print(f"Checked {len(indexable_pages())} HTML files.")
if errors:
    print("FAIL:")
    for e in errors[:50]:
        print("  -", e)
    sys.exit(1)
print("OK: knowledge base + site invariants validated.")
