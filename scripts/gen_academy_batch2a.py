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

# ============================================================ FUNDAMENTALS
article("what-is-a-slab-leak.html",
 "What Is A Slab Leak? A Plain-Language Definition | Leak Detection Academy",
 "A clear, jargon-free explanation of what a slab leak actually is and why it happens under a home's foundation.",
 "Leak detection fundamentals", "What is a slab leak?",
 "It's one of the most common plumbing terms homeowners hear and rarely have explained clearly. Here's the plain-language version.",
 [("The basic definition","A slab leak is a leak in one of the water lines that run underneath a home's concrete foundation (the 'slab'). Because the pipe is buried in or under concrete, the leak isn't visible the way a leak under a sink would be."),
  ("Why the location matters so much","Because the pipe is inaccessible, a slab leak can run for weeks or months before it's noticed &mdash; often first showing up as a rising water bill, a warm floor spot, or a sound of running water, rather than a visible puddle."),
  ("Why it's treated differently from other leaks","Repairing a slab leak may involve accessing concrete, which is why accurate detection &mdash; confirming the exact spot before any concrete is opened &mdash; matters so much more here than with an exposed pipe leak.")],
 [("Is a slab leak an emergency?", "It depends on severity, but it's generally something to address promptly rather than ignore, since it can worsen and cause additional damage the longer it continues."),
  ("Can a slab leak happen in any home?", "Any home with water lines running through or under its foundation can develop a slab leak, though age and pipe material affect the likelihood.")],
 [("../services/slab-leak-detection.html","Slab Leak Detection"), ("warm-spot-on-floor-slab-leak.html","Warm Spot On Floor?"), ("../guides/slab-leak-repair-cost.html","Slab Leak Repair Cost")]
)

article("hot-water-vs-cold-water-slab-leaks.html",
 "Hot Water vs. Cold Water Slab Leaks: What's The Difference? | Leak Detection Academy",
 "Why it matters whether a slab leak is on your hot or cold water line, and how each type typically presents.",
 "Leak detection fundamentals", "Hot water vs. cold water slab leaks",
 "Not all slab leaks behave the same way &mdash; and knowing which line is involved shapes both the symptoms and the diagnostic approach.",
 [("Hot water line leaks","These often create a noticeably warm spot on the floor above the leak, since the escaping hot water raises the temperature of the surrounding concrete and flooring. Thermal imaging is especially effective here."),
  ("Cold water line leaks","These typically don't produce a temperature signature, so they tend to be caught through water bill increases, meter movement, or the sound of running water rather than a warm spot."),
  ("Why the distinction affects diagnosis","Knowing which type of leak you likely have helps us decide which detection method to lead with &mdash; thermal imaging for hot water signatures, acoustic listening for either type.")],
 [("Which type of slab leak is more common?", "Both occur, though hot water line leaks are often noticed sooner because of the warm-spot symptom."),
  ("Can both a hot and cold line leak at the same time?", "It's uncommon but possible, especially in older homes with widespread pipe corrosion.")],
 [("what-is-a-slab-leak.html","What Is A Slab Leak?"), ("warm-spot-on-floor-slab-leak.html","Warm Spot On Floor?"), ("acoustic-leak-detection-explained.html","Acoustic Detection Explained")]
)

article("how-plumbers-find-leaks-without-cutting-walls.html",
 "How Do Plumbers Find Leaks Without Cutting Into Walls? | Leak Detection Academy",
 "An overview of the non-invasive technology used to locate hidden leaks before any wall or floor is opened.",
 "Leak detection fundamentals", "How do plumbers find leaks without cutting walls?",
 "It's a fair question &mdash; and the honest answer is a combination of listening equipment, thermal imaging, and process of elimination.",
 [("Acoustic listening equipment","Specialized microphones and amplifiers detect the specific sound of pressurized water escaping a pipe, even through drywall or concrete."),
  ("Thermal imaging cameras","These reveal temperature differences in walls and floors that often correspond to moisture or hot water leaks, invisible to the naked eye."),
  ("Pressure testing and isolation","Testing different sections of the plumbing system in isolation narrows down which line and zone is affected before any physical search even begins."),
  ("Why this combination works","No single method is perfect on its own, which is why combining them narrows the leak down to a small, specific, confirmable area.")],
 [],
 [("acoustic-leak-detection-explained.html","Acoustic Detection Explained"), ("../services/leak-detection.html","Our Leak Detection Process"), ("what-is-a-slab-leak.html","What Is A Slab Leak?")]
)

# ============================================================ SLAB LEAK EDUCATION
article("slab-leak-vs-foundation-crack.html",
 "Slab Leak vs. Foundation Crack: How To Tell The Difference | Leak Detection Academy",
 "Cracks in flooring or walls can be caused by a slab leak or by unrelated foundation settling. Here's how to tell which you're dealing with.",
 "Slab leak education", "Slab leak vs. foundation crack: what's the difference?",
 "Cracking in your home can have several causes, and figuring out which one applies changes what happens next.",
 [("Slab leak-related cracking","When a slab leak goes unaddressed, moisture can affect the soil beneath the foundation, occasionally contributing to cracking in flooring or nearby walls, usually alongside other leak symptoms like a warm spot or rising water bill."),
  ("Unrelated foundation settling","Many homes experience minor cracking over the decades simply from normal foundation settling, unrelated to any plumbing issue &mdash; this is far more common than leak-caused cracking."),
  ("How to tell which applies to you","If cracking appears alongside a warm spot, rising water bill, or sounds of running water, a leak is worth ruling out first. If it's isolated cracking with none of those other signs, a foundation specialist may be the better first call.")],
 [("Should I call a plumber or a foundation company first?", "If you're also noticing water-related symptoms, start with leak detection to rule that out, since it's often the faster, less invasive diagnostic step."),
  ("Can a slab leak actually damage my foundation?", "Prolonged, unaddressed leaks can affect soil conditions beneath a foundation over time, which is one more reason early detection matters.")],
 [("what-is-a-slab-leak.html","What Is A Slab Leak?"), ("warm-spot-on-floor-slab-leak.html","Warm Spot On Floor?"), ("preventing-slab-leaks.html","Can Slab Leaks Be Prevented?")]
)

article("multiple-slab-leaks-same-house.html",
 "Why Do Some Homes Get Multiple Slab Leaks Over Time? | Leak Detection Academy",
 "If your home has had more than one slab leak, here's why that happens and what it might mean for your long-term plumbing decisions.",
 "Slab leak education", "Why do some homes get multiple slab leaks over time?",
 "A second or third slab leak is a meaningfully different situation than a first one &mdash; and usually points to a systemic, not isolated, issue.",
 [("Aging copper doesn't fail all at once","Copper pipe corrosion tends to progress gradually throughout a system, meaning if one section has failed, other sections of similar age are often not far behind."),
  ("What repeat leaks usually indicate","A pattern of multiple leaks over a relatively short time span is one of the clearest signals that a reroute or whole-house repipe may be the more cost-effective long-term choice, rather than continuing with spot repairs."),
  ("How we approach a repeat-leak home","We look at the age, material, and condition of the whole system &mdash; not just the most recent leak &mdash; before recommending a path forward.")],
 [("How many slab leaks before repiping makes sense?", "There's no universal number, but two or more leaks within a few years is a common point where homeowners start seriously considering a repipe."),
  ("Does a repipe guarantee no future leaks?", "New PEX piping significantly reduces the risk profile compared to aging copper, though no plumbing system is entirely leak-proof forever.")],
 [("../services/pex-repiping.html","Whole-House PEX Repiping"), ("../guides/repair-vs-reroute-vs-repipe.html","Repair vs. Reroute vs. Repipe"), ("copper-vs-pex-pipes.html","Copper vs. PEX Pipes")]
)

article("slab-leaks-in-older-orange-county-homes.html",
 "Slab Leaks In Older Orange County Homes: What To Know | Leak Detection Academy",
 "Why homes built several decades ago in Orange County are more prone to slab leaks, and what owners of older homes should watch for.",
 "Slab leak education", "Slab leaks in older Orange County homes",
 "Many South Orange County neighborhoods were built between the 1960s and 1990s, putting a large share of local homes squarely in the age range where slab leaks become more common.",
 [("Why age matters so much","Copper pipe has a realistic service life, and homes approaching or exceeding 30-40 years old with original plumbing are statistically more likely to experience slab leaks than newer construction."),
  ("What to watch for as a home ages","Periodic attention to water bills, awareness of any warm floor spots, and a general sense of your home's plumbing history become more valuable the older a home gets."),
  ("Proactive options for older homes","Rather than waiting for a leak to force the decision, some owners of older homes choose to proactively schedule a repipe on their own timeline, avoiding the disruption of an emergency situation.")],
 [("How do I find out how old my home's plumbing is?", "Home inspection reports, prior repair records, or simply the home's original construction date are good starting points."),
  ("Is it worth repiping before a leak happens?", "For homes with aging original copper, some owners find it worthwhile to address it proactively rather than reactively &mdash; it's a personal and financial decision we're happy to walk through with you.")],
 [("multiple-slab-leaks-same-house.html","Multiple Slab Leaks Over Time"), ("../services/pex-repiping.html","Whole-House PEX Repiping"), ("../cities/laguna-niguel.html","Laguna Niguel Service Area")]
)

print("Batch 1 (fundamentals + slab leak education) complete.")
