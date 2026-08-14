/* ============================================================================
   ELEMENT 26 — site behaviour

   Four small things, no dependencies: a sticky-header hairline, the mobile menu,
   scroll reveals, and the volume bars filling once they're actually on screen.
   Everything degrades to a perfectly readable page if this file never loads.
   ========================================================================= */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- the header hairline, once you've left the top ---------------- */
  var hdr = document.getElementById("hdr");
  function onScroll() {
    hdr.classList.toggle("stuck", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- mobile menu -------------------------------------------------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");

  function setMenu(open) {
    nav.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  }

  burger.addEventListener("click", function () {
    setMenu(!nav.classList.contains("open"));
  });

  // Any nav tap closes it — the links are all in-page, so the menu would
  // otherwise sit over the section you just asked for.
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  /* ---- scroll reveal ------------------------------------------------- */
  var revealables = document.querySelectorAll(".rv");

  if (reduced || !("IntersectionObserver" in window)) {
    // No observer, or the visitor asked for less motion: show everything now.
    revealables.forEach(function (el) { el.classList.add("in"); });
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        // Stagger whatever came into view together, so a grid of cards arrives
        // as a sequence rather than all at once.
        var delay = Math.min(i, 6) * 70;
        setTimeout(function () { entry.target.classList.add("in"); }, delay);
        revealer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -60px 0px", threshold: 0.12 });

    revealables.forEach(function (el) { revealer.observe(el); });
  }

  /* ---- volume bars --------------------------------------------------- */
  /* Each bar carries its own width on data-w and starts at zero, so the fill
     animates from empty the first time the panel is actually looked at. */
  var fills = document.querySelectorAll(".bar .fill");

  function fill(el) {
    el.style.width = (el.getAttribute("data-w") || 0) + "%";
  }

  if (reduced || !("IntersectionObserver" in window)) {
    fills.forEach(fill);
  } else {
    var filler = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        fill(entry.target);
        filler.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    fills.forEach(function (el) { filler.observe(el); });
  }

  /* ---- footer year --------------------------------------------------- */
  document.getElementById("yr").textContent = new Date().getFullYear();
})();
