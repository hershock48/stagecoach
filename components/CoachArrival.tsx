"use client";

import { useEffect, useRef } from "react";

/**
 * The coach arrives, and the logo completes itself.
 *
 * The badge renders with a coach-shaped hole in it (public/brand/badge-empty.png,
 * cut by tools/cut-mark.py and filled with the badge's own cream). The coach
 * team gallops in from off-screen left, wheels turning, horses bounding, the
 * driver cracking the whip, and lands in exactly the position the coach
 * occupies in the real artwork. At rest the layers ARE the logo, pixel for
 * pixel, because they were cut out of it.
 *
 * Every number in the stylesheet that places these layers came out of
 * mark.json, measured off the artwork rather than nudged until it looked
 * right:
 *
 *   coach sits at   29.096% / 23.372% of the badge, 42.041% wide
 *   rear hub        11.360% / 74.385% of the coach canvas
 *   front hub       46.664% / 80.830%
 *
 * The wheel origins are the reason the wheels SPIN rather than orbit: each
 * wheel layer is emitted at full canvas size with the wheel baked in its true
 * position, so setting transform-origin to its measured hub turns it on its
 * own axle.
 *
 * Timing. Everything is a whole number of cycles inside the 2200ms arrival, so
 * every part lands back at identity at the same instant and the finished state
 * is the untouched logo:
 *
 *   travel   2200ms x1     decelerating, the team pulling up at the door
 *   wheels    550ms x4     4 turns; 12 spokes means any multiple of 30 lands clean
 *   horses    440ms x5     two beats to a stride
 *   whip     1100ms x2     two cracks on the way in
 *
 * The three motion rules from glaze.md:
 *   1. The un-animated state is the finished state. No JS, no class, no
 *      animation: the badge is whole and the coach is parked in it.
 *   2. Reduced motion degrades to that same complete logo, and it was looked
 *      at in a reduced-motion browser rather than assumed.
 *   3. The curve was checked. The travel uses cubic-bezier(.2,.75,.3,1), which
 *      covers most of its distance early and then eases, so it reads as a team
 *      slowing to a stop instead of the pop-then-creep an ease-out gives.
 */
export default function CoachArrival({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Only run the arrival when the badge is actually on screen. A visitor who
    // lands mid-page scrolled should still get it when they reach it, and a
    // visitor who never does should not have it happen behind their back.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("is-arriving");
            io.disconnect();
          }
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`badge-stage ${className}`}>
      {/* eslint-disable @next/next/no-img-element -- these are hand-cut layers
          that must stack at identical intrinsic sizes and ink with
          currentColor; next/image would rasterize and break both. */}
      <img
        src="/brand/badge-empty.png"
        alt="The Stagecoach Inn"
        className="badge-plate"
        width={1715}
        height={1459}
      />
      <div className="coach-rig" aria-hidden="true">
        {/* The frame is the ONE statically positioned layer: it gives the rig
            its height, and every other layer stacks on it. Without a static
            child the container measures zero high, which paints correctly and
            still breaks anything that asks how big it is. */}
        <img src="/brand/coach-frame.svg" alt="" className="rig-layer rig-base" width={721} height={321} />
        <div className="coach-bound">
          <img src="/brand/horses.svg" alt="" className="rig-layer" width={721} height={321} />
        </div>
        <img src="/brand/wheel-rear.svg" alt="" className="rig-layer rig-wheel-rear" width={721} height={321} />
        <img src="/brand/wheel-front.svg" alt="" className="rig-layer rig-wheel-front" width={721} height={321} />
        <img src="/brand/whip.svg" alt="" className="rig-layer rig-whip" width={721} height={321} />
      </div>
      {/* eslint-enable @next/next/no-img-element */}
    </div>
  );
}
