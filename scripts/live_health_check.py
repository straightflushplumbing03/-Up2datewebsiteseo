#!/usr/bin/env python3
"""Live-site health check: homepage, robots.txt AI-bot access, llms.txt,
security response headers.

Runs in GitHub Actions (.github/workflows/live-health.yml) so the daily Claude
run does not depend on a WebFetch permission prompt that nobody answers in an
unattended run. Stdlib only.

Each check prints one JSON line:
  {"check", "target", "result": pass|fail|warn|inconclusive, "detail", "severity"}
and the run also writes them to live-health.json.

The security-headers check reports `warn` (never `fail`) when headers from the
repo's `_headers` file are missing live: GitHub Pages ignores `_headers`, so
they only arrive once Cloudflare sends them (scripts/cloudflare_add_security_headers.py).
It exists so the crew can see from the Action what is actually served.

Exit code: 1 if any check is a definite `fail`, else 0. A blocked/failed fetch
(e.g. a Cloudflare challenge on the runner's IP) is `inconclusive`, never `fail`.
"""
import json
import sys
import urllib.error
import urllib.request

DOMAIN = "https://straightflushplumbingoc.com"
UA = "Mozilla/5.0 (compatible; SFPL-live-health/1.0; +https://straightflushplumbingoc.com/)"
AI_BOTS = [
    "GPTBot", "OAI-SearchBot", "ClaudeBot", "Claude-SearchBot", "PerplexityBot",
    "Google-Extended", "Applebot-Extended", "Bingbot",
]
NAME = "Straight Flush"
PHONE_DIGITS = "9493746524"


def fetch(url, timeout=20):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.read().decode("utf-8", "replace"), dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, "", dict(e.headers or {})
    except Exception as e:  # network error, timeout
        return None, str(e), {}


def parse_robots(text):
    """Return list of (agents:set[str lower], rules:list[(field, value)])."""
    groups, agents, rules, last_was_agent = [], set(), [], False
    for raw in text.splitlines():
        line = raw.split("#", 1)[0].strip()
        if ":" not in line:
            continue
        field, value = (p.strip() for p in line.split(":", 1))
        field = field.lower()
        if field == "user-agent":
            if not last_was_agent and (agents or rules):
                groups.append((agents, rules))
                agents, rules = set(), []
            agents.add(value.lower())
            last_was_agent = True
        elif field in ("allow", "disallow"):
            rules.append((field, value))
            last_was_agent = False
        else:
            last_was_agent = False
    if agents or rules:
        groups.append((agents, rules))
    return groups


def bot_blocked(groups, bot):
    """True if the group that applies to `bot` disallows the whole site."""
    b = bot.lower()
    matching = [r for a, r in groups if b in a]
    if not matching:
        matching = [r for a, r in groups if "*" in a]
    rules = [rule for g in matching for rule in g]
    full_disallow = any(f == "disallow" and v == "/" for f, v in rules)
    full_allow = any(f == "allow" and v == "/" for f, v in rules)
    return full_disallow and not full_allow


def challenged(status, headers):
    h = {k.lower(): v for k, v in headers.items()}
    return status in (403, 429, 503) or "cf-mitigated" in h


def row(check, target, result, detail, severity):
    return {"check": check, "target": target, "result": result,
            "detail": detail, "severity": severity}


# Header -> lowercase substring the live value must contain ("" = present is enough).
# Mirrors the repo's `_headers` file; test_live_health_check.py keeps them in sync.
EXPECTED_HEADERS = {
    "Strict-Transport-Security": "max-age=",
    "Content-Security-Policy": "default-src",
    "X-Frame-Options": "sameorigin",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=()",
    "Cross-Origin-Opener-Policy": "same-origin",
}


def header_gaps(headers):
    """Return the EXPECTED_HEADERS that are missing or have an unexpected value."""
    h = {k.lower(): str(v).lower() for k, v in headers.items()}
    gaps = []
    for name, needle in EXPECTED_HEADERS.items():
        value = h.get(name.lower())
        if value is None:
            gaps.append(name + " missing")
        elif needle and needle not in value:
            gaps.append(name + " unexpected value")
    return gaps


def check_security_headers():
    url = DOMAIN + "/"
    status, _body, headers = fetch(url)
    if status != 200:
        return row("security_headers", url, "inconclusive", f"HTTP {status}", "info")
    gaps = header_gaps(headers)
    if gaps:
        return row("security_headers", url, "warn", "; ".join(gaps), "medium")
    return row("security_headers", url, "pass",
               f"all {len(EXPECTED_HEADERS)} expected security headers served", "info")


def check_homepage():
    url = DOMAIN + "/"
    status, body, headers = fetch(url)
    if status != 200:
        why = "challenged/blocked for this runner" if challenged(status, headers) else "fetch failed"
        res = "inconclusive" if status is None or challenged(status, headers) else "fail"
        return row("homepage", url, res, f"HTTP {status}: {why}", "high" if res == "fail" else "info")
    digits = "".join(c for c in body if c.isdigit())
    ok_name, ok_phone = NAME in body, PHONE_DIGITS in digits
    if ok_name and ok_phone:
        return row("homepage", url, "pass", "200, business name and phone present", "info")
    return row("homepage", url, "fail", f"200 but name={ok_name} phone={ok_phone}", "high")


def check_robots():
    url = DOMAIN + "/robots.txt"
    status, body, headers = fetch(url)
    if status != 200:
        res = "inconclusive" if status is None or challenged(status, headers) else "fail"
        return row("robots_ai_bots", url, res, f"HTTP {status}", "high" if res == "fail" else "info")
    problems = []
    if "cloudflare managed" in body.lower():
        problems.append("Cloudflare Managed robots block present")
    groups = parse_robots(body)
    blocked = [b for b in AI_BOTS if bot_blocked(groups, b)]
    if blocked:
        problems.append("Disallow: / for " + ", ".join(blocked))
    if problems:
        return row("robots_ai_bots", url, "fail", "; ".join(problems), "critical")
    return row("robots_ai_bots", url, "pass", "no AI-bot Disallow: /, no Cloudflare Managed block", "info")


def check_llms():
    url = DOMAIN + "/llms.txt"
    status, body, headers = fetch(url)
    if status == 200 and body.strip():
        return row("llms_txt", url, "pass", f"200, {len(body)} bytes", "info")
    res = "inconclusive" if status is None or challenged(status, headers) else "fail"
    return row("llms_txt", url, res, f"HTTP {status}", "medium" if res == "fail" else "info")


def main():
    rows = [check_homepage(), check_robots(), check_llms(), check_security_headers()]
    for r in rows:
        print(json.dumps(r))
    with open("live-health.json", "w") as f:
        json.dump(rows, f, indent=2)
    return 1 if any(r["result"] == "fail" for r in rows) else 0


if __name__ == "__main__":
    sys.exit(main())
