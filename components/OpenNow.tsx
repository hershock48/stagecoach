import { localNow } from "@/lib/ordering/time";
import { SITE } from "@/lib/site";

// "Open now" computed per request in America/Detroit, from the same hours
// constant the footer and the schema read.
//
// Two traps this avoids, both in the glaze.md failure log. A statically
// generated page freezes new Date() at build time, so this only renders inside
// force-dynamic routes. And a UTC lambda calling getHours() would say the bar
// opens at 6 AM Michigan time, every day, quietly; localNow uses Intl.
export default function OpenNow() {
  const { day, minutes } = localNow();
  // Sunday 10am-10pm, Monday to Saturday 11am-midnight. Same source as
  // ORDERING.window, expressed as venue hours rather than kitchen hours: the
  // bar stays open after the kitchen stops taking online orders.
  const opens = day === 0 ? 10 * 60 : 11 * 60;
  const closes = day === 0 ? 22 * 60 : 24 * 60;
  const open = minutes >= opens && minutes < closes;

  const fmt = (m: number) => {
    const h = Math.floor(m / 60) % 24;
    const ampm = h >= 12 ? "pm" : "am";
    const h12 = ((h + 11) % 12) + 1;
    return m % 60 === 0 ? `${h12}${ampm}` : `${h12}:${String(m % 60).padStart(2, "0")}${ampm}`;
  };

  return (
    <p className="inline-flex items-center gap-2.5 rounded-sm border border-cream-dim/40 bg-ink-soft/80 px-4 py-2.5 text-sm text-cream-dim">
      <span
        className={`h-2.5 w-2.5 flex-none rounded-full ${open ? "bg-[#7dd18a]" : "bg-red-light"}`}
        aria-hidden
      />
      {open ? (
        <>
          <span className="text-cream-light">Open now</span>
          <span aria-hidden>·</span>
          <span>until {closes === 24 * 60 ? "midnight" : fmt(closes)}</span>
        </>
      ) : (
        <>
          <span className="text-cream-light">Closed right now</span>
          <span aria-hidden>·</span>
          <span>open {fmt(opens)} today</span>
        </>
      )}
      <span className="sr-only">
        {`Hours: ${SITE.hours.map((h) => `${h.days} ${h.open} to ${h.close}`).join(". ")}.`}
      </span>
    </p>
  );
}
