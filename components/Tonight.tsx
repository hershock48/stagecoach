import Link from "next/link";
import { tonightsEvent } from "@/lib/tonight";

/**
 * What is on TONIGHT, answered on arrival.
 *
 * The homepage and the events page both listed the whole week, which left a
 * visitor at six on a Wednesday to work out for themselves that trivia starts
 * in an hour. The site already knew the day: localNow() computes it per
 * request in America/Detroit, the same source OpenNow reads.
 *
 * Two traps this had to avoid, both in the glaze.md failure log:
 *   - new Date() in a statically generated page freezes at build time, so
 *     every route rendering this is force-dynamic.
 *   - getHours() on a UTC lambda would call it Thursday from 7pm Michigan
 *     time onward. localNow uses Intl and the venue's own timezone.
 *
 * The computation itself lives in lib/tonight.ts so it can be tested against a
 * supplied clock instead of only against whatever day it happens to be.
 */
export default function Tonight({ className = "" }: { className?: string }) {
  const found = tonightsEvent();
  if (!found) return null;
  const { when, event } = found;

  const lead =
    when === "tonight" ? "Tonight" : when === "tomorrow" ? "Tomorrow" : event.day;

  return (
    <Link
      href="/events"
      className={`group inline-flex flex-wrap items-baseline gap-x-2.5 gap-y-1 border-b-2 border-red pb-1 ${className}`}
    >
      <span className="eyebrow text-red">{lead}</span>
      <span className="font-display text-xl text-ink group-hover:text-red sm:text-2xl">
        {event.name}
      </span>
      {event.time && <span className="text-sm text-muted">{event.time}</span>}
    </Link>
  );
}
