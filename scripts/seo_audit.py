#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SEO/AEO audit engine for straightflushplumbingoc.com (static tree).

Reads every HTML page + sitemap.xml from the repo (the exact bytes GitHub Pages
serves) and emits a consolidated report. Re-runnable at any time:
    python3 scripts/seo_audit.py
Exit code 0 always; findings are printed as structured sections.
"""
import json
import os
import re
import sys
from collections import Counter, defaultdict
from html.parser import HTMLParser
from urllib.parse import urljoin

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOMAIN = "straightflushplumbingoc.com"

# ---------------------------------------------------------------- HTML parser
class PageParse(HTMLParser):
    VOID = {"img", "br", "hr", "meta", "link", "input", "source", "area", "col", "embed", "track", "wbr"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title = ""
        self._in_title = False
        self.metas = []          # list of dicts
        self.links = []          # <link rel=... href>
        self.h1 = []
        self.h2 = []
        self.h3 = 0
        self.jsonld_types = []
        self._in_script = 0
        self._script_buf = []
        self.imgs_no_alt = 0
        self.imgs_total = 0
        self.anchors = []        # raw hrefs
        self._skip_depth = 0     # inside script/style
        self._text_chunks = []
        self.canonical = None
        self.meta_robots = None
        self.meta_desc = None
        self.og_url = None
        self.has_tel = False
        self.has_form = False
        self.viewport = None
        self._capture = False
        self._h_buf = []
        self._h2_capture = False
        self._h2_buf = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ("script", "style"):
            self._skip_depth += 1
            if tag == "script" and (a.get("type") or "").lower() in ("application/ld+json",):
                self._in_script = 2
                self._script_buf = []
            return
        if tag == "title":
            self._in_title = True
        elif tag == "meta":
            self.metas.append(a)
            if a.get("name") == "robots":
                self.meta_robots = a.get("content")
            if a.get("name") == "description":
                self.meta_desc = a.get("content")
            if a.get("property") == "og:url":
                self.og_url = a.get("content")
            if a.get("name") == "viewport":
                self.viewport = a.get("content")
        elif tag == "link":
            if a.get("rel") == "canonical":
                self.canonical = a.get("href")
            self.links.append((a.get("rel"), a.get("href")))
        elif tag == "h1":
            self._capture = True
            self._h_buf = []
        elif tag == "h2":
            self._h2_capture = True
            self._h2_buf = []
        elif tag == "h3":
            self.h3 += 1
        elif tag == "img":
            self.imgs_total += 1
            if "alt" not in a:
                self.imgs_no_alt += 1
        elif tag == "a":
            href = a.get("href")
            if href and not href.startswith(("mailto:", "tel:", "javascript:", "#")):
                self.anchors.append(href)
            if href and href.startswith("tel:"):
                self.has_tel = True
        elif tag == "form":
            self.has_form = True

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            if self._skip_depth:
                self._skip_depth -= 1
            if self._in_script == 2:
                self._in_script = 0
                self._extract_jsonld()
            return
        if tag == "title":
            self._in_title = False
        elif tag == "h1":
            self.h1.append(" ".join("".join(self._h_buf).split()))
            self._capture = False
        elif tag == "h2":
            self._h2_capture = False
            self.h2.append(" ".join("".join(self._h2_buf).split())[:120])

    def handle_data(self, data):
        if self._in_script == 2:
            self._script_buf.append(data)
            return
        if self._in_title:
            self.title += data
        if self._skip_depth:
            return
        if self._capture:
            self._h_buf.append(data)
        if self._h2_capture:
            self._h2_buf.append(data)
        if not self._skip_depth:
            self._text_chunks.append(data)

    def _extract_jsonld(self):
        blob = "".join(self._script_buf)
        try:
            data = json.loads(blob)
        except Exception:
            self.jsonld_types.append("<invalid-json>")
            return
        def walk(node):
            if isinstance(node, dict):
                t = node.get("@type")
                if t:
                    self.jsonld_types.append(t if isinstance(t, str) else ",".join(t))
                if node.get("@id") or "mainEntity" in node:
                    pass
                for v in node.values():
                    walk(v)
            elif isinstance(node, list):
                for v in node:
                    walk(v)
        walk(data)

    # text helpers
    def word_count(self):
        return len(re.findall(r"[A-Za-z']+", " ".join(self._text_chunks)))


def parse_page(path):
    rel = os.path.relpath(path, ROOT)
    with open(path, "r", encoding="utf-8", errors="replace") as fh:
        raw = fh.read()
    p = PageParse()
    try:
        p.feed(raw)
    except Exception as e:
        p.parse_error = str(e)
    p.rel = rel
    p.raw = raw
    p.title = p.title.strip()
    # STUB-AWARE: noindex stubs are canonicalized duplicates by design
    p.is_stub = bool(p.meta_robots and "noindex" in p.meta_robots.lower())
    return p


def norm_href(href, page_rel):
    """Resolve a href against the page location to a site-relative path."""
    if href.startswith(("http://", "https://")):
        m = re.match(rf"https?://(?:www\.)?{re.escape(DOMAIN)}(/.*)$", href)
        if not m:
            return None  # external
        href = m.group(1)
    if href.startswith("/"):
        path = href.lstrip("/")
    else:
        base_dir = os.path.dirname(page_rel)
        path = os.path.normpath(os.path.join(base_dir, href)).replace(os.sep, "/")
        if path.startswith("../"):
            return None
    path = path.split("#")[0].split("?")[0]
    return path or "index.html"


def main():
    pages = {}
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in (".git", ".git-2", ".agents", ".claude", ".codex", ".vly-run", "node_modules")]
        for fn in filenames:
            if fn.endswith(".html"):
                full = os.path.join(dirpath, fn)
                pp = parse_page(full)
                pages[pp.rel] = pp

    print(f"=== 1. PAGE INVENTORY: {len(pages)} HTML pages ===\n")

    # ---- metadata table
    dup_titles = Counter(p.title.lower() for p in pages.values())
    noindex = [r for r, p in pages.items() if p.meta_robots and ("noindex" in p.meta_robots.lower())]
    missing_desc = [r for r, p in pages.items() if not p.meta_desc]
    short_desc = [r for r, p in pages.items() if p.meta_desc and len(p.meta_desc) < 70]
    long_desc = [r for r, p in pages.items() if p.meta_desc and len(p.meta_desc) > 165]
    dup_desc = Counter((p.meta_desc or "").lower() for p in pages.values() if p.meta_desc)
    multi_h1 = [r for r, p in pages.items() if len(p.h1) != 1]
    empty_h1 = [r for r, p in pages.items() if len(p.h1) == 1 and not p.h1[0]]
    missing_canon = [r for r, p in pages.items() if not p.canonical]
    thin = [r for r, p in pages.items() if p.word_count() < 150]
    imgs_no_alt = {r: p.imgs_no_alt for r, p in pages.items() if p.imgs_no_alt}
    no_viewport = [r for r, p in pages.items() if not p.viewport]
    invalid_ld = [r for r, p in pages.items() if "<invalid-json>" in p.jsonld_types]
    no_schema = [r for r, p in pages.items() if not p.jsonld_types]

    print(f"  noindex pages:            {len(noindex)} {noindex[:5]}")
    print(f"  missing meta description: {len(missing_desc)} {missing_desc[:8]}")
    print(f"  short (<70c) descriptions:{len(short_desc)}")
    print(f"  long (>165c) descriptions:{len(long_desc)} {long_desc[:5]}")
    dupd = {t: c for t, c in dup_desc.items() if c > 1}
    print(f"  duplicate descriptions:   {len(dupd)} clusters")
    print(f"  pages with != 1 H1:       {len(multi_h1)} {multi_h1[:8]}")
    print(f"  empty H1:                 {len(empty_h1)}")
    print(f"  missing canonical:        {len(missing_canon)} {missing_canon[:8]}")
    print(f"  thin pages (<150 words):  {len(thin)} {thin[:10]}")
    print(f"  pages with imgs w/o alt:  {len(imgs_no_alt)}  total imgs missing alt: {sum(imgs_no_alt.values())}")
    print(f"  missing viewport:         {len(no_viewport)} {no_viewport[:5]}")
    print(f"  invalid JSON-LD:          {len(invalid_ld)} {invalid_ld[:5]}")
    print(f"  zero structured data:     {len(no_schema)} {no_schema[:8]}")
    live_titles = Counter(p.title.lower() for p in pages.values() if not p.is_stub)
    dt = {t: c for t, c in live_titles.items() if c > 1 and t}
    print(f"  duplicate titles (indexable pages): {len(dt)} clusters")
    for t, c in list(dt.items())[:10]:
        files = [r for r, p in pages.items() if p.title.lower() == t and not p.is_stub]
        print(f"     x{c}: {t[:70]}  ->  {files}")
    stubs = sorted(r for r, p in pages.items() if p.is_stub)
    print(f"  noindex stub pages (by design):       {len(stubs)}")

    # ---- canonical checks
    print("\n=== 2. CANONICAL INTEGRITY ===")
    canon_issues = []
    for r, p in pages.items():
        if p.is_stub:
            continue  # STUB-AWARE: stubs intentionally canonicalize elsewhere
        if not p.canonical:
            continue
        target = norm_href(p.canonical, r)
        # STUB-AWARE: <loc>/dir/index.html</loc> in sitemap is listed as /dir/;
        # a self-canonical pointing at the trailing-slash form is the same URL.
        if target is not None and target != r and target == r[: -len("index.html")] and r.endswith("index.html"):
            continue
        if target is None:
            canon_issues.append((r, "offsite", p.canonical))
        elif target != r and not (target == "index.html" and r == "index.html"):
            # self-canonical mismatch (different file)
            canon_issues.append((r, "points-to-other-file", target))
        if p.og_url:
            if norm_href(p.og_url, r) != target:
                canon_issues.append((r, "og:url!=canonical", p.og_url))
    stub_no_canon = [r for r, p in pages.items() if p.is_stub and not p.canonical]
    print(f"  canonical anomalies (indexable pages): {len(canon_issues)}")
    print(f"  stubs missing a canonical (should be 0): {len(stub_no_canon)} {stub_no_canon[:5]}")
    for r, kind, val in canon_issues[:15]:
        print(f"     {kind}: {r} -> {val}")

    # ---- link graph
    print("\n=== 3. LINK GRAPH ===")
    inbound = Counter()
    outbound_bad = []
    external_hosts = Counter()
    for r, p in pages.items():
        for href in p.anchors:
            tgt = norm_href(href, r)
            if tgt is None:
                host = re.match(r"https?://([^/]+)", href)
                if host:
                    external_hosts[host.group(1)] += 1
                continue
            if tgt in pages:
                inbound[tgt] += 1
            elif tgt.endswith("/"):
                idx = tgt + "index.html"
                if idx in pages:
                    inbound[idx] += 1
                else:
                    outbound_bad.append((r, href, "dir-no-index"))
            elif tgt + "/index.html" in pages:
                # href lost its trailing slash via normpath; directory index exists
                inbound[tgt + "/index.html"] += 1
            else:
                outbound_bad.append((r, href, "missing"))
    print(f"  broken internal links: {len(outbound_bad)}")
    for r, href, why in outbound_bad[:10]:
        print(f"     [{why}] {r} -> {href}")
    orphans = [r for r in pages if inbound[r] == 0 and not pages[r].is_stub]
    print(f"  orphan pages (0 internal inbound links): {len(orphans)}")
    for o in sorted(orphans):
        print(f"     {o}")
    print(f"  top external link targets: {dict(external_hosts.most_common(8))}")

    # ---- sitemap cross-check
    print("\n=== 4. SITEMAP CROSS-CHECK ===")
    sm_path = os.path.join(ROOT, "sitemap.xml")
    sm_urls = []
    with open(sm_path, encoding="utf-8") as fh:
        sm = fh.read()
    sm_urls = re.findall(r"<loc>(.*?)</loc>", sm)
    sm_paths = set()
    for u in sm_urls:
        m = re.match(rf"https?://(?:www\.)?{re.escape(DOMAIN)}(/.*)$", u)
        if m:
            pth = m.group(1).lstrip("/")
            if pth.endswith("/"):
                pth += "index.html"
            sm_paths.add(pth or "index.html")
    fs_paths = set(pages)
    print(f"  sitemap URLs: {len(sm_urls)}  (unique paths: {len(sm_paths)})")
    in_sm_not_fs = sorted(sm_paths - fs_paths)
    in_fs_not_sm = sorted(p for p in fs_paths - sm_paths)
    print(f"  in sitemap but NO file: {len(in_sm_not_fs)} {in_sm_not_fs[:8]}")
    print(f"  file exists but NOT in sitemap: {len(in_fs_not_sm)} {in_fs_not_sm[:12]}")
    non_self_canon_in_sm = []
    for u_path in sorted(sm_paths):
        if u_path in pages and pages[u_path].canonical:
            c = norm_href(pages[u_path].canonical, u_path)
            if c and c != u_path:
                non_self_canon_in_sm.append((u_path, c))
    print(f"  sitemap URLs whose canonical points elsewhere: {len(non_self_canon_in_sm)} {non_self_canon_in_sm[:5]}")

    # ---- duplicate-content clusters (near-duplicate titles/h1s across dirs)
    print("\n=== 5. DUPLICATE-CONTENT CLUSTERS (root vs subdir) ===")
    def stem(rel):
        return os.path.basename(rel).replace(".html", "")
    by_stem = defaultdict(list)
    for r in pages:
        by_stem[stem(r)].append(r)
    clusters = {s: fs for s, fs in by_stem.items() if len(fs) > 1}
    for s, fs in sorted(clusters.items()):
        tset = {pages[f].title[:60] for f in fs}
        h1set = {pages[f].h1[0][:60] if pages[f].h1 else "" for f in fs}
        same_h1 = len(h1set) == 1 and "" not in h1set
        print(f"  /{s}: {fs}  identical-H1={same_h1}")
        for f in fs:
            p = pages[f]
            print(f"     {f}: words={p.word_count()} h1='{(p.h1[0][:60] if p.h1 else '')}' title='{p.title[:60]}'")

    # ---- schema inventory
    print("\n=== 6. SCHEMA INVENTORY ===")
    type_usage = Counter()
    for p in pages.values():
        for t in set(p.jsonld_types):
            type_usage[t] += 1
    for t, c in type_usage.most_common(20):
        print(f"  {c:4d}  {t}")

    # ---- AEO readiness
    print("\n=== 7. AEO READINESS ===")
    aeo_ready = 0
    aeo_weak = []
    for r, p in pages.items():
        has_faq = "city-faq-section" in p.raw or "faq-item" in p.raw or "FAQPage" in p.jsonld_types
        has_q_h2 = any(h.strip().endswith("?") for h in p.h2)
        has_answerish = bool(re.search(r"(What is|How (do|much|long|does|can)|Why (is|does)|Can a|Should I|Does )", " ".join(p.h2)))
        if has_faq or (has_q_h2 and p.word_count() > 400):
            aeo_ready += 1
        else:
            aeo_weak.append(r)
    print(f"  pages with FAQ block or question-driven H2s: {aeo_ready}/{len(pages)}")
    print(f"  AEO-weak pages: {len(aeo_weak)} {aeo_weak[:12]}")

    # ---- word-count distribution
    print("\n=== 8. CONTENT DEPTH ===")
    wc = sorted(((p.word_count(), r) for r, p in pages.items()))
    print(f"  thinnest 8: {[(r, w) for w, r in wc[:8]]}")
    print(f"  deepest 8:  {[(r, w) for w, r in wc[-8:]]}")
    print(f"  median words: {wc[len(wc)//2][0]}")

    # ---- click-to-call coverage
    print("\n=== 9. CTA / CONVERSION COVERAGE ===")
    no_tel = [r for r, p in pages.items() if not p.has_tel]
    no_form_ok = [r for r, p in pages.items() if p.has_form]
    print(f"  pages WITHOUT tel: link: {len(no_tel)} {no_tel[:10]}")
    print(f"  pages WITH <form>: {len(no_form_ok)} {no_form_ok[:5]}")
    placeholder_forms = [r for r, p in pages.items() if "YOUR_FORMSPREE_ID" in p.raw]
    print(f"  pages with UNSET Formspree ID: {len(placeholder_forms)} {placeholder_forms}")

    print("\n=== AUDIT COMPLETE ===")


if __name__ == "__main__":
    main()
