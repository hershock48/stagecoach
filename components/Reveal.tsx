"use client";

import { useEffect } from "react";

// Scroll reveal, built to glaze.md's three motion rules.
//
// 1. The un-animated state is the finished state. This component adds the
//    `js-reveal` class to <html>, and only then does the CSS hide anything.
//    Script blocked, JS off, hydration failed: every [data-reveal] element is
//    simply visible. Nothing is hidden by default, ever.
// 2. Reduced motion degrades to something, and it is the complete page: the
//    hiding rules live inside a `prefers-reduced-motion: no-preference` block,
//    so the class does nothing at all for a visitor who asked for less.
// 3. The curve is checked, not just the duration. cubic-bezier(.22,.61,.36,1)
//    spends its travel evenly rather than popping and creeping.
//
// It also re-arms on navigation. The failure log has a case where a reveal
// system queried once on mount left every subsequent page blank while the URL
// and the nav highlight both changed correctly. A MutationObserver catches
// elements the router swaps in.
export default function Reveal() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    document.documentElement.classList.add("js-reveal");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );

    const arm = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)").forEach((el) => {
        // Already on screen at arm time (above the fold, or a short page):
        // show it immediately rather than waiting for a scroll that may never
        // come.
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92) el.classList.add("is-in");
        else io.observe(el);
      });
    };

    arm();
    const mo = new MutationObserver(arm);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
      document.documentElement.classList.remove("js-reveal");
    };
  }, []);

  return null;
}
