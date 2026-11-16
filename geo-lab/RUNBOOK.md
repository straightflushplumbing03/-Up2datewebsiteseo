# Runbook

Any agent or person can run the lab with Node 22 and npm. No vendor CLI is required.

```bash
cd geo-lab
npm ci
npm test
npx tsc --noEmit
npm run build
GEO_LAB_OWNER_PASSWORD='choose-one' npm run seed
npm run dev          # http://localhost:12000
```

Daily job, no paid API calls:

```bash
npm run job
```

Add `--visibility` only when a provider key is set. That spends the provider's quota.

Backup and restore:

```bash
npm run backup -- /var/lib/geo-lab/backup.db
npm run restore -- /var/lib/geo-lab/backup.db /var/lib/geo-lab/restored.db
```

Restore never overwrites the file `GEO_LAB_DB` points at. Point `GEO_LAB_DB` at the new file and restart.

Sign in at `/login`. The seeded owner is `lance@straightflushplumbingoc.com` unless `GEO_LAB_OWNER_EMAIL` is set. Change the password and delete `data/owner-credentials.txt`.

The public URL does not exist until the owner creates a VM and a tunnel for `geo-lab.straightflushplumbingoc.com`. Steps and the exact token scopes are in `DEPLOYMENT.md`. Do not attach the lab to the `up2datewebsiteseo` worker.
