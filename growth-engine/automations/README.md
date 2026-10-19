### Automations: required secrets and host

This repository's automation deploy script (growth-engine/automations/deploy_intelligence_hq.py)
requires the following environment variables when run with `--deploy`:

- `OPENHANDS_API_KEY` — the bearer token used to call the OpenHands Cloud automation API.
- `OPENHANDS_HOST` (optional) — override the default host `https://app.all-hands.dev` for testing.

Notes:
- Do not commit API keys into the repository. Store `OPENHANDS_API_KEY` as a GitHub Actions secret
  named `OPENHANDS_API_KEY` in the repository/organization if you plan to run the deploy from CI.
- The deploy script runs a dry-run by default. Pass `--deploy` to apply changes.
