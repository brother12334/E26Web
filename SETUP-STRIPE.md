# Selling Element 26 with Stripe

$15, paid once. This is everything needed to go live.

> **Delivery model changed.** Element 26 is now an installable PWA (service
> worker, manifest, icons, and a Cloudflare Worker for sync and plan import),
> not a lone HTML file. The pages now send buyers to the app rather than to a
> download. The gating note further down applies either way.

There are exactly **two values to fill in**:

| Value | File | What it is |
| --- | --- | --- |
| `CHECKOUT.url` | `assets/buy.js` | Your Stripe Payment Link |
| `APP_URL` | `assets/success.js` | Where the app itself is served |

---

## ⚠️ Read this first: the app is currently public

`brother12334/ShowcaseE26` is a **public repository**, and it holds the whole
app — `index.html`, the service worker, the manifest and the icons. Anyone who
finds it can clone and run Element 26 without paying, today.

That is a product decision, not a bug, and there are only three honest ways
forward:

1. **Make the app repo private** and serve it from a host that isn't a public
   git remote. GitHub Pages can only publish a private repo on a paid plan;
   Cloudflare Pages, Netlify and Vercel all publish from a private repo free.
2. **Leave it public and sell convenience** — a hosted, always-updated,
   installable copy plus support. Plenty of open products are sold this way,
   but the price has to be framed as supporting the work rather than as buying
   access, or buyers who find the repo will feel misled.
3. **Leave it public and treat the $15 as voluntary.** Same as above, stated
   plainly.

This site's copy currently implies option 1. Pick one before switching Stripe
to live mode.

Note that `brother12334/E26Web` — this repo, the marketing site — is public
too, which is fine: nothing here is the product.

---

## 1. Create the product and Payment Link

In the Stripe Dashboard:

1. **Product catalogue → Add product.** Name it *Element 26*, one-time price
   **$15.00**.
2. **Payment links → New.** Select the product.
3. Under **After payment**, choose **Redirect customers to your website** and
   enter:

   ```
   https://YOUR-DOMAIN/success.html?session_id={CHECKOUT_SESSION_ID}
   ```

   `{CHECKOUT_SESSION_ID}` is a literal Stripe template — type it exactly,
   braces included. Stripe substitutes the real id on redirect, and
   `success.html` reads it back out.

4. Copy the payment link (`https://buy.stripe.com/…`) into `CHECKOUT.url` in
   `assets/buy.js`.

## 2. Point the success page at the app

Put the URL the app is served from into `APP_URL` in `assets/success.js`.

Until it is set, the button renders visibly disabled rather than 404-ing
somebody who has just paid.

## 3. Test before you sell

Use Stripe **test mode**: switch the dashboard toggle, make a test Payment
Link, and pay with card `4242 4242 4242 4242`, any future expiry, any CVC.
Confirm you land on `success.html` and the button opens the app. Then repeat the
setup in live mode — **test and live payment links are different URLs.**

---

## What this setup does and does not do

**It does:** take payment and send the buyer straight into the app.

**It does not gate access.** `success.html` checks only that the URL carries
something *shaped like* a Stripe session id. It cannot do better: verifying a
session for real means calling Stripe with your **secret key**, and this site is
static — any key deployed here is public immediately. Never put `sk_live_…` in
this repo.

And while the app repo stays public, the gate is moot regardless: the app can
be had from GitHub. Fix that first if access is meant to be paid-for.

---

## Optional: a real gate, when you want one

Once the app is served from somewhere you control, put a serverless function in
front of it. Free tier on Cloudflare Workers, Vercel or Netlify. The whole thing:

```js
// POST { session_id } -> { url } ; deploy with STRIPE_SECRET_KEY set
export default async (req) => {
  const { session_id } = await req.json();

  const r = await fetch(
    "https://api.stripe.com/v1/checkout/sessions/" + encodeURIComponent(session_id),
    { headers: { Authorization: "Bearer " + process.env.STRIPE_SECRET_KEY } }
  );
  if (!r.ok) return new Response("not found", { status: 404 });

  const session = await r.json();
  if (session.payment_status !== "paid") {
    return new Response("unpaid", { status: 402 });
  }

  // Hand back a short-lived signed URL, not the permanent one.
  return Response.json({ url: await signAppUrl({ expiresIn: 900 }) });
};
```

Then in `assets/success.js`, replace the `looksLikeSession` check with a
`fetch()` to that endpoint and use the `url` it returns. Nothing else on the
page changes.

The secret key lives in the function's environment variables — never in this
repository.
