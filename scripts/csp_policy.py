"""Single source of truth for the site's Content-Security-Policy.

Three places emit a CSP — the meta tag baked into every page
(`add_security_meta.py`), the template used to generate new pages
(`build.py`), and the Cloudflare response-header rule
(`cloudflare_add_security_headers.py`). They drifted apart before: the header
one lacked `form-action https://formspree.io`, and `build.py` allowed a CDN
nothing uses. More importantly, any one of them silently disabling the GA4 tag
is invisible — the tag stays in the markup and simply records nothing.

So the policy lives here once, and all three import it.

The inline `gtag()` bootstrap is permitted by SHA-256 hash, not
`'unsafe-inline'`, so the site keeps its XSS protection. The hash is derived
from the exact snippet text, so editing the snippet cannot forget to update
the hash.

Google Analytics requirements:
https://developers.google.com/tag-platform/security/guides/csp
"""

import base64
import hashlib

MEASUREMENT_ID = "G-DFS6B1LV4P"

GTAG_BLOCK = """<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id={mid}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){{dataLayer.push(arguments);}}
  gtag('js', new Date());

  gtag('config', '{mid}');
</script>""".format(mid=MEASUREMENT_ID)

_INLINE_START = GTAG_BLOCK.index("<script>\n") + len("<script>")
_INLINE_END = GTAG_BLOCK.rindex("</script>")
INLINE_SOURCE = GTAG_BLOCK[_INLINE_START:_INLINE_END]


def inline_sha256():
    """CSP hash source for the inline `gtag()` bootstrap."""
    return base64.b64encode(hashlib.sha256(INLINE_SOURCE.encode()).digest()).decode()


def csp_content():
    """The one CSP string. Keep this the only definition in the repo.

    `style-src-attr 'unsafe-inline'` allows the site's many inline style=""
    attributes (layout, form fields, the form honeypot's off-screen position).
    Without it every one was blocked: the spam-trap field was visible to real
    visitors and the contact form rendered cramped. It does not allow <style>
    elements or any script.
    """
    return (
        "default-src 'self'; style-src 'self' https://fonts.googleapis.com; "
        "style-src-attr 'unsafe-inline'; "
        "font-src https://fonts.gstatic.com; img-src 'self' data: "
        "https://*.googleusercontent.com https://maps.google.com https://maps.gstatic.com "
        "https://*.googletagmanager.com https://*.google-analytics.com "
        "https://*.analytics.google.com https://*.g.doubleclick.net https://www.google.com; "
        "script-src 'self' 'sha256-%s' https://*.googletagmanager.com "
        "https://static.cloudflareinsights.com; "
        "frame-src https://www.google.com https://www.googletagmanager.com; "
        # GA4 now sends hits to analytics.google.com, www.google.com and
        # stats.g.doubleclick.net. Verified 2026-10-26 in a real browser: the old
        # policy blocked every page_view, so GA recorded almost nothing.
        "connect-src 'self' https://*.googletagmanager.com https://*.google-analytics.com "
        "https://*.analytics.google.com https://analytics.google.com https://*.g.doubleclick.net "
        "https://www.google.com https://cloudflareinsights.com https://formspree.io; "
        "object-src 'none'; base-uri 'self'; form-action https://formspree.io; "
        "upgrade-insecure-requests" % inline_sha256()
    )


def meta_csp_tag():
    return '<meta http-equiv="Content-Security-Policy" content="%s">' % csp_content()
