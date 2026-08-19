import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "That road went nowhere",
  robots: { index: false, follow: false },
};

// Their current site's sitemap lists three URLs, which means real links to
// other paths exist in the world: printed material, old posts, search results
// that have not caught up. Every one of those visitors used to land on the
// framework's bare error page. This one apologizes briefly and then does the
// three things they probably came for.
export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
      <div className="rule-double" />
      <div className="flex flex-wrap items-center justify-between gap-3 py-2.5">
        <p className="eyebrow text-red">Page not found</p>
        <p className="eyebrow text-muted">Established {SITE.since}</p>
      </div>
      <div className="rule-hair" />

      <div className="grid items-center gap-10 py-12 sm:grid-cols-[1fr_auto]">
        <div>
          <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] leading-[0.95] text-ink">
            That road went nowhere.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-body">
            The page you were after has moved or never existed. The bar has not
            moved since {SITE.since}, so here is the way back.
          </p>
        </div>
        <Image
          src="/brand/logo.png"
          alt=""
          width={720}
          height={613}
          className="hidden h-auto w-40 justify-self-end sm:block"
        />
      </div>

      <div className="rule-double" />
      <ul>
        {[
          { href: "/menu", title: "The menu", note: "All 61 items, with prices." },
          { href: "/order", title: "Order pickup", note: "Order ahead, pick it up at the bar." },
          { href: "/events", title: "What's on this week", note: "Trivia, bingo, live music, karaoke." },
          { href: "/visit", title: "Visit", note: `${SITE.street}, ${SITE.city}.` },
        ].map((l) => (
          <li key={l.href} className="border-b border-cream-dim">
            <Link
              href={l.href}
              className="group flex items-baseline justify-between gap-4 py-4 transition-colors hover:text-red"
            >
              <span>
                <span className="font-display text-xl text-ink group-hover:text-red">
                  {l.title}
                </span>
                <span className="ml-3 text-sm text-muted">{l.note}</span>
              </span>
              <span aria-hidden className="text-red">
                &rarr;
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <a
        href={SITE.phoneHref}
        className="mt-9 inline-block rounded-sm bg-red px-7 py-4 font-sans text-sm uppercase tracking-[0.14em] text-cream-light transition-colors hover:bg-red-deep"
      >
        Or call {SITE.phone}
      </a>
    </div>
  );
}
