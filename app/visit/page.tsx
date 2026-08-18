import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import InquiryForm from "@/components/InquiryForm";
import OpenNow from "@/components/OpenNow";

export const metadata: Metadata = {
  title: "Visit",
  description:
    "The Stagecoach Inn, 201 West Michigan Avenue, Marshall, Michigan. Hours, phone, parking and directions.",
  alternates: { canonical: "/visit" },
};

// Time-dependent: OpenNow reads the clock, so this route renders per request.
export const dynamic = "force-dynamic";

export default function VisitPage() {
  return (
    <>
      <section className="border-b border-cream-dim bg-ink">
        <div className="mx-auto max-w-5xl px-5 py-16">
          <p className="font-sans text-xs uppercase tracking-[0.24em] text-red-pale">
            {SITE.city}, Michigan
          </p>
          <h1 className="mt-3 font-display text-4xl text-cream-light sm:text-5xl">Visit.</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-cream-dim">
            On Michigan Avenue, in the middle of everything, where it has been
            since {SITE.since}.
          </p>
          <div className="mt-7">
            <OpenNow />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div data-reveal>
            <h2 className="font-display text-2xl text-ink">Where and when</h2>
            <address className="mt-4 space-y-1 text-lg not-italic leading-relaxed text-body">
              <p>{SITE.street}</p>
              <p>
                {SITE.city}, {SITE.state} {SITE.zip}
              </p>
            </address>
            <p className="mt-4">
              <a
                href={SITE.phoneHref}
                className="font-display text-2xl text-red underline underline-offset-4"
              >
                {SITE.phone}
              </a>
            </p>

            <dl className="mt-7 divide-y divide-cream-dim border-y border-cream-dim">
              {SITE.hours.map((h) => (
                <div key={h.days} className="flex items-baseline justify-between gap-4 py-3.5">
                  <dt className="text-body">{h.days}</dt>
                  <dd className="font-sans tabular-nums text-ink">
                    {h.open} to {h.close}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              The kitchen stops taking online pickup orders about an hour before
              the bar closes, so the last order out is a hot one.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${SITE.name}, ${SITE.address}`)}`}
                target="_blank"
                rel="noopener"
                className="rounded-sm bg-red px-6 py-3.5 font-sans text-sm uppercase tracking-[0.14em] text-cream-light transition-colors hover:bg-red-light"
              >
                Directions
              </a>
              <Link
                href="/order"
                className="rounded-sm border border-cream-dim px-6 py-3.5 font-sans text-sm uppercase tracking-[0.14em] text-ink transition-colors hover:border-red hover:text-red"
              >
                Order pickup
              </Link>
            </div>

            {/* A static map link, not an embedded iframe: an embed loads a
                third-party script on every page view and gains nothing over a
                link that opens the visitor's own maps app. */}
            <div className="mt-8 rounded-sm border border-cream-dim bg-cream p-6">
              <h3 className="font-display text-lg text-ink">Parking</h3>
              <p className="mt-2 text-sm leading-relaxed text-body">
                Street parking on Michigan Avenue and the public lots a block
                either side. Downtown Marshall is walkable end to end.
              </p>
            </div>
          </div>

          <div data-reveal>
            <h2 className="font-display text-2xl text-ink">Send a message</h2>
            <p className="mt-2 leading-relaxed text-body">
              Private parties, big groups, or a question the menu does not answer.
              For anything happening today, call. Someone is behind the bar.
            </p>
            <div className="mt-6">
              <InquiryForm variant="contact" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
