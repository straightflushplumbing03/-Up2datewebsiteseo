/**
 * Straight Flush Plumbing — Cloudflare Worker
 * Secure proxy between the website and Base44 API.
 *
 * Deploy this file as a Cloudflare Worker and set the following
 * Environment Variables / Secrets in your Worker settings:
 *   BASE44_APP_ID   — your Base44 app ID
 *   BASE44_API_KEY  — your Base44 API key  (set as a Secret, not plain text)
 *   GITHUB_TOKEN    — a GitHub fine-grained PAT with "Contents: write" scope
 *   GITHUB_REPO     — e.g.  straightflushplumbing03/-Up2datewebsiteseo
 *
 * Routes handled:
 *   POST /api/lead        — contact form lead → Base44
 *   POST /api/pageview    — page visit event  → Base44
 *   POST /api/content     — Base44 content    → GitHub Actions workflow_dispatch
 */

const ALLOWED_ORIGIN = 'https://straightflushplumbingoc.com';

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return corsPreflightResponse();
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (request.method === 'POST' && path === '/api/lead') {
        return await handleLead(request, env);
      }
      if (request.method === 'POST' && path === '/api/pageview') {
        return await handlePageview(request, env);
      }
      if (request.method === 'POST' && path === '/api/content') {
        return await handleContentWebhook(request, env);
      }
      return jsonResponse({ error: 'Not found' }, 404);
    } catch (err) {
      return jsonResponse({ error: 'Internal server error', detail: err.message }, 500);
    }
  },
};

// ---------------------------------------------------------------------------
// Phase 1 — Lead capture from contact form
// ---------------------------------------------------------------------------
async function handleLead(request, env) {
  const body = await request.json();
  const { name, phone, city, details, service, source_url } = body;

  if (!name || !phone) {
    return jsonResponse({ error: 'name and phone are required' }, 400);
  }

  const base44Payload = {
    entity: 'Lead',
    data: {
      name: sanitize(name),
      phone: sanitize(phone),
      city: sanitize(city || ''),
      details: sanitize(details || ''),
      service: sanitize(service || ''),
      source_url: sanitize(source_url || ''),
      submitted_at: new Date().toISOString(),
      channel: 'website_contact_form',
    },
  };

  const result = await base44Request(env, 'entities/create', base44Payload);
  return jsonResponse({ success: true, id: result?.id }, 200);
}

// ---------------------------------------------------------------------------
// Phase 3 — Page visit tracking (local SEO signals)
// ---------------------------------------------------------------------------
async function handlePageview(request, env) {
  const body = await request.json();
  const { page_url, city, service, referrer } = body;

  const base44Payload = {
    entity: 'PageView',
    data: {
      page_url: sanitize(page_url || ''),
      city: sanitize(city || ''),
      service: sanitize(service || ''),
      referrer: sanitize(referrer || ''),
      visited_at: new Date().toISOString(),
    },
  };

  await base44Request(env, 'entities/create', base44Payload);
  return jsonResponse({ success: true }, 200);
}

// ---------------------------------------------------------------------------
// Phase 4 — Base44 → GitHub content webhook
// ---------------------------------------------------------------------------
async function handleContentWebhook(request, env) {
  const body = await request.json();

  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
    return jsonResponse({ error: 'GitHub integration not configured' }, 503);
  }

  const ghResponse = await fetch(
    `https://api.github.com/repos/${env.GITHUB_REPO}/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `token ${env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'StraightFlushPlumbing-Worker/1.0',
      },
      body: JSON.stringify({
        event_type: 'base44_content_sync',
        client_payload: body,
      }),
    }
  );

  if (!ghResponse.ok) {
    const err = await ghResponse.text();
    return jsonResponse({ error: 'GitHub dispatch failed', detail: err }, 502);
  }

  return jsonResponse({ success: true }, 200);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function base44Request(env, endpoint, payload) {
  const response = await fetch(
    `https://api.base44.com/apps/${env.BASE44_APP_ID}/${endpoint}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        api_key: env.BASE44_API_KEY,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Base44 API error ${response.status}: ${text}`);
  }

  return response.json().catch(() => ({}));
}

function sanitize(str) {
  // Encode all angle brackets to HTML entities so no markup can survive.
  return String(str)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim()
    .slice(0, 2000);
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function corsPreflightResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
