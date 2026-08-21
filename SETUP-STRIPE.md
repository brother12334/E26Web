# Selling Element 26 with Stripe

$15, paid once, delivered as a file. This is everything needed to go live.

There are exactly **two values to fill in**:

| Value | File | What it is |
| --- | --- | --- |
| `CHECKOUT.url` | `assets/buy.js` | Your Stripe Payment Link |
| `DOWNLOAD_URL` | `assets/success.js` | Where the app file is hosted |

---

## ⚠️ Read this first: do not put the app file in this repo

**`brother12334/E26Web` is a public repository.** Anything committed here is
downloadable by anyone, with or without paying. Committing `element-26.html`
would hand away the product.

The file has to live somewhere else. Good options, cheapest first:

- **Cloudflare R2** — free egress, generous free tier. Upload the file, give it
  a long random object name, expose it on a public bucket URL.
- **Amazon S3 / Backblaze B2** — same idea.
- **A second, private repo with a release asset** — works, but the URL is
  guessable-ish and expires oddly. Fine to start.

Use a long random filename either way, e.g.
`element-26-8f3a9c21b7e64d05.html`. That is not security, but it stops the URL
being guessed or crawled.

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

## 2. Host the file and wire the download

Upload the app file somewhere from the list above, then put its URL in
`DOWNLOAD_URL` in `assets/success.js`.

Until it is set, the download button renders visibly disabled rather than
404-ing somebody who has just paid.

## 3. Test before you sell

Use Stripe **test mode**: switch the dashboard toggle, make a test Payment
Link, and pay with card `4242 4242 4242 4242`, any future expiry, any CVC.
Confirm you land on `success.html` and the file downloads. Then repeat the
setup in live mode — **test and live payment links are different URLs.**

---

## What this setup does and does not do

**It does:** take payment, redirect to a download, and keep casual visitors
away from the file.

**It does not gate the download.** `success.html` checks only that the URL
carries something *shaped like* a Stripe session id. It cannot do better:
verifying a session for real means calling Stripe with your **secret key**, and
this site is static — any key deployed here is public immediately. Never put
`sk_live_…` in this repo.

So the realistic threat is a buyer sharing the download URL, not a stranger
finding it. At $15 that is usually a fine trade, and it is the same trade
every "pay once, download the file" product makes.

---

## Optional: a real gate, when you want one

If sharing becomes a problem, put a serverless function in front of the
download. Free tier on Cloudflare Workers, Vercel or Netlify. The whole thing:

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

  // Return a short-lived signed URL (R2/S3), not the permanent object URL.
  return Response.json({ url: await signDownloadUrl({ expiresIn: 900 }) });
};
```

Then in `assets/success.js`, replace the `looksLikeSession` check with a
`fetch()` to that endpoint and use the `url` it returns. Nothing else on the
page changes.

The secret key lives in the function's environment variables — never in this
repository.
