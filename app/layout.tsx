import type { Metadata } from "next";
import { Abril_Fatface, Source_Sans_3 } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/lib/site";
import "./globals.css";
import Reveal from "@/components/Reveal";

// Self-hosted at build time by next/font, which is what makes this compliant
// with the no-rented-dependencies rule: no runtime request to a font CDN.
//
// Abril Fatface for display. The first pass used Playfair, which is elegant
// and is also on half the restaurant sites on the internet; Kevin's read was
// that the whole site looked like it came off a template, and the safe font
// was part of that. Fat face is the advertising type of the 1820s to 1840s,
// the decade this building went up, and it is what an 1838 broadside for a
// stagecoach line was actually set in. It also echoes the logo's own
// high-contrast wordmark. Display sizes only: it has one weight and no
// business setting body copy.
const display = Abril_Fatface({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});
const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const DESCRIPTION =
  "A tavern in the oldest stagecoach stop in Marshall, Michigan. Scratch kitchen, full bar, trivia Wednesdays, karaoke Sundays. Order pickup online.";

export const metadata: Metadata = {
  metadataBase: new URL("https://stagecoach1838.com"),
  title: {
    default: `${SITE.name} · Bar and kitchen in Marshall, Michigan`,
    // Every route sets its own title; this is the frame, not a fallback that
    // ships as-is. glaze.md: every route has its OWN title and description.
    template: `%s · ${SITE.name}`,
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} · ${SITE.tagline} since ${SITE.since}`,
    description: DESCRIPTION,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${SITE.name}, ${SITE.street}` }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

// The structured data their current site does not have. Google reads this to
// answer "is it open now", "where is it", "what does it cost" without a
// visitor ever landing on the site. Hours come from lib/site.ts so the schema
// and the visible page can never disagree.
function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    name: SITE.name,
    description: DESCRIPTION,
    url: "https://stagecoach1838.com",
    telephone: SITE.phone,
    priceRange: "$$",
    foundingDate: String(SITE.since),
    servesCuisine: ["American", "Bar food"],
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.street,
      addressLocality: SITE.city,
      addressRegion: SITE.state,
      postalCode: SITE.zip,
      addressCountry: "US",
    },
    sameAs: [SITE.facebook],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "11:00",
        closes: "00:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "10:00",
        closes: "22:00",
      },
    ],
    hasMenu: "https://stagecoach1838.com/menu",
    acceptsReservations: "False",
  };
}

const NAV = [
  { href: "/menu", label: "Menu" },
  { href: "/events", label: "What's on" },
  { href: "/story", label: "Since 1838" },
  { href: "/visit", label: "Visit" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen bg-cream-light">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema()) }}
        />
        <Reveal />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-ink focus:px-4 focus:py-2 focus:text-cream-light"
        >
          Skip to content
        </a>

        <header className="sticky top-0 z-40 border-b border-cream-dim/60 bg-cream-light/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
            <Link href="/" className="flex items-center gap-3" aria-label={`${SITE.name} home`}>
              <Image
                src="/brand/logo.png"
                alt=""
                width={720}
                height={613}
                className="h-11 w-auto"
                priority
              />
              <span className="sr-only">{SITE.name}</span>
            </Link>
            <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="font-sans text-sm tracking-wide text-body transition-colors hover:text-red"
                >
                  {n.label}
                </Link>
              ))}
              <Link
                href="/order"
                className="rounded-sm bg-red px-4 py-2 font-sans text-xs uppercase tracking-[0.14em] text-cream-light transition-colors hover:bg-red-light"
              >
                Order pickup
              </Link>
            </nav>
            <Link
              href="/order"
              className="rounded-sm bg-red px-3.5 py-2 font-sans text-xs uppercase tracking-[0.12em] text-cream-light md:hidden"
            >
              Order
            </Link>
          </div>
          {/* The phone belongs above the fold on every page, not buried on a
              contact page. It is the action a bar actually gets. */}
          <div className="border-t border-cream-dim/50 bg-cream/70 md:hidden">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-1.5 text-xs">
              <nav aria-label="Sections" className="flex gap-4">
                {NAV.map((n) => (
                  <Link key={n.href} href={n.href} className="text-body">
                    {n.label}
                  </Link>
                ))}
              </nav>
              <a href={SITE.phoneHref} className="font-semibold text-red">
                Call
              </a>
            </div>
          </div>
        </header>

        <main id="main">{children}</main>

        <footer className="mt-20 bg-ink text-cream-dim">
          <div className="mx-auto max-w-6xl px-5 pt-12">
            <p className="text-center font-display text-[clamp(1.5rem,4vw,2.4rem)] leading-none text-cream-light">
              {SITE.tagline}, since {SITE.since}.
            </p>
            <div className="mt-6 h-px bg-ink-line" />
          </div>
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Image
                src="/brand/logo.png"
                alt={`${SITE.name} logo`}
                width={720}
                height={613}
                className="h-16 w-auto"
              />
              <p className="mt-4 text-sm leading-relaxed">
                One of Michigan&rsquo;s oldest stagecoach stops, still open.
              </p>
            </div>
            <div>
              <h2 className="eyebrow border-b border-ink-line pb-2 text-cream-light">
                Find us
              </h2>
              <address className="mt-3 space-y-1 text-sm not-italic leading-relaxed">
                <p>{SITE.street}</p>
                <p>
                  {SITE.city}, {SITE.state} {SITE.zip}
                </p>
                <p>
                  <a href={SITE.phoneHref} className="underline underline-offset-4 hover:text-cream-light">
                    {SITE.phone}
                  </a>
                </p>
              </address>
            </div>
            <div>
              <h2 className="eyebrow border-b border-ink-line pb-2 text-cream-light">
                Hours
              </h2>
              <dl className="mt-3 space-y-1.5 text-sm">
                {SITE.hours.map((h) => (
                  <div key={h.days}>
                    <dt className="text-cream-light/80">{h.days}</dt>
                    <dd>
                      {h.open} to {h.close}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h2 className="eyebrow border-b border-ink-line pb-2 text-cream-light">
                More
              </h2>
              <ul className="mt-3 space-y-1.5 text-sm">
                <li>
                  <Link href="/menu" className="underline underline-offset-4 hover:text-cream-light">
                    Menu
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="underline underline-offset-4 hover:text-cream-light">
                    What&rsquo;s on this week
                  </Link>
                </li>
                <li>
                  <Link href="/order" className="underline underline-offset-4 hover:text-cream-light">
                    Order pickup
                  </Link>
                </li>
                <li>
                  <a
                    href={SITE.facebook}
                    className="underline underline-offset-4 hover:text-cream-light"
                    target="_blank"
                    rel="noopener"
                  >
                    Facebook
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-ink-line">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-xs">
              <p>
                &copy; {SITE.since}&ndash;present {SITE.name}. Marshall, Michigan.
              </p>
              {/* The studio credit goes on before launch, not after. */}
              <a
                href="https://glazedweb.com"
                target="_blank"
                rel="noopener"
                className="transition-colors hover:text-cream-light"
              >
                Double Dipped by Glazed Web
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
