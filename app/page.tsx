import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SITE, WEEKLY_EVENTS, FEATURED_COCKTAILS } from "@/lib/site";
import OpenNow from "@/components/OpenNow";

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
      <section className="relative isolate overflow-hidden bg-ink">
        <Image
          src="/brand/exterior.webp"
          alt=""
          width={1600}
          height={1067}
          priority
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/60 to-ink" />
        <div className="relative mx-auto max-w-6xl px-5 py-24 sm:py-32">
          <Image
            src="/brand/logo.png"
            alt={`${SITE.name}`}
            width={720}
            height={613}
            className="h-28 w-auto sm:h-36"
            priority
          />
          <h1 className="mt-8 max-w-3xl font-display text-4xl leading-[1.08] text-cream-light sm:text-6xl">
            The stagecoaches stopped here first.
            <span className="block text-red-pale">People still do.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream-dim">
            {SITE.historyLine}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/order"
              className="rounded-sm bg-red px-7 py-4 font-sans text-sm uppercase tracking-[0.14em] text-cream-light transition-colors hover:bg-red-light"
            >
              Order pickup
            </Link>
            <Link
              href="/menu"
              className="rounded-sm border border-cream-dim/50 px-7 py-4 font-sans text-sm uppercase tracking-[0.14em] text-cream-light transition-colors hover:border-cream-light"
            >
              See the menu
            </Link>
            <a
              href={SITE.phoneHref}
              className="px-2 py-4 font-sans text-sm text-cream-dim underline underline-offset-4 transition-colors hover:text-cream-light"
            >
              {SITE.phone}
            </a>
          </div>
          <div className="mt-8">
            <OpenNow />
          </div>
        </div>
      </section>

      {/* What's on this week. Their events are weekly and recurring, which is
          why this is a hand-written week rather than an events calendar with
          nothing in it. */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4" data-reveal>
          <div>
            <p className="font-sans text-xs uppercase tracking-[0.24em] text-red">Every week</p>
            <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
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
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WEEKLY_EVENTS.map((e) => (
            <li
              key={e.day}
              data-reveal
              className="overflow-hidden rounded-sm border border-cream-dim bg-white"
            >
              {e.image ? (
                <Image
                  src={e.image}
                  alt=""
                  width={1000}
                  height={1000}
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-ink">
                  <span className="font-display text-4xl text-red-pale">{e.day.slice(0, 3)}</span>
                </div>
              )}
              <div className="p-5">
                <p className="font-sans text-xs uppercase tracking-[0.18em] text-red">{e.day}</p>
                <h3 className="mt-1.5 font-display text-xl text-ink">{e.name}</h3>
                {e.time && <p className="mt-1 text-sm text-muted">{e.time}</p>}
                <p className="mt-2 text-sm leading-relaxed text-body">{e.blurb}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-cream py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div data-reveal>
              <p className="font-sans text-xs uppercase tracking-[0.24em] text-red">The kitchen</p>
              <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
                Scratch food, cooked to order.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-body">
                Executive Chef {SITE.chef} runs a scratch kitchen: bread from Albion
                Malleable and Foundry Bakery, oyster mushrooms from Sprout It Farms,
                hand-cut cod, homemade tartar and pimento cheese.
              </p>
              <ul className="mt-8 divide-y divide-cream-dim border-y border-cream-dim">
                {FEATURED_PLATES.map((p) => (
                  <li key={p.name} className="flex items-baseline justify-between gap-4 py-3.5">
                    <div>
                      <h3 className="font-display text-lg text-ink">{p.name}</h3>
                      <p className="text-sm text-muted">{p.note}</p>
                    </div>
                    <span className="font-sans text-sm tabular-nums text-ink">{p.price}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/menu"
                className="mt-8 inline-block rounded-sm bg-ink px-7 py-4 font-sans text-sm uppercase tracking-[0.14em] text-cream-light transition-colors hover:bg-ink-soft"
              >
                The full menu
              </Link>
            </div>
            <div data-reveal className="lg:pl-6">
              <Image
                src="/brand/featured.jpg"
                alt="The Stagecoach Inn"
                width={800}
                height={450}
                className="w-full rounded-sm border border-cream-dim object-cover"
              />
              <div className="mt-6 rounded-sm border border-cream-dim bg-cream-light p-6">
                <p className="font-sans text-xs uppercase tracking-[0.22em] text-red">
                  From behind the bar
                </p>
                <ul className="mt-3 space-y-1.5">
                  {FEATURED_COCKTAILS.map((c) => (
                    <li key={c} className="font-display text-lg text-ink">
                      {c}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  Fresh ingredients, homemade syrups, and techniques older than the
                  building. Cocktails are poured in house, not sold online.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-10 rounded-sm border border-cream-dim bg-white p-8 sm:p-12 lg:grid-cols-2" data-reveal>
          <div>
            <p className="font-sans text-xs uppercase tracking-[0.24em] text-red">
              Since {SITE.since}
            </p>
            <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
              {SITE.tagline}.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-body">
              Marshall was a stop on the road west before it was a town with a
              courthouse. Travelers changed horses here, ate here, slept upstairs.
              The road got faster and the coaches stopped coming, and the building
              kept doing the part that mattered: feeding whoever walked in.
            </p>
            <Link
              href="/story"
              className="mt-6 inline-block font-sans text-sm text-red underline underline-offset-4 hover:text-red-deep"
            >
              Read the history
            </Link>
          </div>
          <div className="rounded-sm bg-ink p-8 text-cream-dim">
            <h3 className="font-display text-xl text-cream-light">Come find us</h3>
            <address className="mt-4 space-y-1 not-italic leading-relaxed">
              <p>{SITE.street}</p>
              <p>
                {SITE.city}, {SITE.state} {SITE.zip}
              </p>
            </address>
            <dl className="mt-5 space-y-2 text-sm">
              {SITE.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-4">
                  <dt>{h.days}</dt>
                  <dd className="text-cream-light">
                    {h.open} to {h.close}
                  </dd>
                </div>
              ))}
            </dl>
            <a
              href={SITE.phoneHref}
              className="mt-6 inline-block rounded-sm bg-red px-6 py-3 font-sans text-sm uppercase tracking-[0.14em] text-cream-light transition-colors hover:bg-red-light"
            >
              Call {SITE.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
