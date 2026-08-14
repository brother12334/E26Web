 Element 26 — promotional site

A static one-page marketing site for Element 26, the training log that reads what
you lift and tells you what to change.

## Running it

No build step, no dependencies. Open `index.html`, or serve the folder:

```sh
python3 -m http.server 8000
```

## Files

| Path                 | What it is                                                    |
| -------------------- | ------------------------------------------------------------- |
| `index.html`         | The whole page. Sections are commented and in reading order.   |
| `assets/styles.css`  | Design tokens first, then one block per section.               |
| `assets/app.js`      | Sticky-header hairline, mobile menu, scroll reveals, bar fills. |

The page is fully readable with JavaScript disabled — `app.js` only adds motion
and the mobile menu.

## Design

The palette, type and geometry are taken from the app itself so the two read as
one product:

- **Iron oxide (`#c65d3a`) is the only saturated colour**, and it marks the
  primary action and nothing else. The muscle hues in the volume panel are the
  exception, because there they are wayfinding rather than decoration.
- **IBM Plex Mono for headings and numbers**, IBM Plex Sans for body copy. A
  heading set in the same face as the figures beneath it reads as a column
  label, which is the register the app works in.
- **Rectilinear radii** (10px cards): this is a reference table, not a bubble.
- The **Fe · 26 periodic tile** is the brand mark, at three sizes.

## Content

Every feature claim on the page is drawn from the app's actual behaviour — the
plan importer, session grading, the 38-region muscle map, the MEV/MAV/MRV volume
landmarks, the programme change log, and the no-email account.

Deliberately **not** included, since there was nothing in the app to source them
from: pricing, testimonials, partner logos, App Store and Play Store links, and
the legal pages. The footer's Privacy and Support links currently point at the
FAQ, and both `Start training` buttons need a real destination.
