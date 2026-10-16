"""Insert the GA4 Google tag into every page and widen the CSP so it can run.

The tag alone is not enough here. Every page carries a meta CSP with
`script-src 'self'` and `connect-src 'self'`, which blocks three separate
things the snippet needs:

  * `<script async src="https://www.googletagmanager.com/gtag/js?id=...">`
    -> blocked by `script-src`
  * the inline `gtag('config', ...)` function -> blocked by `script-src`
  * the measurement beacons to google-analytics.com -> blocked by `connect-src`

So pasting the snippet alone loads the tag in markup and records nothing.
The inline block is allowed by SHA-256 hash rather than `'unsafe-inline'`, so
the site keeps its XSS protection; the hash is computed from the exact block
below, so the two cannot drift apart.

Idempotent: re-running adds nothing and changes nothing.
"""

import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from csp_policy import GTAG_BLOCK, MEASUREMENT_ID, inline_sha256, meta_csp_tag  # noqa: E402

META_CSP_RE = re.compile(r'<meta http-equiv="Content-Security-Policy" content="[^"]*">')

SEARCH_DIRS = ["", "academy", "cities", "services", "insurance", "case-studies",
               "guides", "about"]


def iter_pages():
    for d in SEARCH_DIRS:
        base = os.path.join(ROOT, d) if d else ROOT
        if not os.path.isdir(base):
            continue
        for name in sorted(os.listdir(base)):
            if name.endswith(".html"):
                yield os.path.join(base, name)


def main():
    new_csp = meta_csp_tag()
    tagged = csp_fixed = skipped = 0
    for path in iter_pages():
        with open(path, "r", encoding="utf-8", newline="") as fh:
            src = fh.read()
        updated = src

        if "Google tag (gtag.js)" not in updated:
            nl = "\r\n" if "\r\n" in updated[:400] else "\n"
            block = GTAG_BLOCK.replace("\n", nl)
            if "<head>" in updated:
                updated = updated.replace("<head>", "<head>" + nl + block, 1)
            else:
                updated = re.sub(r"(<head[^>]*>)", r"\1" + nl + block, updated, count=1)
            tagged += 1

        if META_CSP_RE.search(updated):
            updated = META_CSP_RE.sub(new_csp, updated, count=1)
            csp_fixed += 1
        else:
            print("  !! no meta CSP: %s" % os.path.relpath(path, ROOT))
            skipped += 1

        if updated != src:
            with open(path, "w", encoding="utf-8", newline="") as fh:
                fh.write(updated)

    print("tag inserted: %d page(s)" % tagged)
    print("CSP widened:  %d page(s)" % csp_fixed)
    print("no CSP found: %d page(s)" % skipped)
    print("inline script sha256: sha256-%s" % inline_sha256())


if __name__ == "__main__":
    main()
