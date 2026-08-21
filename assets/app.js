/* ============================================================================
   ELEMENT 26 — site behaviour

   No dependencies. Everything here is enhancement: the page is fully readable
   and navigable if this file never loads, and every animated element has a
   legible resting state.

   Motion is gated on prefers-reduced-motion. When it is set, the whole file
   still runs — it just skips straight to the finished state of each effect.
   ========================================================================= */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---- header hairline + read progress ------------------------------- */
  var hdr = $("#hdr");
  var prog = $("#prog");
  var ticking = false;

  function onScroll() {
    if (hdr) hdr.classList.toggle("stuck", window.scrollY > 8);
    if (prog) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
    }
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---- mobile menu ---------------------------------------------------- */
  /* Not every page has a menu — the post-purchase page is a single column with
     no nav at all. This file is shared across all of them, so each block has to
     tolerate its elements being absent rather than throwing on load and taking
     the rest of the script (reveals, the footer year) down with it. */
  var burger = $("#burger");
  var nav = $("#nav");

  if (burger && nav) {
    var setMenu = function (open) {
      nav.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
    };

    burger.addEventListener("click", function () {
      setMenu(!nav.classList.contains("open"));
    });

    // Every nav link is in-page, so leaving the menu open would cover the very
    // section the visitor just asked for.
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  /* ---- one observer, several jobs -------------------------------------
     Reveals, bar fills, sparkline bars and count-ups all fire the first time
     their element is seen. They share a single IntersectionObserver keyed off
     a data attribute rather than running four of them. */

  function fillBar(el) {
    el.style.width = (el.getAttribute("data-w") || 0) + "%";
  }

  function fillSpark(el) {
    el.style.height = (el.getAttribute("data-h") || 0) + "%";
  }

  // Count from zero to the target, eased out so it settles rather than stops.
  function countUp(el) {
    var to = parseInt(el.getAttribute("data-to"), 10) || 0;
    if (reduced || to === 0) { el.textContent = String(to); return; }

    var dur = 1100;
    var t0 = performance.now();

    (function frame(now) {
      var p = Math.min((now - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(to * eased));
      if (p < 1) requestAnimationFrame(frame);
    })(t0);
  }

  function activate(el) {
    if (el.classList.contains("rv")) el.classList.add("in");
    if (el.classList.contains("fill")) fillBar(el);
    if (el.hasAttribute("data-h")) fillSpark(el);
    if (el.classList.contains("count")) countUp(el);
  }

  var watched = $$(".rv, .bar .fill, .spark i, .count");

  if (!("IntersectionObserver" in window)) {
    watched.forEach(activate);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        // Stagger whatever arrived together, so a row of cards reads as a
        // sequence instead of a single flash.
        var delay = reduced ? 0 : Math.min(i, 7) * 65;
        setTimeout(function () { activate(entry.target); }, delay);
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -60px 0px", threshold: 0.12 });

    watched.forEach(function (el) { io.observe(el); });
  }

  /* ---- cursor glow on the feature cards -------------------------------- */
  /* Each card's ::before is a radial gradient positioned from --mx/--my. */
  if (!reduced && window.matchMedia("(hover: hover)").matches) {
    $$(".cell").forEach(function (cell) {
      cell.addEventListener("pointermove", function (e) {
        var r = cell.getBoundingClientRect();
        cell.style.setProperty("--mx", (e.clientX - r.left) + "px");
        cell.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---- parallax on the hero's floating cards --------------------------- */
  /* Each card drifts at its own rate as the hero scrolls past, which gives the
     phone the appearance of sitting deeper in the scene than the annotations.
     Desktop only: on narrow screens the cards are in normal flow. */
  var floats = $$(".float[data-par]");
  var wide = window.matchMedia("(min-width: 941px)");

  if (!reduced && floats.length) {
    var parking = false;

    // Hand transform control over from the entry animation to the inline style.
    floats.forEach(function (el) {
      el.addEventListener("animationend", function () { el.classList.add("settled"); });
    });

    var park = function () {
      if (!wide.matches) {
        floats.forEach(function (el) { el.style.transform = ""; });
        parking = false;
        return;
      }
      var y = window.scrollY;
      floats.forEach(function (el) {
        el.style.transform = "translateY(" + (-y * parseFloat(el.getAttribute("data-par"))) + "px)";
      });
      parking = false;
    };

    window.addEventListener("scroll", function () {
      if (!parking) { parking = true; requestAnimationFrame(park); }
    }, { passive: true });

    park();
  }

  /* ---- footer year ------------------------------------------------------ */
  var yr = $("#yr");
  if (yr) yr.textContent = new Date().getFullYear();
})();
