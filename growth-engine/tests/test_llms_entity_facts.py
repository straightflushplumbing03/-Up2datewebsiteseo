#!/usr/bin/env python3
"""llms.txt must state the same business entity as the homepage JSON-LD.

llms.txt is the file written for AI engines. If its phone, hours, profile links
or service list drift from the structured data on the homepage, engines see two
versions of the business. Checks:
  1. Name and phone in llms.txt match the homepage #business node.
  2. Every sameAs profile URL in the homepage #business node appears in llms.txt.
  3. Every on-domain link in llms.txt resolves to a file in the repo.
  4. Every top-level service hub (services/<name>.html without a city suffix)
     is listed in llms.txt.
"""
import json
import os
import re
import unittest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DOMAIN = "https://straightflushplumbingoc.com"
BUSINESS_ID = DOMAIN + "/#business"


def _read(rel):
    with open(os.path.join(ROOT, rel), encoding="utf-8") as fh:
        return fh.read()


def _business_node():
    html = _read("index.html")
    found = {}

    def walk(x):
        if isinstance(x, dict):
            if x.get("@id") == BUSINESS_ID and "telephone" in x:
                found.update(x)
            for v in x.values():
                walk(v)
        elif isinstance(x, list):
            for v in x:
                walk(v)

    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        walk(json.loads(block))
    return found


def _digits(s):
    return re.sub(r"\D", "", s)[-10:]


class LlmsEntityFacts(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.llms = _read("llms.txt")
        cls.biz = _business_node()

    def test_business_node_found(self):
        self.assertTrue(self.biz, "homepage #business node with telephone not found")

    def test_name_and_phone_match(self):
        self.assertIn(self.biz["name"], self.llms)
        phones = {_digits(m) for m in re.findall(r"\(\d{3}\) \d{3}-\d{4}", self.llms)}
        self.assertEqual(phones, {_digits(self.biz["telephone"])},
                         "llms.txt phone numbers differ from homepage schema")

    def test_same_as_profiles_listed(self):
        missing = [u for u in self.biz.get("sameAs", []) if u not in self.llms]
        self.assertEqual(missing, [], "sameAs profiles missing from llms.txt")

    def test_links_resolve(self):
        bad = []
        for url in set(re.findall(re.escape(DOMAIN) + r"/[^\s)\]>`]*", self.llms)):
            path = url[len(DOMAIN) + 1:].split("#")[0].rstrip(".,;")
            if not path:
                continue
            cand = os.path.join(ROOT, path)
            if path.endswith("/"):
                cand = os.path.join(cand, "index.html")
            if not os.path.isfile(cand):
                bad.append(url)
        self.assertEqual(sorted(bad), [], "llms.txt links that 404 in the repo")

    def test_service_hubs_listed(self):
        hubs = []
        for name in sorted(os.listdir(os.path.join(ROOT, "services"))):
            if not name.endswith(".html") or name == "index.html":
                continue
            stem = name[:-5]
            # A hub has no city suffix: leak-detection, slab-leak-detection, pex-repiping,
            # water-heater-services, drain-services, plumbing-repair, emergency-plumbing.
            if re.search(r"-(laguna-niguel|dana-point|san-clemente|mission-viejo|ladera-ranch|"
                         r"laguna-hills|aliso-viejo|irvine|lake-forest|rancho-santa-margarita|"
                         r"san-juan-capistrano|newport-beach|laguna-beach|costa-mesa|tustin|orange)$",
                         stem):
                continue
            hubs.append(name)
        missing = [h for h in hubs if f"{DOMAIN}/services/{h}" not in self.llms]
        self.assertEqual(missing, [], "service hub pages missing from llms.txt")


if __name__ == "__main__":
    unittest.main()
