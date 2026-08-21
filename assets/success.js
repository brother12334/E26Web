/* ============================================================================
   ELEMENT 26 — post-purchase page

   ────────────────────────────────────────────────────────────────────────
   SET `DOWNLOAD_URL` BELOW. See SETUP-STRIPE.md for where to host the file.
   ────────────────────────────────────────────────────────────────────────

   READ THIS BEFORE TRUSTING IT:

   This page is NOT a paywall. It cannot be one. Verifying that a Stripe
   checkout actually happened means calling Stripe with your SECRET key, and
   this site is static — any key shipped here is public the moment it deploys.
   So the check below reads `session_id` from the URL and confirms it merely
   *looks* like a Stripe session id. Anyone who types one can reach the
   download.

   That is a deliberate trade, not an oversight. It keeps people who wander
   onto the page from stumbling into a free copy, while staying honest that
   the file itself is the product and copies of it cannot be recalled.

   If you later want a real gate, SETUP-STRIPE.md has the ~20-line serverless
   function that verifies the session properly and hands back a signed,
   expiring link. Nothing on this page needs to change except DOWNLOAD_URL.
   ========================================================================= */
(function () {
  "use strict";

  var DOWNLOAD_URL = "";   // ← the hosted app file, e.g. an R2/S3 link
  var FILE_NAME    = "element-26.html";

  var $ = function (s) { return document.querySelector(s); };

  var paid   = $("#paid"),
      unpaid = $("#unpaid"),
      dl     = $("#download"),
      dlNote = $("#dlNote"),
      receipt= $("#receipt");

  if (!paid || !unpaid) return;

  var params  = new URLSearchParams(location.search);
  var session = params.get("session_id") || "";

  // Stripe checkout session ids look like cs_test_… / cs_live_…
  var looksLikeSession = /^cs_(test|live)_[A-Za-z0-9]+$/.test(session);

  if (!looksLikeSession) {
    unpaid.hidden = false;
    return;
  }

  paid.hidden = false;

  if (DOWNLOAD_URL) {
    dl.setAttribute("href", DOWNLOAD_URL);
    dl.setAttribute("download", FILE_NAME);
  } else {
    // Better an obviously unfinished button than one that 404s a paying customer.
    dl.classList.add("is-disabled");
    dl.setAttribute("aria-disabled", "true");
    dl.removeAttribute("download");
    dl.addEventListener("click", function (e) { e.preventDefault(); });
    dl.querySelector("span").textContent = "Download link not set";
    dlNote.textContent = "Set DOWNLOAD_URL in assets/success.js.";
  }

  // The session id doubles as the customer's reference if they need support.
  receipt.textContent = "Reference: " + session;
})();
