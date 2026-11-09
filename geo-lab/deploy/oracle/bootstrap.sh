#!/usr/bin/env bash
#
# One-shot bootstrap for the GEO Intelligence Lab on an Oracle Cloud Always Free
# VM (Ubuntu 22.04 or 24.04, Arm or AMD).
#
#   curl -fsSLO https://raw.githubusercontent.com/straightflushplumbing03/-Up2datewebsiteseo/main/geo-lab/deploy/oracle/bootstrap.sh
#   sudo bash bootstrap.sh
#
# It is idempotent: re-running updates the checkout and rebuilds, leaving the
# database alone.
#
# IMPORTANT — why this clones the whole repository and not just geo-lab/:
# the lab analyses the website by walking the checkout. The website lives at the
# repository root and geo-lab/ is a subdirectory of it, so the lab must run from
# inside a full checkout. Deploying geo-lab/ on its own makes the crawler walk
# whatever directory happens to be its parent. See geo-lab/DEPLOYMENT.md.
#
# Secrets are NOT accepted as arguments (they would land in shell history and in
# `ps`). They go in /etc/geo-lab/geo-lab.env afterwards.
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/straightflushplumbing03/-Up2datewebsiteseo.git}"
REPO_DIR="${REPO_DIR:-/opt/sfpl-repo}"
BRANCH="${BRANCH:-main}"
APP_USER="geolab"
DATA_DIR="/var/lib/geo-lab"
CONF_DIR="/etc/geo-lab"
ENV_FILE="${CONF_DIR}/geo-lab.env"
PORT="${PORT:-12000}"

log() { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }
die() { printf '\n\033[1;31mERROR:\033[0m %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "run this with sudo"

# ── 1. Timezone ────────────────────────────────────────────────────────────
# The business is in California. Setting the system zone makes the daily timer
# correct across the PST/PDT changeover without touching the schedule.
log "Setting timezone to America/Los_Angeles"
timedatectl set-timezone America/Los_Angeles

# ── 2. Base packages ───────────────────────────────────────────────────────
log "Installing base packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl ca-certificates gnupg git openssl

# ── 3. Node.js 22+ ─────────────────────────────────────────────────────────
# node:sqlite (the lab's database driver, zero native dependencies) needs
# Node 22.5+. Ubuntu's own nodejs package is older, so use NodeSource.
need_node=1
if command -v node >/dev/null 2>&1; then
  major="$(node -p 'process.versions.node.split(".")[0]')"
  minor="$(node -p 'process.versions.node.split(".")[1]')"
  if [ "$major" -gt 22 ] || { [ "$major" -eq 22 ] && [ "$minor" -ge 5 ]; }; then need_node=0; fi
fi
if [ "$need_node" -eq 1 ]; then
  log "Installing Node.js 22 (NodeSource)"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y -qq nodejs
fi
log "Node $(node -v) / npm $(npm -v) on $(uname -m)"

# ── 4. Service account ─────────────────────────────────────────────────────
log "Creating ${APP_USER} user"
id -u "$APP_USER" >/dev/null 2>&1 || useradd --system --create-home --shell /usr/sbin/nologin "$APP_USER"
mkdir -p "$DATA_DIR" "$CONF_DIR"

# ── 5. Repository checkout ─────────────────────────────────────────────────
# Public repository, so no credentials are needed for a read-only clone.
if [ -d "${REPO_DIR}/.git" ]; then
  log "Updating existing checkout in ${REPO_DIR}"
  git -C "$REPO_DIR" remote set-url origin "$REPO_URL"
  git -C "$REPO_DIR" fetch -q origin "$BRANCH"
  git -C "$REPO_DIR" checkout -q "$BRANCH"
  git -C "$REPO_DIR" reset -q --hard "origin/${BRANCH}"
else
  log "Cloning ${REPO_URL} (branch ${BRANCH}) into ${REPO_DIR}"
  git clone -q --branch "$BRANCH" --depth 1 "$REPO_URL" "$REPO_DIR"
fi
[ -f "${REPO_DIR}/geo-lab/package.json" ] || die "no geo-lab/package.json in ${REPO_DIR} — is the branch pushed?"
[ -f "${REPO_DIR}/index.html" ] || die "no index.html at ${REPO_DIR} — the lab needs the whole repository, not just geo-lab/"

APP_DIR="${REPO_DIR}/geo-lab"
cd "$APP_DIR"
log "Installing dependencies"
# Full install, deliberately not --omit=dev: the daily job runs `tsx` (a
# devDependency) and `next build` needs tailwind/postcss, also devDeps.
npm ci --no-audit --no-fund

# ── 6. Environment file ────────────────────────────────────────────────────
if [ ! -f "$ENV_FILE" ]; then
  log "Creating ${ENV_FILE} with a generated run token"
  token="$(openssl rand -hex 32)"
  cat > "$ENV_FILE" <<EOF
# GEO Lab environment. Root-owned, mode 600. Never commit this file.
NODE_ENV=production
PORT=${PORT}
GEO_LAB_DB=${DATA_DIR}/geo-lab.db
GEO_LAB_PUBLIC_URL=http://127.0.0.1:${PORT}
GEO_LAB_RUN_TOKEN=${token}

# The website under analysis. Defaults to the parent of geo-lab/, which is
# correct for this checkout, so this is only needed if you move things around.
# GEO_LAB_SITE_DIR=${REPO_DIR}

# Fill these in (see geo-lab/DEPLOYMENT.md). Leave blank to disable.
# TAVILY_API_KEY=
# GEMINI_API_KEY=
# PERPLEXITY_API_KEY=
# GITHUB_TOKEN=
EOF
  chmod 600 "$ENV_FILE"
else
  log "Keeping existing ${ENV_FILE}"
  if grep -q '^PORT=' "$ENV_FILE"; then
    sed -i "s|^PORT=.*|PORT=${PORT}|" "$ENV_FILE"
  else
    echo "PORT=${PORT}" >> "$ENV_FILE"
  fi
  grep -q '^GEO_LAB_DB=' "$ENV_FILE" || echo "GEO_LAB_DB=${DATA_DIR}/geo-lab.db" >> "$ENV_FILE"
fi
chown root:root "$ENV_FILE"
chmod 600 "$ENV_FILE"

# The checkout must be readable by the service user; the data dir writable.
chown -R "$APP_USER:$APP_USER" "$REPO_DIR" "$DATA_DIR"

# ── 7. Schema + build ──────────────────────────────────────────────────────
log "Applying the schema"
sudo -u "$APP_USER" env $(grep -v '^#' "$ENV_FILE" | grep -v '^$' | xargs -d '\n') \
  sh -c "cd ${APP_DIR} && npx --yes tsx scripts/migrate.ts"

log "Building the app"
sudo -u "$APP_USER" env $(grep -v '^#' "$ENV_FILE" | grep -v '^$' | xargs -d '\n') \
  sh -c "cd ${APP_DIR} && npm run build"

# ── 8. systemd: web service ────────────────────────────────────────────────
log "Installing systemd units"
cat > /etc/systemd/system/geo-lab.service <<EOF
[Unit]
Description=GEO Intelligence Lab (web)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=${APP_USER}
Group=${APP_USER}
WorkingDirectory=${APP_DIR}
EnvironmentFile=${ENV_FILE}
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
# Hardening: the lab only needs to write its own data directory.
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=${DATA_DIR} ${APP_DIR}/.next

[Install]
WantedBy=multi-user.target
EOF

# ── 9. systemd: daily autonomous run ───────────────────────────────────────
# The scheduler. No server, no browser, no OpenHands session — it calls the
# same orchestrator the dashboard buttons call.
cat > /etc/systemd/system/geo-lab-daily.service <<EOF
[Unit]
Description=GEO Intelligence Lab daily operations
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
User=${APP_USER}
Group=${APP_USER}
WorkingDirectory=${APP_DIR}
EnvironmentFile=${ENV_FILE}
ExecStart=/usr/bin/npm run job
TimeoutStartSec=3600
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=${DATA_DIR}
EOF

cat > /etc/systemd/system/geo-lab-daily.timer <<'EOF'
[Unit]
Description=GEO Intelligence Lab daily run at 06:00 local

[Timer]
# 06:00 every day including weekends, in the VM's zone (America/Los_Angeles,
# set above), so it survives the PST/PDT changeover.
OnCalendar=*-*-* 06:00:00
# If the VM was off or busy at 06:00, run as soon as it can.
Persistent=true
AccuracySec=1min

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now geo-lab.service
systemctl enable --now geo-lab-daily.timer

# ── 10. Verify ─────────────────────────────────────────────────────────────
log "Verifying the web service"
sleep 5
if curl -fsS -o /dev/null --max-time 10 "http://127.0.0.1:${PORT}/login"; then
  echo "  web service responding on port ${PORT}"
else
  echo "  WARNING: the web service did not answer on port ${PORT}."
  echo "  Check: journalctl -u geo-lab -n 50 --no-pager"
fi

log "Running the daily job once, now, to prove it works"
systemctl start geo-lab-daily.service || true
journalctl -u geo-lab-daily -n 20 --no-pager || true

systemctl list-timers geo-lab-daily.timer --no-pager || true

log "Done"
cat <<EOF

  Checkout   : ${REPO_DIR}
  App dir    : ${APP_DIR}
  Database   : ${DATA_DIR}/geo-lab.db
  Env file   : ${ENV_FILE}  (mode 600 — put your API keys here)
  Port       : ${PORT}  (localhost only)

  Next steps
    1. Add API keys to ${ENV_FILE}, then: systemctl restart geo-lab
    2. Reach the dashboard over an SSH tunnel from your own computer:
         ssh -N -L ${PORT}:127.0.0.1:${PORT} ubuntu@<vm-public-ip>
       then open http://localhost:${PORT}
       (or expose it properly with Cloudflare Tunnel — see geo-lab/DEPLOYMENT.md)
    3. Read the owner password printed by the first seed, sign in, change it,
       then delete geo-lab/data/owner-credentials.txt.
    4. Do NOT open port ${PORT} in the VCN security list. Reach it over the
       tunnel instead.

  Useful commands
    systemctl status geo-lab
    journalctl -u geo-lab -f
    systemctl start geo-lab-daily.service       # manual run
    journalctl -u geo-lab-daily -n 50 --no-pager
    systemctl list-timers geo-lab-daily.timer
EOF
