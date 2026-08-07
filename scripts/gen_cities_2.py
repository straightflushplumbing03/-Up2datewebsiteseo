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
    "aliso-viejo.html", "Aliso Viejo",
    "Newer homes, same diagnose-first standard.",
    "Aliso Viejo's master-planned neighborhoods are newer than much of South Orange County, but newer construction still develops slab and hidden leaks &mdash; and homeowners here deserve the same accurate diagnosis before repair.",
    "Aliso Viejo's homes, built mostly from the late 1980s onward, tend to have more consistent plumbing systems than older cities nearby &mdash; but original fittings and slab conditions still vary by tract, which is why we diagnose each home individually rather than assuming.",
    [("laguna-niguel.html","Laguna Niguel"), ("laguna-beach.html","Laguna Beach"), ("mission-viejo.html","Mission Viejo"), ("ladera-ranch.html","Ladera Ranch")]
)

city_page(
    "ladera-ranch.html", "Ladera Ranch",
    "Planned-community plumbing, diagnosed with the same rigor.",
    "Ladera Ranch's newer, master-planned homes still develop leaks &mdash; often from original fitting quality or shifting soil rather than aging pipe material.",
    "As one of South Orange County's younger communities, Ladera Ranch homes are less prone to the classic aging-copper slab leak &mdash; but we still see issues from original installation quality and foundation settling that make professional diagnosis worthwhile.",
    [("rancho-santa-margarita.html","Rancho Santa Margarita"), ("mission-viejo.html","Mission Viejo"), ("san-clemente.html","San Clemente"), ("lake-forest.html","Lake Forest")]
)

city_page(
    "rancho-santa-margarita.html", "Rancho Santa Margarita",
    "From foothill developments to established neighborhoods.",
    "Rancho Santa Margarita's foothill terrain and mix of home ages mean soil movement is a more relevant factor here than in flatter parts of the county.",
    "Homes built into RSM's foothill lots can experience more soil shift than flatland developments, which is a contributing factor to slab leaks worth understanding before assuming the cause is simply aging pipe.",
    [("lake-forest.html","Lake Forest"), ("mission-viejo.html","Mission Viejo"), ("ladera-ranch.html","Ladera Ranch"), ("irvine.html","Irvine")]
)

city_page(
    "lake-forest.html", "Lake Forest",
    "Full leak detection and plumbing repair for Lake Forest homes.",
    "Lake Forest's blend of established and newer neighborhoods calls for the same case-by-case diagnostic approach we bring everywhere else in South Orange County.",
    "From the older El Toro-area tracts to newer development near the toll road, Lake Forest's plumbing age varies enough that we never assume what we'll find before inspecting.",
    [("rancho-santa-margarita.html","Rancho Santa Margarita"), ("mission-viejo.html","Mission Viejo"), ("irvine.html","Irvine"), ("laguna-niguel.html","Laguna Niguel")]
)

city_page(
    "irvine.html", "Irvine",
    "Village by village, diagnosed on its own merits.",
    "Irvine's master-planned villages span decades of construction &mdash; from 1970s original villages to brand-new developments &mdash; so plumbing age and condition vary significantly by neighborhood.",
    "Older Irvine villages like Woodbridge or University Park carry more original copper plumbing, while newer villages have modern PEX systems from the start &mdash; we tailor our approach to your village's actual construction era.",
    [("lake-forest.html","Lake Forest"), ("newport-beach.html","Newport Beach"), ("rancho-santa-margarita.html","Rancho Santa Margarita"), ("laguna-beach.html","Laguna Beach")]
)

city_page(
    "newport-beach.html", "Newport Beach",
    "Coastal properties, diagnosed with coastal-specific care.",
    "Newport Beach's coastal exposure and range of home ages &mdash; from older Balboa Peninsula cottages to newer bayfront construction &mdash; call for extra care in diagnosis before any repair begins.",
    "Salt air accelerates certain types of pipe corrosion, and older Newport Beach homes near the water often carry original plumbing that's more susceptible to slab leaks than inland properties of the same age.",
    [("laguna-beach.html","Laguna Beach"), ("irvine.html","Irvine"), ("costa-mesa.html","Costa Mesa"), ("dana-point.html","Dana Point")]
)

city_page(
    "laguna-beach.html", "Laguna Beach",
    "Hillside and canyon homes, non-invasive detection matters most.",
    "Laguna Beach's hillside and canyon lots often mean difficult access to plumbing lines &mdash; exactly the scenario where non-invasive acoustic and electronic detection earns its keep.",
    "Many Laguna Beach homes are built into steep hillside lots with limited crawl space or slab access, making accurate, non-invasive leak detection especially valuable before any repair work is even discussed.",
    [("newport-beach.html","Newport Beach"), ("dana-point.html","Dana Point"), ("aliso-viejo.html","Aliso Viejo"), ("irvine.html","Irvine")]
)

city_page(
    "huntington-beach.html", "Huntington Beach",
    "Leak detection and plumbing repair for Surf City homes.",
    "Huntington Beach's older beach-close neighborhoods and newer inland developments both benefit from the same diagnose-first standard before any plumbing work begins.",
    "From older homes near the pier to newer developments further inland, Huntington Beach's plumbing age varies enough block by block that we treat each property individually rather than assuming based on the neighborhood.",
    [("costa-mesa.html","Costa Mesa"), ("newport-beach.html","Newport Beach"), ("irvine.html","Irvine")]
)

city_page(
    "costa-mesa.html", "Costa Mesa",
    "Central Orange County leak detection and plumbing repair.",
    "Costa Mesa's established neighborhoods, many built decades ago, are prime candidates for the aging-copper slab leak pattern we see throughout central Orange County.",
    "A number of Costa Mesa's neighborhoods date to the 1960s&ndash;80s, which puts original copper plumbing well past the age where slab leaks become more common &mdash; making accurate detection especially valuable here.",
    [("huntington-beach.html","Huntington Beach"), ("newport-beach.html","Newport Beach"), ("irvine.html","Irvine")]
)

city_page(
    "tustin.html", "Tustin",
    "Old Town character, modern diagnostic technology.",
    "Tustin's mix of Old Town-era homes and newer development means plumbing systems here range from original mid-century copper to modern PEX, depending on the neighborhood.",
    "Older Tustin neighborhoods near Old Town carry a higher likelihood of aging copper plumbing, while newer development toward the Tustin Legacy area is far less likely to need the same attention &mdash; we assess each home on its own history.",
    [("irvine.html","Irvine"), ("orange.html","Orange"), ("costa-mesa.html","Costa Mesa")]
)

city_page(
    "orange.html", "Orange",
    "Historic neighborhoods, careful diagnosis.",
    "The City of Orange's Old Towne district includes some of the county's oldest housing stock, where original plumbing materials and decades of wear make accurate leak detection especially important.",
    "Homes in and around Old Towne Orange can carry plumbing systems many decades old, which is exactly the profile where acoustic and electronic detection prevents unnecessary damage to a historic property during diagnosis.",
    [("tustin.html","Tustin"), ("irvine.html","Irvine"), ("costa-mesa.html","Costa Mesa")]
)

print("Tustin and Orange generated.")

