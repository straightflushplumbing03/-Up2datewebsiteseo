# -*- coding: utf-8 -*-
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build import *

PREFIX = "../"
schema = f"""<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Water Heater Repair & Installation",
  "provider": {{"@type":"Plumber","name":"Straight Flush Plumbing & Leak Detection","telephone":"{PHONE_TEL}"}},
  "areaServed": "Orange County, CA"
}}
</script>
"""
html = head(
    "Water Heater Repair & Installation | Tankless & Traditional | Orange County",
    "Water heater repair, replacement, and tankless installation in Laguna Niguel, Dana Point & San Clemente. Same-day diagnosis, honest recommendations.",
    "services/water-heater-services.html", PREFIX, schema
)
html += nav(PREFIX)
html += page_hero(PREFIX,
    [("Home","index.html"),("Water Heater Services", None)],
    "Traditional & tankless",
    "Hot water problems, diagnosed and fixed right the first time.",
    "From a pilot light that won't stay lit to a full tankless conversion, we repair, replace, and install water heaters with the same diagnose-first approach we bring to leak detection.",
    "Schedule Water Heater Service"
)
html += f"""<section>
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Signs you need service</div>
      <h2>When to call about your water heater</h2>
    </div>
    <div class="checklist-grid">
      <div class="check-card reveal"><span class="mark">1</span><p><strong>No hot water, or it runs out fast</strong>A failing heating element or sediment buildup is often the cause.</p></div>
      <div class="check-card reveal"><span class="mark">2</span><p><strong>Rumbling or popping sounds</strong>Usually sediment hardening at the bottom of the tank.</p></div>
      <div class="check-card reveal"><span class="mark">3</span><p><strong>Water pooling around the base</strong>Could be a tank leak &mdash; worth an inspection before it worsens.</p></div>
      <div class="check-card reveal"><span class="mark">4</span><p><strong>Discolored hot water</strong>Often a sign of corrosion inside an aging tank.</p></div>
      <div class="check-card reveal"><span class="mark">5</span><p><strong>Your unit is 8&ndash;12+ years old</strong>Most tank water heaters are nearing the end of their service life by then.</p></div>
      <div class="check-card reveal"><span class="mark">6</span><p><strong>Rising energy bills</strong>An inefficient or failing unit can quietly cost you more every month.</p></div>
    </div>
  </div>
</section>
"""
html += f"""<section class="section-ink">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Our services</div>
      <h2>Traditional tank &amp; tankless, covered both ways</h2>
    </div>
    <div class="tech-grid reveal">
      <div class="tech-item"><span class="tag">Repair</span><h3>Diagnosis &amp; Repair</h3><p>Thermostats, heating elements, pilot assemblies, and leaks diagnosed and repaired without unnecessary replacement.</p></div>
      <div class="tech-item"><span class="tag">Replacement</span><h3>Tank Water Heaters</h3><p>Straightforward replacement when a unit has reached the end of its service life, sized correctly for your household.</p></div>
      <div class="tech-item"><span class="tag">Upgrade</span><h3>Tankless Conversion</h3><p>Endless hot water and smaller footprint &mdash; we'll walk you through whether the upfront cost makes sense for your home.</p></div>
    </div>
  </div>
</section>
"""
html += faq_section(PREFIX, "Water heater FAQ", "Common questions", [
    ("Is it worth switching to tankless?", "It depends on your household's hot water usage, existing gas/electric setup, and how long you plan to stay in the home. We'll walk through the real numbers with you rather than a blanket recommendation."),
    ("How long do water heaters typically last?", "Traditional tank water heaters usually last 8 to 12 years, while tankless units can last considerably longer with proper maintenance."),
    ("Can a water heater leak cause a slab leak?", "A failing water heater can leak at its base or connections, but a true slab leak involves a pipe under the foundation. If you're not sure which you're dealing with, we can diagnose it directly."),
])
html += cta_band(PREFIX, "Hot water not working right?", "Schedule a diagnosis and get a straight answer about repair vs. replacement.")
html += footer(PREFIX)
write_page("services/water-heater-services.html", html)
