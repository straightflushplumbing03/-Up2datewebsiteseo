# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build import *

PREFIX = "../"

def city_schema(name):
    return f"""<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Plumber",
  "name": "Straight Flush Plumbing & Leak Detection",
  "telephone": "{PHONE_TEL}",
  "areaServed": "{name}, CA"
}}
</script>
"""

def city_page(fname, name, headline, blurb, local_notes, nearby):
    html = head(
        f"Leak Detection & Plumbing in {name}, CA | Straight Flush Plumbing",
        f"Acoustic slab leak detection and plumbing services in {name}, CA. Local, family-owned, diagnose-first. Call {PHONE_DISPLAY}.",
        f"cities/{fname}", PREFIX, city_schema(name)
    )
    html += nav(PREFIX)
    html += page_hero(PREFIX,
        [("Home","index.html"),("Service Areas","service-areas.html"),(name, None)],
        f"Serving {name}", headline, blurb, f"Schedule Service in {name}"
    )
    html += f"""<section>
  <div class="wrap two-col">
    <div class="reveal">
      <div class="eyebrow">Local knowledge</div>
      <h2 style="font-size:1.8rem; margin-bottom:18px;">What we know about {name} homes</h2>
      <p class="muted">{local_notes}</p>
    </div>
    <div class="reveal">
      <div class="eyebrow">Services available in {name}</div>
      <ul class="founder-list">
        <li><span class="tick">&#10003;</span> Acoustic slab leak detection</li>
        <li><span class="tick">&#10003;</span> Hidden &amp; underground water leak detection</li>
        <li><span class="tick">&#10003;</span> Whole-house PEX repiping &amp; copper line elimination</li>
        <li><span class="tick">&#10003;</span> Water heater repair &amp; installation</li>
        <li><span class="tick">&#10003;</span> Drain services &amp; general plumbing repair</li>
      </ul>
    </div>
  </div>
</section>
"""
    html += f"""<section class="section-sand">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Nearby areas we also serve</div>
      <h2>Also serving communities near {name}</h2>
    </div>
    <div class="city-grid reveal">
"""
    for href, label in nearby:
        html += f'      <a class="city-chip" href="{href}">{label} <span>&rarr;</span></a>\n'
    html += """    </div>
  </div>
</section>
"""
    html += cta_band(PREFIX, f"Ready to schedule service in {name}?", "Diagnose-first leak detection and plumbing, done right the first time.", f"Call {PHONE_DISPLAY}", "contact.html")
    html += footer(PREFIX)
    write_page(f"cities/{fname}", html)

city_page(
    "laguna-hills.html", "Laguna Hills",
    "Trusted local plumbing for Laguna Hills homes.",
    "Laguna Hills sits right in the heart of our service area, with a mix of established neighborhoods where accurate leak diagnosis really pays off.",
    "Many Laguna Hills homes date to the 1970s-80s, putting original copper plumbing squarely in the age range where slab leaks become more common. We bring the same acoustic detection standard here as anywhere else in South Orange County.",
    [("../cities/laguna-niguel.html","Laguna Niguel"), ("../cities/mission-viejo.html","Mission Viejo"), ("../cities/aliso-viejo.html","Aliso Viejo"), ("../cities/rancho-santa-margarita.html","Rancho Santa Margarita")]
)

city_page(
    "coto-de-caza.html", "Coto de Caza",
    "Discreet, precise leak detection for Coto de Caza estates.",
    "Larger properties and custom-built homes in Coto de Caza call for detection methods that respect both the scale of the home and the quality of its finishes.",
    "Custom and estate homes in Coto de Caza often have more extensive plumbing runs and higher-end flooring, which makes non-invasive acoustic and thermal detection especially valuable before any repair discussion begins.",
    [("../cities/rancho-santa-margarita.html","Rancho Santa Margarita"), ("../cities/ladera-ranch.html","Ladera Ranch"), ("../cities/mission-viejo.html","Mission Viejo")]
)

city_page(
    "foothill-ranch.html", "Foothill Ranch",
    "Full-service plumbing and leak detection for Foothill Ranch.",
    "Foothill Ranch's family-friendly neighborhoods get the same diagnose-first approach as everywhere else we serve in South Orange County.",
    "Homes throughout Foothill Ranch benefit from routine attention to water pressure and early leak detection, especially as the community's original construction continues to age.",
    [("../cities/lake-forest.html","Lake Forest"), ("../cities/rancho-santa-margarita.html","Rancho Santa Margarita"), ("../cities/irvine.html","Irvine")]
)

city_page(
    "san-juan-capistrano.html", "San Juan Capistrano",
    "Historic city, modern leak detection technology.",
    "San Juan Capistrano's mix of historic and modern homes means plumbing systems here range widely in age and material.",
    "From homes near the historic mission to newer development further from downtown, San Juan Capistrano's plumbing age varies enough that we assess every property individually rather than assuming based on the neighborhood.",
    [("../cities/dana-point.html","Dana Point"), ("../cities/san-clemente.html","San Clemente"), ("../cities/laguna-niguel.html","Laguna Niguel")]
)

city_page(
    "laguna-woods.html", "Laguna Woods",
    "Careful, respectful plumbing service for Laguna Woods residents.",
    "Laguna Woods' established residential communities benefit from a diagnose-first approach that avoids unnecessary disruption.",
    "Many Laguna Woods properties are part of coordinated communities, which makes accurate diagnosis and minimal-access repairs especially appreciated by residents and property managers alike.",
    [("../cities/laguna-hills.html","Laguna Hills"), ("../cities/laguna-beach.html","Laguna Beach"), ("../cities/aliso-viejo.html","Aliso Viejo")]
)

city_page(
    "dove-canyon.html", "Dove Canyon",
    "Guard-gated community plumbing, done right.",
    "Dove Canyon's guard-gated neighborhoods and larger custom homes get the same precise, non-invasive detection standard we bring to every South Orange County property.",
    "Homes in Dove Canyon tend to be larger, custom-built properties where the cost of guessing wrong on a leak location is especially high &mdash; exactly the situation acoustic and thermal detection is built for.",
    [("../cities/rancho-santa-margarita.html","Rancho Santa Margarita"), ("../cities/coto-de-caza.html","Coto de Caza"), ("../cities/mission-viejo.html","Mission Viejo")]
)

print("6 additional city pages generated.")
