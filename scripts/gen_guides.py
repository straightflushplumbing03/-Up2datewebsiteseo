# -*- coding: utf-8 -*-
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build import *

PREFIX = "../"

# ============================================================ LEAK DETECTION COST
html = head(
    "Leak Detection Cost Guide | What to Expect | Orange County",
    "What does professional leak detection cost in Orange County? A clear breakdown of factors that affect price, with no fine print.",
    "guides/leak-detection-cost.html", PREFIX
)
html += nav(PREFIX)
html += page_hero(PREFIX,
    [("Home","index.html"),("Cost Guides", None)],
    "Cost guide",
    "What does leak detection actually cost?",
    "Leak detection pricing depends on the size of the home, the type of leak, and how accessible the plumbing is. Here's how to think about it before you call anyone.",
    "Get A Straight Answer"
)
html += f"""<section>
  <div class="wrap two-col">
    <div class="reveal">
      <div class="eyebrow">The direct answer</div>
      <h2 style="font-size:1.9rem; margin-bottom:18px;">What affects the price</h2>
      <ul class="founder-list">
        <li><span class="tick">&#10003;</span> Size of the home and number of suspect areas</li>
        <li><span class="tick">&#10003;</span> Whether the leak is a slab leak, wall leak, or underground line</li>
        <li><span class="tick">&#10003;</span> How accessible the plumbing is (finished floors, landscaping, etc.)</li>
        <li><span class="tick">&#10003;</span> Which detection methods are needed &mdash; acoustic, thermal, or electronic</li>
        <li><span class="tick">&#10003;</span> Whether documentation is needed for an insurance claim</li>
      </ul>
    </div>
    <div class="reveal">
      <div class="eyebrow">Why we don't post a flat number</div>
      <h2 style="font-size:1.9rem; margin-bottom:18px;">Every home is different</h2>
      <p class="muted" style="margin-bottom:16px;">Any company that quotes an exact leak detection price over the phone, before seeing the property, is guessing. The honest answer is that pricing depends on the variables above &mdash; and we'll give you a clear, specific number after a brief conversation about your situation, before we ever step onto the property.</p>
      <p class="muted">What we can promise: no surprise charges, and a clear explanation of what you're paying for before we start.</p>
    </div>
  </div>
</section>
"""
html += faq_section(PREFIX, "Leak detection cost FAQ", "Common questions", [
    ("Is leak detection expensive compared to just guessing and repairing?", "Usually not, once you factor in the cost of repairs that miss the actual leak. Accurate detection prevents paying to open the wrong wall or floor twice."),
    ("Will you give me a price over the phone?", "We can give you a general range based on what you describe, but a firm number comes after understanding your specific situation &mdash; that's the same diagnose-first standard we apply to the plumbing itself."),
    ("Does homeowners insurance ever cover the cost of detection?", "Sometimes, depending on your policy and the cause of the leak. See our Insurance Resource Center for what to check with your provider."),
])
html += cta_band(PREFIX, "Want a straight answer on your specific situation?", "Tell us what you're noticing and we'll give you real numbers, not a guess.")
html += footer(PREFIX)
write_page("guides/leak-detection-cost.html", html)

# ============================================================ SLAB LEAK REPAIR COST
html = head(
    "Slab Leak Repair Cost Guide | Repair vs. Reroute vs. Repipe Pricing Factors",
    "What determines the cost of slab leak repair in Orange County — spot repair, reroute, or whole-house repipe.",
    "guides/slab-leak-repair-cost.html", PREFIX
)
html += nav(PREFIX)
html += page_hero(PREFIX,
    [("Home","index.html"),("Cost Guides","guides/leak-detection-cost.html"),("Slab Leak Repair Cost", None)],
    "Cost guide",
    "What determines slab leak repair cost?",
    "Once a slab leak is found, the repair path you choose &mdash; spot repair, reroute, or repipe &mdash; is the biggest factor in overall cost.",
    "Ask About Your Situation"
)
html += f"""<section>
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Three paths, three cost profiles</div>
      <h2>Understanding your options</h2>
    </div>
    <div class="card-grid card-grid-3">
      <div class="service-card reveal"><h3>Spot Repair</h3><p>The lowest-cost option when there's a single, accessible leak in an otherwise sound system. Involves a small, targeted access point.</p></div>
      <div class="service-card reveal"><h3>Reroute</h3><p>A moderate investment that avoids the problem section of pipe entirely by running a new line around it, often through attic or wall space instead of the slab.</p></div>
      <div class="service-card reveal"><h3>Whole-House Repipe</h3><p>The larger investment, appropriate when copper throughout the home is aging or leaks have repeated. Pays off by addressing the root cause once.</p></div>
    </div>
  </div>
</section>
"""
html += f"""<section class="section-ink">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">What drives the decision</div>
      <h2>Why we don't default to the most expensive option</h2>
      <p>A single isolated leak in an otherwise healthy system rarely justifies a full repipe. We recommend the option that matches what we actually find during diagnosis &mdash; not the biggest invoice.</p>
    </div>
  </div>
</section>
"""
html += faq_section(PREFIX, "Slab leak repair FAQ", "Common questions", [
    ("How do I know which option is right for my home?", "It comes down to the age and condition of your existing pipes, whether this is your first leak or a repeat issue, and the accessibility of the affected line. We'll walk through this with you after diagnosis."),
    ("Does a slab leak repair mean breaking up my floor?", "Sometimes, but often the access point can be minimized significantly with accurate acoustic detection narrowing down the exact spot first."),
    ("Is a reroute cheaper than a repipe?", "Generally yes, since it addresses one problem line rather than the entire system &mdash; but it doesn't address other aging lines that may develop issues later."),
])
html += cta_band(PREFIX, "Already found a slab leak?", "Let's talk through your realistic options.")
html += footer(PREFIX)
write_page("guides/slab-leak-repair-cost.html", html)

# ============================================================ REPAIR VS REROUTE VS REPIPE
html = head(
    "Repair vs. Reroute vs. Repipe | Which Is Right For Your Home?",
    "A clear breakdown of when a spot repair, a reroute, or a whole-house repipe makes the most sense after a leak is found.",
    "guides/repair-vs-reroute-vs-repipe.html", PREFIX
)
html += nav(PREFIX)
html += page_hero(PREFIX,
    [("Home","index.html"),("Repair vs. Reroute vs. Repipe", None)],
    "Decision guide",
    "Repair, reroute, or repipe: how to actually decide.",
    "Once a leak is found and confirmed, the next question is what to do about it. Here's how we think through that decision with every homeowner.",
    "Get Guidance For Your Home"
)
html += f"""<section>
  <div class="wrap">
    <div class="checklist-grid">
      <div class="check-card reveal"><span class="mark">1</span><p><strong>Choose repair if&hellip;</strong>This is your first leak, the rest of your plumbing is in good condition, and the leak is in an accessible location.</p></div>
      <div class="check-card reveal"><span class="mark">2</span><p><strong>Choose reroute if&hellip;</strong>The leak is in a hard-to-access spot (like under a slab) but the rest of the system is sound &mdash; avoiding the problem section is more practical than repairing it in place.</p></div>
      <div class="check-card reveal"><span class="mark">3</span><p><strong>Choose repipe if&hellip;</strong>You've had multiple leaks, your pipes are original copper from an older build, or discoloration and corrosion show up at multiple fixtures.</p></div>
      <div class="check-card reveal"><span class="mark">4</span><p><strong>Consider your timeline</strong>Planning to sell soon? A repipe can be a strong selling point. Staying long-term? It can prevent years of repeat repairs.</p></div>
      <div class="check-card reveal"><span class="mark">5</span><p><strong>Consider your budget</strong>A spot repair now doesn't rule out a planned repipe later &mdash; sometimes the right answer is doing this in stages.</p></div>
      <div class="check-card reveal"><span class="mark">6</span><p><strong>When in doubt, ask</strong>We'll always tell you honestly which category your situation falls into.</p></div>
    </div>
  </div>
</section>
"""
html += cta_band(PREFIX, "Not sure which category you're in?", "We'll diagnose first and walk you through it clearly.")
html += footer(PREFIX)
write_page("guides/repair-vs-reroute-vs-repipe.html", html)

print("All guide pages generated.")
