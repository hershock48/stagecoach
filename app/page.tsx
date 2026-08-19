import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SITE, WEEKLY_EVENTS, FEATURED_COCKTAILS } from "@/lib/site";
import OpenNow from "@/components/OpenNow";
import CoachArrival from "@/components/CoachArrival";

export const metadata: Metadata = {
  title: `${SITE.name} · Bar and kitchen in Marshall, Michigan`,
  description:
    "The oldest stagecoach stop in Marshall, Michigan, still pouring. Scratch kitchen, full bar, trivia Wednesdays, karaoke Sundays, and pickup you can order online.",
  alternates: { canonical: "/" },
};

// Time-dependent content: this page shows whether the bar is open right now, so
// it cannot be statically generated or revalidated on a timer. glaze.md failure
// log, twice over: a cached page ages indefinitely on a quiet site, and
// new Date() in a static page freezes at build time.
export const dynamic = "force-dynamic";

const FEATURED_PLATES = [
  { name: "Coach Burger", note: "American, romaine, tomato, onion, pickle, Coach sauce", price: "$12" },
  { name: "Fried Mushrooms", note: "Sprout It Farms oyster mushrooms, truffle aioli, balsamic", price: "$14" },
  { name: "Bistro Chicken", note: "Drake's battered chicken, smoked gouda, bacon, Coach sauce", price: "$17" },
  { name: "Steak Bites", note: "Marinated, seared steak tips", price: "$28" },
];

export default function Home() {
  return (
    <>
      {/* THE BROADSIDE.
          The first version of this hero was a photograph with a dark scrim and
          a headline on top, which is the shape of every restaurant homepage
          made since 2015 and is what made Kevin say it looked like Squarespace.
          This is the alternative: a printed notice, the way a stagecoach line
          announced itself in 1838. Paper, heavy rules, fat-face type, the
          badge, and the coach itself running along the road at the bottom.
          The photograph still exists; it appears further down, full width,
          where it is a photograph rather than a background. */}
      <section className="relative overflow-x-clip bg-cream-light">
        <div className="mx-auto max-w-6xl px-5 pt-10 sm:pt-14">
          <div className="rule-double" />
          <div className="flex flex-wrap items-center justify-between gap-3 py-2.5">
            <p className="eyebrow text-red">Established {SITE.since}</p>
            <p className="eyebrow text-muted">
              {SITE.street} &middot; {SITE.city}, Michigan
            </p>
          </div>
          <div className="rule-hair" />

          {/* The arrival gets its own band, above the headline. It lived
              beside the headline first and the coach flew straight through
              "stopped here first" on the way in, which is a collision, not a
              composition. Here the flight path is clear paper. */}
          <div className="py-8 sm:py-10">
            <CoachArrival className="mx-auto w-full max-w-[22rem] sm:max-w-[26rem]" />
          </div>

          <div className="pb-12 lg:pb-16">
            <h1 className="max-w-4xl font-display text-[clamp(2.6rem,8vw,5.4rem)] leading-[0.95] text-ink">
              The stagecoaches stopped here first.
              <span className="mt-2 block text-red">People still do.</span>
            </h1>
            <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <p className="max-w-lg text-lg leading-relaxed text-body">
                One of Michigan&rsquo;s oldest stagecoach stops, on the Territorial
                Road between Detroit and Chicago. Scratch kitchen, full bar, and
                something on four nights a week.
              </p>
              <div className="lg:pb-1">
                <OpenNow />
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/order"
                className="rounded-sm bg-red px-7 py-4 font-sans text-sm uppercase tracking-[0.14em] text-cream-light transition-colors hover:bg-red-deep"
              >
                Order pickup
              </Link>
              <Link
                href="/menu"
                className="rounded-sm border-2 border-ink px-7 py-[14px] font-sans text-sm uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-cream-light"
              >
                See the menu
              </Link>
              <a
                href={SITE.phoneHref}
                className="px-2 py-4 font-sans text-sm text-body underline underline-offset-4 transition-colors hover:text-red"
              >
                {SITE.phone}
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-5">
          <div className="rule-double" />
          <p className="py-2.5 text-center font-display text-sm tracking-[0.3em] text-red sm:text-base">
            {SITE.tagline.toUpperCase()}
          </p>
          <div className="rule-hair" />
        </div>
      </section>

      {/* The photograph, as a photograph. */}
      <section className="mt-12 border-y border-cream-dim">
        <Image
          src="/brand/exterior.webp"
          alt={`${SITE.name} on West Michigan Avenue in Marshall`}
          width={1600}
          height={1067}
          className="h-[38vh] min-h-[240px] w-full object-cover sm:h-[46vh]"
        />
      </section>

      {/* THE WEEK. Set as a printed bill: a row per night, rules between,
          times in the margin. Not three photo cards in a grid. */}
      <section className="mx-auto max-w-5xl px-5 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4" data-reveal>
          <div>
            <p className="eyebrow text-red">Every week</p>
            <h2 className="mt-2 font-display text-[clamp(2rem,5vw,3.2rem)] leading-none text-ink">
              Something on, most nights.
            </h2>
          </div>
          <Link
            href="/events"
            className="font-sans text-sm text-red underline underline-offset-4 hover:text-red-deep"
          >
            The whole week
          </Link>
        </div>

        <div className="mt-9 rule-double" />
        <ul>
          {WEEKLY_EVENTS.map((e) => (
            <li
              key={e.day}
              data-reveal
              className="grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-1 border-b border-cream-dim py-5 sm:grid-cols-[7.5rem_1fr_auto]"
            >
              <p className="eyebrow text-red">{e.day}</p>
              <h3 className="font-display text-2xl leading-tight text-ink sm:text-3xl">
                {e.name}
              </h3>
              <p className="col-start-2 text-sm text-muted sm:col-start-3 sm:text-right">
                {e.time ?? "Time varies"}
              </p>
              <p className="col-start-2 text-body sm:col-span-2">{e.blurb}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mx-auto max-w-5xl px-5">
        <div className="ornament">
          <span>&#9670;</span>
        </div>
      </div>

      {/* THE BILL OF FARE. A menu should look like a menu: leader dots, prices
          in the margin, no cards. */}
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-5xl px-5">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr]">
            <div data-reveal>
              <p className="eyebrow text-red">The kitchen</p>
              <h2 className="mt-2 font-display text-[clamp(2rem,5vw,3.2rem)] leading-none text-ink">
                Scratch food, cooked to order.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-body">
                Executive Chef {SITE.chef} runs a scratch kitchen: bread from Albion
                Malleable and Foundry Bakery, oyster mushrooms from Sprout It Farms,
                hand-cut cod, homemade tartar and pimento cheese.
              </p>

              <div className="mt-8 rule-double" />
              <ul>
                {FEATURED_PLATES.map((p) => (
                  <li key={p.name} className="border-b border-cream-dim py-4">
                    <div className="flex items-baseline gap-3">
                      <h3 className="font-display text-xl text-ink">{p.name}</h3>
                      <span
                        className="h-px flex-1 translate-y-[-3px] border-b border-dotted border-muted/60"
                        aria-hidden
                      />
                      <span className="font-sans text-base tabular-nums text-ink">
                        {p.price}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted">{p.note}</p>
                  </li>
                ))}
              </ul>
              <Link
                href="/menu"
                className="mt-8 inline-block rounded-sm bg-ink px-7 py-4 font-sans text-sm uppercase tracking-[0.14em] text-cream-light transition-colors hover:bg-ink-soft"
              >
                All 61 items
              </Link>
            </div>

            <div data-reveal className="lg:pt-16">
              <div className="border-2 border-ink bg-cream-light p-7">
                <p className="eyebrow text-red">From behind the bar</p>
                <ul className="mt-4 space-y-2.5">
                  {FEATURED_COCKTAILS.map((c) => (
                    <li key={c} className="font-display text-2xl leading-tight text-ink">
                      {c}
                    </li>
                  ))}
                </ul>
                <div className="my-5 rule-hair" />
                <p className="text-sm leading-relaxed text-body">
                  Fresh ingredients, homemade syrups, and techniques older than the
                  building. Poured in house, never sold to go.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE NOTICE. Address, hours and the history, set as one printed card
          the way an inn would have posted its terms by the door. */}
      <section className="mx-auto max-w-5xl px-5 py-20">
        <div className="border-2 border-ink bg-ink text-cream-dim" data-reveal>
          <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-2">
            <div>
              <p className="eyebrow text-red-pale">Since {SITE.since}</p>
              <h2 className="mt-2 font-display text-[clamp(1.9rem,4.5vw,3rem)] leading-none text-cream-light">
                {SITE.tagline}.
              </h2>
              <p className="mt-5 leading-relaxed">
                Marshall was a stop on the road west before it was a town with a
                courthouse. Travelers changed horses here, ate here, slept
                upstairs. The road got faster and the coaches stopped coming, and
                the building kept doing the part that mattered.
              </p>
              <Link
                href="/story"
                className="mt-6 inline-block font-sans text-sm text-cream-light underline underline-offset-4 hover:text-white"
              >
                Read the history
              </Link>
            </div>
            <div>
              <address className="space-y-1 text-lg not-italic leading-relaxed text-cream-light">
                <p>{SITE.street}</p>
                <p>
                  {SITE.city}, {SITE.state} {SITE.zip}
                </p>
              </address>
              <dl className="mt-6 divide-y divide-ink-line border-y border-ink-line">
                {SITE.hours.map((h) => (
                  <div key={h.days} className="flex justify-between gap-4 py-3">
                    <dt>{h.days}</dt>
                    <dd className="text-cream-light">
                      {h.open} to {h.close}
                    </dd>
                  </div>
                ))}
              </dl>
              <a
                href={SITE.phoneHref}
                className="mt-6 inline-block rounded-sm bg-red px-6 py-3.5 font-sans text-sm uppercase tracking-[0.14em] text-cream-light transition-colors hover:bg-red-light"
              >
                Call {SITE.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
