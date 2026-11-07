# Deploying the GEO Lab on Oracle Cloud Always Free

This is the walkthrough for putting the lab on a free Oracle VM: creating the
machine in the console, then letting `bootstrap.sh` do the install.

Free-tier limits quoted here come from Oracle's own documentation and were
checked on 2026-11-06. See `../../DEPLOYMENT.md` for the full comparison of
hosts and why Oracle was chosen.

## What you get, and what it costs

| Resource | Free allowance |
|---|---|
| AMD micro VMs | Up to **two** `VM.Standard.E2.1.Micro` |
| Arm VMs | Ampere A1, **1,500 OCPU-hours + 9,000 GB-hours/month** = **2 OCPU / 12 GB** |
| Block storage | **200 GB** total; **47 GB** minimum boot volume per instance |

Two things to know before you start:

- **Pick the Arm shape if you can.** 2 OCPU / 12 GB is far more headroom than a
  micro, and the lab runs on Arm without changes (its only database driver is
  Node's built-in `node:sqlite`; no native modules).
- **Oracle reclaims idle instances.** "Idle Always Free compute instances may be
  reclaimed by Oracle" when, over 7 days, 95th-percentile CPU is under 20% *and*
  network is under 20% (and, on A1 shapes, memory under 20%). A lab that runs for
  two minutes a day is exactly what that rule describes. Take the backup in step
  9 and be ready to rebuild.

## Step 1 — Create the instance

Sign in at <https://cloud.oracle.com> and pick your **home region** (a US West
region keeps the VM near the business). Then:

1. Open the hamburger menu → **Compute** → **Instances** → **Create instance**.
2. **Name**: `geo-lab`.
3. **Image**: Canonical **Ubuntu 24.04** (Arm build if you chose the Arm shape).
4. **Shape**: click **Change shape** →
   - **Ampere** → `VM.Standard.A1.Flex` → **2 OCPU**, **12 GB** (best), or
   - **AMD** → `VM.Standard.E2.1.Micro` (1 OCPU, 1 GB — tight but workable).
5. **Networking**: leave **Create new virtual cloud network** and
   **Create new public subnet** selected. Ensure **Assign a public IPv4 address**
   is **Yes**.
6. **Add SSH keys**: choose **Generate a key pair for me**, then click
   **Save private key**. You cannot get this file back — save it somewhere safe,
   e.g. `~/.ssh/oci_geo_lab`.
7. **Boot volume**: leave the default (47 GB is inside the free allowance).
8. Click **Create**.

If you get **"Out of host capacity"** for the Arm shape, that is normal for the
free tier — the Arm pool is popular. Try a different **availability domain**,
try again at a different time, or fall back to the AMD micro shape. It is not an
error in your account.

Once the instance shows **Running**, copy its **Public IP address**.

## Step 2 — Connect over SSH

From your own computer:

```bash
chmod 600 ~/.ssh/oci_geo_lab
ssh -i ~/.ssh/oci_geo_lab ubuntu@<PUBLIC_IP>
```

The default user on an Ubuntu image is `ubuntu`, not `root`.

## Step 3 — Run the bootstrap

On the VM:

```bash
curl -fsSLO https://raw.githubusercontent.com/straightflushplumbing03/-Up2datewebsiteseo/main/geo-lab/deploy/oracle/bootstrap.sh
sudo bash bootstrap.sh
```

It sets the timezone to `America/Los_Angeles`, installs Node 22, clones the
repository to `/opt/sfpl-repo`, builds the app, installs two systemd units, runs
the daily job once to prove it works, and prints a summary.

**It clones the whole repository on purpose.** The lab analyses the website by
walking the checkout, and the website lives at the repository root. Copying only
`geo-lab/` would make the crawler walk whatever directory happened to be its
parent and score unrelated files — `crawlRepo()` now refuses to run rather than
produce that nonsense.

Re-running the script is safe: it updates the checkout, rebuilds, and leaves the
database alone.

## Step 4 — Add your API keys

```bash
sudo nano /etc/geo-lab/geo-lab.env
sudo systemctl restart geo-lab
```

The file is root-owned, mode `600`, and already contains a generated
`GEO_LAB_RUN_TOKEN`. Uncomment and fill the keys you have; each is optional and
simply disables its feature when absent. See `../../DEPLOYMENT.md` for what each
one enables.

Never commit this file. It is not in the repository.

## Step 5 — Reach the dashboard

**Do not open port 12000 to the internet.** An SSH tunnel is simpler and safer:

```bash
# from your own computer
ssh -i ~/.ssh/oci_geo_lab -N -L 12000:127.0.0.1:12000 ubuntu@<PUBLIC_IP>
```

Leave that running and open <http://localhost:12000>.

To expose it properly on a hostname, use **Cloudflare Tunnel** — an outbound-only
connection, so no inbound ports and no TLS certificate to manage. Point it at
`http://127.0.0.1:12000`.

## Step 6 — First sign-in

The first seed creates the owner account and prints its generated password:

```bash
sudo journalctl -u geo-lab-daily -n 50 --no-pager | grep -i password
```

Sign in, change the password in **Settings**, then delete the credentials file:

```bash
sudo rm -f /opt/sfpl-repo/geo-lab/data/owner-credentials.txt
```

## Step 7 — Confirm the schedule

```bash
systemctl list-timers geo-lab-daily.timer
```

It should show the next run at **06:00** local, daily. The timer uses
`OnCalendar=*-*-* 06:00:00` in the VM's own timezone, so it stays at 06:00 local
across the PST/PDT changeover. `Persistent=true` means a run missed while the VM
was off happens as soon as it can.

## Step 8 — Confirm it is doing real work

```bash
sudo systemctl start geo-lab-daily.service
sudo journalctl -u geo-lab-daily -n 50 --no-pager
```

A healthy run names each agent and reports what it did. If an agent reports
`failed`, the message says why — most often a missing API key.

## Step 9 — Back up the database

Everything the lab knows is one SQLite file. Oracle can reclaim an idle instance,
so keep a copy off the VM:

```bash
# on the VM — install the cron job
sudo tee /etc/cron.d/geo-lab-backup >/dev/null <<'EOF'
30 3 * * * root sqlite3 /var/lib/geo-lab/geo-lab.db ".backup /var/lib/geo-lab/backup-$(date +\%F).db" && find /var/lib/geo-lab -name 'backup-*.db' -mtime +14 -delete
EOF
```

Then copy `/var/lib/geo-lab/backup-*.db` somewhere off the machine now and then
(`scp`). `sqlite3` comes from `apt install sqlite3`.

Note that the database holds the owner's password hash and session tokens, so
treat a backup as a credential file: keep it private, and never commit it.

## Step 10 — Keep it updated

```bash
sudo bash /opt/sfpl-repo/geo-lab/deploy/oracle/bootstrap.sh
```

Pulls the latest `main`, reinstalls, rebuilds, restarts. Safe to re-run.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `Out of host capacity` | Normal on the free Arm pool. Change availability domain, retry later, or use the AMD micro shape. |
| Bootstrap stops at `no index.html at /opt/sfpl-repo` | The branch does not have the website at its root. Check `BRANCH=...`. |
| `GEO Lab: no index.html in the site directory ...` | The checkout is not where the lab expects. Set `GEO_LAB_SITE_DIR` in the env file. |
| Web service does not answer | `sudo journalctl -u geo-lab -n 50 --no-pager`. Usually a missing env var. |
| Daily job reports an agent `failed` | Read the message; it names the missing key or the unreachable host. |
| `systemctl` says the unit is not found | `sudo systemctl daemon-reload` then retry. |

## What is not automated yet

The bootstrap does not set up TLS, a domain, or monitoring, and it does not
configure the optional integrations (Search Console, GA4, Business Profile).
Those need credentials only you can authorise. The lab reports them as
`disconnected` rather than pretending they work.
