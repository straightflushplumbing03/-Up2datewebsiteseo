#!/usr/bin/env python3
"""Turn plain-text "(949) 374-6524" in visible page copy into tap-to-call links.

Conversion, 2026-11-12. A phone number written as plain text cannot be tapped on
Android, and iOS auto-detected taps bypass assets/js/lead-events.js, so they never
record phone_call_click. This wraps each plain-text number in
<a href="tel:+19493746524" class="tel-inline">. Text inside <script> (JSON-LD),
<title>, <head>, existing links, buttons and form controls is left alone, and the
visible text does not change, so FAQPage schema and the md/ mirrors stay in sync.

Usage (from the repo root): python3 scripts/link_inline_phones.py [--check]
  --check  only list pages that still have plain-text numbers; exit 1 if any.
Safe to re-run: numbers already inside a link are skipped.
"""
import glob
import re
import sys

PHONE = re.compile(r"\(949\) 374-6524")
TAG = re.compile(r"<!--.*?-->|<[^>]+>", re.S)
SKIP = {"script", "style", "title", "a", "textarea", "option", "head", "button", "select"}
LINK = '<a href="tel:+19493746524" class="tel-inline">(949) 374-6524</a>'
EXCLUDE = ("geo-lab/", "ai-headquarters-blueprint/", "briefs/", "md/")


def link_numbers(html):
    out, pos, stack, count = [], 0, [], 0
    for m in TAG.finditer(html):
        text = html[pos:m.start()]
        if text and not any(t in SKIP for t in stack):
            text, k = PHONE.subn(LINK, text)
            count += k
        out.append(text)
        tag = m.group(0)
        out.append(tag)
        pos = m.end()
        if tag.startswith("<!--"):
            continue
        mm = re.match(r"<(/?)([a-zA-Z0-9]+)", tag)
        if not mm or mm.group(2).lower() not in SKIP:
            continue
        name = mm.group(2).lower()
        if mm.group(1):
            if name in stack:
                i = len(stack) - 1 - stack[::-1].index(name)
                del stack[i:]
        elif not tag.endswith("/>"):
            stack.append(name)
    out.append(html[pos:])
    return "".join(out), count


def main():
    check = "--check" in sys.argv
    total = 0
    for path in sorted(glob.glob("**/*.html", recursive=True)):
        if path.startswith(EXCLUDE):
            continue
        with open(path, encoding="utf-8") as fh:
            html = fh.read()
        if 'name="robots" content="noindex' in html:
            continue
        new, n = link_numbers(html)
        if not n:
            continue
        total += n
        print(f"{path}: {n}")
        if not check:
            with open(path, "w", encoding="utf-8") as fh:
                fh.write(new)
    print(f"{'found' if check else 'linked'} {total} plain-text number(s)")
    return 1 if (check and total) else 0


if __name__ == "__main__":
    sys.exit(main())
