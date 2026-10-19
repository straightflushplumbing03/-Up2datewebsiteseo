#!/usr/bin/env python3
"""Deploy (or update) the two Intelligence HQ automations from the canonical prompts.

Hardening changes (2026-10-19):
- Add timeouts and simple retry/backoff for transient network errors (5xx, 429, URLError).
- Defend json decoding against non-JSON responses and include raw body in error output.
- Improve prompt parsing error messages and accept trailing whitespace after the '---' separator.
- Validate payload shapes before POST/PATCH.
- Emit structured logs (via logging) and return non-zero exit codes on failure.

Run:
    python3 growth-engine/automations/deploy_intelligence_hq.py            # dry run
    python3 growth-engine/automations/deploy_intelligence_hq.py --deploy   # apply (requires OPENHANDS_API_KEY)

Notes:
- This file uses only stdlib so it can run in minimal CI images.
"""
import argparse
import json
import logging
import os
import re
import sys
import time
import urllib.error
import urllib.request
from typing import Any, Dict, Optional, Tuple

HERE = os.path.dirname(os.path.abspath(__file__))
REPO_URL = "https://github.com/straightflushplumbing03/-Up2datewebsiteseo"
TIMEZONE = "America/Los_Angeles"
TIMEOUT = 10  # per-request timeout in seconds (network)
MAX_RETRIES = 3
BACKOFF_BASE = 1.0

# Required env var name is documented in automations/README.md
API_KEY_ENV = "OPENHANDS_API_KEY"
DEFAULT_HOST = os.environ.get("OPENHANDS_HOST", "https://app.all-hands.dev")

TARGETS = [
    {
        "file": "intelligence-hq-daily.prompt.md",
        "name": "SFPL Intelligence HQ Daily 6 AM",
        "schedule": "0 6 * * *",  # every day, incl. weekends
    },
    {
        "file": "intelligence-hq-weekly.prompt.md",
        "name": "SFPL Intelligence HQ Weekly Review",
        "schedule": "0 6 * * 1",  # Mondays
    },
]

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("deploy_intel_hq")


class APIError(RuntimeError):
    pass


def prompt_body(path: str) -> str:
    """Return the prompt text: everything after the first '---' rule.

    Accept trailing whitespace after the '---' line. Raise a clear error when
    the file is missing or the separator is not present.
    """
    try:
        text = open(path, encoding="utf-8").read()
    except FileNotFoundError:
        raise SystemExit(f"prompt file not found: {path}")

    parts = re.split(r"^---\s*$", text, maxsplit=1, flags=re.M)
    if len(parts) != 2:
        raise SystemExit(f"no '---' prompt separator found in {path} — make sure the file has a top metadata section followed by a line with only '---'")
    return parts[1].strip()


def safe_json_loads(s: str) -> Any:
    try:
        return json.loads(s) if s else {}
    except Exception:
        # Return raw text when JSON decoding fails so callers can include it in errors
        return {"_raw": s}


def _request_with_retry(method: str, url: str, token: str, payload: Optional[Dict] = None) -> Tuple[int, Dict[str, Any]]:
    """Helper implementing simple retries with exponential backoff for transient failures."""
    data = json.dumps(payload).encode() if payload is not None else None
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "User-Agent": "deploy-intel-hq/1.0",
    }

    for attempt in range(1, MAX_RETRIES + 1):
        req = urllib.request.Request(url, data=data, method=method, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                body = r.read().decode(errors="replace")
                parsed = safe_json_loads(body)
                return r.status, parsed
        except urllib.error.HTTPError as e:
            body = e.read().decode(errors="replace")
            status = e.code
            # Retry on 5xx and 429
            if status >= 500 or status == 429:
                logger.warning("HTTP %s from %s (attempt %d/%d): %s", status, url, attempt, MAX_RETRIES, body[:200])
                if attempt < MAX_RETRIES:
                    time.sleep(BACKOFF_BASE * (2 ** (attempt - 1)))
                    continue
            # Non-retryable or exhausted retries: return structured error
            return status, {"error": body}
        except urllib.error.URLError as e:
            # Treat as transient network error and retry
            logger.warning("Network error on %s (attempt %d/%d): %s", url, attempt, MAX_RETRIES, e)
            if attempt < MAX_RETRIES:
                time.sleep(BACKOFF_BASE * (2 ** (attempt - 1)))
                continue
            return 0, {"error": str(e)}

    return 0, {"error": "exhausted retries"}


def find_by_name(host: str, token: str, name: str) -> Optional[Dict[str, Any]]:
    status, data = _request_with_retry("GET", f"{host}/api/automation/v1?limit=100", token)
    if status != 200:
        raise APIError(f"could not list automations: HTTP {status} {data}")
    for a in data.get("automations", []):
        if a.get("name") == name:
            return a
    return None


def validate_payload(payload: Dict[str, Any]) -> None:
    if not payload.get("name") or not payload.get("prompt"):
        raise SystemExit("invalid payload: name and prompt are required")
    trigger = payload.get("trigger")
    if not trigger or trigger.get("type") != "cron" or not trigger.get("schedule"):
        raise SystemExit("invalid payload: trigger.type must be 'cron' and a schedule must be provided")


def api(method: str, url: str, token: str, payload: Optional[Dict] = None) -> Tuple[int, Dict[str, Any]]:
    status, data = _request_with_retry(method, url, token, payload)
    # Normalize error shapes for callers
    if status >= 400:
        # Ensure error has readable text
        err = data.get("error") if isinstance(data, dict) else data
        return status, {"error": err}
    return status, data


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--deploy", action="store_true", help="apply to OpenHands Cloud")
    ap.add_argument("--host", default=DEFAULT_HOST)
    args = ap.parse_args()

    token = os.environ.get(API_KEY_ENV)
    if args.deploy and not token:
        sys.exit(f"{API_KEY_ENV} is not set — required for --deploy")

    host = args.host

    any_failure = False
    for t in TARGETS:
        path = os.path.join(HERE, t["file"])
        try:
            body = prompt_body(path)
        except SystemExit as e:
            logger.error(e)
            any_failure = True
            continue

        payload = {
            "name": t["name"],
            "prompt": body,
            "trigger": {"type": "cron", "schedule": t["schedule"], "timezone": TIMEZONE},
            "timeout": TIMEOUT * 60,  # keep the previous behavior of larger job timeout; this is not the network timeout
            "repos": [{"url": REPO_URL, "ref": "main"}],
        }

        logger.info("Prepared payload for %s (prompt %d chars) schedule=%s", t["name"], len(body), t["schedule"])

        if not args.deploy:
            continue

        try:
            validate_payload(payload)
        except SystemExit as e:
            logger.error("Validation failed: %s", e)
            any_failure = True
            continue

        existing = None
        try:
            existing = find_by_name(host, token, t["name"])
        except APIError as e:
            logger.error("Failed to lookup existing automation: %s", e)
            any_failure = True
            continue

        if existing:
            status, data = api("PATCH", f"{host}/api/automation/v1/{existing['id']}", token, payload)
            logger.info("PATCH %s -> HTTP %s", existing['id'], status)
        else:
            status, data = api("POST", f"{host}/api/automation/v1/preset/prompt", token, payload)
            logger.info("POST create -> HTTP %s", status)

        # Check response for expected fields
        if status >= 400 or not isinstance(data, dict):
            logger.error("API error for %s: HTTP %s %s", t['name'], status, data)
            any_failure = True
            continue

        returned_id = data.get("id") or data.get("automation", {}).get("id")
        if not returned_id:
            logger.warning("created/updated but response missing id: %s", data)
        else:
            logger.info("Automation %s now id=%s enabled=%s state=%s", t['name'], returned_id, data.get("enabled"), data.get("state"))

    if any_failure:
        sys.exit(1)


if __name__ == "__main__":
    main()
