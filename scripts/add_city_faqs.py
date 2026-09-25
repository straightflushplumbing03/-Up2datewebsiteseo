#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Add a localized FAQ section + matching FAQPage JSON-LD to every city page.

Grounding rules:
- The city-specific sentence in Q1 is taken from each page's own existing
  "local knowledge" copy (no new claims are invented).
- Cost answer deliberately avoids specific figures (the cost guide states none).
- Contact path uses the real phone number; services match each page's own list.

Idempotent: pages already carrying the marker are left untouched.
Run from the repo root:  python3 scripts/add_city_faqs.py
"""
import html
import json
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CITIES = os.path.join(ROOT, "cities")
MARKER = "city-faq-section"

PHONE_DISPLAY = "(949) 374-6524"
PHONE_TEL = "+19493746524"

# City-specific lead sentence per page, extracted from that page's own copy.
CITY_LOCAL = {
    "aliso-viejo": "Aliso Viejo homes from the 1980s\u201390s often still run on original copper. Expansive clay soils and hard water contribute to slab leaks and hidden water line failures.",
    "costa-mesa": "Costa Mesa's established neighborhoods, many built decades ago, are prime candidates for the aging-copper slab leak pattern we see throughout central Orange County.",
    "coto-de-caza": "Larger properties and custom-built homes in Coto de Caza call for detection methods that respect both the scale of the home and the quality of its finishes.",
    "dana-point": "From the Lantern District to Monarch Beach, Dana Point's coastal conditions and mix of home ages call for a detection-first approach before any repair begins.",
    "dove-canyon": "Dove Canyon's guard-gated neighborhoods and larger custom homes get the same precise, non-invasive detection standard we bring to every South Orange County property.",
    "foothill-ranch": "Foothill Ranch's family-friendly neighborhoods get the same diagnose-first approach as everywhere else we serve in South Orange County.",
    "huntington-beach": "Huntington Beach's older beach-close neighborhoods and newer inland developments both benefit from the same diagnose-first standard before any plumbing work begins.",
    "irvine": "Irvine's master-planned villages span decades of construction \u2014 from 1970s original villages to brand-new developments \u2014 so plumbing age and condition vary significantly by neighborhood.",
    "ladera-ranch": "Ladera Ranch's newer, master-planned homes still develop leaks \u2014 often from original fitting quality or shifting soil rather than aging pipe material.",
    "laguna-beach": "Laguna Beach's hillside and canyon lots often mean difficult access to plumbing lines \u2014 exactly the scenario where non-invasive acoustic and electronic detection earns its keep.",
    "laguna-hills": "Laguna Hills sits right in the heart of our service area, with a mix of established neighborhoods where accurate leak diagnosis really pays off.",
    "laguna-niguel": "Straight Flush Plumbing & Leak Detection is headquartered in Laguna Niguel \u2014 this is where it all started, and where we've diagnosed more slab leaks than anywhere else.",
    "laguna-woods": "Laguna Woods' established residential communities benefit from a diagnose-first approach that avoids unnecessary disruption.",
    "lake-forest": "Lake Forest's blend of established and newer neighborhoods calls for the same case-by-case diagnostic approach we bring everywhere else in South Orange County.",
    "mission-viejo": "Mission Viejo's size and range of home ages mean plumbing systems here vary widely block to block \u2014 from original 1960s\u201370s construction to newer builds.",
    "newport-beach": "Newport Beach's coastal exposure and range of home ages \u2014 from older Balboa Peninsula cottages to newer bayfront construction \u2014 call for extra care in diagnosis before any repair begins.",
    "orange": "The City of Orange's Old Towne district includes some of the county's oldest housing stock, where original plumbing materials and decades of wear make accurate leak detection especially important.",
    "rancho-santa-margarita": "Rancho Santa Margarita's foothill terrain and mix of home ages mean soil movement is a more relevant factor here than in flatter parts of the county.",
    "san-clemente": "San Clemente's Spanish-village charm comes with a wide range of home ages and plumbing systems \u2014 we treat each one on its own merits, not a one-size-fits-all assumption.",
    "san-juan-capistrano": "San Juan Capistrano's mix of historic and modern homes means plumbing systems here range widely in age and material.",
    "tustin": "Tustin's mix of Old Town-era homes and newer development means plumbing systems here range from original mid-century copper to modern PEX, depending on the neighborhood.",
}


NAME_OVERRIDES = {
    "coto-de-caza": "Coto de Caza",
    "rancho-santa-margarita": "Rancho Santa Margarita",
}


def display_name(slug):
    if slug in NAME_OVERRIDES:
        return NAME_OVERRIDES[slug]
    return " ".join(w.capitalize() for w in slug.split("-"))


def qa(slug):
    city = display_name(slug)
    local = CITY_LOCAL.get(slug, "")
    return [
        {
            "q": f"How much does leak detection cost in {city}, CA?",
            "a": (
                f"Costs in {city} depend on the type of leak, how deep it sits, and how "
                "accessible the plumbing is \u2014 which is exactly why we diagnose before quoting "
                "any repair. Call (949) 374-6524 and Lance will walk you through what to expect "
                "for your specific situation."
            ),
        },
        {
            "q": f"Do you serve my neighborhood in {city}?",
            "a": (
                f"Yes \u2014 {local} We serve all of {city} and the surrounding South and Central "
                "Orange County communities, and Lance personally answers the phone."
            ),
        },
        {
            "q": f"Can you find a slab leak in a {city} home without tearing up my floors?",
            "a": (
                "In most cases, yes. We use acoustic listening equipment, electronic "
                "amplification, and thermal imaging to pinpoint the leak to a small, specific "
                "area before any concrete, tile, or drywall is opened \u2014 so any access needed "
                "stays as small as possible."
            ),
        },
        {
            "q": f"How fast can you get to a leak in {city}?",
            "a": (
                f"We're based nearby in Laguna Niguel, so {city} is a short drive. Same-day "
                "appointments are often available, and we offer 24/7 service for emergencies. "
                f"Call {PHONE_DISPLAY} and we'll find the earliest slot that works for you."
            ),
        },
        {
            "q": f"What are the warning signs of a hidden leak in a {city} home?",
            "a": (
                f"An unexplained jump in your water bill, a water meter that keeps moving with "
                "everything off, the sound of running water behind a wall, a warm spot on the "
                "floor, or dropping pressure. Any one of these in "
                + ("an" if city[0].lower() in "aeiou" else "a")
                + f" {city} home is worth a professional diagnosis before it becomes water damage."
            ),
        },
    ]


def faq_section_html(slug):
    city = display_name(slug)
    items = "\n".join(
        '      <div class="faq-item">\n'
        f'        <button class="faq-q" aria-expanded="false">{html.escape(qa_["q"])}<span class="plus">+</span></button>\n'
        f'        <div class="faq-a"><p>{qa_["a"]}</p></div>\n'
        "      </div>"
        for qa_ in qa(slug)
    )
    return (
        f'<!-- {MARKER} -->\n'
        '<section class="section-sand">\n'
        '  <div class="wrap">\n'
        '    <div class="faq">\n'
        '      <div class="section-head" style="margin-bottom:30px;">\n'
        '        <div class="eyebrow">Common questions</div>\n'
        f'        <h2>{city} leak detection FAQs</h2>\n'
        "      </div>\n"
        f"{items}\n"
        "    </div>\n"
        "  </div>\n"
        "</section>\n"
    )


def faq_jsonld(slug):
    return json.dumps(
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": qa_["q"],
                    "acceptedAnswer": {"@type": "Answer", "text": qa_["a"]},
                }
                for qa_ in qa(slug)
            ],
        },
        ensure_ascii=False,
    )


def main():
    updated = skipped = 0
    for name in sorted(os.listdir(CITIES)):
        if not name.endswith(".html"):
            continue
        slug = name[:-5]
        path = os.path.join(CITIES, name)
        with open(path, "r", encoding="utf-8", newline="") as fh:
            src = fh.read()

        if MARKER in src:
            skipped += 1
            continue
        if slug not in CITY_LOCAL:
            print(f"  !! no grounded text for {slug}; skipped")
            continue

        newline = "\r\n" if "\r\n" in src[:400] else "\n"

        # 1) FAQ section before the footer.
        anchor = '<footer class="site-footer">'
        if anchor not in src:
            print(f"  !! no footer anchor in {name}; skipped")
            continue
        src = src.replace(anchor, faq_section_html(slug) + anchor, 1)

        # 2) FAQPage JSON-LD before </head> (or after last ld+json block).
        script = ("<script type=\"application/ld+json\">" + newline
                  + faq_jsonld(slug) + newline + "</script>")
        if "</head>" in src:
            src = src.replace("</head>", script + newline + "</head>", 1)

        with open(path, "w", encoding="utf-8", newline="") as fh:
            fh.write(src)
        updated += 1

    print(f"FAQs added to {updated} city page(s); {skipped} already done.")


if __name__ == "__main__":
    main()
