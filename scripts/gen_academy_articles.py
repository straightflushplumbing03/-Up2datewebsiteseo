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
    html += page_hero(PREFIX,
        [("Home","index.html"),("Leak Detection Academy","academy/index.html"),(h1[:28]+("..." if len(h1)>28 else ""), None)],
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

# ---------------------------------------------------------------------------
article(
    "why-is-my-water-bill-so-high.html",
    "Why Is My Water Bill So High All Of A Sudden? | Leak Detection Academy",
    "A sudden spike in your water bill is one of the most common signs of a hidden leak. Here's how to think through the possible causes.",
    "Water leak symptoms",
    "Why is my water bill so high all of a sudden?",
    "A water bill that jumps without an obvious explanation is one of the clearest early signs of a hidden leak &mdash; and one of the easiest to dismiss as a fluke.",
    [
        ("Start with the water meter", "Turn off every fixture and appliance that uses water in your home, then check your water meter. If it's still moving, water is flowing somewhere in your system even though nothing should be running &mdash; a strong indicator of a leak."),
        ("Rule out the obvious first", "Before assuming a hidden leak, check for a running toilet (the most common household water waster), a dripping outdoor spigot, or an irrigation system left on longer than intended."),
        ("Compare your usage history", "Most water utilities let you view several months of usage online. A sudden, sustained jump &mdash; not a one-time spike &mdash; is more consistent with an ongoing leak than a fluke reading."),
        ("When it points to a slab or hidden leak", "If your meter keeps moving with everything off and you've ruled out the obvious culprits, the next step is professional leak detection to find the exact source before it causes further damage."),
    ],
    [
        ("Can a running toilet really explain a big bill increase?", "Yes &mdash; a continuously running toilet can waste hundreds of gallons a day, which adds up quickly and is often mistaken for a more serious leak."),
        ("How much of a bill increase is worth investigating?", "Any sustained, unexplained increase is worth a look, especially if it coincides with other signs like a warm floor spot or the sound of running water."),
    ],
    [("water-meter-still-moving-everything-off.html","Water Meter Still Moving? Here's Why"),
     ("../services/leak-detection.html","Our Leak Detection Process"),
     ("../guides/leak-detection-cost.html","What Detection Costs")]
)

# ---------------------------------------------------------------------------
article(
    "water-meter-still-moving-everything-off.html",
    "Water Meter Still Moving With Everything Off? Here's Why | Leak Detection Academy",
    "If your water meter keeps spinning even with every fixture off, here's what that means and what to check next.",
    "Water leak symptoms",
    "Water meter still moving with everything off?",
    "This is one of the most reliable DIY tests for a hidden leak &mdash; and if you've already run it, you're closer to an answer than you think.",
    [
        ("How to run the test correctly", "Turn off every fixture, appliance, irrigation zone, and pool fill valve. Note your meter reading, wait 20&ndash;30 minutes without using any water, then check it again."),
        ("What movement tells you", "Any change in the reading during that window means water is passing through the meter somewhere in your system &mdash; whether that's a running toilet, an irrigation leak, or a hidden pipe leak."),
        ("Narrowing down where", "If you can isolate your irrigation system and toilets and the meter still moves, the leak is most likely in a supply line &mdash; which is where professional acoustic or electronic detection becomes valuable."),
    ],
    [
        ("Could this be a meter malfunction instead of a leak?", "It's possible but uncommon. A slow, steady movement is far more often a real leak than a faulty meter."),
        ("How urgent is it once I confirm the meter is moving?", "Reasonably urgent &mdash; ongoing leaks can cause water damage and cost you money the longer they run undetected."),
    ],
    [("why-is-my-water-bill-so-high.html","Why Is My Water Bill So High?"),
     ("sound-of-running-water-in-wall.html","Hearing Water In A Wall?"),
     ("../services/leak-detection.html","Our Leak Detection Process")]
)

# ---------------------------------------------------------------------------
article(
    "warm-spot-on-floor-slab-leak.html",
    "Warm Spot On Your Floor? What It Usually Means | Leak Detection Academy",
    "A warm or hot spot on your floor is a classic sign of a hot water slab leak. Here's why it happens and what to do next.",
    "Slab leak education",
    "Warm spot on your floor? What it usually means.",
    "A patch of flooring that feels noticeably warmer than the rest of the house &mdash; especially near a hallway or bathroom &mdash; is one of the most recognizable slab leak signs.",
    [
        ("Why hot water lines cause this", "When a hot water line running beneath your slab develops a leak, the escaping hot water warms the surrounding concrete and flooring above it, creating a noticeably warm patch that has nothing to do with sunlight or heating vents."),
        ("Why it can be misleading at first", "Some homeowners assume it's a heating duct or in-floor heating quirk. The giveaway is that true slab leak warmth tends to be localized, persistent, and not tied to your HVAC system's schedule."),
        ("What tends to follow if it's ignored", "Left unaddressed, the moisture can migrate, potentially causing flooring damage, mold risk, and a larger repair down the line than if it's caught early."),
        ("How it gets confirmed", "Thermal imaging can visually confirm the warm zone's shape and boundaries, while acoustic detection pinpoints the exact leak location before any flooring is disturbed."),
    ],
    [
        ("Is a warm floor spot always a slab leak?", "Not always, but it's one of the more specific signs. In-floor radiant heating and certain sunlight patterns can occasionally mimic it, which is why professional confirmation matters."),
        ("Does a warm spot mean the leak is directly underneath it?", "Usually close to it, though heat and moisture can spread somewhat before surfacing &mdash; which is exactly why acoustic pinpointing is used rather than guessing based on the warm area alone."),
    ],
    [("how-long-does-slab-leak-repair-take.html","How Long Does Repair Take?"),
     ("../services/slab-leak-detection.html","Slab Leak Detection"),
     ("../guides/slab-leak-repair-cost.html","Slab Leak Repair Cost")]
)

# ---------------------------------------------------------------------------
article(
    "sound-of-running-water-in-wall.html",
    "Hearing Running Water In A Wall With Nothing On? | Leak Detection Academy",
    "A faint hissing or trickling sound behind a wall with everything off is one of the more unsettling leak symptoms. Here's what's likely happening.",
    "Water leak symptoms",
    "Hearing running water in a wall with nothing on?",
    "This is one of the symptoms homeowners are most tempted to dismiss &mdash; until it doesn't go away.",
    [
        ("What that sound usually is", "A consistent hiss, trickle, or faint rushing sound behind a wall, with no fixtures running, is typically pressurized water escaping from a small crack or joint failure in a supply line."),
        ("Why it's easy to second-guess", "The sound can be faint, intermittent, or easily confused with normal house settling or plumbing 'water hammer.' The key difference is that a leak sound tends to be continuous and unrelated to any fixture use."),
        ("Why professional listening equipment matters here", "Our ears are decent at noticing something is off, but not at pinpointing exactly where in a wall cavity the sound is loudest. Acoustic equipment isolates the precise source, avoiding unnecessary drywall removal."),
    ],
    [
        ("Could this just be normal pipe noise?", "Normal pipes can tick or pop briefly with temperature changes, but a sustained hiss or trickle with nothing running is a different pattern worth investigating."),
        ("How quickly should I act on this?", "Reasonably quickly &mdash; a wall leak left running can lead to structural and mold issues well before it becomes visible."),
    ],
    [("water-meter-still-moving-everything-off.html","Water Meter Still Moving?"),
     ("../services/leak-detection.html","Our Leak Detection Process"),
     ("acoustic-leak-detection-explained.html","How Acoustic Detection Works")]
)

# ---------------------------------------------------------------------------
article(
    "copper-vs-pex-pipes.html",
    "Copper vs. PEX Pipes: What Homeowners Should Know | Leak Detection Academy",
    "A clear, unbiased comparison of copper and PEX piping for homeowners considering a repipe.",
    "Technology education",
    "Copper vs. PEX pipes: what homeowners should know",
    "If you're facing a repipe decision, understanding the real differences between these two materials helps you ask better questions &mdash; not just take our word for it.",
    [
        ("Copper: the traditional standard", "Copper has been the standard for decades thanks to its durability and heat tolerance. Its main long-term vulnerability is corrosion, especially in areas with certain water chemistry, which is the leading cause of slab leaks in older homes."),
        ("PEX: the modern alternative", "PEX (cross-linked polyethylene) doesn't corrode the way copper does, flexes to route around obstacles with fewer joints, and has become the standard in new residential construction."),
        ("Where copper still has an edge", "Copper has a long, proven track record, natural resistance to UV and rodents in exposed applications, and some homeowners simply prefer it for that reason."),
        ("What actually matters for your decision", "Your home's specific leak history, the age and condition of your current pipes, and your long-term plans for the property all matter more than a generic 'which is better' debate."),
    ],
    [
        ("Does PEX affect water taste or quality?", "Modern PEX is certified for potable water and doesn't meaningfully affect taste for most homeowners."),
        ("Can you mix copper and PEX in the same system?", "Yes, this is common in reroutes and partial repipes, using approved transition fittings between the two materials."),
    ],
    [("../services/pex-repiping.html","Whole-House PEX Repiping"),
     ("../guides/repair-vs-reroute-vs-repipe.html","Repair vs. Reroute vs. Repipe"),
     ("../services/slab-leak-detection.html","Slab Leak Detection")]
)

# ---------------------------------------------------------------------------
article(
    "how-long-does-slab-leak-repair-take.html",
    "How Long Does Slab Leak Repair Actually Take? | Leak Detection Academy",
    "A realistic timeline for slab leak detection and repair, from first call to finished repair.",
    "Slab leak education",
    "How long does slab leak repair actually take?",
    "Timelines vary, but here's a realistic breakdown of what to expect at each stage.",
    [
        ("Detection visit", "Most leak detection visits take one to a few hours, depending on home size and how quickly the source is isolated."),
        ("Findings & decision", "Once the leak is found, we walk through your options on the spot &mdash; repair, reroute, or repipe &mdash; so you're not left waiting for a follow-up call."),
        ("Spot repair timeline", "A straightforward spot repair, once access is confirmed, is often completed within the same day or the next, depending on flooring type and material availability."),
        ("Reroute or repipe timeline", "A reroute typically takes one to two days; a whole-house repipe is usually completed within a few days, with water restored at the end of each working day whenever possible."),
    ],
    [
        ("Can I stay in my home during a repipe?", "In most cases, yes. We work to minimize disruption and keep water access restored overnight during multi-day projects."),
        ("What could extend the timeline?", "Limited access, the need for specialty flooring repair afterward, or discovering additional issues once work begins."),
    ],
    [("../services/slab-leak-detection.html","Slab Leak Detection"),
     ("../guides/slab-leak-repair-cost.html","Slab Leak Repair Cost"),
     ("../guides/repair-vs-reroute-vs-repipe.html","Repair vs. Reroute vs. Repipe")]
)

# ---------------------------------------------------------------------------
article(
    "acoustic-leak-detection-explained.html",
    "Acoustic Leak Detection Explained In Plain English | Leak Detection Academy",
    "How acoustic leak detection actually works, explained without the jargon.",
    "Technology education",
    "Acoustic leak detection, explained in plain English",
    "It's the technology behind most non-invasive slab leak detection &mdash; here's how it actually works.",
    [
        ("The basic idea", "Water escaping a pressurized pipe makes a distinct sound &mdash; often a hiss or rushing noise &mdash; that travels through pipes, soil, and concrete. Sensitive acoustic equipment is built to isolate that specific sound from background noise."),
        ("How we use it in the field", "We listen at multiple points across the suspected area, comparing sound intensity to triangulate the loudest, most consistent point &mdash; which is typically the leak itself."),
        ("Why it beats guessing", "Without acoustic equipment, finding a slab leak means opening up concrete based on educated guesses. With it, we can often narrow the access point to a very small, specific area."),
        ("Its limits", "Acoustic detection works best with adequate water pressure and is sometimes combined with thermal imaging for hot water leaks, or electronic locating for tracing a pipe's exact path."),
    ],
    [
        ("Does acoustic detection work on all pipe types?", "It works on most common residential pipe materials, though sound transmission can vary slightly depending on pipe material and burial depth."),
        ("Is the equipment loud or disruptive to use?", "No &mdash; it's a listening tool, not a machine that generates noise. The process is quiet and non-invasive."),
    ],
    [("../services/leak-detection.html","Our Leak Detection Process"),
     ("../services/slab-leak-detection.html","Slab Leak Detection"),
     ("sound-of-running-water-in-wall.html","Hearing Water In A Wall?")]
)

# ---------------------------------------------------------------------------
article(
    "preventing-slab-leaks.html",
    "Can Slab Leaks Be Prevented? What Actually Helps | Leak Detection Academy",
    "Practical, realistic steps that can reduce the risk of a slab leak — and an honest look at what's outside your control.",
    "Prevention & maintenance",
    "Can slab leaks be prevented? What actually helps",
    "There's no way to guarantee a slab leak never happens, but a few habits meaningfully reduce your risk.",
    [
        ("Monitor your water pressure", "Consistently high water pressure (above roughly 80 psi) puts extra stress on pipes and joints over time. A pressure regulator, checked periodically, helps keep pressure in a safe range."),
        ("Watch your water quality", "Highly acidic or mineral-heavy water can accelerate pipe corrosion over the years. A water treatment system can help in areas where this is a known issue."),
        ("Pay attention to your water bill", "Reviewing your bill for unexplained changes is a free, ongoing early-warning system that costs nothing but a few minutes a month."),
        ("Know your home's plumbing age", "If your home has original copper plumbing from several decades ago, proactively discussing a repipe timeline &mdash; before a leak forces the decision &mdash; can save money and stress."),
        ("Don't ignore small signs", "Small warm spots, faint sounds, or minor pressure changes are easier and cheaper to address early than after they've caused visible damage."),
    ],
    [
        ("Is there a way to fully prevent slab leaks?", "Not entirely &mdash; some causes, like soil shifting, are outside anyone's control. But the steps above meaningfully reduce risk and catch problems earlier."),
        ("How often should I have my plumbing checked?", "For older homes, a periodic plumbing check-up every few years is a reasonable, low-cost habit."),
    ],
    [("copper-vs-pex-pipes.html","Copper vs. PEX Pipes"),
     ("../services/slab-leak-detection.html","Slab Leak Detection"),
     ("../services/pex-repiping.html","Whole-House PEX Repiping")]
)

print("All 8 academy articles generated.")
