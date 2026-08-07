# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build import *

PREFIX = "../"

schema = """<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {"@type":"Question","name":"What should I do first in a plumbing emergency?","acceptedAnswer":{"@type":"Answer","text":"Shut off the water at the main shutoff valve or the fixture's local shutoff if it's safe and accessible, then assess the situation before calling for help."}},
    {"@type":"Question","name":"Where is my home's main water shutoff valve?","acceptedAnswer":{"@type":"Answer","text":"Most homes have it near the street-facing side of the house, in a garage, basement, or utility closet — it's worth locating it before an emergency happens, not during one."}}
  ]
}
</script>
"""

html = head(
    "Emergency Plumbing Checklist | What To Do Right Now | Straight Flush Plumbing",
    "A step-by-step emergency plumbing checklist for burst pipes, major leaks, and water emergencies in Orange County. Know what to do before we arrive.",
    "academy/emergency-plumbing-checklist.html", PREFIX, schema
)
html += nav(PREFIX)
html += page_hero(PREFIX,
    [("Home","index.html"),("Leak Detection Academy","academy/index.html"),("Emergency Plumbing Checklist", None)],
    "Prevention & maintenance", "Emergency plumbing checklist: what to do right now",
    "A burst pipe or major leak is stressful. Here's exactly what to do in the first few minutes, before help arrives.",
    "Call For Emergency Help"
)
html += """<section>
  <div class="wrap">
    <div class="process" style="background:var(--sand); padding:32px; border-radius:var(--radius-lg);">
      <div class="process-step reveal" style="border-top-color:var(--line);"><span class="num">01</span><h4 style="color:var(--ink-text);">Shut off the water</h4><p style="color:var(--muted);">Find your main shutoff valve (often near the street side of the house, garage, or utility closet) and turn it fully off.</p></div>
      <div class="process-step reveal" style="border-top-color:var(--line);"><span class="num">02</span><h4 style="color:var(--ink-text);">Shut off electricity if needed</h4><p style="color:var(--muted);">If water is near outlets, appliances, or the electrical panel, shut off power to that area at the breaker.</p></div>
      <div class="process-step reveal" style="border-top-color:var(--line);"><span class="num">03</span><h4 style="color:var(--ink-text);">Contain what you can</h4><p style="color:var(--muted);">Towels, buckets, and moving furniture out of the way can limit damage while you wait.</p></div>
      <div class="process-step reveal" style="border-top-color:var(--line);"><span class="num">04</span><h4 style="color:var(--ink-text);">Document the damage</h4><p style="color:var(--muted);">Photos and video now will help later, whether for repair planning or an insurance claim.</p></div>
      <div class="process-step reveal" style="border-top-color:var(--line);"><span class="num">05</span><h4 style="color:var(--ink-text);">Call for help</h4><p style="color:var(--muted);">Once the immediate danger is controlled, call a plumber who can diagnose the actual source, not just stop the symptom.</p></div>
    </div>
  </div>
</section>
"""
html += """<section class="section-sand">
  <div class="wrap two-col">
    <div class="reveal">
      <div class="eyebrow">Know this before you need it</div>
      <h2 style="font-size:1.8rem; margin-bottom:18px;">Find your shutoff valve today, not during an emergency</h2>
      <p class="muted">The single most useful thing you can do right now, before anything goes wrong, is locate your home's main water shutoff valve and make sure it actually turns. Valves that haven't been used in years can seize up &mdash; testing it now means it will actually work when you need it.</p>
    </div>
    <div class="reveal">
      <div class="eyebrow">When to call immediately</div>
      <ul class="founder-list">
        <li><span class="tick">&#10003;</span> Water actively flooding a room</li>
        <li><span class="tick">&#10003;</span> No hot water and a gas smell nearby</li>
        <li><span class="tick">&#10003;</span> Sewage backing up into the home</li>
        <li><span class="tick">&#10003;</span> A burst pipe you can't shut off</li>
      </ul>
    </div>
  </div>
</section>
"""
html += faq_section(PREFIX, "Emergency plumbing FAQ", "Common questions", [
    ("What should I do first in a plumbing emergency?", "Shut off the water at the main shutoff valve or the fixture's local shutoff if it's safe and accessible, then assess the situation before calling for help."),
    ("Where is my home's main water shutoff valve?", "Most homes have it near the street-facing side of the house, in a garage, basement, or utility closet — it's worth locating it before an emergency happens, not during one."),
    ("Should I try to fix a burst pipe myself?", "A temporary measure like a pipe clamp or shutting off the water is reasonable, but permanent repair should be left to a professional to make sure the actual cause is addressed."),
])
html += """<section class="section-ink">
  <div class="wrap">
    <div class="cta-band reveal">
      <div>
        <h2>Dealing with a plumbing emergency right now?</h2>
        <p>Call us directly &mdash; we'll help you figure out the right next step.</p>
      </div>
      <a href="tel:%s" class="btn btn-primary">Call %s</a>
    </div>
  </div>
</section>
""" % (PHONE_TEL, PHONE_DISPLAY)
html += footer(PREFIX)
write_page("academy/emergency-plumbing-checklist.html", html)
print("Emergency Plumbing Checklist article generated.")
