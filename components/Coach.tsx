"use client";

import { useEffect, useRef } from "react";

/**
 * The coach, galloping.
 *
 * The artwork is lifted, not drawn: public/brand/coach.svg is the coach,
 * driver, whip, reins and both horses cut straight out of the client's own
 * badge (public/brand/logo.png) as a single connected black component, traced
 * at 8x with a slight blur, threshold picked by rendering four candidates and
 * diffing each against the source bitmap. glaze.md: if the real asset exists,
 * use the real asset. This is their mark moving, not an approximation of it.
 *
 * Three nested elements because three transforms must not fight each other:
 *   .coach-travel  X, the entrance and the scroll scrub
 *   .coach-bob     Y, the suspension over the road
 *   .coach-art     the drawing itself
 *
 * Motion rules, all three from glaze.md:
 *
 * 1. The un-animated state IS the finished state. The coach renders parked at
 *    its rest position with no class at all, so a blocked script, a failed
 *    hydration or reduced motion leaves a complete hero rather than an empty
 *    strip of road. `is-live` is added only after this component confirms it
 *    may animate.
 * 2. Reduced motion degrades to something and it was looked at: the coach is
 *    simply there, parked, whip out. No animation, no jump.
 * 3. The curve was checked, not just the duration. The entrance uses
 *    cubic-bezier(.16,.84,.36,1), which travels most of its distance early and
 *    settles, so it reads as a team pulling up rather than the pop-then-creep
 *    an ease-out default produces.
 *
 * The wheels deliberately do not spin. They are spoked, and a real spoked
 * wheel at a gallop blurs into a disc; a rotating spoke pattern at this size
 * reads as a cartoon. The bob, the dust and the travel carry the speed.
 */
export default function Coach({ className = "" }: { className?: string }) {
  const laneRef = useRef<HTMLDivElement>(null);
  const travelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lane = laneRef.current;
    const travel = travelRef.current;
    if (!lane || !travel) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    lane.classList.add("is-live");

    // Scroll scrub. The coach keeps travelling as the hero leaves, so the
    // motion belongs to the visitor rather than to a timer they cannot stop.
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = lane.getBoundingClientRect();
        // 0 while the lane sits at or below the fold, rising to 1 once it has
        // scrolled a full viewport past the top.
        const progress = Math.min(1, Math.max(0, -rect.top / window.innerHeight));
        travel.style.setProperty("--scrub", String(progress));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      lane.classList.remove("is-live");
    };
  }, []);

  return (
    <div ref={laneRef} className={`coach-lane ${className}`} aria-hidden="true">
      <div ref={travelRef} className="coach-travel">
        <div className="coach-bob">
          {/* eslint-disable-next-line @next/next/no-img-element -- a static
              inline-colored SVG; next/image would rasterize it and lose the
              currentColor inking. */}
          <img src="/brand/coach.svg" alt="" className="coach-art" width={577} height={257} />
        </div>
        <span className="coach-dust coach-dust-1" />
        <span className="coach-dust coach-dust-2" />
        <span className="coach-dust coach-dust-3" />
      </div>
    </div>
  );
}
