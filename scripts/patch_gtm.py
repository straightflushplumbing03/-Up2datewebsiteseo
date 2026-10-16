#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Install Google Tag Manager (GTM-KNVW3QG7) site-wide, and make the CSP allow it.

Two snippets are added to every .html file:
  1. The GTM loader, immediately after the Content-Security-Policy <meta> in
     <head> (CSP must stay first so it governs the snippet; GTM is then as high
     as it can safely be).
  2. The GTM <noscript> iframe, immediately after <body>.

The site carries a `script-src 'self'` Content-Security-Policy meta tag on every
page. That policy blocks an inline <script>, so the GTM loader would be silently
ignored without a CSP change. GTM also injects inline scripts for its tags, and a
static GitHub Pages host cannot mint a per-request nonce, so `'unsafe-inline'`
plus the googletagmanager.com origin is required (Google's documented approach for
this situation). GA4/GTM network and image endpoints are added too.

Idempotent. Run from project root:  python3 scripts/patch_gtm.py
"""
import glob
import os

GTM_ID = "GTM-KNVW3QG7"

GTM_HEAD = """<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','%s');</script>
<!-- End Google Tag Manager -->""" % GTM_ID

GTM_BODY = """<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=%s"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->""" % GTM_ID

OLD_CSP = ("default-src 'self'; style-src 'self' https://fonts.googleapis.com; "
           "font-src https://fonts.gstatic.com; img-src 'self' data: "
           "https://*.googleusercontent.com https://maps.google.com "
           "https://maps.gstatic.com; script-src 'self'; "
           "frame-src https://www.google.com; connect-src 'self'; "
           "object-src 'none'; base-uri 'self'; form-action https://formspree.io; "
           "upgrade-insecure-requests")

NEW_CSP = ("default-src 'self'; style-src 'self' https://fonts.googleapis.com; "
           "font-src https://fonts.gstatic.com; img-src 'self' data: "
           "https://*.googleusercontent.com https://maps.google.com "
           "https://maps.gstatic.com https://www.googletagmanager.com "
           "https://www.google-analytics.com https://*.google-analytics.com; "
           "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; "
           "frame-src https://www.google.com https://www.googletagmanager.com; "
           "connect-src 'self' https://www.googletagmanager.com "
           "https://www.google-analytics.com https://*.google-analytics.com "
           "https://*.analytics.google.com https://stats.g.doubleclick.net; "
           "object-src 'none'; base-uri 'self'; form-action https://formspree.io; "
           "upgrade-insecure-requests")

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
old_meta = '<meta http-equiv="Content-Security-Policy" content="%s">' % OLD_CSP
new_meta = '<meta http-equiv="Content-Security-Policy" content="%s">' % NEW_CSP

changed = csp = body = 0
for path in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True):
    if "/.git/" in path or "/growth-engine/" in path:
        continue
    rel = os.path.relpath(path, ROOT)
    src = open(path, encoding="utf-8").read()
    out = src

    # 1) CSP: allow GTM (and GA endpoints). Idempotent — only rewrites old->new.
    if old_meta in out:
        out = out.replace(old_meta, new_meta, 1)
        csp += 1
    elif new_meta not in out:
        print(f"  !! unexpected CSP in {rel}")

    # 2) GTM loader in <head>
    if GTM_HEAD not in out:
        if new_meta in out:
            out = out.replace(new_meta, new_meta + "\n" + GTM_HEAD, 1)
        else:
            print(f"  !! could not place GTM head snippet in {rel}")

    # 3) GTM noscript after <body>
    if GTM_BODY not in out:
        if "<body>" in out:
            out = out.replace("<body>", "<body>\n" + GTM_BODY, 1)
            body += 1
        else:
            print(f"  !! no <body> in {rel}")

    if out != src:
        open(path, "w", encoding="utf-8", newline="").write(out)
        changed += 1

print(f"files updated: {changed}   CSP rewritten: {csp}   noscript added: {body}")
