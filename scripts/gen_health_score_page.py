# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build import *

PREFIX = ""

schema = """<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Home Plumbing Health Score",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Any (web browser)",
  "description": "A free, instant 60-second assessment that estimates a home's plumbing risk score based on age, water bill history, past leaks, water pressure, and current warning signs.",
  "offers": {"@type":"Offer","price":"0","priceCurrency":"USD"},
  "provider": {"@type":"Plumber","name":"Straight Flush Plumbing & Leak Detection","telephone":"+19493746524"}
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {"@type":"Question","name":"How accurate is the Home Plumbing Health Score?","acceptedAnswer":{"@type":"Answer","text":"It's a directional self-assessment based on common risk factors, not a diagnostic tool. It's designed to help you decide whether a professional inspection is worth scheduling, not to replace one."}},
    {"@type":"Question","name":"Is the Home Plumbing Health Score free?","acceptedAnswer":{"@type":"Answer","text":"Yes, completely free with no signup required. It takes about 60 seconds to complete."}},
    {"@type":"Question","name":"What do I do if I get a low score?","acceptedAnswer":{"@type":"Answer","text":"A lower score means several common risk factors are present in your home. We'd recommend scheduling a professional leak detection visit to get an accurate, confirmed answer rather than relying on the self-assessment alone."}}
  ]
}
</script>
"""

html = head(
    "Home Plumbing Health Score | Free Instant Risk Assessment | Straight Flush Plumbing",
    "Take our free 60-second Home Plumbing Health Score quiz. Answer 5 quick questions and get an instant, personalized risk score for hidden leaks and aging pipes.",
    "plumbing-health-score.html", PREFIX, schema
)
html += nav(PREFIX)
html += page_hero(PREFIX,
    [("Home","index.html"),("Home Plumbing Health Score", None)],
    "Free 60-second assessment",
    "What's Your Home Plumbing Health Score?",
    "A quick, free way to understand your home's real risk of hidden leaks and aging plumbing &mdash; before it becomes an emergency. Answer 5 questions, get an instant personalized score.",
    "Skip To The Quiz", "#quiz"
)

html += """<section id="quiz">
  <div class="wrap">
    <div class="health-tool reveal" id="healthTool" data-prefix="">
      <div class="health-progress-track"><div class="health-progress-fill"></div></div>

      <div class="health-question active">
        <h3>How old is your home's plumbing system?</h3>
        <div class="health-options">
          <button class="health-option" data-points="25">Less than 10 years</button>
          <button class="health-option" data-points="15">10&ndash;25 years</button>
          <button class="health-option" data-points="5">More than 25 years, original copper</button>
        </div>
      </div>

      <div class="health-question">
        <h3>Has your water bill changed recently?</h3>
        <div class="health-options">
          <button class="health-option" data-points="20">No, it's been consistent</button>
          <button class="health-option" data-points="10">Slightly higher, not sure why</button>
          <button class="health-option" data-points="0">Yes, a noticeable jump</button>
        </div>
      </div>

      <div class="health-question">
        <h3>Have you ever had a slab leak or major plumbing repair?</h3>
        <div class="health-options">
          <button class="health-option" data-points="20">Never</button>
          <button class="health-option" data-points="10">Once</button>
          <button class="health-option" data-points="0">Two or more times</button>
        </div>
      </div>

      <div class="health-question">
        <h3>Do you know your home's water pressure?</h3>
        <div class="health-options">
          <button class="health-option" data-points="20">Yes, and it's in the 40-80 psi range</button>
          <button class="health-option" data-points="10">Not sure</button>
          <button class="health-option" data-points="0">It's noticeably high or fluctuates a lot</button>
        </div>
      </div>

      <div class="health-question">
        <h3>Have you noticed any warning signs recently?</h3>
        <div class="health-options">
          <button class="health-option" data-points="15">No, everything seems normal</button>
          <button class="health-option" data-points="5">A minor sign or two (sound, spot, pressure)</button>
          <button class="health-option" data-points="0">Multiple signs at once</button>
        </div>
      </div>

      <div class="health-result"></div>
    </div>
  </div>
</section>
"""

html += """<section class="section-sand">
  <div class="wrap two-col">
    <div class="reveal">
      <div class="eyebrow">How it works</div>
      <h2 style="font-size:1.8rem; margin-bottom:18px;">What this score actually measures</h2>
      <p class="muted" style="margin-bottom:16px;">The Home Plumbing Health Score looks at five of the most common risk factors for hidden leaks and slab leaks: the age of your plumbing system, recent water bill trends, your repair history, water pressure, and any current warning signs you've noticed.</p>
      <p class="muted">Each answer is weighted based on how strongly it correlates with leak risk in the homes we've diagnosed throughout Orange County. It's a self-assessment, not a diagnosis &mdash; think of it as a first, free filter to help you decide whether a professional visit is worth scheduling.</p>
    </div>
    <div class="reveal">
      <div class="eyebrow">Why we built this</div>
      <ul class="founder-list">
        <li><span class="tick">&#10003;</span> Most homeowners don't know they're at risk until a leak is already causing damage</li>
        <li><span class="tick">&#10003;</span> A few simple questions can reveal patterns worth paying attention to</li>
        <li><span class="tick">&#10003;</span> It's free, instant, and requires no signup</li>
        <li><span class="tick">&#10003;</span> If your score comes back low, we'll tell you honestly &mdash; and if it's high, we'll tell you that too</li>
      </ul>
    </div>
  </div>
</section>
"""

html += faq_section(PREFIX, "Common questions", "About this tool", [
    ("How accurate is the Home Plumbing Health Score?", "It's a directional self-assessment based on common risk factors, not a diagnostic tool. It's designed to help you decide whether a professional inspection is worth scheduling, not to replace one."),
    ("Is the Home Plumbing Health Score free?", "Yes, completely free with no signup required. It takes about 60 seconds to complete."),
    ("What do I do if I get a low score?", "A lower score means several common risk factors are present in your home. We'd recommend scheduling a professional leak detection visit to get an accurate, confirmed answer rather than relying on the self-assessment alone."),
])

html += """<section class="section-sand">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Keep learning</div>
      <h2>Related reading</h2>
    </div>
    <div class="card-grid card-grid-3">
      <div class="service-card reveal"><h3>What Is A Slab Leak?</h3><p>A plain-language definition and why it happens.</p><a href="academy/what-is-a-slab-leak.html">Read &rarr;</a></div>
      <div class="service-card reveal"><h3>Can Slab Leaks Be Prevented?</h3><p>Practical steps that actually reduce your risk.</p><a href="academy/preventing-slab-leaks.html">Read &rarr;</a></div>
      <div class="service-card reveal"><h3>How Water Pressure Affects Pipes</h3><p>Why pressure is one of the biggest risk factors.</p><a href="academy/water-pressure-and-pipe-health.html">Read &rarr;</a></div>
    </div>
  </div>
</section>
"""

html += cta_band(PREFIX, "Ready for a real answer, not just a score?", "Schedule a professional leak detection visit and know for certain.", "Schedule Diagnosis", "contact.html", dark=True)
html += footer(PREFIX)
html = html.replace('<script src="assets/js/main.js"></script>', '<script src="assets/js/main.js"></script>\n<script src="assets/js/features.js"></script>')
write_page("plumbing-health-score.html", html)
print("Home Plumbing Health Score landing page generated.")
