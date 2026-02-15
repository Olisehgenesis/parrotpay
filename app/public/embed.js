/**
 * Tempo / Parrot Pay - Embed script
 * Add to any site: <script src="https://YOUR_DOMAIN/embed.js" data-merchant="PAYMENT_LINK_SLUG"></script>
 * Opens /pay/{slug} when the button is clicked.
 */
(function () {
  'use strict';

  var script = document.currentScript;
  if (!script) return;

  var merchant = script.getAttribute('data-merchant') || script.getAttribute('data-slug');
  if (!merchant) {
    console.warn('[Tempo] Missing data-merchant or data-slug. Use: data-merchant="your-payment-link-slug"');
    return;
  }

  // Base URL: from data-base, or from script src (e.g. https://yoursite.com/embed.js -> https://yoursite.com)
  var base = script.getAttribute('data-base');
  if (!base && script.src) {
    base = script.src.substring(0, script.src.lastIndexOf('/'));
  }
  if (!base) base = window.location.origin;
  var payUrl = base.replace(/\/$/, '') + '/pay/' + encodeURIComponent(merchant);
  var openInNewTab = script.getAttribute('data-target') !== 'self';
  var buttonText = script.getAttribute('data-button') || 'Pay with Tempo';

  var style = document.createElement('style');
  style.textContent =
    '.tempo-embed-btn{display:inline-flex;align-items:center;justify-content:center;padding:12px 24px;background:#635bff;color:#fff!important;font-family:system-ui,-apple-system,sans-serif;font-size:16px;font-weight:600;border:none;cursor:pointer;text-decoration:none}.tempo-embed-btn:hover{background:#5851ea}';
  document.head.appendChild(style);

  var btn = document.createElement(openInNewTab ? 'button' : 'a');
  btn.className = 'tempo-embed-btn';
  btn.textContent = buttonText;
  if (openInNewTab) {
    btn.onclick = function () {
      window.open(payUrl, '_blank', 'noopener,noreferrer');
    };
  } else {
    btn.href = payUrl;
  }

  var container = script.getAttribute('data-container');
  if (container) {
    var el = document.querySelector(container);
    if (el) {
      el.appendChild(btn);
      return;
    }
  }

  script.parentNode.insertBefore(btn, script.nextSibling);
})();
