# Cloudflare Worker — Base44 Integration Setup

This Worker acts as a secure API proxy between your static website and Base44.

---

## Deploy in 5 Minutes

### 1. Create the Worker in Cloudflare

1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Go to **Workers & Pages** → **Create** → **Create Worker**
3. Name it `sfp-base44-proxy` (or anything you like)
4. Click **Deploy**, then click **Edit Code**
5. Delete all default code and paste the contents of `worker.js`
6. Click **Deploy**

### 2. Set Environment Variables / Secrets

In your Worker → **Settings** → **Variables**:

| Variable | Type | Value |
|---|---|---|
| `BASE44_APP_ID` | Plain text | `6a1b62b4bad1fccd54f96e77` |
| `BASE44_API_KEY` | **Secret** (encrypted) | Your Base44 API key |
| `GITHUB_TOKEN` | **Secret** (encrypted) | A GitHub fine-grained PAT |
| `GITHUB_REPO` | Plain text | `straightflushplumbing03/-Up2datewebsiteseo` |

> ⚠️ **Always store the API key and tokens as Secrets**, never as plain text variables.

### 3. Add the Custom Route (so /api/* hits your Worker)

In Cloudflare → **Your Domain** → **Workers Routes** → **Add Route**:

- Route: `straightflushplumbingoc.com/api/*`
- Worker: `sfp-base44-proxy`

This makes `https://straightflushplumbingoc.com/api/lead` call your Worker.

### 4. Create the GitHub Fine-Grained PAT (for content sync)

1. Go to [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new)
2. Set **Repository access** → only `straightflushplumbing03/-Up2datewebsiteseo`
3. Grant **Contents: Read and Write** permission
4. Generate and copy the token → paste it as `GITHUB_TOKEN` secret in your Worker

### 5. Configure Base44 Webhook (for content sync)

In your Base44 app's settings, add a webhook:
- **URL:** `https://straightflushplumbingoc.com/api/content`
- **Event:** content_generated (or whatever Base44 calls it)
- **Payload format:** `{ "path": "cities/new-city.html", "content": "<html>...</html>" }`

---

## What Each Route Does

| Route | Direction | Purpose |
|---|---|---|
| `POST /api/lead` | Website → Base44 | Contact form submissions become leads in your Base44 app |
| `POST /api/pageview` | Website → Base44 | City/service page visits sent as SEO signals |
| `POST /api/content` | Base44 → GitHub | AI-generated pages automatically committed to your repo |

---

## Re-generating Your API Key

Your previous Base44 API key was shared in a chat message. You should regenerate it:

1. Log in to Base44 → **Settings** → **API Keys**
2. Delete the old key
3. Create a new key
4. Update the `BASE44_API_KEY` secret in your Cloudflare Worker
