#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""One-off: trim meta descriptions >165c to <=~155c. Idempotent."""
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

FIXES = {
    "insurance/dos-and-donts-talking-to-insurance.html":
        "What to say — and not say — to your insurer after a slab leak, and why the plumber's written report matters for Orange County claims.",
    "services/slab-leak-detection.html":
        "Slab leak detection in Laguna Niguel and South OC. Acoustic and thermal imaging for 1970s–90s copper homes. Diagnose before any concrete is cut. (949) 374-6524.",
    "south-oc-slab-leak-specialist.html":
        "Why 1970s–90s South OC homes get slab leaks: aging copper, expansive clay, hard water — and how acoustic and thermal detection finds them before demolition.",
    "services/leak-detection.html":
        "Hidden water leak detection in Laguna Niguel using acoustic, electronic and thermal methods. No unnecessary demolition. Lance answers the phone.",
    "about.html":
        "Meet Lance, owner of Straight Flush Plumbing in Laguna Niguel. Diagnose-first acoustic and thermal leak detection for South OC copper-era homes.",
    "services/emergency-plumbing.html":
        "Emergency plumber in Orange County, 24/7. Burst pipes, slab leaks, water heater failures. Call (949) 374-6524.",
    "about/straight-flush-plumbing-orange-county.html":
        "Owner-operated Laguna Niguel plumber for slab leak detection, repiping and water heaters across South Orange County. Diagnose-first, honest pricing.",
    "services/index.html":
        "Full-service plumbing in Laguna Niguel and South Orange County — leak detection, slab leak repair, PEX repiping, water heaters, drain cleaning and repair.",
    "contact.html":
        "Schedule leak detection or plumbing service in Laguna Niguel and Orange County. Call, email, or request a callback from Straight Flush Plumbing.",
    "service-areas.html":
        "Straight Flush Plumbing serves Laguna Niguel, Dana Point, San Clemente, Mission Viejo, Irvine, Newport Beach and all of South Orange County.",
    "academy/acoustic-leak-detection-explained.html":
        "How acoustic leak detection works, what the equipment hears, and why it finds hidden leaks without tearing open walls. From Laguna Niguel.",
}

DESC_RE = re.compile(r'(<meta name="description" content=")([^"]*)("\s*/?>)')

for rel, new in FIXES.items():
    path = os.path.join(ROOT, rel)
    with open(path, encoding="utf-8") as fh:
        src = fh.read()
    m = DESC_RE.search(src)
    if not m:
        print(f"  !! no description meta found: {rel}")
        continue
    old_val = m.group(2)
    if old_val == new:
        print(f"  =  already set: {rel}")
        continue
    # idempotency: only rewrite when current value is one of the long originals
    # (match by length heuristic — all originals are >165c)
    if len(old_val) <= 160:
        print(f"  ~ skip (already short, {len(old_val)}c): {rel}")
        continue
    src = src[:m.start(2)] + new + src[m.end(2):]
    with open(path, "w", encoding="utf-8", newline="") as fh:
        fh.write(src)
    print(f"  ✔ {len(old_val)}c -> {len(new)}c  {rel}")

print("done")
