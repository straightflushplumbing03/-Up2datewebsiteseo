#!/usr/bin/env python3
"""Compare the deployed site against a local checkout.

For each URL in the live sitemap, fetch it and compare against the matching
HTML file in the repo, ignoring markup that Cloudflare injects at the edge
(email obfuscation, the challenge script). Reports any page where the repo
is genuinely ahead of or behind production, plus reachability from the
homepage.

Usage:
    python3 verify_live_vs_repo.py <repo_dir> [--base https://example.com/]
"""
import argparse
import os
import re
import subprocess
import sys
import tempfile
from collections import deque

CF_SCRIPT = re.compile(r'<script>\(function\(\)\{function c\(\).*?\}\)\(\);</script>', re.S)
CF_DECODE = re.compile(r'<script data-cfasync="false" src="/cdn-cgi/scripts/[^"]*"></script>')


def strip_cf(html: str) -> str:
    html = CF_DECODE.sub('', html)
    html = CF_SCRIPT.sub('', html)
    html = re.sub(r'straightflushplumbing03@gmail\.com', 'EMAIL', html)
    html = re.sub(r'href="/cdn-cgi/l/email-protection[^"]*"', 'href="MAILTO"', html)
    html = re.sub(r'href="mailto:[^"]*"', 'href="MAILTO"', html)
    html = re.sub(r'href="EMAIL"', 'href="MAILTO"', html)
    html = re.sub(r'<span class="__cf_email__"[^>]*>.*?</span>', 'EMAIL', html, flags=re.S)
    html = re.sub(r'class="__cf_email__"[^>]*', '', html)
    html = re.sub(r'<a href="MAILTO"[^>]*>.*?</a>', 'EMAIL', html, flags=re.S)
    html = re.sub(r'<a href="MAILTO">EMAIL</a>', 'EMAIL', html)
    return re.sub(r'\s+', ' ', html).strip()


def repo_path_for(repo: str, url: str, base: str) -> str:
    raw = url.replace(base, '')
    rel = raw.strip('/')
    if not rel:
        return os.path.join(repo, 'index.html')
    if raw.endswith('/'):
        return os.path.join(repo, rel, 'index.html')
    return os.path.join(repo, rel + '.html')


def fetch(url: str, dest: str) -> bool:
    r = subprocess.run(
        ['curl', '-sS', '--compressed', '-A', 'Mozilla/5.0 (compatible; site-audit)',
         url, '-o', dest], capture_output=True)
    return r.returncode == 0 and os.path.getsize(dest) > 0


def crawl_from_homepage(repo: str):
    """BFS over local links to find how deep each page sits."""
    def links(path):
        html = open(path, encoding='utf-8', errors='replace').read()
        out = set()
        for m in re.findall(r'href="([^"]+)"', html):
            if m.startswith(('http', 'mailto:', 'tel:', '#', 'javascript', '//')):
                continue
            m = m.split('#')[0].split('?')[0]
            if not m:
                continue
            if m.endswith('/'):
                m += 'index.html'
            elif not m.endswith('.html'):
                m += '.html'
            nxt = os.path.normpath(os.path.join(os.path.dirname(path), m))
            if not nxt.startswith('..'):
                out.add(nxt)
        return out

    start = os.path.join(repo, 'index.html')
    seen = {start: 0}
    q = deque([start])
    while q:
        cur = q.popleft()
        for nxt in links(cur):
            if nxt in seen or not os.path.exists(nxt):
                continue
            seen[nxt] = seen[cur] + 1
            q.append(nxt)
    return {os.path.relpath(k, repo): v for k, v in seen.items()}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('repo')
    ap.add_argument('--base', default='https://straightflushplumbingoc.com/')
    args = ap.parse_args()

    sitemap = subprocess.run(
        ['curl', '-sS', args.base + 'sitemap.xml'], capture_output=True, text=True).stdout
    urls = re.findall(r'<loc>([^<]+)</loc>', sitemap)
    if not urls:
        sys.exit('no URLs in sitemap')

    print(f'live sitemap: {len(urls)} URLs\n')
    same, diffs, missing = 0, [], []
    with tempfile.TemporaryDirectory() as tmp:
        for u in urls:
            rp = repo_path_for(args.repo, u, args.base)
            if not os.path.exists(rp):
                missing.append(u)
                continue
            tmpfile = os.path.join(tmp, 'p.html')
            if not fetch(u, tmpfile):
                diffs.append((u, 'fetch failed'))
                continue
            live = strip_cf(open(tmpfile, encoding='utf-8', errors='replace').read())
            repo = strip_cf(open(rp, encoding='utf-8', errors='replace').read())
            if live == repo:
                same += 1
            else:
                diffs.append((u, f'live={len(live)} repo={len(repo)}'))

    print(f'identical to repo: {same}/{len(urls)}')
    for u, w in diffs:
        print(f'  DIFF  {u}  ({w})')
    for u in missing:
        print(f'  NO REPO FILE  {u}')

    depth = crawl_from_homepage(args.repo)
    print(f'\ncrawl from index.html reached {len(depth)} pages')
    for page, d in sorted(depth.items(), key=lambda kv: -kv[1])[:10]:
        print(f'  depth {d}  {page}')


if __name__ == '__main__':
    main()