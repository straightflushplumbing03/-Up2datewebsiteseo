# -*- coding: utf-8 -*-
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build import *

PREFIX = "../"

# ============================================================ INSURANCE HUB
html = head(
    "Insurance Resource Center | Water & Slab Leak Claims | Orange County",
    "Understand how homeowners insurance typically treats water and slab leak claims, what documentation helps, and questions worth asking your provider.",
    "insurance/index.html", PREFIX
)
html += nav(PREFIX)
html += page_hero(PREFIX,
    [("Home","index.html"),("Insurance Resource Center", None)],
    "Insurance resource center",
    "Understanding insurance and leak claims, honestly.",
    "We're not insurance agents, and coverage always depends on your specific policy &mdash; but we can help you understand the general landscape and provide the documentation your claim may need.",
    "Ask For Documentation Help"
)
html += f"""<section>
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Start here</div>
      <h2>Resource library</h2>
    </div>
    <div class="card-grid">
      <div class="service-card reveal"><h3>Does Insurance Cover Slab Leaks?</h3><p>The general factors that typically determine coverage, and why it varies so much by policy.</p><a href="does-insurance-cover-slab-leaks.html">Read the guide &rarr;</a></div>
      <div class="service-card reveal"><h3>What To Do After Discovering a Leak</h3><p>The steps that protect both your home and your claim.</p><a href="what-to-do-after-a-leak.html">Read the guide &rarr;</a></div>
      <div class="service-card reveal"><h3>Documentation That Helps Your Claim</h3><p>What kind of diagnostic reporting insurers typically want to see.</p><a href="documentation-checklist.html">Read the guide &rarr;</a></div>
      <div class="service-card reveal"><h3>Questions To Ask Your Insurer</h3><p>The right questions before you assume anything is or isn't covered.</p><a href="questions-to-ask-your-insurer.html">Read the guide &rarr;</a></div>
    </div>
  </div>
</section>
"""
html += cta_band(PREFIX, "Filing a claim and need documentation?", "We provide clear diagnostic reporting you can bring straight to your insurer.")
html += footer(PREFIX)
write_page("insurance/index.html", html)

# ============================================================ DOES INSURANCE COVER SLAB LEAKS
html = head(
    "Does Insurance Cover Slab Leaks? | What Typically Determines Coverage",
    "A clear, honest look at how homeowners insurance policies typically approach slab leak coverage in California.",
    "insurance/does-insurance-cover-slab-leaks.html", PREFIX
)
html += nav(PREFIX)
html += page_hero(PREFIX,
    [("Home","index.html"),("Insurance Resource Center","insurance/index.html"),("Does Insurance Cover Slab Leaks?", None)],
    "Insurance basics",
    "Does homeowners insurance cover slab leaks?",
    "The honest answer: it depends entirely on your specific policy, the cause of the leak, and your insurer's terms. Here's the general landscape.",
    "Ask Us About Documentation"
)
html += f"""<section>
  <div class="wrap two-col">
    <div class="reveal">
      <div class="eyebrow">The general pattern</div>
      <h2 style="font-size:1.9rem; margin-bottom:18px;">What often matters most</h2>
      <ul class="founder-list">
        <li><span class="tick">&#10003;</span> Whether the leak was sudden and accidental, versus gradual wear over time</li>
        <li><span class="tick">&#10003;</span> Whether resulting damage (not just the pipe itself) is what's being claimed</li>
        <li><span class="tick">&#10003;</span> Your specific policy's language around "hidden water damage"</li>
        <li><span class="tick">&#10003;</span> Whether the pipe failure was linked to lack of maintenance</li>
      </ul>
    </div>
    <div class="reveal">
      <div class="eyebrow">Our role</div>
      <h2 style="font-size:1.9rem; margin-bottom:18px;">What we can and can't tell you</h2>
      <p class="muted" style="margin-bottom:16px;">We can't tell you what your policy covers &mdash; that's between you and your insurer. What we can do is give you an accurate, well-documented diagnosis of what happened and where, which is exactly the kind of information insurers ask for when evaluating a claim.</p>
      <p class="muted">If you're mid-claim, let us know before the visit so we can structure our findings the way your adjuster will want to see them.</p>
    </div>
  </div>
</section>
"""
html += faq_section(PREFIX, "Insurance FAQ", "Common questions", [
    ("Is a slab leak considered sudden or gradual damage?", "This is determined by your insurer based on the specific circumstances, and it's often the single biggest factor in whether a claim is approved. We can't make that determination, but our diagnostic findings can help inform it."),
    ("Will my rates go up if I file a claim?", "That depends on your insurer and policy history. It's worth asking your agent directly before filing, if you're unsure."),
    ("Can you deal with my insurance company directly?", "We're happy to provide documentation and answer technical questions your adjuster may have, though the claim itself is between you and your insurer."),
])
html += cta_band(PREFIX, "Need documentation for a claim?", "We'll provide clear, accurate findings you can bring to your insurer.")
html += footer(PREFIX)
write_page("insurance/does-insurance-cover-slab-leaks.html", html)

# ============================================================ WHAT TO DO AFTER A LEAK
html = head(
    "What To Do After Discovering a Water Leak | Step-By-Step",
    "The steps to take immediately after discovering a water or slab leak, to protect your home and your potential insurance claim.",
    "insurance/what-to-do-after-a-leak.html", PREFIX
)
html += nav(PREFIX)
html += page_hero(PREFIX,
    [("Home","index.html"),("Insurance Resource Center","insurance/index.html"),("What To Do After a Leak", None)],
    "Step-by-step",
    "You just found a leak. Here's what to do first.",
    "The first few hours after discovering a leak matter &mdash; both for limiting damage and for supporting any insurance claim that may follow.",
    "Schedule Emergency Diagnosis"
)
html += f"""<section>
  <div class="wrap">
    <div class="process process-3" style="background:var(--sand); padding:32px; border-radius:var(--radius-lg);">
      <div class="process-step reveal" style="border-top-color:var(--line);"><span class="num">01</span><h4 style="color:var(--ink-text);">Stop further damage</h4><p style="color:var(--muted);">If possible and safe, shut off the water at the main or the affected fixture.</p></div>
      <div class="process-step reveal" style="border-top-color:var(--line);"><span class="num">02</span><h4 style="color:var(--ink-text);">Document everything</h4><p style="color:var(--muted);">Photos and video of the damage, the date noticed, and anything you observed leading up to it.</p></div>
      <div class="process-step reveal" style="border-top-color:var(--line);"><span class="num">03</span><h4 style="color:var(--ink-text);">Avoid unnecessary cleanup yet</h4><p style="color:var(--muted);">Where safe to wait, avoid discarding damaged materials before documentation is complete.</p></div>
      <div class="process-step reveal" style="border-top-color:var(--line);"><span class="num">04</span><h4 style="color:var(--ink-text);">Call for diagnosis</h4><p style="color:var(--muted);">Get a professional, documented diagnosis of the source before repairs begin.</p></div>
      <div class="process-step reveal" style="border-top-color:var(--line);"><span class="num">05</span><h4 style="color:var(--ink-text);">Contact your insurer</h4><p style="color:var(--muted);">Report the claim with your documentation and diagnostic findings in hand.</p></div>
      <div class="process-step reveal" style="border-top-color:var(--line);"><span class="num">06</span><h4 style="color:var(--ink-text);">Proceed with repairs</h4><p style="color:var(--muted);">Once the source is confirmed and your claim (if any) is underway, move forward with the right fix.</p></div>
    </div>
  </div>
</section>
"""
html += cta_band(PREFIX, "Dealing with an active leak right now?", "Call us and we'll help you figure out the right next step.")
html += footer(PREFIX)
write_page("insurance/what-to-do-after-a-leak.html", html)

# ============================================================ DOCUMENTATION CHECKLIST
html = head(
    "Documentation That Helps Your Leak Insurance Claim",
    "What kind of diagnostic documentation insurers typically want to see for a water or slab leak claim.",
    "insurance/documentation-checklist.html", PREFIX
)
html += nav(PREFIX)
html += page_hero(PREFIX,
    [("Home","index.html"),("Insurance Resource Center","insurance/index.html"),("Documentation Checklist", None)],
    "Documentation",
    "What good leak documentation looks like.",
    "Insurers evaluate claims on specifics, not impressions. Here's the kind of documentation that tends to support a clear, well-understood claim.",
    "Request Documented Diagnosis"
)
html += f"""<section>
  <div class="wrap">
    <div class="checklist-grid">
      <div class="check-card reveal"><span class="mark">&#10003;</span><p><strong>Date first noticed</strong>As specific as you can reasonably be.</p></div>
      <div class="check-card reveal"><span class="mark">&#10003;</span><p><strong>Photos and video</strong>Of visible damage, from multiple angles, with timestamps if possible.</p></div>
      <div class="check-card reveal"><span class="mark">&#10003;</span><p><strong>Water bill history</strong>Showing the change that prompted concern.</p></div>
      <div class="check-card reveal"><span class="mark">&#10003;</span><p><strong>Professional diagnostic findings</strong>Confirming the type, location, and likely cause of the leak.</p></div>
      <div class="check-card reveal"><span class="mark">&#10003;</span><p><strong>Repair estimate</strong>An itemized breakdown of proposed work and cost.</p></div>
      <div class="check-card reveal"><span class="mark">&#10003;</span><p><strong>Maintenance history</strong>If available, showing the system was reasonably maintained.</p></div>
    </div>
  </div>
</section>
"""
html += cta_band(PREFIX, "Need a documented diagnosis for your claim?", "We'll provide clear findings formatted for your insurer.")
html += footer(PREFIX)
write_page("insurance/documentation-checklist.html", html)

# ============================================================ QUESTIONS TO ASK YOUR INSURER
html = head(
    "Questions To Ask Your Insurer About a Leak Claim",
    "The right questions to ask your homeowners insurance provider before assuming a leak is or isn't covered.",
    "insurance/questions-to-ask-your-insurer.html", PREFIX
)
html += nav(PREFIX)
html += page_hero(PREFIX,
    [("Home","index.html"),("Insurance Resource Center","insurance/index.html"),("Questions To Ask Your Insurer", None)],
    "Before you assume anything",
    "Questions worth asking your insurance provider.",
    "Coverage details vary widely by policy and provider. These questions help you get a clear answer instead of guessing.",
    "Get A Diagnosis First"
)
html += f"""<section>
  <div class="wrap">
    <div class="founder-list" style="max-width:720px; gap:20px;">
      <li class="reveal"><span class="tick">?</span><p>Does my policy distinguish between "sudden and accidental" damage versus gradual damage, and how is that determined?</p></li>
      <li class="reveal"><span class="tick">?</span><p>Is the cost of locating the leak (detection) covered, separately from repair costs?</p></li>
      <li class="reveal"><span class="tick">?</span><p>Is resulting damage (flooring, drywall) covered even if the pipe repair itself isn't?</p></li>
      <li class="reveal"><span class="tick">?</span><p>What documentation do you require to process a claim like this?</p></li>
      <li class="reveal"><span class="tick">?</span><p>Will filing this claim affect my premium, and if so, by how much?</p></li>
      <li class="reveal"><span class="tick">?</span><p>Is there a preferred format or professional you require for diagnostic reporting?</p></li>
    </div>
  </div>
</section>
"""
html += cta_band(PREFIX, "Want documentation ready before you call your insurer?", "We'll diagnose first so you walk into that call informed.")
html += footer(PREFIX)
write_page("insurance/questions-to-ask-your-insurer.html", html)

print("All insurance pages generated.")
