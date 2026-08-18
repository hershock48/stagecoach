import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SITE, WEEKLY_EVENTS } from "@/lib/site";
import PageMasthead from "@/components/PageMasthead";

export const metadata: Metadata = {
  title: "What's on this week",
  description:
    "Trivia Wednesdays, DJ Bingo Thursdays, live music Saturdays and karaoke Sundays at The Stagecoach Inn in Marshall, Michigan.",
  alternates: { canonical: "/events" },
};

// Their current site runs an events calendar plugin whose archive page reads
// "There are no upcoming events" while the homepage advertises three weekly
// nights. The fix is not a better calendar; it is admitting the events are
// weekly and recurring. A recurring week needs no data entry and can never go
// stale, which is the whole reason the old one was empty.
//
// The day this page needs a one-off (a New Year's party, a touring band), it
// gets a dated list ABOVE this one. Named in the README as the seam.
export default function EventsPage() {
  return (
    <>
      <PageMasthead
        eyebrow="Every single week"
        title="What's on."
        lede="Four nights a week the room has something going on, and none of it needs a ticket. Walk in, grab a stool, play along."
      />

      <div className="mx-auto max-w-4xl px-5 py-16">
        <ol className="space-y-8">
          {WEEKLY_EVENTS.map((e) => (
            <li
              key={e.day}
              data-reveal
              className="grid gap-6 overflow-hidden rounded-sm border border-cream-dim bg-white sm:grid-cols-[220px_1fr]"
            >
              {e.image ? (
                <Image
                  src={e.image}
                  alt=""
                  width={1000}
                  height={1000}
                  className="h-52 w-full object-cover sm:h-full"
                />
              ) : (
                <div className="flex h-52 w-full items-center justify-center bg-ink sm:h-full">
                  <span className="font-display text-5xl text-red-pale">
                    {e.day.slice(0, 3)}
                  </span>
                </div>
              )}
              <div className="p-6 sm:py-8 sm:pr-8">
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-red">
                  {e.day}
                  {e.time ? ` · ${e.time}` : ""}
                </p>
                <h2 className="mt-2 font-display text-2xl text-ink">{e.name}</h2>
                <p className="mt-2 leading-relaxed text-body">{e.blurb}</p>
                {!e.time && (
                  /* PLACEHOLDER, said out loud rather than invented: their Toast
                     page advertises Saturday live music with no start time. */
                  <p className="mt-3 text-sm text-muted">
                    Start time varies. Call the bar or check Facebook for who is
                    playing this week.
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 rounded-sm border border-cream-dim bg-cream p-8" data-reveal>
          <h2 className="font-display text-2xl text-ink">Booking the room</h2>
          <p className="mt-3 leading-relaxed text-body">
            Parties, work things, a band that wants a Saturday. Call the bar and
            ask for whoever is running the floor.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={SITE.phoneHref}
              className="rounded-sm bg-red px-6 py-3.5 font-sans text-sm uppercase tracking-[0.14em] text-cream-light transition-colors hover:bg-red-light"
            >
              Call {SITE.phone}
            </a>
            <Link
              href="/visit"
              className="rounded-sm border border-cream-dim px-6 py-3.5 font-sans text-sm uppercase tracking-[0.14em] text-ink transition-colors hover:border-red hover:text-red"
            >
              Send a message
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
