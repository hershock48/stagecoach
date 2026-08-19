import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import InquiryForm from "@/components/InquiryForm";
import OpenNow from "@/components/OpenNow";
import PageMasthead from "@/components/PageMasthead";

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
      <PageMasthead
        eyebrow={`${SITE.city}, Michigan`}
        title="Visit."
        lede={`On Michigan Avenue, in the middle of everything, where it has been since ${SITE.since}.`}
      >
        <OpenNow />
      </PageMasthead>

      <div className="mx-auto max-w-5xl px-5 py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div data-reveal>
            <h2 className="font-display text-[clamp(1.7rem,4vw,2.3rem)] leading-none text-ink">Where and when</h2>
            <div className="mt-3 rule-double" />
            <address className="mt-4 space-y-1 text-lg not-italic leading-relaxed text-body">
              <p>{SITE.street}</p>
              <p>
                {SITE.city}, {SITE.state} {SITE.zip}
              </p>
            </address>
            <p className="mt-4">
              <a
                href={SITE.phoneHref}
                className="font-display text-3xl text-red underline underline-offset-4 decoration-1"
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
                className="rounded-sm bg-red px-7 py-4 font-sans text-sm uppercase tracking-[0.14em] text-cream-light transition-colors hover:bg-red-deep"
              >
                Directions
              </a>
              <Link
                href="/order"
                className="rounded-sm border-2 border-ink px-7 py-[14px] font-sans text-sm uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-cream-light"
              >
                Order pickup
              </Link>
            </div>

            {/* A static map link, not an embedded iframe: an embed loads a
                third-party script on every page view and gains nothing over a
                link that opens the visitor's own maps app. */}
            <div className="mt-8 border-2 border-ink bg-cream p-6">
              <h3 className="font-display text-xl text-ink">Parking</h3>
              <p className="mt-2 text-sm leading-relaxed text-body">
                Street parking on Michigan Avenue and the public lots a block
                either side. Downtown Marshall is walkable end to end.
              </p>
            </div>
          </div>

          <div data-reveal>
            <h2 className="font-display text-[clamp(1.7rem,4vw,2.3rem)] leading-none text-ink">Send a message</h2>
            <div className="mt-3 rule-double" />
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
