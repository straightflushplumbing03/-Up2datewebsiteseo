/**
 * Straight Flush Plumbing — Base44 Page Visit Tracker
 * Sends a lightweight pageview event to the Cloudflare Worker,
 * which forwards it to Base44 as a local SEO signal.
 *
 * Included on: city pages, service pages
 * Fires once per page load, non-blocking (fire-and-forget).
 */
(function () {
  'use strict';

  var API_ENDPOINT = 'https://straightflushplumbingoc.com/api/pageview';

  /**
   * Extract city name from the URL path.
   * e.g.  /cities/laguna-niguel  →  "laguna-niguel"
   */
  function detectCity() {
    var match = window.location.pathname.match(/\/cities\/([^\/]+)/);
    return match ? match[1].replace(/-/g, ' ') : '';
  }

  /**
   * Extract service name from the URL path.
   * e.g.  /services/slab-leak-detection  →  "slab-leak-detection"
   */
  function detectService() {
    var match = window.location.pathname.match(/\/services\/([^\/]+)/);
    return match ? match[1].replace(/-/g, ' ') : '';
  }

  function sendPageview() {
    var payload = {
      page_url: window.location.href,
      city: detectCity(),
      service: detectService(),
      referrer: document.referrer || ''
    };

    // Use sendBeacon when available (non-blocking, survives page unload)
    if (navigator.sendBeacon) {
      var blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(API_ENDPOINT, blob);
    } else {
      // Fallback: fire-and-forget fetch (older browsers)
      fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(function () {});
    }
  }

  // Wait for page to be interactive before firing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sendPageview);
  } else {
    sendPageview();
  }
})();
