#!/bin/sh
# Local preview server for the static site.
# Freebuff injects PORT for isolated workspaces; falls back to 8000 locally.
exec python3 -m http.server "${PORT:-8000}" --bind 0.0.0.0
