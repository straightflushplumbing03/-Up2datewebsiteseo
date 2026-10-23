#!/usr/bin/env python3
"""Generate AI-readable Markdown mirrors of the important public HTML pages.

Stdlib only (no bs4/markdownify) so it runs anywhere with python3 and needs no
build step -- consistent with this repo. Output: /md/**.md plus /llms-full.txt.

The HTML pages remain canonical. Each Markdown file carries its canonical URL
and a note that it is a machine-readable mirror.
"""
import html as _html
import os
import posixpath
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOMAIN = "https://straightflushplumbingoc.com"

# Pages to mirror: (source_html, output_slug, section_label)
PAGES = [
    ("index.html", "index.md", "Homepage"),
    ("about.html", "about.md", "Company"),
    ("about/straight-flush-plumbing-orange-county.html", "about/straight-flush-plumbing-orange-county.md", "Company"),
    ("contact.html", "contact.md", "Company"),
    ("service-areas.html", "service-areas.md", "Service areas"),
    ("services/index.html", "services/index.md", "Services"),
    ("services/leak-detection.html", "services/leak-detection.md", "Services"),
    ("services/slab-leak-detection.html", "services/slab-leak-detection.md", "Services"),
    ("services/plumbing-repair.html", "services/plumbing-repair.md", "Services"),
    ("services/pex-repiping.html", "services/pex-repiping.md", "Services"),
    ("services/water-heater-services.html", "services/water-heater-services.md", "Services"),
    ("services/water-heater-repair-laguna-niguel.html", "services/water-heater-repair-laguna-niguel.md", "Services"),
    ("services/water-heater-repair-dana-point.html", "services/water-heater-repair-dana-point.md", "Services"),
    ("services/water-heater-repair-san-clemente.html", "services/water-heater-repair-san-clemente.md", "Services"),
    ("services/drain-services.html", "services/drain-services.md", "Services"),
    ("services/emergency-plumbing.html", "services/emergency-plumbing.md", "Services"),
    ("south-oc-slab-leak-specialist.html", "south-oc-slab-leak-specialist.md", "Specialty"),
    ("plumbing-health-score.html", "plumbing-health-score.md", "Tools"),
    ("insurance/index.html", "insurance/index.md", "Insurance"),
    ("academy/index.html", "academy/index.md", "Academy"),
    ("cities/laguna-niguel.html", "cities/laguna-niguel.md", "Service areas"),
    ("cities/dana-point.html", "cities/dana-point.md", "Service areas"),
    ("cities/san-clemente.html", "cities/san-clemente.md", "Service areas"),
    ("cities/ladera-ranch.html", "cities/ladera-ranch.md", "Service areas"),
    ("cities/laguna-hills.html", "cities/laguna-hills.md", "Service areas"),
]

BLOCK_DROP = re.compile(
    r"<(script|style|noscript|svg|template|iframe)\b[^>]*>.*?</\1>",
    re.I | re.S,
)


def _strip_blocks(h: str) -> str:
    return BLOCK_DROP.sub("", h)


def extract_head(h: str):
    title = re.search(r"<title[^>]*>(.*?)</title>", h, re.I | re.S)
    desc = re.search(r'<meta[^>]+name=["\']description["\'][^>]*content=["\'](.*?)["\']', h, re.I | re.S)
    canon = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]*href=["\'](.*?)["\']', h, re.I | re.S)
    return (
        _html.unescape(title.group(1).strip()) if title else "",
        _html.unescape(desc.group(1).strip()) if desc else "",
        canon.group(1).strip() if canon else "",
    )


def extract_body(h: str) -> str:
    # Prefer <main>, else the region between </header> and <footer>.
    m = re.search(r"<main\b[^>]*>(.*?)</main>", h, re.I | re.S)
    if m:
        return m.group(1)
    h = _strip_blocks(h)
    start = 0
    hm = re.search(r"</header\s*>", h, re.I)
    if hm:
        start = hm.end()
    fm = re.search(r"<footer\b", h, re.I)
    end = fm.start() if fm else len(h)
    return h[start:end]


def inline(text: str) -> str:
    text = _html.unescape(text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def abs_url(href: str, src: str) -> str:
    """Resolve a page-relative href to an absolute canonical URL."""
    href = href.strip()
    if not href or href.startswith(("http://", "https://", "mailto:", "tel:", "#", "data:")):
        return href
    path, sep, frag = href.partition("#")
    base = "/" + posixpath.dirname(src) + "/"
    resolved = posixpath.normpath(posixpath.join(base, path))
    if resolved.endswith("index.html"):
        resolved = resolved[: -len("index.html")]
    if resolved == "." or resolved == "/":
        resolved = "/"
    url = DOMAIN + (resolved if resolved.startswith("/") else "/" + resolved)
    return url + (sep + frag if sep else "")


def to_markdown(body: str, src: str) -> str:
    body = _strip_blocks(body)
    # Normalize <br> to newlines.
    body = re.sub(r"<br\s*/?>", "\n", body, flags=re.I)

    # Images -> absolute URL (kept as a Markdown image)
    body = re.sub(
        r"<img\b[^>]*?src=[\"']([^\"']+)[\"'][^>]*?(?:alt=[\"']([^\"']*)[\"'])?[^>]*>",
        lambda m: f"![{inline(m.group(2) or '')}]({abs_url(m.group(1), src)})",
        body, flags=re.I | re.S,
    )

    # Links: [text](absolute-url)
    def link(m):
        href = abs_url(m.group(1), src)
        label = inline(re.sub(r"<[^>]+>", "", m.group(2)))
        if not label:
            label = href
        return f"[{label}]({href})"

    body = re.sub(r"<a\b[^>]*href=[\"']([^\"']+)[\"'][^>]*>(.*?)</a>", link, body, flags=re.I | re.S)

    body = re.sub(r"<(strong|b)\b[^>]*>(.*?)</\1>", lambda m: f"**{inline(m.group(2))}**", body, flags=re.I | re.S)
    body = re.sub(r"<(em|i)\b[^>]*>(.*?)</\1>", lambda m: f"*{inline(m.group(2))}*", body, flags=re.I | re.S)

    for lvl in range(1, 7):
        body = re.sub(
            rf"<h{lvl}\b[^>]*>(.*?)</h{lvl}>",
            lambda m, l=lvl: f"\n\n{'#' * l} {inline(re.sub(r'<[^>]+>', '', m.group(1)))}\n\n",
            body, flags=re.I | re.S,
        )

    body = re.sub(r"<li\b[^>]*>(.*?)</li>", lambda m: f"\n- {inline(re.sub(r'<[^>]+>', '', m.group(1)))}", body, flags=re.I | re.S)
    body = re.sub(r"</?(ul|ol)\b[^>]*>", "\n", body, flags=re.I)
    body = re.sub(r"<blockquote\b[^>]*>(.*?)</blockquote>", lambda m: f"\n\n> {inline(re.sub(r'<[^>]+>', '', m.group(1)))}\n\n", body, flags=re.I | re.S)
    body = re.sub(r"<p\b[^>]*>(.*?)</p>", lambda m: f"\n\n{inline(re.sub(r'<[^>]+>', '', m.group(1)))}\n\n", body, flags=re.I | re.S)
    body = re.sub(r"<hr\s*/?>", "\n\n---\n\n", body, flags=re.I)

    # Any remaining tags: drop, keep their text.
    body = re.sub(r"<[^>]+>", " ", body)
    body = _html.unescape(body)
    body = re.sub(r"[ \t]+", " ", body)
    body = re.sub(r"\n{3,}", "\n\n", body)
    body = "\n".join(line.rstrip() for line in body.splitlines()).strip()
    return body


def front_matter(title, desc, canonical, section):
    lines = [
        f"# {title}" if title else "# (untitled)",
        "",
        f"> AI-readable Markdown mirror of the canonical HTML page: {canonical}",
        f"> Section: {section}",
    ]
    if desc:
        lines.append(f"> Summary: {desc}")
    lines.append("")
    lines.append("---")
    lines.append("")
    return "\n".join(lines)


def main():
    outdir = os.path.join(ROOT, "md")
    os.makedirs(outdir, exist_ok=True)
    full_parts = []
    made = []
    for src, slug, section in PAGES:
        path = os.path.join(ROOT, src)
        if not os.path.exists(path):
            print(f"SKIP (missing): {src}")
            continue
        h = open(path, encoding="utf-8").read()
        title, desc, canonical = extract_head(h)
        if not canonical:
            canonical = f"{DOMAIN}/{src}"
        md = front_matter(title, desc, canonical, section) + to_markdown(extract_body(h), src)
        out = os.path.join(outdir, slug)
        os.makedirs(os.path.dirname(out), exist_ok=True)
        with open(out, "w", encoding="utf-8") as f:
            f.write(md.rstrip() + "\n")
        made.append((slug, canonical, len(md)))
        full_parts.append(
            f"\n\n<!-- ===== {canonical} ===== -->\n\n" + md.rstrip() + "\n"
        )
        print(f"wrote md/{slug} ({len(md)} chars)")

    header = (
        "# Straight Flush Plumbing & Leak Detection - Full AI-readable content\n\n"
        f"> Complete Markdown mirror of key public pages. Canonical site: {DOMAIN}/\n"
        "> Contact: (949) 374-6524. This file is generated from the site HTML; the\n"
        "> HTML pages remain canonical.\n"
    )
    with open(os.path.join(ROOT, "llms-full.txt"), "w", encoding="utf-8") as f:
        f.write(header + "".join(full_parts))
    print(f"wrote llms-full.txt ({len(made)} pages)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
