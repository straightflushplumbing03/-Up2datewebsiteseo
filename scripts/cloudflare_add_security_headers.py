#!/usr/bin/env python3
"""Cloudflare response-security-header provisioning (read-only by default).

GitHub Pages ignores the repo's `_headers` file, so the site currently ships NO
security response headers (verified 2026-10-15: no HSTS, X-Frame-Options,
X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP response header,
or Cross-Origin-*). `README.md` documents the fix as a Cloudflare
"Transform Rule -> Modify Response Header".

This script reads the zone's current `http_response_headers_transform` ruleset and
(with --apply) writes the exact header values from the repo's `_headers` file.

SAFETY
  * Read-only unless `--apply` is passed.
  * `--apply` is a Level 3 (hosting/security) change — requires owner approval and
    a Cloudflare API token with Zone:Transform Rules:Edit.
  * Never prints the token. Reversible: removing the rule removes the headers.

Usage
  python3 scripts/cloudflare_add_security_headers.py                # show current
  python3 scripts/cloudflare_add_security_headers.py --apply        # apply
Env
  CLOUDFLARE_API_TOKEN   token with Zone:Zone:Read + Zone:Transform Rules:Edit
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request

API = "https://api.cloudflare.com/client/v4"
DOMAIN = "straightflushplumbingoc.com"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Values mirror the repo's _headers file (keep in sync).
HEADERS = {
    "Content-Security-Policy": "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https://*.googleusercontent.com https://maps.google.com https://maps.gstatic.com; script-src 'self'; frame-src https://www.google.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action https://formspree.io; upgrade-insecure-requests",
    "X-Frame-Options": "SAMEORIGIN",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
}


def call(path, token, method="GET", body=None):
    req = urllib.request.Request(
        API + path,
        method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, json.loads(r.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode() or "{}")
        except Exception:
            return e.code, {"error": str(e)}


def zone_id(token):
    st, body = call(f"/zones?name={DOMAIN}", token)
    if st != 200 or not body.get("result"):
        sys.exit(f"cannot resolve zone {DOMAIN} (HTTP {st}): {body.get('errors')}")
    return body["result"][0]["id"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="write the Transform Rule (Level 3)")
    args = ap.parse_args()

    token = os.environ.get("CLOUDFLARE_API_TOKEN")
    if not token:
        sys.exit("CLOUDFLARE_API_TOKEN not set — cannot reach the Cloudflare API.")

    zid = zone_id(token)
    phase = "http_response_headers_transform"
    st, body = call(f"/zones/{zid}/rulesets/phases/{phase}/entrypoint", token)
    existing = body.get("result", {}) if st == 200 else None
    print(f"zone {DOMAIN} ({zid})  phase {phase}  -> HTTP {st}")
    if existing:
        print("current rules:", [r.get("description") for r in existing.get("rules", [])])

    # Preserve any existing rules; add/replace ours by description.
    desc = "Straight Flush: security response headers (_headers parity)"
    rule = {
        "action": "rewrite",
        "action_parameters": {"headers": {k: {"operation": "set", "value": v} for k, v in HEADERS.items()}},
        "expression": "true",
        "description": desc,
    }
    keep = [r for r in (existing or {}).get("rules", []) if r.get("description") != desc]
    payload = {"rules": keep + [rule]}

    if not args.apply:
        print("\nDRY RUN — would set these headers for all responses:")
        for k, v in HEADERS.items():
            print(f"  {k}: {v[:70]}{'…' if len(v) > 70 else ''}")
        print("\nRe-run with --apply to write (requires owner approval).")
        return

    st, body = call(f"/zones/{zid}/rulesets/phases/{phase}/entrypoint", token, "PUT", payload)
    print(f"\napplied -> HTTP {st}")
    if st != 200:
        sys.exit(f"apply failed: {body.get('errors')}")
    print("Verify: curl -sI https://straightflushplumbingoc.com/ | grep -i strict-transport")


if __name__ == "__main__":
    main()
