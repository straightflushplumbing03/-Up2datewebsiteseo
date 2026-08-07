# -*- coding: utf-8 -*-
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build import *

PREFIX = "../"

ARTICLES = [
    ("what-is-a-slab-leak.html", "What Is A Slab Leak? A Plain-Language Definition", "Leak Detection Fundamentals"),
    ("hot-water-vs-cold-water-slab-leaks.html", "Hot Water vs. Cold Water Slab Leaks", "Leak Detection Fundamentals"),
    ("how-plumbers-find-leaks-without-cutting-walls.html", "How Do Plumbers Find Leaks Without Cutting Walls?", "Leak Detection Fundamentals"),

    ("warm-spot-on-floor-slab-leak.html", "Warm Spot On Your Floor? What It Usually Means", "Slab Leak Education"),
    ("how-long-does-slab-leak-repair-take.html", "How Long Does Slab Leak Repair Actually Take?", "Slab Leak Education"),
    ("slab-leak-vs-foundation-crack.html", "Slab Leak vs. Foundation Crack", "Slab Leak Education"),
    ("multiple-slab-leaks-same-house.html", "Why Do Some Homes Get Multiple Slab Leaks?", "Slab Leak Education"),
    ("slab-leaks-in-older-orange-county-homes.html", "Slab Leaks In Older Orange County Homes", "Slab Leak Education"),

    ("why-is-my-water-bill-so-high.html", "Why Is My Water Bill So High All Of A Sudden?", "Water Leak Symptoms"),
    ("water-meter-still-moving-everything-off.html", "Water Meter Still Moving With Everything Off?", "Water Leak Symptoms"),
    ("sound-of-running-water-in-wall.html", "Hearing Running Water In A Wall With Nothing On?", "Water Leak Symptoms"),

    ("is-leak-detection-worth-the-cost.html", "Is Professional Leak Detection Worth The Cost?", "Costs & Repairs"),
    ("why-two-plumbers-give-different-quotes.html", "Why Do Two Plumbers Give Different Quotes?", "Costs & Repairs"),
    ("hidden-costs-of-ignoring-a-leak.html", "The Hidden Costs Of Ignoring A Suspected Leak", "Costs & Repairs"),

    ("water-pressure-and-pipe-health.html", "How Water Pressure Affects Your Pipes' Health", "Prevention & Maintenance"),
    ("annual-plumbing-checkup-checklist.html", "A Simple Annual Plumbing Checkup Checklist", "Prevention & Maintenance"),
    ("preventing-slab-leaks.html", "Can Slab Leaks Be Prevented? What Actually Helps", "Prevention & Maintenance"),
    ("emergency-plumbing-checklist.html", "Emergency Plumbing Checklist: What To Do Right Now", "Prevention & Maintenance"),

    ("copper-vs-pex-pipes.html", "Copper vs. PEX Pipes: What Homeowners Should Know", "Technology Education"),
    ("acoustic-leak-detection-explained.html", "Acoustic Leak Detection Explained In Plain English", "Technology Education"),
    ("thermal-imaging-leak-detection-explained.html", "Thermal Imaging For Leak Detection, Explained", "Technology Education"),
    ("electronic-pipe-locating-explained.html", "Electronic Pipe Locating, Explained", "Technology Education"),
]

CATEGORIES = [
    "Leak Detection Fundamentals","Slab Leak Education","Water Leak Symptoms","Costs & Repairs",
    "Insurance Resources","Prevention & Maintenance","Technology Education","Local Orange County Content"
]

html = head(
    "Leak Detection Academy | Free Homeowner Education | Orange County",
    "Straight Flush Plumbing's free library of leak detection education — symptoms, causes, technology, and prevention, explained in plain language.",
    "academy/index.html", PREFIX
)
html += nav(PREFIX)
html += page_hero(PREFIX,
    [("Home","index.html"),("Leak Detection Academy", None)],
    "Free homeowner education",
    "The Leak Detection Academy",
    "A growing library of straight answers about hidden leaks, slab leaks, and the technology used to find them &mdash; written for homeowners, not plumbers.",
    "Have A Question We Haven't Covered?"
)
html += f"""<section>
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">{len(ARTICLES)} articles and growing</div>
      <h2>Browse by category</h2>
    </div>
"""
from collections import OrderedDict
grouped = OrderedDict()
for href, title, cat in ARTICLES:
    grouped.setdefault(cat, []).append((href, title))

for cat, items in grouped.items():
    html += f'    <div class="reveal" style="margin-bottom:44px;">\n'
    html += f'      <h3 style="font-size:1.15rem; margin-bottom:18px; padding-bottom:10px; border-bottom:1px solid var(--line);">{cat}</h3>\n'
    html += '      <div class="card-grid card-grid-3">\n'
    for href, title in items:
        html += f'        <div class="service-card reveal" style="padding:22px;"><h3 style="font-size:1rem;">{title}</h3><a href="{href}">Read &rarr;</a></div>\n'
    html += '      </div>\n    </div>\n'
html += """  </div>
</section>
"""
html += f"""<section class="section-sand">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">More resources</div>
      <h2>Insurance &amp; local city guides</h2>
      <p>These two categories have their own dedicated sections, linked below.</p>
    </div>
    <div class="card-grid card-grid-2">
      <div class="service-card reveal"><h3>Insurance Resources</h3><p>Coverage basics, documentation checklists, and questions to ask your provider.</p><a href="../insurance/index.html">Visit the Insurance Resource Center &rarr;</a></div>
      <div class="service-card reveal"><h3>Local Orange County Content</h3><p>City-specific pages covering local plumbing conditions across our full service area.</p><a href="../service-areas.html">Browse all service areas &rarr;</a></div>
    </div>
  </div>
</section>
"""
html += cta_band(PREFIX, "Didn't find your question here?", "Ask us directly and we'll give you a straight answer.")
html += footer(PREFIX)
write_page("academy/index.html", html)
print("Academy hub generated.")
