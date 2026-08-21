/* ============================================================================
   ELEMENT 26 — purchase page

   ────────────────────────────────────────────────────────────────────────
   EVERYTHING YOU NEED TO EDIT IS IN THE `PRICING` BLOCK DIRECTLY BELOW.
   Set the two prices and the two checkout URLs and the page is live. Nothing
   further down needs touching.
   ────────────────────────────────────────────────────────────────────────

   The page ships with the prices deliberately unset: `null` renders a visible
   "price not set" state rather than a plausible-looking number, because a
   placeholder that looks like a real price is the kind that reaches production
   unnoticed. The checkout button stays disabled until both a price and a URL
   exist for the selected period, so it can never take somebody to a dead link.
   ========================================================================= */
(function () {
  "use strict";

  var PRICING = {
    currency: "$",

    monthly: {
      price: null,          // e.g. 6      — your monthly price
      url:   ""             // e.g. "https://buy.stripe.com/xxxxxxxx"
    },

    yearly: {
      price: null,          // e.g. 48     — the TOTAL charged once per year
      url:   ""             // e.g. "https://buy.stripe.com/yyyyyyyy"
    }
  };

  /* ---- one-time purchase instead of a subscription? --------------------
     Set ONE_TIME to true, fill in monthly.price / monthly.url with the
     one-off amount and link, and the period switch removes itself. */
  var ONE_TIME = false;

  // ----------------------------------------------------------------------

  var $ = function (s) { return document.querySelector(s); };

  var els = {
    amount:  $("#amount"),
    cur:     $("#cur"),
    per:     $("#per"),
    billed:  $("#billed"),
    checkout:$("#checkout"),
    saveTag: $("#saveTag"),
    period:  document.querySelector(".period")
  };

  if (!els.checkout) return;

  var current = "monthly";

  // Yearly framed as a per-month figure, which is the honest comparison to a
  // monthly plan; the amount actually charged is spelled out underneath.
  function perMonth(total) { return Math.round((total / 12) * 100) / 100; }

  function money(n) {
    return PRICING.currency + (Number.isInteger(n) ? n : n.toFixed(2));
  }

  function savingPct() {
    var m = PRICING.monthly.price, y = PRICING.yearly.price;
    if (!m || !y) return null;
    var pct = Math.round((1 - (y / (m * 12))) * 100);
    return pct > 0 ? pct : null;
  }

  function render() {
    var plan = PRICING[current];
    var priced = typeof plan.price === "number" && plan.price > 0;
    var linked = !!plan.url;

    document.body.classList.toggle("price-unset", !priced);

    if (!priced) {
      els.cur.textContent = "";
      els.amount.textContent = "Price not set";
      els.per.textContent = "";
      els.billed.textContent = "Set the price in assets/buy.js to enable checkout.";
    } else if (ONE_TIME) {
      els.cur.textContent = PRICING.currency;
      els.amount.textContent = String(plan.price);
      els.per.textContent = "once";
      els.billed.textContent = "One payment. Yours to keep.";
    } else if (current === "yearly") {
      els.cur.textContent = PRICING.currency;
      els.amount.textContent = String(perMonth(plan.price));
      els.per.textContent = "per month";
      els.billed.textContent = "Billed " + money(plan.price) + " once a year. Cancel any time.";
    } else {
      els.cur.textContent = PRICING.currency;
      els.amount.textContent = String(plan.price);
      els.per.textContent = "per month";
      els.billed.textContent = "Billed monthly. Cancel any time.";
    }

    // Never hand somebody a checkout button that goes nowhere.
    var ready = priced && linked;
    els.checkout.setAttribute("href", ready ? plan.url : "#");
    els.checkout.classList.toggle("is-disabled", !ready);
    els.checkout.setAttribute("aria-disabled", String(!ready));
    if (!ready) {
      els.checkout.querySelector("span").textContent =
        priced ? "Checkout link not set" : "Start training";
    } else {
      els.checkout.querySelector("span").textContent = "Start training";
    }
  }

  // A saving badge is only truthful once both prices exist.
  if (els.saveTag) {
    var pct = savingPct();
    els.saveTag.textContent = pct ? "save " + pct + "%" : "";
  }

  if (ONE_TIME && els.period) {
    els.period.remove();
  } else if (els.period) {
    els.period.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-period]");
      if (!btn) return;
      current = btn.getAttribute("data-period");
      els.period.querySelectorAll("button").forEach(function (b) {
        b.classList.toggle("on", b === btn);
      });
      render();
    });
  }

  els.checkout.addEventListener("click", function (e) {
    if (els.checkout.classList.contains("is-disabled")) e.preventDefault();
  });

  render();
})();
