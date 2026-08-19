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
//
// The week is set as a printed bill rather than a grid of picture cards. The
// posters are the client's own and they stay, but they are moved to a strip at
// the foot of the page: a purple DJ Bingo flyer and a wood-panelled TV set
// next to fat-face type were fighting each other, and the flyers were winning.
// Presented as what they are, posters on a wall, they read as character
// instead of clutter.
export default function EventsPage() {
  const posters = WEEKLY_EVENTS.filter((e) => e.image);

  return (
    <>
      <PageMasthead
        eyebrow="Every single week"
        title="What's on."
        lede="Four nights a week the room has something going on, and none of it needs a ticket. Walk in, grab a stool, play along."
      />

      <div className="mx-auto max-w-4xl px-5 pb-16">
        <div className="rule-double" />
        <ol>
          {WEEKLY_EVENTS.map((e) => (
            <li
              key={e.day}
              data-reveal
              className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1.5 border-b border-cream-dim py-7"
            >
              <p className="eyebrow col-span-2 text-red sm:col-span-1">{e.day}</p>
              <p className="col-start-2 row-start-1 hidden text-sm text-muted sm:block">
                {e.time ?? "Time varies"}
              </p>
              <h2 className="col-span-2 font-display text-[clamp(1.9rem,5vw,2.8rem)] leading-none text-ink">
                {e.name}
              </h2>
              <p className="col-span-2 max-w-xl text-lg leading-relaxed text-body">
                {e.blurb}
                {!e.time && (
                  /* PLACEHOLDER, said out loud rather than invented: their
                     Toast page advertises Saturday live music with no start
                     time, and their own site does not mention it at all. */
                  <span className="text-muted">
                    {" "}
                    Start time varies, so call the bar or check Facebook for who is
                    playing this week.
                  </span>
                )}
              </p>
              <p className="col-span-2 text-sm text-muted sm:hidden">
                {e.time ?? "Time varies"}
              </p>
            </li>
          ))}
        </ol>

        {posters.length > 0 && (
          <section className="mt-14" data-reveal>
            <div className="ornament">
              <span>&#9670;</span>
            </div>
            <h2 className="mt-8 text-center font-display text-2xl text-ink">
              The posters on the wall
            </h2>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2">
              {posters.map((e) => (
                <li key={e.day} className="border-2 border-ink bg-white p-2.5">
                  <Image
                    src={e.image as string}
                    alt={`${e.name} poster`}
                    width={1000}
                    height={1000}
                    className="h-56 w-full object-contain"
                  />
                  <p className="eyebrow mt-2.5 text-center text-muted">
                    {e.day}s
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-14 border-2 border-ink bg-cream p-8" data-reveal>
          <h2 className="font-display text-[clamp(1.7rem,4vw,2.4rem)] leading-none text-ink">
            Booking the room.
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-body">
            Parties, work things, a band that wants a Saturday. Call the bar and
            ask for whoever is running the floor.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={SITE.phoneHref}
              className="rounded-sm bg-red px-7 py-4 font-sans text-sm uppercase tracking-[0.14em] text-cream-light transition-colors hover:bg-red-deep"
            >
              Call {SITE.phone}
            </a>
            <Link
              href="/visit"
              className="rounded-sm border-2 border-ink px-7 py-[14px] font-sans text-sm uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-cream-light"
            >
              Send a message
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
