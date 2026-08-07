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
  "serviceType": "Drain Cleaning & Sewer Service",
  "provider": {{"@type":"Plumber","name":"Straight Flush Plumbing & Leak Detection","telephone":"{PHONE_TEL}"}},
  "areaServed": "Orange County, CA"
}}
</script>
"""
html = head(
    "Drain Cleaning & Sewer Services | Orange County",
    "Slow drain, clogged drain, and sewer line services in Laguna Niguel, Dana Point & San Clemente. Camera inspection before any digging.",
    "services/drain-services.html", PREFIX, schema
)
html += nav(PREFIX)
html += page_hero(PREFIX,
    [("Home","index.html"),("Drain Services", None)],
    "Slow, clogged, or backed up",
    "Drain and sewer service that finds the actual blockage first.",
    "From a single slow bathroom sink to a backed-up main sewer line, we diagnose the real cause before recommending a fix &mdash; camera inspection included when it matters.",
    "Schedule Drain Service"
)
html += f"""<section>
  <div class="wrap two-col">
    <div class="reveal">
      <div class="eyebrow">Common issues</div>
      <h2 style="font-size:1.9rem; margin-bottom:18px;">What we handle</h2>
      <ul class="founder-list">
        <li><span class="tick">&#10003;</span> Slow-draining sinks, tubs, and showers</li>
        <li><span class="tick">&#10003;</span> Fully clogged drains and toilets</li>
        <li><span class="tick">&#10003;</span> Recurring backups in the same fixture</li>
        <li><span class="tick">&#10003;</span> Main sewer line blockages</li>
        <li><span class="tick">&#10003;</span> Tree root intrusion in older sewer lines</li>
        <li><span class="tick">&#10003;</span> Gurgling drains or sewer odor indoors</li>
      </ul>
    </div>
    <div class="reveal">
      <div class="eyebrow">Our approach</div>
      <h2 style="font-size:1.9rem; margin-bottom:18px;">Diagnose before we clear</h2>
      <p class="muted" style="margin-bottom:16px;">A single slow drain is often a simple, local clog. Recurring or whole-house drainage issues usually point to something further down the line &mdash; which is where camera inspection earns its keep, confirming exactly what's happening before any cutting or digging is discussed.</p>
      <p class="muted">We explain what the camera shows in plain language, then walk through every reasonable option.</p>
    </div>
  </div>
</section>
"""
html += faq_section(PREFIX, "Drain services FAQ", "Common questions", [
    ("Do I need a camera inspection for a slow drain?", "Not always. A single, isolated slow drain is often solved with standard cleaning. Camera inspection becomes valuable when the problem is recurring, affects multiple fixtures, or involves the main sewer line."),
    ("What causes a main sewer line backup?", "Common causes include tree root intrusion, aging or collapsed clay pipe, grease buildup, and, in older Orange County neighborhoods, simple pipe age."),
    ("Is hydro jetting safe for older pipes?", "It can be, but pipe age and material matter. We'll assess the line's condition first and recommend the appropriate cleaning method rather than defaulting to the most aggressive option."),
])
html += cta_band(PREFIX, "Dealing with a stubborn drain?", "We'll find the real cause before recommending anything.")
html += footer(PREFIX)
write_page("services/drain-services.html", html)
