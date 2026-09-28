"""Give the two guide pages without a hub step a proper 3-level breadcrumb.

The hub now exists, so 'Home > Cost Guides > <page>' is the correct trail.
Their BreadcrumbList JSON-LD is updated to match, since a visible breadcrumb
and its structured data disagreeing is worse than either being absent.
"""
import json
import re

PAGES = {
    # path -> (label currently shown, breadcrumb/JSON-LD name to use)
    'guides/leak-detection-cost.html': ('Cost Guides', 'Leak Detection Cost'),
    'guides/repair-vs-reroute-vs-repipe.html': ('Repair vs. Reroute vs. Repipe', 'Repair vs. Reroute vs. Repipe'),
}

for path, (old_label, name) in PAGES.items():
    src = open(path, encoding='utf-8').read()
    out = src

    old_crumb = ('<div class="breadcrumbs"><a href="../index.html">Home</a> &rsaquo; '
                 f'<span>{old_label}</span></div>')
    new_crumb = ('<div class="breadcrumbs"><a href="../index.html">Home</a> &rsaquo; '
                 '<a href="../guides/index.html">Cost Guides</a> &rsaquo; '
                 f'<span>{name}</span></div>')
    assert old_crumb in out, f'breadcrumb not found in {path}'
    out = out.replace(old_crumb, new_crumb)

    def fix_jsonld(m):
        try:
            data = json.loads(m.group(1))
        except Exception:
            return m.group(0)
        if not isinstance(data, dict) or data.get('@type') != 'BreadcrumbList':
            return m.group(0)
        data['itemListElement'] = [
            {"@type": "ListItem", "position": 1, "name": "Home",
             "item": "https://straightflushplumbingoc.com/"},
            {"@type": "ListItem", "position": 2, "name": "Cost Guides",
             "item": "https://straightflushplumbingoc.com/guides/"},
            {"@type": "ListItem", "position": 3, "name": name,
             "item": f"https://straightflushplumbingoc.com/{path[:-5]}"},
        ]
        return ('<script type="application/ld+json">\n'
                + json.dumps(data, indent=2, ensure_ascii=False) + '\n</script>')

    out = re.sub(r'<script type="application/ld\+json">(.*?)</script>', fix_jsonld, out, flags=re.S)
    open(path, 'w', encoding='utf-8').write(out)
    print('updated', path)
