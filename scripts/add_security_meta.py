#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Ensure every HTML page of the static site carries a
<meta http-equiv="Content-Security-Policy"> (plus <meta name="referrer">).

Why: _headers only applies on hosts that support it (Netlify/Cloudflare Pages).
For GitHub Pages and any other static host, an equivalent meta CSP is needed on
every page. Meta CSP complements (never overrides) header CSP: directives that
require header-only delivery (report-uri, frame-ancestors, sandbox) are omitted
here by design.

This script is idempotent AND self-healing: pages whose injected policy is
older than the current policy are upgraded in place. Safe to re-run at any
time (e.g. after the page generators create new pages).
"""
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

SEARCH_DIRS = ["", "about", "academy", "assets", "case-studies", "cities",
               "guides", "insurance", "services"]

CSP_CONTENT = (
    "default-src 'self'; style-src 'self' https://fonts.googleapis.com; "
    "font-src https://fonts.gstatic.com; img-src 'self' data: "
    "https://*.googleusercontent.com https://maps.google.com https://maps.gstatic.com; "
    "script-src 'self'; frame-src https://www.google.com; connect-src 'self'; "
    "object-src 'none'; base-uri 'self'; form-action https://formspree.io; "
    "upgrade-insecure-requests"
)
META_CSP = '<meta http-equiv="Content-Security-Policy" content="' + CSP_CONTENT + '">'
META_REFERRER = '<meta name="referrer" content="strict-origin-when-cross-origin">'
META_CSP_RE = re.compile(r'<meta http-equiv="Content-Security-Policy" content="[^"]*">')
VIEWPORT_RE = re.compile(r'<meta name="viewport"[^>]*>')


def iter_pages():
    for d in SEARCH_DIRS:
        base = os.path.join(ROOT, d) if d else ROOT
        if not os.path.isdir(base):
            continue
        for name in sorted(os.listdir(base)):
            if name.endswith(".html"):
                yield os.path.join(base, name)


def main():
    added = upgraded = unchanged = missing_head = 0
    for path in iter_pages():
        with open(path, "r", encoding="utf-8", newline="") as fh:
            src = fh.read()

        if "<head" not in src:
            print(f"  !! no <head> found: {os.path.relpath(path, ROOT)}")
            missing_head += 1
            continue

        newline = "\r\n" if "\r\n" in src[:400] else "\n"
        block = META_CSP + newline + META_REFERRER

        if META_CSP_RE.search(src):
            # Meta CSP present: upgrade it (and ensure referrer meta) if stale.
            updated = META_CSP_RE.sub(lambda _: META_CSP, src, count=1)
            if 'name="referrer"' not in updated:
                m = META_CSP_RE.search(updated)
                updated = updated[:m.end()] + newline + META_REFERRER + updated[m.end():]
            if updated == src:
                unchanged += 1
            else:
                with open(path, "w", encoding="utf-8", newline="") as fh:
                    fh.write(updated)
                upgraded += 1
            continue

        # No meta CSP yet: inject after the viewport meta (or right after <head>).
        m = VIEWPORT_RE.search(src)
        if m:
            updated = src[:m.end()] + newline + block + src[m.end():]
        else:
            updated = src.replace("<head>", "<head>" + newline + block, 1)

        if updated != src:
            with open(path, "w", encoding="utf-8", newline="") as fh:
                fh.write(updated)
            added += 1
        else:
            unchanged += 1

    print(f"CSP meta added to {added} page(s); upgraded {upgraded}; "
          f"{unchanged} already current; {missing_head} page(s) missing <head>.")


if __name__ == "__main__":
    main()
