# -*- coding: utf-8 -*-
import sys
import os
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
    "laguna-niguel.html", "Laguna Niguel",
    f"Leak detection &amp; plumbing, right in our own backyard.",
    "Straight Flush Plumbing &amp; Leak Detection is headquartered in Laguna Niguel &mdash; this is where it all started, and where we've diagnosed more slab leaks than anywhere else.",
    "Laguna Niguel's mix of 1970s&ndash;90s hillside developments means a wide range of original copper plumbing still in service. We've come to know the common leak patterns in neighborhoods throughout the city, from Bear Brand to Niguel Summit.",
    [("dana-point.html","Dana Point"), ("san-clemente.html","San Clemente"), ("mission-viejo.html","Mission Viejo"), ("../service-areas.html#aliso-viejo","Aliso Viejo")]
)

city_page(
    "dana-point.html", "Dana Point",
    "Coastal homes deserve coastal-savvy diagnosis.",
    "From the Lantern District to Monarch Beach, Dana Point's coastal conditions and mix of home ages call for a detection-first approach before any repair begins.",
    "Salt air, coastal humidity, and a number of older homes near the harbor make accurate diagnosis especially valuable in Dana Point &mdash; guesswork here tends to be more costly than elsewhere.",
    [("laguna-niguel.html","Laguna Niguel"), ("san-clemente.html","San Clemente"), ("../service-areas.html#laguna-beach","Laguna Beach"), ("../service-areas.html#newport-beach","Newport Beach")]
)

city_page(
    "san-clemente.html", "San Clemente",
    "From the pier to Forster Ranch, we've got you covered.",
    "San Clemente's Spanish-village charm comes with a wide range of home ages and plumbing systems &mdash; we treat each one on its own merits, not a one-size-fits-all assumption.",
    "Whether it's an older home near the pier or a newer build in Forster Ranch or Talega, we bring the same diagnose-first standard to every San Clemente property.",
    [("dana-point.html","Dana Point"), ("laguna-niguel.html","Laguna Niguel"), ("../service-areas.html#san-juan-capistrano","San Juan Capistrano"), ("mission-viejo.html","Mission Viejo")]
)

city_page(
    "mission-viejo.html", "Mission Viejo",
    "Reliable diagnosis for one of South OC's largest communities.",
    "Mission Viejo's size and range of home ages mean plumbing systems here vary widely block to block &mdash; from original 1960s&ndash;70s construction to newer builds.",
    "We've worked throughout Mission Viejo long enough to recognize the common signs of aging copper in the city's older tracts, alongside newer-build issues in more recently developed pockets.",
    [("laguna-niguel.html","Laguna Niguel"), ("../service-areas.html#lake-forest","Lake Forest"), ("../service-areas.html#rancho-santa-margarita","Rancho Santa Margarita"), ("../service-areas.html#ladera-ranch","Ladera Ranch")]
)

print("All 4 city pages generated.")
