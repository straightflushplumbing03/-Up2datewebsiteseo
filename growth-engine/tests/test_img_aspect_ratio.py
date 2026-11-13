"""A stylesheet rule that sets an image's width must not leave its height fixed.

The global rule is `img{ max-width:100%; display:block; }` with no
`height:auto`, so an <img> keeps the pixel height from its height="" attribute
whenever CSS changes its width. Until 2026-11-13 `.founder-photo img{ width:100% }`
did exactly that: Lance's 841x947 photo on the homepage and about page rendered
334x947 on a phone (aspect 0.35 instead of 0.89), visibly stretched, and
Lighthouse flagged "Displays images with incorrect aspect ratio". The same gap
squashed the `.sonar-logo` on the homepage (height set, width left at the
attribute value).

This test fails if any CSS rule whose selector targets images sets exactly one
of width/height to a non-auto value without setting the other dimension too
(either to auto or to an explicit value), unless the rule uses object-fit.
"""

import os
import re
import unittest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CSS = os.path.join(ROOT, "assets", "css", "style.css")
RULE = re.compile(r"([^{}]+)\{([^{}]*)\}")


def _decls(body):
    out = {}
    for part in body.split(";"):
        if ":" in part:
            k, v = part.split(":", 1)
            out[k.strip().lower()] = v.strip().lower()
    return out


def one_sided_image_sizes(css_text):
    css_text = re.sub(r"/\*.*?\*/", "", css_text, flags=re.S)
    bad = []
    for sel, body in RULE.findall(css_text):
        sels = [s.strip() for s in sel.split(",")]
        if not any(re.search(r"(^|[\s>+~])img(\.[\w-]+)*$", s) or s.endswith("-logo") for s in sels):
            continue
        d = _decls(body)
        if "object-fit" in d or "aspect-ratio" in d:
            continue
        w, h = d.get("width"), d.get("height")
        if (w is None) != (h is None):
            set_one = w if w is not None else h
            if set_one != "auto":
                bad.append(f"{sel.strip()} {{{body.strip()}}}")
    return bad


class ImageAspectRatioTest(unittest.TestCase):
    def test_css_never_fixes_one_image_dimension(self):
        with open(CSS, encoding="utf-8") as fh:
            bad = one_sided_image_sizes(fh.read())
        self.assertEqual(bad, [], "image rules that set width or height but not the other: " + "; ".join(bad))

    def test_detector_catches_the_old_bug(self):
        self.assertTrue(one_sided_image_sizes(".founder-photo img{ width:100%; }"))
        self.assertTrue(one_sided_image_sizes(".sonar-logo{ height:56px; padding:8px; }"))
        self.assertFalse(one_sided_image_sizes(".founder-photo img{ width:100%; height:auto; }"))
        self.assertFalse(one_sided_image_sizes(".nav-brand img{ height:44px; width:auto; }"))


if __name__ == "__main__":
    unittest.main()
