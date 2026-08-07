# -*- coding: utf-8 -*-
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build import *

PREFIX = "../"

def article(fname, title, meta_desc, eyebrow, h1, sub, body_sections, faqs, related):
    schema_faq = ""
    if faqs:
        items = ",\n    ".join(
            f'{{"@type":"Question","name":"{q}","acceptedAnswer":{{"@type":"Answer","text":"{a}"}}}}'
            for q, a in faqs
        )
        schema_faq = f"""<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {items}
  ]
}}
</script>
"""
    html = head(title, meta_desc, f"academy/{fname}", PREFIX, schema_faq)
    html += nav(PREFIX)
    trail_label = h1[:28]+("..." if len(h1)>28 else "")
    html += page_hero(PREFIX,
        [("Home","index.html"),("Leak Detection Academy","academy/index.html"),(trail_label, None)],
        eyebrow, h1, sub, "Schedule Diagnosis"
    )
    html += '<section><div class="wrap two-col" style="grid-template-columns:1fr;">'
    for heading, text in body_sections:
        html += f'<div class="reveal" style="margin-bottom:36px; max-width:760px;"><h2 style="font-size:1.5rem; margin-bottom:14px;">{heading}</h2><p class="muted">{text}</p></div>'
    html += '</div></section>'
    if faqs:
        html += faq_section(PREFIX, "Common questions", "You might also be wondering", faqs)
    html += f"""<section class="section-sand">
  <div class="wrap">
    <div class="section-head reveal"><div class="eyebrow">Keep reading</div><h2>Related articles</h2></div>
    <div class="card-grid card-grid-3">"""
    for href, rtitle in related:
        html += f'<div class="service-card reveal"><h3 style="font-size:1.02rem;">{rtitle}</h3><a href="{href}">Read &rarr;</a></div>'
    html += "</div></div></section>"
    html += cta_band(PREFIX, "Think this applies to your home?", "Let's get you a real answer, not more guessing.")
    html += footer(PREFIX)
    write_page(f"academy/{fname}", html)

# ============================================================ COSTS & REPAIRS
article("is-leak-detection-worth-the-cost.html",
 "Is Professional Leak Detection Worth The Cost? | Leak Detection Academy",
 "Weighing the cost of professional leak detection against the cost of guessing and repairing the wrong area.",
 "Costs & repairs", "Is professional leak detection worth the cost?",
 "It's a reasonable question, especially when a leak's exact cost is still unknown. Here's how to think about the trade-off honestly.",
 [("The cost of skipping detection","Without accurate detection, a repair crew is essentially guessing where to open a wall or slab. If they guess wrong, you pay for the repair, the patch-up, and then the process repeats."),
  ("The cost of detection itself","A detection visit is a fraction of the cost of unnecessary demolition, and it gives you a documented, specific answer rather than an educated guess."),
  ("When it matters most","The more finished and expensive your flooring or walls are, the more valuable accurate detection becomes &mdash; the cost of being wrong scales with the cost of what you're opening up.")],
 [("Can I just skip detection and have a repair company look for it?", "You can, but many repair-only companies don't carry dedicated acoustic or thermal equipment, which means more exploratory opening of walls or floors."),
  ("Does detection cost get applied toward the repair?", "Practices vary by company; we're upfront about how our pricing works before we begin.")],
 [("../guides/leak-detection-cost.html","Leak Detection Cost Guide"), ("../services/leak-detection.html","Our Leak Detection Process"), ("how-plumbers-find-leaks-without-cutting-walls.html","How Leaks Are Found Without Cutting Walls")]
)

article("why-two-plumbers-give-different-quotes.html",
 "Why Do Two Plumbers Give Completely Different Quotes For The Same Leak? | Leak Detection Academy",
 "Understanding why leak repair quotes can vary so widely between companies, and what questions help you compare them fairly.",
 "Costs & repairs", "Why do two plumbers give different quotes for the same leak?",
 "Wide quote differences are common in this industry, and the reason usually comes down to what's actually being diagnosed versus assumed.",
 [("Different diagnostic depth","A quote based on a five-minute look and a guess will differ wildly from one based on acoustic detection and pressure testing &mdash; because they're not actually quoting the same scope of work."),
  ("Different repair philosophies","Some companies default to the most profitable option (often a full repipe) regardless of what's actually needed; others, like us, recommend the smallest solution that reasonably solves the problem."),
  ("How to compare quotes fairly","Ask each company what diagnostic method they used to arrive at their recommendation, and whether the quote is based on a confirmed leak location or an assumption.")],
 [("Should I always choose the cheapest quote?", "Not necessarily &mdash; a cheap quote based on a guess can end up costing more if it doesn't solve the actual problem."),
  ("Should I get multiple quotes?", "It's reasonable to do so, especially for larger jobs like a repipe, as long as you're comparing quotes based on similar diagnostic depth.")],
 [("../guides/repair-vs-reroute-vs-repipe.html","Repair vs. Reroute vs. Repipe"), ("is-leak-detection-worth-the-cost.html","Is Leak Detection Worth It?"), ("../guides/slab-leak-repair-cost.html","Slab Leak Repair Cost")]
)

article("hidden-costs-of-ignoring-a-leak.html",
 "The Hidden Costs Of Ignoring A Suspected Leak | Leak Detection Academy",
 "What a small, ignored leak can eventually cost — in water, damage, and repair scope — compared to addressing it early.",
 "Costs & repairs", "The hidden costs of ignoring a suspected leak",
 "A leak that seems minor today rarely stays that way. Here's what tends to happen when detection gets put off.",
 [("Wasted water adds up daily","Even a modest, ongoing leak can waste a significant amount of water every single day, showing up as a steadily climbing water bill the longer it continues."),
  ("Damage tends to spread, not stay put","Moisture from an undetected leak can migrate into flooring, drywall, and even affect indoor air quality through mold growth, expanding the eventual repair scope."),
  ("The repair itself often gets bigger","A leak caught early is often a smaller, more contained repair. The same leak left for months can mean replacing flooring, drywall, or cabinetry in addition to the plumbing fix.")],
 [("How quickly should I act on a suspected leak?", "Reasonably quickly &mdash; scheduling a diagnostic visit as soon as you notice consistent symptoms is the best way to limit both cost and damage."),
  ("Is it ever okay to just monitor a suspected leak?", "For very minor, ambiguous signs, monitoring for a short period can be reasonable, but consistent or worsening signs warrant a professional look sooner rather than later.")],
 [("why-is-my-water-bill-so-high.html","Why Is My Water Bill So High?"), ("is-leak-detection-worth-the-cost.html","Is Leak Detection Worth It?"), ("../services/leak-detection.html","Our Leak Detection Process")]
)

# ============================================================ PREVENTION & MAINTENANCE
article("water-pressure-and-pipe-health.html",
 "How Water Pressure Affects Your Pipes' Long-Term Health | Leak Detection Academy",
 "Why consistently high water pressure accelerates pipe wear, and how to know if your home's pressure is in a healthy range.",
 "Prevention & maintenance", "How water pressure affects your pipes' long-term health",
 "Water pressure is one of the most overlooked factors in a plumbing system's long-term durability.",
 [("Why high pressure matters","Residential water pressure above roughly 80 psi puts sustained extra stress on pipes, joints, and fixtures, which can accelerate wear and contribute to leaks over time."),
  ("How to check your pressure","A simple gauge, available at most hardware stores, attaches to an outdoor spigot and gives you a quick pressure reading in a couple of minutes."),
  ("The role of a pressure regulator (PRV)","A properly installed and functioning PRV keeps incoming water pressure in a safe range, protecting the rest of your plumbing system &mdash; and its placement matters, since one installed downstream of the actual pressure source may not do its job correctly.")],
 [("What's considered a safe water pressure range?", "Generally between 40 and 80 psi is considered a healthy range for most residential systems."),
  ("How often should a pressure regulator be checked?", "Every few years is a reasonable interval, or sooner if you notice pressure-related symptoms like banging pipes or fluctuating flow.")],
 [("preventing-slab-leaks.html","Can Slab Leaks Be Prevented?"), ("../services/plumbing-repair.html","Plumbing Repair Services"), ("what-is-a-slab-leak.html","What Is A Slab Leak?")]
)

article("annual-plumbing-checkup-checklist.html",
 "A Simple Annual Plumbing Checkup Checklist For Homeowners | Leak Detection Academy",
 "A short, practical checklist homeowners can use once a year to catch small plumbing issues before they become expensive ones.",
 "Prevention & maintenance", "A simple annual plumbing checkup checklist",
 "None of this requires special tools &mdash; just a bit of attention once a year.",
 [("Check your water meter", "With everything off, confirm the meter isn't moving. This single check catches more hidden leaks than almost anything else you can do yourself."),
  ("Review your last 12 months of water bills", "Look for any unexplained upward trend, not just a single unusual month."),
  ("Look for visible corrosion", "Check under sinks and around your water heater for greenish or white corrosion buildup at fittings, a sign of aging pipe."),
  ("Test your water pressure", "A simple gauge test tells you if your pressure is in a healthy range or quietly stressing your system."),
  ("Note your plumbing's age", "If you don't already know roughly when your home's plumbing was installed, this is worth finding out &mdash; it shapes how proactive you may want to be.")],
 [],
 [("water-pressure-and-pipe-health.html","Water Pressure & Pipe Health"), ("preventing-slab-leaks.html","Can Slab Leaks Be Prevented?"), ("../services/leak-detection.html","Our Leak Detection Process")]
)

# ============================================================ TECHNOLOGY EDUCATION
article("thermal-imaging-leak-detection-explained.html",
 "Thermal Imaging For Leak Detection: How It Works | Leak Detection Academy",
 "How infrared thermal imaging cameras help identify hidden water leaks by detecting temperature differences.",
 "Technology education", "Thermal imaging for leak detection, explained",
 "It's one of the more visually intuitive detection tools we use &mdash; and it works on a simple principle.",
 [("The basic principle","Thermal cameras detect infrared radiation and translate temperature differences into a visible color image. Wet materials and hot water leaks typically show up as a distinct temperature zone compared to their dry surroundings."),
  ("Where it works best","Thermal imaging is particularly effective for hot water line slab leaks, where the escaping warm water creates a clear, identifiable heat signature on the surface above."),
  ("Its limitations","Thermal imaging is less effective for cold water leaks, since there's often no meaningful temperature difference to detect &mdash; which is why we pair it with acoustic detection rather than relying on it alone.")],
 [("Can thermal imaging see through concrete?", "It detects surface temperature differences rather than literally seeing through concrete, but those surface patterns often correspond accurately to what's happening beneath."),
  ("Is thermal imaging always necessary?", "Not for every job &mdash; it's most valuable for hot water leaks or when acoustic results need visual confirmation.")],
 [("acoustic-leak-detection-explained.html","Acoustic Detection Explained"), ("hot-water-vs-cold-water-slab-leaks.html","Hot vs. Cold Water Slab Leaks"), ("../services/leak-detection.html","Our Leak Detection Process")]
)

article("electronic-pipe-locating-explained.html",
 "Electronic Pipe Locating: How It Narrows Down A Leak | Leak Detection Academy",
 "How electronic pipe locating equipment traces a pipe's exact path to narrow down where a leak or line actually runs.",
 "Technology education", "Electronic pipe locating, explained",
 "This technology answers a different question than acoustic or thermal detection: not 'where's the leak' but 'exactly where does this pipe run.'",
 [("The basic principle","A transmitter sends a traceable signal through a pipe (often via an accessible fitting), and a handheld receiver detects that signal from above ground, tracing the pipe's exact path and depth."),
  ("Why knowing the path matters","Once we know precisely where a pipe runs, we can narrow excavation or access points to a small, specific area rather than a broad, uncertain zone."),
  ("How it complements other methods","Electronic locating is often used alongside acoustic detection &mdash; one confirms where the pipe is, the other confirms where along that path the leak actually is.")],
 [("Does electronic locating require digging first?", "No &mdash; it's done from the surface, tracing the signal without any excavation."),
  ("Can it be used on plastic pipes like PEX?", "Tracing typically requires a conductive element, so approach varies by pipe material &mdash; we'll determine the right method for your specific system.")],
 [("acoustic-leak-detection-explained.html","Acoustic Detection Explained"), ("thermal-imaging-leak-detection-explained.html","Thermal Imaging Explained"), ("../services/leak-detection.html","Our Leak Detection Process")]
)

print("Batch 2 (costs, prevention, technology) complete.")
