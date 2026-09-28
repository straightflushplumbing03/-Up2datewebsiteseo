"""Point footer 'Cost Guides' at the guides hub and add a Case Studies footer link.

Both hubs existed but had almost no inbound links, which is what made them
hard to discover. This runs across the whole site so the change is uniform.
"""
import glob
import re

files = []
for p in glob.glob('**/*.html', recursive=True):
    if p.startswith('.git') or 'live-snapshot' in p:
        continue
    files.append(p)

COST_GUIDES = re.compile(r'href="((?:\.\./)?)guides/leak-detection-cost\.html">Cost Guides<')
INSURANCE = re.compile(
    r'([ \t]*)<li><a href="((?:\.\./)?)insurance/index\.html">Insurance Resources</a></li>')

changed_cost = 0
changed_cases = 0
for p in files:
    src = open(p, encoding='utf-8').read()
    out = src

    out, n = COST_GUIDES.subn(lambda m: f'href="{m.group(1)}guides/index.html">Cost Guides<', out)
    changed_cost += n

    def add_case(m):
        indent, prefix = m.group(1), m.group(2)
        return (m.group(0) + '\n'
                + f'{indent}<li><a href="{prefix}case-studies/index.html">Case Studies</a></li>')

    out, n = INSURANCE.subn(add_case, out)
    changed_cases += n

    if out != src:
        open(p, 'w', encoding='utf-8').write(out)

print(f'pages scanned: {len(files)}')
print(f'Cost Guides footer links repointed to hub: {changed_cost}')
print(f'Case Studies footer links added: {changed_cases}')