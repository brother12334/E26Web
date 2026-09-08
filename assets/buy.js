/* ============================================================================
   ELEMENT 26 — purchase page

   ────────────────────────────────────────────────────────────────────────
   ONE THING LEFT TO SET: CHECKOUT.url, directly below.
   ────────────────────────────────────────────────────────────────────────

   Element 26 is a single one-time purchase: pay once, keep it, one person.
   There is no billing period and no tier, so there is no switch and no
   subscription branch here — the earlier version carried both and they were
   describing a product that no longer exists.

   `url` is still empty. While it is, the button renders visibly disabled
   instead of live-but-dead, because a checkout that looks clickable and goes
   nowhere costs a sale in a way an obviously inert one does not.
   ========================================================================= */
(function () {
  "use strict";

  var CHECKOUT = {
    currency: "$",
    price: 15,            // one payment, forever, single user
    // Your Stripe Payment Link. Create it in the Stripe Dashboard and set the
    // post-payment redirect to your success page — see SETUP-STRIPE.md.
    url: ""               // e.g. "https://buy.stripe.com/xxxxxxxx"  ← set this
  };

  // ----------------------------------------------------------------------

  var $ = function (s) { return document.querySelector(s); };

  var amount = $("#amount"),
      cur    = $("#cur"),
      billed = $("#billed"),
      btn    = $("#checkout");

  if (!btn) return;

  var priced = typeof CHECKOUT.price === "number" && CHECKOUT.price > 0;
  var linked = !!CHECKOUT.url;

  document.body.classList.toggle("price-unset", !priced);

  if (priced) {
    cur.textContent = CHECKOUT.currency;
    amount.textContent = String(CHECKOUT.price);
    billed.textContent = "One payment. Yours forever, for one person.";
  } else {
    cur.textContent = "";
    amount.textContent = "Price not set";
    billed.textContent = "Set the price in assets/buy.js to enable checkout.";
  }

  var ready = priced && linked;
  btn.setAttribute("href", ready ? CHECKOUT.url : "#");
  btn.classList.toggle("is-disabled", !ready);
  btn.setAttribute("aria-disabled", String(!ready));
  btn.querySelector("span").textContent =
    ready ? "Get Element 26" : (priced ? "Checkout link not set" : "Get Element 26");

  btn.addEventListener("click", function (e) {
    if (btn.classList.contains("is-disabled")) e.preventDefault();
  });
})();
