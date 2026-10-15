#!/usr/bin/env python3
"""Build the automation payload from the master prompt file."""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(HERE, "01-MASTER-AGENT-PROMPT.md")

text = open(src, encoding="utf-8").read()
m = re.search(r"^## THE PROMPT.*?\n(.*?)^## END OF PROMPT", text, re.S | re.M)
if not m:
    raise SystemExit("could not locate prompt markers")
prompt = m.group(1)

payload = {
    "name": "SFPL AI Headquarters Daily",
    "prompt": prompt,
    "trigger": {"type": "cron", "schedule": "0 6 * * *",
                "timezone": "America/Los_Angeles"},
    "timeout": 1800,
    "repos": [
        {"url": "https://github.com/straightflushplumbing03/AI-Headquarters",
         "ref": "main"},
        {"url": "https://github.com/straightflushplumbing03/-Up2datewebsiteseo",
         "ref": "main"},
    ],
}

out = "/tmp/payload.json"
with open(out, "w", encoding="utf-8") as fh:
    json.dump(payload, fh)

print("wrote", out)
print("name:        ", payload["name"])
print("trigger:     ", payload["trigger"])
print("timeout:     ", payload["timeout"])
print("repos:       ", [r["url"] for r in payload["repos"]])
print("prompt chars:", len(prompt))
print("payload bytes:", len(json.dumps(payload)))
