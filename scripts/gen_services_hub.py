# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build import *

PREFIX = "../"

html = head(
    "Plumbing Services | Leak Detection, Repiping & More | Straight Flush Plumbing",
    "Full-service plumbing in Laguna Niguel & South Orange County — leak detection, slab leak repair, PEX repiping, water heaters, drain cleaning, and general plumbing repair.",
    "services/index.html", PREFIX
)
html += nav(PREFIX)
html += page_hero(PREFIX,
    [("Home","index.html"),("Services", None)],
    "What we do",
    "Every plumbing service, one diagnose-first standard.",
    "From a single dripping faucet to a full slab leak diagnosis, every job starts the same way: find the real problem before recommending a fix.",
    "Schedule Service"
)
html += """<section>
  <div class="wrap">
    <div class="card-grid">
      <div class="service-card reveal">
        <div class="icon">&#128266;</div>
        <h3>Leak Detection</h3>
        <p>Acoustic, electronic &amp; thermal detection that finds hidden leaks before any demolition.</p>
        <a href="leak-detection.html">Learn more &rarr;</a>
      </div>
      <div class="service-card reveal">
        <div class="icon">&#127959;&#65039;</div>
        <h3>Slab Leak Detection</h3>
        <p>Our core specialty &mdash; pinpointing leaks under concrete with acoustic precision.</p>
        <a href="slab-leak-detection.html">Learn more &rarr;</a>
      </div>
      <div class="service-card reveal">
        <div class="icon">&#128295;</div>
        <h3>PEX Repiping</h3>
        <p>Whole-house repiping and copper line elimination, recommended only when it's truly needed.</p>
        <a href="pex-repiping.html">Learn more &rarr;</a>
      </div>
      <div class="service-card reveal">
        <div class="icon">&#128167;</div>
        <h3>Water Heater Services</h3>
        <p>Repair, replacement, and tankless conversion for traditional and tankless units.</p>
        <a href="water-heater-services.html">Learn more &rarr;</a>
      </div>
      <div class="service-card reveal">
        <div class="icon">&#128703;</div>
        <h3>Drain Services</h3>
        <p>Slow drains, clogs, and sewer line issues, diagnosed with camera inspection when it matters.</p>
        <a href="drain-services.html">Learn more &rarr;</a>
      </div>
      <div class="service-card reveal">
        <div class="icon">&#128736;&#65039;</div>
        <h3>Plumbing Repair</h3>
        <p>Faucets, toilets, pipe repair, and water pressure issues, fixed right the first time.</p>
        <a href="plumbing-repair.html">Learn more &rarr;</a>
      </div>
    </div>
  </div>
</section>
"""
html += cta_band(PREFIX, "Not sure which service you need?", "Tell us what's going on and we'll point you in the right direction.")
html += footer(PREFIX)
write_page("services/index.html", html)
print("Services hub generated.")
