# -*- coding: utf-8 -*-
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build import *

PREFIX = "../"

# ---------------------------------------------------------------- PEX REPIPING
schema = f"""<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Whole-House PEX Repiping",
  "provider": {{"@type":"Plumber","name":"Straight Flush Plumbing & Leak Detection","telephone":"{PHONE_TEL}"}},
  "areaServed": "Orange County, CA"
}}
</script>
"""
html = head(
    "Whole-House PEX Repiping | Copper Line Elimination | Orange County",
    "Whole-house PEX repiping and copper line elimination in Laguna Niguel, Dana Point & San Clemente. Honest guidance on when repiping actually makes sense.",
    "services/pex-repiping.html", PREFIX, schema
)
html += nav(PREFIX)
html += page_hero(PREFIX,
    [("Home","index.html"),("Leak Detection","services/leak-detection.html"),("PEX Repiping", None)],
    "When repair isn't the answer anymore",
    "Whole-house PEX repiping, explained honestly before it's recommended.",
    "PEX repiping replaces aging, leak-prone copper lines throughout a home with modern, corrosion-resistant piping &mdash; but it's only the right call after diagnosis shows it's actually needed.",
    "Ask If Repiping Is Right For You"
)
html += f"""<section>
  <div class="wrap two-col">
    <div class="reveal">
      <div class="eyebrow">The direct answer</div>
      <h2 style="font-size:1.9rem; margin-bottom:18px;">What is whole-house PEX repiping?</h2>
      <p class="muted" style="margin-bottom:16px;">PEX repiping means removing or bypassing a home's old metal (usually copper) water lines and replacing them with cross-linked polyethylene (PEX) piping. PEX resists the corrosion and pinhole leaks that plague aging copper, and it's flexible enough to route with fewer joints &mdash; fewer joints means fewer future failure points.</p>
      <p class="muted">We only recommend a full repipe once diagnosis shows it's the smarter long-term choice &mdash; not as a default answer to a single leak.</p>
    </div>
    <div class="reveal">
      <div class="eyebrow">Why homeowners choose it</div>
      <ul class="founder-list">
        <li><span class="tick">&#10003;</span> Repeated slab leaks in aging copper lines</li>
        <li><span class="tick">&#10003;</span> Corrosion visible at multiple fixtures</li>
        <li><span class="tick">&#10003;</span> Discolored water or metallic taste</li>
        <li><span class="tick">&#10003;</span> Preparing an older home for resale</li>
        <li><span class="tick">&#10003;</span> Wanting to stop patching the same system repeatedly</li>
      </ul>
    </div>
  </div>
</section>
"""
html += f"""<section class="section-ink">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Copper vs. PEX</div>
      <h2>Why PEX has become the modern standard</h2>
    </div>
    <div class="tech-grid reveal">
      <div class="tech-item"><span class="tag">Durability</span><h3>Corrosion Resistant</h3><p>PEX doesn't corrode the way copper does, which removes the leading cause of slab leaks in older Orange County homes.</p></div>
      <div class="tech-item"><span class="tag">Installation</span><h3>Fewer Joints</h3><p>Flexible runs mean fewer fittings behind walls and under slabs &mdash; and fewer fittings means fewer places a leak can start.</p></div>
      <div class="tech-item"><span class="tag">Value</span><h3>Long-Term Cost</h3><p>Fewer repeat service calls over the life of the system, even though the upfront investment is real.</p></div>
    </div>
  </div>
</section>
"""
html += faq_section(PREFIX, "PEX repiping FAQ", "Common questions", [
    ("Do I need to repipe my whole house, or just part of it?", "It depends on the age and condition of your existing lines. Sometimes a partial reroute solves the problem; sometimes the whole system is due. We'll tell you which applies after diagnosis, not before."),
    ("How long does a whole-house repipe take?", "Most residential repipes are completed in one to a few days depending on the size of the home and wall/slab access, with water restored at the end of each working day whenever possible."),
    ("Is PEX safe for drinking water?", "Yes. PEX piping is certified for potable water use and is the standard choice in new residential construction today."),
])
html += cta_band(PREFIX, "Not sure if repiping is right for you?", "We'll diagnose first and give you an honest answer &mdash; repair, reroute, or repipe.", "Ask Us Directly")
html += footer(PREFIX)
write_page("services/pex-repiping.html", html)
