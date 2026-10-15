#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Shorten over-length indexable <title> tags (BASE-12).

Google truncates title links beyond roughly 60 characters, which weakens CTR and
can rewrite the link. 25 indexable pages carried titles of 65-89 chars (mostly a
redundant "| Leak Detection Academy" / "| Orange County" tail). This rewrites
each to <=60c while keeping the page's primary keyword and search intent, and
updates the mirrors (og:title / twitter:title) when they carried the same string.

Uniqueness and length are asserted before writing. Idempotent.

Run from project root:  python3 scripts/patch_titles.py
"""
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# rel path -> (old exact title, new title)
FIXES = {
    "index.html": (
        "Straight Flush Plumbing | Leak Detection & Plumber in Orange County",
        "Straight Flush Plumbing | Leak Detection in Orange County",
    ),
    "contact.html": (
        "Contact Straight Flush Plumbing & Leak Detection | Schedule Service",
        "Contact Straight Flush Plumbing | Schedule Service",
    ),
    "academy/acoustic-leak-detection-explained.html": (
        "Acoustic Leak Detection Explained In Plain English | Leak Detection Academy",
        "Acoustic Leak Detection Explained | Leak Detection Academy",
    ),
    "academy/copper-vs-pex-pipes.html": (
        "Copper vs. PEX Pipes: What Homeowners Should Know | Leak Detection Academy",
        "Copper vs. PEX Pipes: What Homeowners Should Know",
    ),
    "academy/hidden-costs-of-ignoring-a-leak.html": (
        "The Hidden Costs Of Ignoring A Suspected Leak | Leak Detection Academy",
        "Hidden Costs Of Ignoring A Leak | Leak Detection Academy",
    ),
    "academy/how-long-does-slab-leak-repair-take.html": (
        "How Long Does Slab Leak Repair Actually Take? | Leak Detection Academy",
        "How Long Does Slab Leak Repair Actually Take?",
    ),
    "academy/is-leak-detection-worth-the-cost.html": (
        "Is Professional Leak Detection Worth The Cost? | Leak Detection Academy",
        "Is Professional Leak Detection Worth The Cost?",
    ),
    "academy/preventing-slab-leaks.html": (
        "Can Slab Leaks Be Prevented? What Actually Helps | Leak Detection Academy",
        "Can Slab Leaks Be Prevented? What Actually Helps",
    ),
    "academy/sound-of-running-water-in-wall.html": (
        "Hearing Running Water In A Wall With Nothing On? | Leak Detection Academy",
        "Hearing Running Water In A Wall? What It Means",
    ),
    "academy/thermal-imaging-leak-detection-explained.html": (
        "Thermal Imaging For Leak Detection: How It Works | Leak Detection Academy",
        "Thermal Imaging For Leak Detection: How It Works",
    ),
    "academy/warm-spot-on-floor-slab-leak.html": (
        "Warm Spot On Your Floor? What It Usually Means | Leak Detection Academy",
        "Warm Spot On Your Floor? What It Usually Means",
    ),
    "academy/what-is-a-slab-leak.html": (
        "What Is A Slab Leak? A Plain-Language Definition | Leak Detection Academy",
        "What Is A Slab Leak? A Plain-Language Definition",
    ),
    "academy/why-is-my-water-bill-so-high.html": (
        "Why Is My Water Bill So High All Of A Sudden? | Leak Detection Academy",
        "Why Is My Water Bill So High All Of A Sudden?",
    ),
    "case-studies/laguna-niguel-slab-leak-detection-6.html": (
        "Slab Leak Detection in Laguna Niguel | Straight Flush",
        "Slab Leak Detection in Laguna Niguel | Established Area",
    ),
    "guides/slab-leak-repair-cost.html": (
        "Slab Leak Repair Cost Guide | Repair vs. Reroute vs. Repipe Pricing Factors",
        "Slab Leak Repair Cost Guide | Repair vs. Reroute vs. Repipe",
    ),
    "insurance/does-insurance-cover-slab-leaks.html": (
        "Does Insurance Cover Slab Leaks? | What Typically Determines Coverage",
        "Does Insurance Cover Slab Leaks? What Determines It",
    ),
    "insurance/dos-and-donts-talking-to-insurance.html": (
        "Do's and Don'ts When Talking to Insurance About a Slab or Pipe Leak | OC",
        "Talking To Insurance About A Leak? Do's and Don'ts",
    ),
    "insurance/index.html": (
        "Insurance Resource Center | Water & Slab Leak Claims | Orange County",
        "Insurance Resource Center | Slab Leak Claims | OC",
    ),
    "services/emergency-plumbing.html": (
        "24-Hour Emergency Plumber in Orange County | Straight Flush Plumbing",
        "24-Hour Emergency Plumber in Orange County, CA",
    ),
    "services/index.html": (
        "Plumbing Services | Leak Detection, Repiping & More | Straight Flush Plumbing",
        "Plumbing Services | Leak Detection, Repiping & More",
    ),
    "services/leak-detection.html": (
        "Leak Detection Services | Acoustic, Electronic & Thermal | Orange County",
        "Leak Detection Services | Acoustic & Thermal Detection",
    ),
    "services/pex-repiping.html": (
        "Whole-House PEX Repiping | Copper Line Elimination | Orange County",
        "Whole-House PEX Repiping | Copper Line Removal",
    ),
    "services/plumbing-repair.html": (
        "Plumbing Repair Services | Fixtures, Pipes & Pressure | Orange County",
        "Plumbing Repair Services | Fixtures, Pipes & Leaks",
    ),
    "services/slab-leak-detection.html": (
        "Slab Leak Detection | Acoustic Diagnosis Before Demolition | Orange County",
        "Slab Leak Detection | Acoustic Diagnosis First",
    ),
    "services/water-heater-services.html": (
        "Water Heater Repair & Installation | Tankless & Traditional | Orange County",
        "Water Heater Repair & Installation | Tankless & Standard",
    ),
    "service-areas.html": (
        "Service Areas | Leak Detection & Plumbing Across Orange County",
        "Service Areas | Leak Detection Across Orange County",
    ),
    "academy/index.html": (
        "Leak Detection Academy | Free Homeowner Education | Orange County",
        "Leak Detection Academy | Free Homeowner Education",
    ),
    "guides/repair-vs-reroute-vs-repipe.html": (
        "Repair vs. Reroute vs. Repipe | Which Is Right For Your Home?",
        "Repair vs. Reroute vs. Repipe | Which Is Right?",
    ),
    "case-studies/laguna-niguel-slab-leak-detection-1.html": (
        "Slab Leak Detection in Laguna Niguel | Straight Flush Plumbing",
        "Slab Leak Detection in Laguna Niguel | Straight Flush",
    ),
}

# guard: new titles must be <=60c and mutually unique
seen = {}
for rel, (old, new) in FIXES.items():
    assert len(new) <= 60, f"{rel}: new title {len(new)}c > 60"
    assert new not in seen, f"{rel}: duplicate new title with {seen.get(new)}"
    seen[new] = rel

changed = 0
for rel, (old, new) in FIXES.items():
    path = os.path.join(ROOT, rel)
    src = open(path, encoding="utf-8").read()
    if f"<title>{new}</title>" in src:
        print(f"  =  already applied: {rel}")
        continue
    if f"<title>{old}</title>" not in src:
        print(f"  !! old title not found in {rel}")
        continue
    out = src.replace(f"<title>{old}</title>", f"<title>{new}</title>")
    # keep social mirrors in sync when they carried the same string
    out = out.replace(f'property="og:title" content="{old}"', f'property="og:title" content="{new}"')
    out = out.replace(f'name="twitter:title" content="{old}"', f'name="twitter:title" content="{new}"')
    open(path, "w", encoding="utf-8", newline="").write(out)
    changed += 1
    print(f"  \u2714 {rel}: {len(old)}c -> {len(new)}c")

print(f"\n{changed} title(s) shortened.")
