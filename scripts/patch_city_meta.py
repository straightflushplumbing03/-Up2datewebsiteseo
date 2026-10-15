#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Differentiate the 21 city-page <title> and meta description.

Before this patch every city page shared ONE identical description template
("Acoustic slab leak detection and plumbing services in {City}, CA. Local,
family-owned, diagnose-first. Call (949) 374-6524.") and one title template.
Duplicate/near-duplicate metadata across near-identical city pages is a
cannibalisation and relevance problem for local search.

The copy below is derived ONLY from facts already published on each city page's
own body (construction era, housing stock, soil/coastal conditions, access) —
no new claims, no invented statistics, no license/price/warranty language.

Idempotent: re-running replaces only the values in CITY_META; anything already
equal is reported and skipped. Also rewrites the matching og:/twitter: title and
description so social previews stay in sync.

Run from project root:  python3 scripts/patch_city_meta.py
"""
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# city file (without .html) -> (title, description)
CITY_META = {
    "laguna-niguel": (
        "Plumber in Laguna Niguel, CA | Leak & Slab Detection",
        "Laguna Niguel is our home base. 1970s\u201390s hillside homes with original "
        "copper plumbing \u2014 acoustic and thermal leak detection before any cut. (949) 374-6524.",
    ),
    "mission-viejo": (
        "Slab Leak & Plumber in Mission Viejo, CA | Straight Flush",
        "Mission Viejo plumbing age varies block to block, from 1960s\u201370s original "
        "copper tracts to newer builds. Diagnose-first leak detection. Call (949) 374-6524.",
    ),
    "laguna-hills": (
        "Plumber in Laguna Hills, CA | Leak Detection & Repair",
        "Many Laguna Hills homes date to the 1970s\u201380s, putting original copper in the "
        "age range where slab leaks appear. Acoustic diagnosis first. Call (949) 374-6524.",
    ),
    "aliso-viejo": (
        "Leak Detection in Aliso Viejo, CA | Straight Flush Plumbing",
        "Aliso Viejo homes from the 1980s\u201390s often still run original copper, and clay "
        "soils plus hard water add risk. Non-invasive leak detection. Call (949) 374-6524.",
    ),
    "dana-point": (
        "Plumber in Dana Point, CA | Coastal Leak Detection",
        "Salt air and older homes near the harbor make accurate diagnosis more valuable in "
        "Dana Point. Acoustic and thermal detection. Call (949) 374-6524.",
    ),
    "san-clemente": (
        "Leak & Slab Detection in San Clemente, CA | Straight Flush",
        "From homes near the pier to Forster Ranch and Talega, San Clemente spans many home "
        "ages. Diagnose-first leak detection, no guesswork. Call (949) 374-6524.",
    ),
    "san-juan-capistrano": (
        "Plumber in San Juan Capistrano, CA | Leak Detection",
        "San Juan Capistrano mixes historic and modern homes, so plumbing age and material "
        "vary widely. We assess each property individually. Call (949) 374-6524.",
    ),
    "laguna-beach": (
        "Leak Detection in Laguna Beach, CA | Hillside Homes",
        "Laguna Beach hillside and canyon lots often limit plumbing access \u2014 exactly where "
        "non-invasive acoustic and electronic detection helps. Call (949) 374-6524.",
    ),
    "laguna-woods": (
        "Plumber in Laguna Woods, CA | Low-Disruption Leak Detection",
        "Laguna Woods' coordinated communities benefit from accurate diagnosis and "
        "minimal-access repair, appreciated by residents and property managers. (949) 374-6524.",
    ),
    "newport-beach": (
        "Leak Detection in Newport Beach, CA | Coastal Plumbing",
        "From Balboa Peninsula cottages to newer bayfront homes, salt air speeds pipe "
        "corrosion in Newport Beach. Diagnosis before repair. Call (949) 374-6524.",
    ),
    "costa-mesa": (
        "Plumber in Costa Mesa, CA | Aging-Copper Leak Detection",
        "Many Costa Mesa neighborhoods date to the 1960s\u201380s, putting original copper past "
        "the age slab leaks grow common. Accurate detection first. Call (949) 374-6524.",
    ),
    "irvine": (
        "Plumber in Irvine, CA | Leak Detection for Every Village",
        "Irvine's villages span 1970s original build to brand-new; older villages carry more "
        "copper. We match the approach to your village. Call (949) 374-6524.",
    ),
    "lake-forest": (
        "Leak Detection in Lake Forest, CA | Straight Flush Plumbing",
        "From older El Toro-area tracts to newer development near the toll road, Lake "
        "Forest plumbing age varies. We never assume before inspecting. Call (949) 374-6524.",
    ),
    "rancho-santa-margarita": (
        "Plumber in Rancho Santa Margarita, CA | Foothill Homes",
        "Rancho Santa Margarita's foothill lots can see more soil shift than flatland "
        "developments \u2014 a factor in slab leaks worth understanding. Call (949) 374-6524.",
    ),
    "ladera-ranch": (
        "Leak Detection in Ladera Ranch, CA | Straight Flush Plumbing",
        "Ladera Ranch is a younger South OC community, so leaks more often trace to "
        "installation quality or soil settling. Professional diagnosis. Call (949) 374-6524.",
    ),
    "coto-de-caza": (
        "Plumber in Coto de Caza, CA | Estate-Home Leak Detection",
        "Coto de Caza's larger custom homes have longer plumbing runs and high-end flooring "
        "\u2014 non-invasive detection matters before any repair talk. Call (949) 374-6524.",
    ),
    "dove-canyon": (
        "Leak Detection in Dove Canyon, CA | Straight Flush Plumbing",
        "Dove Canyon's guard-gated custom homes make guessing wrong on a leak location costly "
        "\u2014 acoustic and thermal detection is built for this. Call (949) 374-6524.",
    ),
    "foothill-ranch": (
        "Plumber in Foothill Ranch, CA | Leak Detection & Repair",
        "Foothill Ranch homes benefit from water-pressure attention and early leak detection "
        "as the original construction ages. Call (949) 374-6524.",
    ),
    "huntington-beach": (
        "Plumber in Huntington Beach, CA | Leak Detection",
        "Huntington Beach plumbing varies block by block, from older beach-close homes to "
        "newer inland builds. We treat each property on its own. Call (949) 374-6524.",
    ),
    "tustin": (
        "Leak Detection in Tustin, CA | Straight Flush Plumbing",
        "Older Tustin neighborhoods near Old Town carry more mid-century copper, while "
        "Tustin Legacy is newer. We assess each home's own history. Call (949) 374-6524.",
    ),
    "orange": (
        "Plumber in Orange, CA | Old Towne Leak Detection",
        "Old Towne Orange has some of the county's oldest housing stock, where acoustic and "
        "electronic detection protects a historic property. Call (949) 374-6524.",
    ),
}

TITLE_RE = re.compile(r"(<title>)(.*?)(</title>)")
DESC_RE = re.compile(r'(<meta name="description" content=")([^"]*)(")')
OG_T_RE = re.compile(r'(<meta property="og:title" content=")([^"]*)(")')
OG_D = re.compile(r'(<meta property="og:description" content=")([^"]*)(")')
TW_T = re.compile(r'(<meta name="twitter:title" content=")([^"]*)(")')
TW_D = re.compile(r'(<meta name="twitter:description" content=")([^"]*)(")')
OG_U = re.compile(r'(<meta property="og:url" content=")([^"]*)(")')
TW_U = re.compile(r'(<meta property="twitter:url" content=")([^"]*)(")')

seen_titles, seen_descs = {}, {}
problems = []

for city, (title, desc) in CITY_META.items():
    path = os.path.join(ROOT, "cities", f"{city}.html")
    src = open(path, encoding="utf-8").read()
    url = f"https://straightflushplumbingoc.com/cities/{city}.html"

    if len(title) > 60:
        problems.append(f"title {len(title)}c > 60: {city}")
    if not (120 <= len(desc) <= 160):
        problems.append(f"desc {len(desc)}c out of 120-160: {city}")
    if title in seen_titles:
        problems.append(f"duplicate title with {seen_titles[title]}: {city}")
    if desc in seen_descs:
        problems.append(f"duplicate desc with {seen_descs[desc]}: {city}")
    seen_titles[title] = city
    seen_descs[desc] = city

    def sub(rx, text, repl):
        return rx.sub(lambda m: m.group(1) + repl.replace("\\", "\\\\") + m.group(3), text, count=1)

    before = src
    src = sub(TITLE_RE, src, title)
    src = sub(DESC_RE, src, desc)
    src = sub(OG_T_RE, src, title)
    src = sub(OG_D, src, desc)
    src = sub(TW_T, src, title)
    src = sub(TW_D, src, desc)
    # pin social URLs to the canonical (some pages omitted them)
    if OG_U.search(src):
        src = sub(OG_U, src, url)
    if TW_U.search(src):
        src = sub(TW_U, src, url)

    if src != before:
        open(path, "w", encoding="utf-8", newline="").write(src)
        print(f"  \u2714 {city}: title {len(title)}c, desc {len(desc)}c")
    else:
        print(f"  =  unchanged: {city}")

if problems:
    print("\nPROBLEMS:")
    for p in problems:
        print("  !!", p)
    raise SystemExit(1)
print("\nall city titles \u226460c, descriptions 120-160c, unique. done.")
