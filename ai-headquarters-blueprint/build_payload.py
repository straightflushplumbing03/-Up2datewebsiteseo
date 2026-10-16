#!/usr/bin/env python3
"""Build the automation payload from the master prompt file.

The cron and timezone are read from the prompt file's section 3 heading block so
the payload cannot silently drift from the documented schedule. The line that
documents the schedule is the single source of truth; edit it there, not here.
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(HERE, "01-MASTER-AGENT-PROMPT.md")


def build_payload(text):
    """Build the automation payload dict from the master prompt file text."""
    m = re.search(r"^## THE PROMPT.*?\n(.*?)^## END OF PROMPT", text, re.S | re.M)
    if not m:
        raise ValueError("could not locate prompt markers")
    prompt = m.group(1)

    # Schedule is documented in the source file as: `0 6 * * 1,3,5` (Mon/Wed/Fri)
    sched = re.search(r"automation's cron, not a file inside the repo: `([^`]+)`", text)
    if not sched:
        raise ValueError("could not locate the schedule line in the prompt source")
    schedule = sched.group(1).strip()

    tz = re.search(r"`America/([A-Za-z_]+)`", text)
    timezone = "America/" + tz.group(1) if tz else "America/Los_Angeles"

    return {
        "name": "SFPL AI Headquarters Daily",
        "prompt": prompt,
        "trigger": {"type": "cron", "schedule": schedule, "timezone": timezone},
        "timeout": 1800,
        "repos": [
            {"url": "https://github.com/straightflushplumbing03/AI-Headquarters",
             "ref": "main"},
            {"url": "https://github.com/straightflushplumbing03/-Up2datewebsiteseo",
             "ref": "main"},
        ],
    }


def main():
    text = open(src, encoding="utf-8").read()
    payload = build_payload(text)

    out = "/tmp/payload.json"
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(payload, fh)

    print("wrote", out)
    print("name:        ", payload["name"])
    print("trigger:     ", payload["trigger"])
    print("timeout:     ", payload["timeout"])
    print("repos:       ", [r["url"] for r in payload["repos"]])
    print("prompt chars:", len(payload["prompt"]))
    print("payload bytes:", len(json.dumps(payload)))


if __name__ == "__main__":
    main()
