\
# -*- coding: utf-8 -*-
"""
Straight Flush Plumbing & Leak Detection — site generator
Provides shared head/nav/footer/component templates so every new page
(services, guides, insurance, academy, cities) stays visually and
structurally consistent with the flagship homepage.
"""
import os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

PHONE_DISPLAY = "(949) 374-6524"
PHONE_TEL = "+19493746524"
EMAIL = "straightflushplumbing03@gmail.com"
ADDRESS = "78 Cameray Heights, Laguna Niguel, CA 92677"
GOOGLE_REVIEWS_URL = "https://share.google/WcJBYE3uu5FsppBTR"
YELP_REVIEWS_URL = "https://www.yelp.com/biz/straight-flush-plumbing-and-leak-detection-laguna-niguel-3"

def reviews_section(prefix):
    return f"""<section>
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Reputation</div>
      <h2>What Orange County homeowners say</h2>
      <p>Real feedback from Google and Yelp &mdash; not handpicked quotes on a page we control.</p>
    </div>
    <div class="review-grid reveal">
      <div class="review-card">
        <div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
        <p>Yelp reviewers consistently point to fair, transparent pricing and quality workmanship as reasons they'd call Lance and the team again.</p>
        <footer>&mdash; Paraphrased from Yelp reviews</footer>
      </div>
      <div class="review-card">
        <div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
        <p>Several reviewers describe a burst or hidden pipe being tracked down and resolved quickly, with the crew keeping the home usable throughout the repair.</p>
        <footer>&mdash; Paraphrased from Yelp reviews</footer>
      </div>
      <div class="review-note">
        <p><strong>73+ reviews and counting on Yelp,</strong> plus a growing list on Google. Read every review in full, unedited, straight from the source.</p>
        <div style="display:flex; gap:12px; flex-wrap:wrap;">
          <a href="{GOOGLE_REVIEWS_URL}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">Google Reviews &rarr;</a>
          <a href="{YELP_REVIEWS_URL}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">Yelp Reviews &rarr;</a>
        </div>
      </div>
    </div>
  </div>
</section>
"""

NAV_ITEMS = [
    ("services/index.html", "Services"),
    ("about.html", "About"),
    ("service-areas.html", "Service Areas"),
    ("academy/index.html", "Blog"),
    ("index.html#reviews", "Reviews"),
    ("contact.html", "Contact"),
]

def p(prefix, path):
    """Resolve a root-relative path against the page's folder depth prefix."""
    return prefix + path

def normalize_public_path(canonical):
    canonical = canonical.strip()
    if canonical in ("", "/"):
        return ""
    canonical = canonical.lstrip("/")
    if canonical.endswith("/"):
        return canonical
    if "." in canonical.rsplit("/", 1)[-1]:
        return canonical
    return canonical + ".html"

def head(title, description, canonical, prefix, schema=""):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="canonical" href="https://straightflushplumbingoc.com/{normalize_public_path(canonical)}">
<link rel="icon" href="{prefix}assets/img/logo.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://straightflushplumbingoc.com/{normalize_public_path(canonical)}">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="{prefix}assets/css/style.css">
{schema}</head>
<body>
"""

def nav(prefix):
    links = "\n".join(
        f'      <li><a href="{p(prefix,href)}">{label}</a></li>' for href, label in NAV_ITEMS
    )
    return f"""<header class="site-header">
  <nav class="nav">
    <a href="{p(prefix,'index.html')}" class="nav-brand">
      <img src="{p(prefix,'assets/img/logo.jpg')}" alt="Straight Flush Plumbing & Leak Detection logo">
      <span class="nav-brand-text">Straight Flush<span>Plumbing &amp; Leak Detection</span></span>
    </a>
    <ul class="nav-links">
{links}
    </ul>
    <div class="nav-cta">
      <a href="tel:{PHONE_TEL}" class="nav-phone">Call <strong>{PHONE_DISPLAY}</strong></a>
      <a href="{p(prefix,'contact.html')}" class="btn btn-primary btn-sm">Schedule Detection</a>
      <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">&#9776;</button>
    </div>
  </nav>
</header>
"""

def footer(prefix):
    return f"""<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid-5">
      <div>
        <img src="{p(prefix,'assets/img/logo.jpg')}" alt="Straight Flush Plumbing & Leak Detection logo" style="height:56px; margin-bottom:16px;">
        <p style="color:var(--muted-on-ink); font-size:0.92rem; max-width:30ch;">Family-owned and operated since 2019. Providing honest, reliable plumbing services to Laguna Niguel and surrounding areas.</p>
        <div class="footer-ratings">
          <div class="row"><span class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span> 5/5 on Google</div>
          <div class="row"><span class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span> 4.8/5 on Yelp</div>
        </div>
      </div>
      <div>
        <h4>Our Services</h4>
        <ul>
          <li><a href="{p(prefix,'services/leak-detection.html')}">Leak Detection</a></li>
          <li><a href="{p(prefix,'services/slab-leak-detection.html')}">Slab Leak Detection</a></li>
          <li><a href="{p(prefix,'services/pex-repiping.html')}">PEX Repiping</a></li>
          <li><a href="{p(prefix,'services/water-heater-services.html')}">Water Heater</a></li>
          <li><a href="{p(prefix,'services/drain-services.html')}">Drain Cleaning</a></li>
          <li><a href="{p(prefix,'services/plumbing-repair.html')}">Plumbing Repair</a></li>
          <li><a href="{p(prefix,'academy/index.html')}">Blog</a></li>
          <li><a href="{p(prefix,'guides/leak-detection-cost.html')}">Cost Guides</a></li>
          <li><a href="{p(prefix,'insurance/index.html')}">Insurance Resources</a></li>
        </ul>
      </div>
      <div>
        <h4>Contact Us</h4>
        <ul>
          <li><a href="tel:{PHONE_TEL}">{PHONE_DISPLAY}</a></li>
          <li><a href="mailto:{EMAIL}">{EMAIL}</a></li>
          <li>{ADDRESS}</li>
          <li>Mon&ndash;Fri 8am&ndash;7pm &middot; Sat 9am&ndash;6pm<br>Sun Closed &middot; 24/7 for emergencies</li>
        </ul>
      </div>
      <div>
        <h4>Cities We Serve</h4>
        <ul>
          <li><a href="{p(prefix,'cities/laguna-niguel.html')}">Laguna Niguel</a></li>
          <li><a href="{p(prefix,'cities/mission-viejo.html')}">Mission Viejo</a></li>
          <li><a href="{p(prefix,'cities/irvine.html')}">Irvine</a></li>
          <li><a href="{p(prefix,'cities/aliso-viejo.html')}">Aliso Viejo</a></li>
          <li><a href="{p(prefix,'cities/dana-point.html')}">Dana Point</a></li>
          <li><a href="{p(prefix,'cities/laguna-beach.html')}">Laguna Beach</a></li>
          <li><a href="{p(prefix,'cities/newport-beach.html')}">Newport Beach</a></li>
          <li><a href="{p(prefix,'cities/san-clemente.html')}">San Clemente</a></li>
          <li><a href="{p(prefix,'service-areas.html')}"><strong>All Service Areas</strong></a></li>
        </ul>
      </div>
      <div>
        <h4>Save Our Card</h4>
        <p style="color:var(--muted-on-ink); font-size:0.85rem; margin-bottom:14px;">Scan to save our digital business card to your phone.</p>
        <div class="footer-qr"><img src="{p(prefix,'assets/img/qr-code.png')}" alt="QR code to save Straight Flush Plumbing contact info"></div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; <span data-year></span> Straight Flush Plumbing &amp; Leak Detection. Always A Safe Bet.</span>
      <span><a href="{p(prefix,'privacy-policy.html')}" style="color:var(--muted-on-ink);">Privacy Policy</a> &middot; <a href="{p(prefix,'terms-of-service.html')}" style="color:var(--muted-on-ink);">Terms of Service</a></span>
    </div>
  </div>
</footer>
<script src="{p(prefix,'assets/js/main.js')}"></script>
</body>
</html>
"""

def breadcrumbs(prefix, trail):
    """trail: list of (label, href_or_None). Last item has href None (current page)."""
    parts = []
    for label, href in trail:
        if href:
            parts.append(f'<a href="{p(prefix,href)}">{label}</a>')
        else:
            parts.append(f'<span>{label}</span>')
    return '<div class="breadcrumbs">' + ' &rsaquo; '.join(parts) + '</div>'

def page_hero(prefix, trail, eyebrow, h1, sub, cta_label="Schedule Service", cta_href="contact.html"):
    return f"""<section class="hero" style="padding-bottom:90px;">
  <div class="wrap">
    {breadcrumbs(prefix, trail)}
    <div class="hero-eyebrow"><span class="dot"></span> {eyebrow}</div>
    <h1 style="max-width:22ch;">{h1}</h1>
    <p class="hero-sub">{sub}</p>
    <div class="hero-ctas"><a href="{p(prefix,cta_href)}" class="btn btn-primary">{cta_label}</a></div>
  </div>
</section>
"""

def cta_band(prefix, heading, sub, cta_label="Schedule Now", cta_href="contact.html", dark=False):
    bg = ' style="background:var(--ink);"' if dark else ''
    return f"""<section>
  <div class="wrap">
    <div class="cta-band reveal"{bg}>
      <div>
        <h2>{heading}</h2>
        <p>{sub}</p>
      </div>
      <a href="{p(prefix,cta_href)}" class="btn btn-primary">{cta_label}</a>
    </div>
  </div>
</section>
"""

def faq_section(prefix, eyebrow, heading, items):
    """items: list of (question, answer_html)"""
    blocks = []
    for q, a in items:
        blocks.append(f"""      <div class="faq-item">
        <button class="faq-q" aria-expanded="false">{q}<span class="plus">+</span></button>
        <div class="faq-a"><p>{a}</p></div>
      </div>""")
    body = "\n".join(blocks)
    return f"""<section class="section-sand">
  <div class="wrap">
    <div class="faq reveal">
      <div class="section-head" style="margin-bottom:30px;">
        <div class="eyebrow">{eyebrow}</div>
        <h2>{heading}</h2>
      </div>
{body}
    </div>
  </div>
</section>
"""

def write_page(rel_path, html):
    try:
        from icon_defs import apply_icons
        html = apply_icons(html)
    except ImportError:
        pass
    full = os.path.join(ROOT, rel_path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote", rel_path, len(html), "bytes")
