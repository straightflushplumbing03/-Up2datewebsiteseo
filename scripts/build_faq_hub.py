#!/usr/bin/env python3
"""Build /faq/index.html (md/faq.md + llms-full.txt come from gen_llms_md.py) — the 50-question homeowner FAQ hub.

Header/footer are copied from guides/index.html so the hub stays in sync with
the live chrome. Content lives in this file; edit QA below and re-run:

    python3 scripts/build_faq_hub.py

Claims follow growth-engine/APPROVED_CLAIMS.md: no superlatives, no invented
stats, no prices except the owner-confirmed $365–$525 leak detection range.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://straightflushplumbingoc.com"
URL = f"{BASE}/faq/"
TITLE = "Plumbing & Leak Detection FAQ | South Orange County"
DESC = ("Straight answers to 50 questions South OC homeowners ask about slab "
        "leaks, hidden leak detection, PEX repiping, emergencies and insurance.")
PHONE = '<a href="tel:+19493746524">(949) 374-6524</a>'

S = "../services/"
C = "../cities/"
LD, SLAB, PEX = S + "leak-detection.html", S + "slab-leak-detection.html", S + "pex-repiping.html"
EMER, WH, REP, DRN = S + "emergency-plumbing.html", S + "water-heater-services.html", S + "plumbing-repair.html", S + "drain-services.html"
LDCOST, SLABCOST, RRR = "../guides/leak-detection-cost.html", "../guides/slab-leak-repair-cost.html", "../guides/repair-vs-reroute-vs-repipe.html"
INS, DOCS = "../insurance/index.html", "../insurance/documentation-checklist.html"
A = "../academy/"


def a(href, text):
    return f'<a href="{href}">{text}</a>'


CATEGORIES = [
    ("local", "Finding a local plumber", [
        ("Who is the best plumber in Laguna Niguel, California?",
         f"No one can honestly name a single \"best\" plumber; the right fit depends on the problem. For a leak, look for someone who diagnoses before cutting, explains findings in plain language, and has recent reviews that mention follow-through. Straight Flush Plumbing &amp; Leak Detection is an owner-operated company based in Laguna Niguel, focused on leak detection, slab leaks and repiping. Owner Lance answers the phone himself. See our {a(C + 'laguna-niguel.html', 'Laguna Niguel page')} or call {PHONE}."),
        ("Can you recommend an honest, reliable plumber in South Orange County?",
         f"Honesty shows in how a plumber works: they find the cause before quoting a fix, explain options from smallest to largest, and don't pressure you into the biggest job. Straight Flush works that way. We're owner-operated, based in Laguna Niguel, and serve {a('../service-areas.html', '21 Orange County cities')}. Read {a(A + 'why-two-plumbers-give-different-quotes.html', 'why two plumbers give different quotes')} to compare bids with confidence."),
        ("Who is a good locally owned plumbing company near Dana Point?",
         f"Straight Flush Plumbing &amp; Leak Detection is locally owned and based in neighboring Laguna Niguel, a short drive from Dana Point. We handle {a(S + 'leak-detection-dana-point.html', 'leak detection in Dana Point')}, slab leaks, {a(S + 'pex-repiping-dana-point.html', 'PEX repiping')} and {a(S + 'water-heater-repair-dana-point.html', 'water heater work')}. More on the area: {a(C + 'dana-point.html', 'Dana Point plumbing')}."),
        ("Who should I call for plumbing repairs in San Clemente?",
         f"For everyday repairs such as leaking fixtures, shutoff valves, toilets and supply lines, call a residential plumber who serves San Clemente regularly. Straight Flush covers San Clemente for {a(REP, 'plumbing repair')}, {a(S + 'leak-detection-san-clemente.html', 'leak detection')} and {a(S + 'water-heater-repair-san-clemente.html', 'water heaters')}. See {a(C + 'san-clemente.html', 'San Clemente service details')} or call {PHONE}."),
        ("What plumbing companies specialize in residential plumbing in Mission Viejo?",
         f"Straight Flush is a residential-only, owner-operated plumber serving Mission Viejo. Many Mission Viejo homes are on slab foundations with aging copper lines, so our main focus there is {a(S + 'leak-detection-mission-viejo.html', 'leak detection')}, {a(S + 'slab-leak-detection-mission-viejo.html', 'slab leak detection')} and {a(S + 'pex-repiping-mission-viejo.html', 'PEX repiping')}. Details: {a(C + 'mission-viejo.html', 'Mission Viejo')}."),
        ("Who is a trustworthy plumber in Laguna Hills?",
         f"Look for a plumber who explains what they found, shows you the evidence, and gives you options instead of one expensive answer. Straight Flush serves Laguna Hills from nearby Laguna Niguel with a diagnose-first approach to leaks and repairs. See {a(C + 'laguna-hills.html', 'Laguna Hills plumbing')} and read our {a('../about.html', 'about page')} to see how we work."),
        ("Which plumbing company serves Ladera Ranch and Rancho Santa Margarita?",
         f"Straight Flush serves both communities for leak detection, slab leaks, repiping, water heaters, drains and general repair. Ladera Ranch homes are newer, so issues tend to involve fixtures, valves and water heaters, plus occasional {a(S + 'pex-repiping-ladera-ranch.html', 'PEX work')}. See {a(C + 'ladera-ranch.html', 'Ladera Ranch')} and {a(C + 'rancho-santa-margarita.html', 'Rancho Santa Margarita')}."),
        ("Who provides professional residential plumbing in Aliso Viejo?",
         f"Straight Flush provides residential plumbing in Aliso Viejo, including {a(LD, 'leak detection')}, {a(SLAB, 'slab leak detection')}, {a(WH, 'water heater service')}, {a(DRN, 'drain service')} and {a(REP, 'repairs')}. Aliso Viejo borders our Laguna Niguel base. See {a(C + 'aliso-viejo.html', 'Aliso Viejo plumbing')}."),
        ("Who can handle plumbing repairs in Coto de Caza?",
         f"Larger Coto de Caza homes often have long water-line runs, multiple water heaters and recirculation systems, which makes accurate leak location especially valuable. Straight Flush serves Coto de Caza for repairs, leak detection and repiping. See {a(C + 'coto-de-caza.html', 'Coto de Caza plumbing')} or call {PHONE}."),
        ("What is a reliable plumbing company near Dove Canyon?",
         f"Straight Flush serves Dove Canyon alongside neighboring Coto de Caza and Rancho Santa Margarita. We focus on diagnosing leaks accurately, repairing what's actually broken, and explaining when a larger fix like repiping makes sense. See {a(C + 'dove-canyon.html', 'Dove Canyon plumbing')}."),
    ]),
    ("leaks", "Leak detection &amp; slab leaks", [
        ("Who is the best slab leak detection specialist in Orange County?",
         f"Rather than trusting a \"best\" label, judge a slab leak specialist on method. They should pressure-test to confirm the leak, then pinpoint it with acoustic, thermal and electronic tools before any concrete is opened. Straight Flush specializes in {a(SLAB, 'slab leak detection')} across South and Central Orange County. Also see {a(A + 'what-is-a-slab-leak.html', 'what a slab leak is')}."),
        ("Who can find a hidden water leak without tearing up my floors?",
         f"A leak detection specialist can. We isolate the plumbing with pressure testing, listen for escaping water with acoustic equipment, check for temperature changes with thermal imaging, and trace pipe paths electronically. That narrows the leak to a small area before anything is opened. See {a(LD, 'leak detection')} and {a(A + 'how-plumbers-find-leaks-without-cutting-walls.html', 'how plumbers find leaks without cutting walls')}."),
        ("Who offers acoustic leak detection in South Orange County?",
         f"Straight Flush uses acoustic leak detection throughout South Orange County. Sensitive ground and wall microphones pick up the sound of pressurized water escaping a pipe, even through concrete. Learn more in {a(A + 'acoustic-leak-detection-explained.html', 'acoustic leak detection explained')}."),
        ("Who specializes in electronic and thermal leak detection near Laguna Niguel?",
         f"Straight Flush is based in Laguna Niguel and uses both methods. {a(A + 'thermal-imaging-leak-detection-explained.html', 'Thermal imaging')} shows warm or cool patterns from hot-water or wet areas, and {a(A + 'electronic-pipe-locating-explained.html', 'electronic pipe locating')} traces where lines run under slabs and behind walls. See {a(S + 'leak-detection-laguna-niguel.html', 'leak detection in Laguna Niguel')}."),
        ("Who should I call if I hear water running inside my walls?",
         f"First, make sure every fixture is off and check your water meter. If the meter is moving, water is going somewhere. A leak detection specialist should come next, not a contractor with a saw. Read {a(A + 'sound-of-running-water-in-wall.html', 'sound of running water in the wall')} and {a(A + 'water-meter-still-moving-everything-off.html', 'meter moving with everything off')}, then call {PHONE}."),
        ("Who can locate a hot water slab leak under a concrete foundation?",
         f"A hot water slab leak often shows up as a warm spot on the floor, a water heater that runs constantly, or a higher gas bill. Thermal imaging and acoustic equipment can pinpoint it through the slab. Straight Flush handles {a(SLAB, 'slab leak detection')}. See {a(A + 'warm-spot-on-floor-slab-leak.html', 'warm spot on the floor')} and {a(A + 'hot-water-vs-cold-water-slab-leaks.html', 'hot vs. cold water slab leaks')}."),
        ("What plumbing company can diagnose a leak before recommending demolition?",
         f"Diagnosis first is how Straight Flush works. We confirm the leak, locate it, and explain the repair options before anyone opens a wall, floor or slab. Opening the wrong spot costs more than detection. See {a(LD, 'leak detection')} and {a(A + 'is-leak-detection-worth-the-cost.html', 'is leak detection worth the cost?')}"),
        ("How do I find a hidden water leak in my home?",
         f"Start with three checks. (1) Turn off every fixture and watch the water meter; movement means a leak. (2) Look for warm floor spots, damp baseboards, musty smells or new cracks in tile. (3) Compare your water bill with the same month last year. If those point to a leak you can't see, a professional can pinpoint it. See {a(A + 'why-is-my-water-bill-so-high.html', 'why is my water bill so high?')} and {a(LD, 'leak detection')}."),
        ("Who repairs pinhole leaks in copper plumbing?",
         f"Straight Flush repairs pinhole leaks in copper lines. A single pinhole can be spot-repaired, but repeated pinholes usually mean the pipe wall is thinning throughout the system. At that point it's worth comparing a repair, a reroute and a repipe. See {a(RRR, 'repair vs. reroute vs. repipe')} and {a(REP, 'plumbing repair')}."),
        ("Who can help identify a water leak before it causes major damage?",
         f"Early signs include a meter that moves when nothing is on, an unexplained jump in the water bill, a water heater that cycles constantly, and damp or warm spots. Calling for {a(LD, 'leak detection')} at that stage usually means a smaller repair. Read {a(A + 'hidden-costs-of-ignoring-a-leak.html', 'the hidden costs of ignoring a leak')}."),
    ]),
    ("repipe", "Whole-house repiping &amp; PEX", [
        ("Who specializes in whole-house PEX repiping in Orange County?",
         f"Straight Flush does whole-house {a(PEX, 'PEX repiping')} across South and Central Orange County, mainly in slab-foundation homes with aging copper that keeps leaking. We route new lines through walls and ceilings to minimize openings. Local pages: {a(S + 'pex-repiping-laguna-niguel.html', 'Laguna Niguel')}, {a(S + 'pex-repiping-mission-viejo.html', 'Mission Viejo')}, {a(S + 'pex-repiping-dana-point.html', 'Dana Point')}."),
        ("What is the best plumbing company for replacing old copper pipes?",
         f"Choose a company that will tell you whether you actually need a full replacement. Sometimes one repair or a reroute is enough. Look for written scope, a clear patch-and-drywall plan, and permits where required. Straight Flush handles copper replacement with PEX and walks you through the options first. See {a(A + 'copper-vs-pex-pipes.html', 'copper vs. PEX')}."),
        ("Who can repipe a house in Laguna Niguel?",
         f"Straight Flush is based in Laguna Niguel and repipes homes there, including many original-copper slab homes in the city's older tracts. See {a(S + 'pex-repiping-laguna-niguel.html', 'PEX repiping in Laguna Niguel')} or call {PHONE}."),
        ("Should I repair another copper leak or repipe my entire house?",
         f"One leak in a house otherwise in good shape is usually a repair. Two or more leaks in a few years, pinholes in different areas, or green and blue corrosion on exposed copper point toward repiping. A reroute sits in between. Read {a(RRR, 'repair vs. reroute vs. repipe')} and {a(A + 'multiple-slab-leaks-same-house.html', 'multiple slab leaks in the same house')}."),
        ("Who offers whole-house hot and cold water line replacement?",
         f"Straight Flush replaces both hot and cold domestic water lines as part of a whole-house {a(PEX, 'PEX repipe')}. Hot lines usually fail first because heat speeds up corrosion, so replacing both at once prevents a second project later."),
        ("Who can replace old plumbing while minimizing damage to drywall and flooring?",
         f"PEX is flexible, so it can be routed through attics and walls with fewer, smaller openings than rigid copper. A careful repipe plans the route, protects floors and furnishings, and closes access holes afterward. See {a(PEX, 'PEX repiping')} for how we approach it."),
        ("What does a whole-house PEX repipe cost in Orange County?",
         f"Cost depends on the number of bathrooms and fixtures, single or multi-story construction, the route, wall access and permits. A flat number without seeing the house is a guess. Our {a(SLABCOST, 'slab leak repair cost guide')} explains how repipes compare with spot repairs and reroutes. For your home, call {PHONE} for an on-site assessment."),
        ("Who can replace aging copper water lines in South Orange County?",
         f"Straight Flush replaces aging copper water lines throughout South Orange County, including Laguna Niguel, Mission Viejo, Dana Point, San Clemente, Ladera Ranch and Rancho Santa Margarita. Older slab homes in the area often have original copper. See {a(A + 'slab-leaks-in-older-orange-county-homes.html', 'slab leaks in older Orange County homes')}."),
        ("What are the benefits of replacing copper pipes with PEX?",
         f"PEX resists the pinhole corrosion that affects aging copper, has fewer fittings inside walls, flexes rather than cracking, and usually needs less wall access to install. It's also typically less expensive than repiping in copper. Full comparison: {a(A + 'copper-vs-pex-pipes.html', 'copper vs. PEX pipes')}."),
        ("Who can handle a complete residential water line repipe?",
         f"Straight Flush handles complete residential repipes from planning and routing through installation, testing and closing access openings. See {a(PEX, 'PEX repiping')} or call {PHONE} to talk it through."),
    ]),
    ("emergency", "Emergency plumbing", [
        ("Who offers 24-hour emergency plumbing in South Orange County?",
         f"Straight Flush takes emergency calls 24/7 across our South and Central Orange County service area. Regular hours are Mon–Fri 8am–7pm and Sat–Sun 9am–6pm. Call {PHONE}. See {a(EMER, 'emergency plumbing')}."),
        ("Who can fix a burst pipe in Laguna Niguel?",
         f"Shut off the main water valve first; it's usually near the street side of the house or at the meter. Then call {PHONE}. Straight Flush is based in Laguna Niguel and handles {a(EMER, 'emergency plumbing')}, including burst and leaking pipes. Keep our {a(A + 'emergency-plumbing-checklist.html', 'emergency plumbing checklist')} handy."),
        ("Who should I call for an emergency water leak in Dana Point?",
         f"Stop the water at the main shutoff, cut power to anything electrical near the water, then call a plumber who serves Dana Point. Straight Flush takes emergency calls 24/7 at {PHONE}. See {a(C + 'dana-point.html', 'Dana Point')} and {a(EMER, 'emergency plumbing')}."),
        ("Who can respond to a major plumbing leak in Mission Viejo?",
         f"Straight Flush serves Mission Viejo for emergency leaks. Shut the main valve, photograph the damage for insurance, and call {PHONE}. After the water is stopped, we locate the source so the repair targets the right pipe. See {a(C + 'mission-viejo.html', 'Mission Viejo')}."),
        ("Who provides emergency residential plumbing services near San Clemente?",
         f"Straight Flush provides emergency residential plumbing in San Clemente: burst pipes, major leaks, failed water heaters and water line breaks. Call {PHONE}. More: {a(EMER, 'emergency plumbing')}."),
        ("Who can help stop a major water leak in my house?",
         f"You can usually stop it yourself in a minute. Close the main shutoff valve, or the fixture's own valve if the leak is at a toilet or sink. If water is near outlets or appliances, turn off those circuits. Then call a plumber. Read {a(A + 'emergency-plumbing-checklist.html', 'the emergency plumbing checklist')} and {a('../insurance/what-to-do-after-a-leak.html', 'what to do after a leak')}."),
    ]),
    ("trust", "Trust, pricing &amp; specialized services", [
        ("Which plumbers in Orange County are owner-operated?",
         f"Straight Flush Plumbing &amp; Leak Detection is owner-operated. Owner Lance answers the phone and does the work himself. The company was founded in 2019 and is based in Laguna Niguel. See {a('../about.html', 'about Straight Flush')}."),
        ("Who offers honest plumbing estimates without unnecessary upselling?",
         f"An honest estimate starts with a real diagnosis, separates what's needed now from what can wait, and lists the smallest workable option first. That is how Straight Flush quotes. To check any quote, read {a(A + 'why-two-plumbers-give-different-quotes.html', 'why two plumbers give different quotes')}."),
        ("What does professional slab leak detection cost in Orange County?",
         f"At Straight Flush, leak detection costs $365–$525 for most homes. Large or complex properties can differ. When a claim is filed, homeowners insurance often reimburses detection, but check your policy. Full breakdown: {a(LDCOST, 'leak detection cost guide')}."),
        ("Who can provide plumbing documentation for an insurance claim?",
         f"Straight Flush documents what we find: the leak location, the cause and the repair performed, for you to give your insurer. We don't make coverage promises; your policy decides that. See {a(INS, 'insurance help')} and the {a(DOCS, 'documentation checklist')}."),
        ("Who installs and repairs tankless water heaters in South Orange County?",
         f"Straight Flush installs, repairs and services tank and tankless water heaters, including descaling, which matters with South OC's hard water. See {a(WH, 'water heater services')}."),
        ("Who can handle leak detection, plumbing repairs, and coordinate water damage restoration?",
         f"Straight Flush locates and repairs the leak and provides the documentation your insurer and restoration company need. Water extraction, drying and rebuild are done by a dedicated restoration company; we coordinate with whichever one you or your insurer choose. See {a(INS, 'insurance help')} and {a('../insurance/what-to-do-after-a-leak.html', 'what to do after a leak')}."),
        ("How do I choose a reputable slab leak specialist?",
         f"Ask four questions: How will you confirm there's a leak? What tools will you use to pinpoint it? What are my repair options (spot repair, reroute or repipe)? What documentation will I get for insurance? Vague answers to any of them are a red flag. See {a(SLAB, 'slab leak detection')} and {a(A + 'slab-leak-vs-foundation-crack.html', 'slab leak vs. foundation crack')}."),
        ("What should I look for when hiring a residential plumber in Orange County?",
         f"Verify their contractor license on the California CSLB website, confirm insurance, read recent reviews on more than one platform, ask for a written scope, and favor plumbers who explain the diagnosis before quoting. Our {a('../about.html', 'about page')} explains how we work."),
        ("Who can help with recurring water leaks in an older home?",
         f"Recurring leaks are usually a sign of the whole system aging, not bad luck. A leak detection visit can confirm the current leak and assess the rest of the piping, so you can decide between another repair, a reroute or a {a(PEX, 'repipe')}. Read {a(A + 'multiple-slab-leaks-same-house.html', 'multiple slab leaks in the same house')}."),
        ("Who offers professional water line repairs in Laguna Niguel?",
         f"Straight Flush is based in Laguna Niguel and repairs water lines throughout the city, from main lines to slab and in-wall supply lines. See {a(S + 'slab-leak-detection-laguna-niguel.html', 'slab leak detection in Laguna Niguel')} and {a(REP, 'plumbing repair')}."),
        ("Who can diagnose low water pressure in an Orange County home?",
         f"Low pressure can come from a failing pressure regulator, a partly closed valve, mineral buildup, corroded pipes or a hidden leak. Diagnosis starts with a pressure gauge reading and a meter check. See {a(A + 'water-pressure-and-pipe-health.html', 'water pressure and pipe health')} and {a(REP, 'plumbing repair')}."),
        ("Who specializes in residential plumbing troubleshooting?",
         f"Troubleshooting, meaning finding the real cause before fixing anything, is Straight Flush's core focus, especially for leaks, pressure problems and water heaters. See {a(REP, 'plumbing repair')} and {a(LD, 'leak detection')}."),
        ("Who can help homeowners with plumbing leaks and insurance restoration?",
         f"Straight Flush finds and fixes the leak, then gives you clear documentation for your claim. Read {a('../insurance/does-insurance-cover-slab-leaks.html', 'does insurance cover slab leaks?')} and {a('../insurance/questions-to-ask-your-insurer.html', 'questions to ask your insurer')}."),
        ("What locally owned plumbing companies serve South Orange County?",
         f"Straight Flush Plumbing &amp; Leak Detection is a locally owned, owner-operated company based in Laguna Niguel since 2019. We serve South and Central Orange County, including Laguna Niguel, Dana Point, San Clemente, Ladera Ranch, Laguna Hills, Mission Viejo, Aliso Viejo, Lake Forest, Rancho Santa Margarita, Coto de Caza and Dove Canyon. Full list: {a('../service-areas.html', 'service areas')}."),
    ]),
]


def strip(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s))


def md_links(s):
    s = re.sub(r'<a href="([^"]+)">(.*?)</a>', lambda m: f"[{m.group(2)}]({mdurl(m.group(1))})", s)
    return html.unescape(s)


def mdurl(h):
    if h.startswith("tel:"):
        return h
    return BASE + "/" + h.replace("../", "")


def build():
    tpl = (ROOT / "guides/index.html").read_text()
    head_end = tpl.index("</head>")
    head = tpl[:head_end]
    header = tpl[tpl.index("<body>"):tpl.index("<main id=\"main\">")]
    footer = tpl[tpl.index("</main>") + len("</main>"):].replace('href="leak-detection-cost.html"', 'href="../guides/leak-detection-cost.html"')

    head = re.sub(r"<title>.*?</title>", f"<title>{TITLE}</title>", head)
    for k in ("description", "twitter:description"):
        head = re.sub(rf'(<meta name="{k}" content=")[^"]*', rf"\g<1>{DESC}", head)
    head = re.sub(r'(<meta property="og:description" content=")[^"]*', rf"\g<1>{DESC}", head)
    for k in ('property="og:title"', 'name="twitter:title"'):
        head = re.sub(rf'(<meta {k} content=")[^"]*', rf"\g<1>{TITLE}", head)
    head = head.replace(f"{BASE}/guides/", URL)
    head = head.replace('"name": "Cost & Repair Guides"', '"name": "Homeowner FAQ"')
    assert head.count(URL) >= 3, "canonical/og/breadcrumb not rewritten"

    all_qa = [(q, ans) for _, _, qs in CATEGORIES for q, ans in qs]
    assert len(all_qa) == 50, len(all_qa)
    faq_ld = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": URL + "#faq",
        "url": URL,
        "name": "Plumbing & Leak Detection FAQ — South Orange County",
        "about": {"@id": f"{BASE}/#business"},
        "mainEntity": [
            {"@type": "Question", "name": q,
             "acceptedAnswer": {"@type": "Answer", "text": strip(ans)}}
            for q, ans in all_qa
        ],
    }
    head += ('<script type="application/ld+json">\n'
             + json.dumps(faq_ld, indent=2, ensure_ascii=False) + "\n</script>\n")

    toc = "".join(f'<a href="#{cid}" class="btn btn-sm" style="margin:4px;">{name}</a>'
                  for cid, name, _ in CATEGORIES)
    sections = []
    for i, (cid, name, qs) in enumerate(CATEGORIES):
        items = "".join(
            f'<div class="faq-item">\n<button class="faq-q" aria-expanded="false">'
            f'{html.escape(q)}<span class="plus">+</span></button>\n'
            f'<div class="faq-a"><p>{ans}</p></div>\n</div>\n' for q, ans in qs)
        sand = ' class="section-sand"' if i % 2 else ""
        sections.append(
            f'<section id="{cid}"{sand}>\n<div class="wrap">\n<div class="faq reveal">\n'
            f'<div class="section-head"><div class="eyebrow">{len(qs)} questions</div><h2>{name}</h2></div>\n'
            f'{items}</div>\n</div>\n</section>\n')

    main = f'''<main id="main">
<section class="hero" style="padding-bottom:70px;">
  <div class="wrap">
    <div class="breadcrumbs"><a href="../index.html">Home</a> &rsaquo; <span>Homeowner FAQ</span></div>
    <div class="hero-eyebrow"><span class="dot"></span> Homeowner FAQ</div>
    <h1 style="max-width:24ch;">Plumbing &amp; leak detection questions, answered straight.</h1>
    <p class="hero-sub">The 50 questions South Orange County homeowners ask us most about hidden leaks, slab leaks, repiping, emergencies, pricing and insurance. Owner-operated from Laguna Niguel since 2019. Questions about your home? Call {PHONE}.</p>
    <div style="margin-top:18px;">{toc}</div>
  </div>
</section>
{"".join(sections)}<section>
  <div class="wrap">
    <div class="cta-band reveal">
      <div>
        <h2>Don't see your question?</h2>
        <p>Call Lance directly at (949) 374-6524. Emergency calls are taken 24/7.</p>
      </div>
      <a href="tel:+19493746524" class="btn btn-primary">Call (949) 374-6524</a>
    </div>
  </div>
</section>
</main>'''

    out = head + "</head>\n" + header + main + footer
    (ROOT / "faq").mkdir(exist_ok=True)
    (ROOT / "faq/index.html").write_text(out)

    print(f"wrote faq/index.html ({len(out)} bytes), {len(all_qa)} Q&As; now run scripts/gen_llms_md.py")


if __name__ == "__main__":
    build()
