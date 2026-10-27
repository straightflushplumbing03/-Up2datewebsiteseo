// Lead tracking for GA4 (G-DFS6B1LV4P). Sends no personal data: only which page the lead came from.
// Events: phone_call_click (tap on any tel: link), generate_lead (contact form sent to Formspree),
// form_submit_confirmed (thank-you page reached after Formspree redirect).
(function () {
  function track(name, params) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, Object.assign({ transport_type: 'beacon', lead_page: location.pathname }, params || {}));
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
    track('generate_lead', { lead_source: 'website_form' });
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
