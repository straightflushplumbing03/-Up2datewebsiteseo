// Lead tracking for GA4 (G-DFS6B1LV4P). Sends no personal data: only which page the lead came from
// and the visitor's answer to the optional fixed-list "How did you hear about us?" menu. Form leads also
// carry visit_source and landing_page (see firstTouch below) so each Formspree email says where the visit began.
// Events: phone_call_click (tap on any tel: link), generate_lead (contact form sent to Formspree),
// form_submit_confirmed (thank-you page reached after Formspree redirect).
(function () {
  // Count leads only on the real site. The same files are also served from a Cloudflare
  // workers.dev preview host; test taps and form sends there must not show up as leads.
  var LIVE = /^(www\.)?straightflushplumbingoc\.com$/i.test(location.hostname);
  // lead_page is the page's canonical path, so one page reports as one row. The same page is
  // reached as /cities/x, /cities/x.html, /x.html (root stub) or /index.html, and GA4 would
  // otherwise split its leads across those spellings. Pages without a canonical (404) keep the raw path.
  function leadPage() {
    var c = document.querySelector('link[rel="canonical"]');
    if (c && c.href) {
      var m = /^https?:\/\/(www\.)?straightflushplumbingoc\.com(\/[^?#]*)/i.exec(c.href);
      if (m) return m[2];
    }
    return location.pathname;
  }
  // Where this visit started, for the lead email. GA4 already knows the session source, but the
  // owner reads leads in the Formspree email, and GA4 can't tie one email to one visit. On the
  // first page of a visit we keep the source (utm_source, else the referring site's host name,
  // else "direct") and the landing page in sessionStorage, so a visitor who arrives from
  // chatgpt.com on a city page and sends the form from /contact.html still shows "chatgpt.com".
  // Host names and our own page paths only: no personal data, no query strings, nothing stored after the tab closes.
  var VISIT_KEY = 'sf_visit';
  function clean(v) { return String(v || '').toLowerCase().replace(/[^a-z0-9.\-_]/g, '').slice(0, 60); }
  function firstTouch() {
    var src = '';
    try { src = clean(new URLSearchParams(location.search).get('utm_source')); } catch (err) { src = ''; }
    if (!src && document.referrer) {
      try {
        var h = new URL(document.referrer).hostname.replace(/^www\./i, '');
        if (!/(^|\.)straightflushplumbingoc\.com$/i.test(h)) src = clean(h);
      } catch (err) { src = ''; }
    }
    return { s: src || 'direct', l: leadPage() };
  }
  function visit() {
    var v = null;
    try { v = JSON.parse(sessionStorage.getItem(VISIT_KEY) || 'null'); } catch (err) { v = null; }
    if (!v || !v.s || !v.l) {
      v = firstTouch();
      try { sessionStorage.setItem(VISIT_KEY, JSON.stringify(v)); } catch (err) { /* private mode: keep this page's value */ }
    }
    return v;
  }
  var VISIT = visit();
  function stampForm(f) {
    [['visit_source', VISIT.s], ['landing_page', VISIT.l]].forEach(function (pair) {
      var el = f.elements ? f.elements[pair[0]] : null;
      if (!el) {
        el = document.createElement('input');
        el.type = 'hidden';
        el.name = pair[0];
        f.appendChild(el);
      }
      el.value = pair[1];
    });
  }
  function track(name, params) {
    if (LIVE && typeof window.gtag === 'function') {
      window.gtag('event', name, Object.assign({ transport_type: 'beacon', lead_page: leadPage() }, params || {}));
    }
  }
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="tel:"]') : null;
    if (a) track('phone_call_click', { link_text: (a.textContent || '').trim().slice(0, 60) });
  });
  // Send the form in the background and land on our own thank-you page.
  // (Formspree ignored the redirect field and showed its own page, so visitors left the site
  // and form_submit_confirmed never fired.) Any failure falls back to a normal form post.
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (e.defaultPrevented || !f || !f.action || f.action.indexOf('formspree.io') === -1) return;
    // Honeypot: real visitors never see the hidden _gotcha field, so a filled one means a bot.
    // Formspree silently drops those, so they must not be counted as leads in GA4 either.
    // Let the plain post go through untouched so Formspree's own spam handling still applies.
    if (f.elements && f.elements._gotcha && f.elements._gotcha.value) return;
    // heard_about is the visitor's own answer to the optional "How did you hear about us?" menu
    // (a fixed list, no personal data). It is the only way to see AI-assistant leads, which GA4 logs as direct.
    var heard = f.elements && f.elements.heard_about ? f.elements.heard_about.value : '';
    stampForm(f);
    track('generate_lead', { lead_source: 'website_form', heard_about: heard || 'not_answered', visit_source: VISIT.s });
    if (!window.fetch || !window.FormData) return;
    e.preventDefault();
    var btn = f.querySelector('[type="submit"]');
    if (btn) { btn.disabled = true; btn.setAttribute('aria-busy', 'true'); }
    fetch(f.action, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } })
      .then(function (r) { if (r.ok) { location.href = '/thank-you.html'; } else { f.submit(); } })
      .catch(function () { f.submit(); });
  });
  if (/^\/thank-you(\.html)?$/.test(location.pathname)) track('form_submit_confirmed');
})();
