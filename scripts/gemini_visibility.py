#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CLI: run the Gemini Search-grounded AI-visibility suite and append evidence.

Free substitute for `scripts/perplexity_agent.py`. Gemini with Google Search
grounding is a genuine AI answer engine (synthesised answer + citations) and has
a free tier, so AI-platform visibility can be measured without a metered key.

    python3 scripts/gemini_visibility.py --run --append
    python3 scripts/gemini_visibility.py --run --dry-run
    python3 scripts/gemini_visibility.py --smoke --query "plumber in Laguna Niguel"

Requires GEMINI_API_KEY (or GOOGLE_API_KEY). Never pass the key on the command
line — it would land in shell history and process listings.
"""
import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(ROOT, "growth-engine"))

from gemini_search_client import main  # noqa: E402

if __name__ == "__main__":
    sys.exit(main())
