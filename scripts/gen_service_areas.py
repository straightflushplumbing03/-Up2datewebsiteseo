# -*- coding: utf-8 -*-
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build import *

PREFIX = ""

CITIES = [
    ("cities/laguna-niguel.html", "Laguna Niguel", "Headquarters", "Our home base. Decades of slab foundations across Laguna Niguel's hillside neighborhoods mean we've seen nearly every slab leak pattern the area produces."),
    ("cities/dana-point.html", "Dana Point", None, "Coastal moisture and older harbor-area homes make accurate diagnosis especially important before any repair begins."),
    ("cities/san-clemente.html", "San Clemente", None, "From Forster Ranch to the pier district, we handle everything from copper line elimination to full PEX repiping."),
    ("cities/mission-viejo.html", "Mission Viejo", None, "A wide range of home ages means a wide range of plumbing systems &mdash; we diagnose each one on its own merits."),
    ("cities/laguna-hills.html", "Laguna Hills", None, "Established neighborhoods where accurate leak diagnosis on aging copper really pays off."),
    ("cities/aliso-viejo.html", "Aliso Viejo", None, "Newer developments still develop slab leaks &mdash; we help homeowners here get an accurate answer fast."),
    ("cities/ladera-ranch.html", "Ladera Ranch", None, "Planned-community plumbing systems diagnosed with the same rigor as any older home."),
    ("cities/rancho-santa-margarita.html", "Rancho Santa Margarita", None, "From foothill developments to established neighborhoods, accurate leak detection before repair."),
    ("cities/coto-de-caza.html", "Coto de Caza", None, "Discreet, precise detection for larger estate homes and custom properties."),
    ("cities/dove-canyon.html", "Dove Canyon", None, "Guard-gated community plumbing with the same precise, non-invasive standard."),
    ("cities/lake-forest.html", "Lake Forest", None, "Full leak detection and plumbing repair services for Lake Forest homeowners."),
    ("cities/foothill-ranch.html", "Foothill Ranch", None, "Family-friendly neighborhoods get the same diagnose-first approach as everywhere else."),
    ("cities/irvine.html", "Irvine", None, "Master-planned villages with varying plumbing ages &mdash; diagnosed precisely, village by village."),
    ("cities/newport-beach.html", "Newport Beach", None, "Coastal properties deserve extra care &mdash; salt air and older plumbing require experienced diagnosis."),
    ("cities/laguna-beach.html", "Laguna Beach", None, "Hillside and canyon homes with unique access challenges &mdash; exactly where non-invasive detection matters most."),
    ("cities/laguna-woods.html", "Laguna Woods", None, "Careful, respectful plumbing service for established residential communities."),
    ("cities/san-juan-capistrano.html", "San Juan Capistrano", None, "Historic and modern homes alike, diagnosed according to each property's actual age."),
    ("cities/huntington-beach.html", "Huntington Beach", None, "Leak detection and plumbing repair for Surf City homes old and new."),
    ("cities/costa-mesa.html", "Costa Mesa", None, "Established mid-century neighborhoods where aging copper plumbing is common."),
    ("cities/tustin.html", "Tustin", None, "Old Town character alongside newer development &mdash; diagnosed according to each home's actual age."),
    ("cities/orange.html", "Orange", None, "Historic Old Towne homes deserve careful, non-invasive diagnosis before any repair."),
]

html = head(
    "Service Areas | Leak Detection & Plumbing Across Orange County",
    "Straight Flush Plumbing & Leak Detection serves Laguna Niguel, Dana Point, San Clemente, Mission Viejo, Irvine, Newport Beach and all of South & Central Orange County.",
    "service-areas.html", PREFIX
)
html += nav(PREFIX)
html += page_hero(PREFIX,
    [("Home","index.html"),("Service Areas", None)],
    "South & Central Orange County",
    "Local knowledge, from the coast to the foothills.",
    "Every Orange County community has its own mix of slab types, home ages, and soil conditions. We know the differences block by block &mdash; explore your city below.",
    "Ask About Your Area"
)
html += """<section>
  <div class="wrap">
    <div class="card-grid card-grid-2">
"""
for href, name, tagbadge, desc in CITIES:
    tag = f' <span class="tag-line" style="margin-left:8px;">{tagbadge}</span>' if tagbadge else ''
    html += f"""
      <div class="service-card reveal">
        <h3>{name}{tag}</h3>
        <p>{desc}</p>
        <a href="{href}">View {name} page &rarr;</a>
      </div>"""
html += """
    </div>
  </div>
</section>
"""
html += cta_band(PREFIX, "Don't see your city listed?", "We regularly serve communities throughout South and Central Orange County. Call and ask &mdash; chances are we cover it.", "Ask About Your Area", "contact.html", dark=True)
html += footer(PREFIX)
write_page("service-areas.html", html)
print("service-areas.html regenerated with all 15 cities linked.")
