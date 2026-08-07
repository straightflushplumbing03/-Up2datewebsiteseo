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
  "serviceType": "General Plumbing Repair",
  "provider": {{"@type":"Plumber","name":"Straight Flush Plumbing & Leak Detection","telephone":"{PHONE_TEL}"}},
  "areaServed": "Orange County, CA"
}}
</script>
"""
html = head(
    "Plumbing Repair Services | Fixtures, Pipes & Pressure | Orange County",
    "Everyday plumbing repair in Laguna Niguel, Dana Point & San Clemente — faucets, toilets, pipe repair, and water pressure issues, fixed right the first time.",
    "services/plumbing-repair.html", PREFIX, schema
)
html += nav(PREFIX)
html += page_hero(PREFIX,
    [("Home","index.html"),("Plumbing Repair", None)],
    "Everyday plumbing, done right",
    "The plumbing repairs every home eventually needs.",
    "Not every plumbing issue is a mystery to solve &mdash; sometimes it's a worn faucet, a running toilet, or a pressure problem. We handle the everyday repairs with the same care as our diagnostic work.",
    "Schedule a Repair"
)
html += f"""<section>
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">What we repair</div>
      <h2>Common plumbing repairs we handle</h2>
    </div>
    <div class="card-grid">
      <div class="service-card reveal"><div class="icon">&#128703;</div><h3>Faucet &amp; Fixture Repair</h3><p>Leaky, dripping, or low-flow faucets and fixtures repaired or replaced.</p></div>
      <div class="service-card reveal"><div class="icon">&#128701;</div><h3>Toilet Repair</h3><p>Running toilets, weak flushes, and leaks at the base, fixed correctly.</p></div>
      <div class="service-card reveal"><div class="icon">&#128295;</div><h3>Pipe Repair</h3><p>Spot repairs for accessible pipe leaks, corrosion, and damaged sections.</p></div>
      <div class="service-card reveal"><div class="icon">&#128167;</div><h3>Water Pressure Issues</h3><p>Diagnosing low or fluctuating pressure &mdash; from PRV problems to hidden leaks.</p></div>
    </div>
  </div>
</section>
"""
html += f"""<section class="section-sand">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">A real example</div>
      <h2>Pressure problems aren't always where you'd expect</h2>
      <p>We've traced pressure issues on buried lines back to a pressure regulator installed on the wrong end of the run &mdash; downstream instead of at the source. Moving it upstream solved what looked, at first, like a much bigger problem. That's the value of diagnosing before repairing: sometimes the fix is smaller than it looks, and sometimes it's in a different place than expected.</p>
    </div>
  </div>
</section>
"""
html += faq_section(PREFIX, "Plumbing repair FAQ", "Common questions", [
    ("Why does my water pressure keep dropping?", "Common causes include a failing pressure regulator (PRV), mineral buildup in pipes, or a hidden leak somewhere in the system. We diagnose which one applies before recommending a fix."),
    ("Is a running toilet worth fixing right away?", "Yes &mdash; a running toilet can waste a significant amount of water and add up quickly on your water bill, and it's usually an inexpensive repair."),
    ("Do you repair or only replace fixtures?", "We repair whenever a repair is the sound long-term choice, and only recommend replacement when the fixture or part is genuinely beyond a reasonable repair."),
])
html += cta_band(PREFIX, "Got a plumbing repair that's been on the list?", "Let's get it handled properly, the first time.")
html += footer(PREFIX)
write_page("services/plumbing-repair.html", html)
