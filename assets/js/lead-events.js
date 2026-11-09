// Lead tracking for GA4 (G-DFS6B1LV4P). Sends no personal data: only which page the lead came from
// and the visitor's answer to the optional fixed-list "How did you hear about us?" menu.
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
    track('generate_lead', { lead_source: 'website_form', heard_about: heard || 'not_answered' });
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
