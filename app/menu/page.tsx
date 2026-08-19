import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import PageMasthead from "@/components/PageMasthead";
import SEED_MENU from "@/lib/ordering/toast-menu.json";
import type { MenuDocSection } from "@/lib/ordering/menu";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "The full Stagecoach Inn menu: burgers, handhelds, mains, salads, kids and sides, with prices. Marshall, Michigan.",
  alternates: { canonical: "/menu" },
};

// The menu is the most-visited page on any restaurant site and the one their
// current site does not have: every "Menu" link on stagecoach1838.com points
// at Toast's domain, and /menu/ returns a 404. This page is why the rebuild
// exists.
//
// It reads the same document the ordering system reads, so the menu a guest
// browses and the menu the kitchen sells can never drift apart. Prices are
// rendered from cents, never from a string, so "12.00" cannot happen.
const sections = SEED_MENU as MenuDocSection[];

function money(cents: number): string {
  return cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`;
}

export default function MenuPage() {
  return (
    <>
      <PageMasthead
        eyebrow="Bill of fare"
        title="The menu."
        lede={`Scratch kitchen under Executive Chef ${SITE.chef}. Everything below is what the kitchen is selling today, and you can order any of it for pickup.`}
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href="/order"
            className="rounded-sm bg-red px-7 py-4 font-sans text-sm uppercase tracking-[0.14em] text-cream-light transition-colors hover:bg-red-deep"
          >
            Order pickup
          </Link>
          <a
            href={SITE.phoneHref}
            className="rounded-sm border-2 border-ink px-7 py-[14px] font-sans text-sm uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-cream-light"
          >
            Call {SITE.phone}
          </a>
        </div>
      </PageMasthead>

      {/* Jump list. A sixty-one item menu on a phone needs one. */}
      <nav
        aria-label="Menu sections"
        className="sticky top-[var(--header-h)] z-30 border-b border-cream-dim bg-cream-light/95 backdrop-blur"
      >
        <ul className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-5 py-2.5">
          {sections.map((s) => (
            <li key={s.name} className="flex-none">
              <a
                href={`#${slug(s.name)}`}
                className="block rounded-sm px-3 py-1.5 font-sans text-xs uppercase tracking-[0.12em] text-body transition-colors hover:bg-cream hover:text-red"
              >
                {s.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto max-w-4xl px-5 py-16">
        {sections.map((section) => (
          <section key={section.name} id={slug(section.name)} className="scroll-mt-[calc(var(--header-h)+3.5rem)] pb-14">
            <h2 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] leading-none text-ink">{section.name}</h2>
            <div className="mt-3 rule-double" />
            <ul className="mt-7 space-y-6">
              {section.items
                .filter((i) => !i.hidden)
                .map((item) => (
                  <li key={item.id} className="flex gap-4" data-reveal>
                    {item.image && (
                      <Image
                        src={item.image}
                        alt=""
                        width={160}
                        height={160}
                        className="h-20 w-20 flex-none rounded-sm border border-cream-dim object-cover sm:h-24 sm:w-24"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="font-display text-lg text-ink">{item.name}</h3>
                        <span className="flex-none font-sans text-sm tabular-nums text-ink">
                          {money(item.priceCents)}
                        </span>
                      </div>
                      {item.desc && (
                        <p className="mt-1 text-sm leading-relaxed text-body">{item.desc}</p>
                      )}
                      {/* The choices a guest actually has to make, named rather
                          than hidden behind an ordering page. */}
                      {item.groups.some((g) => g.required) && (
                        <p className="mt-1.5 text-xs text-muted">
                          {item.groups
                            .filter((g) => g.required)
                            .map((g) => `Choose your ${g.name.replace(/ Choice$/i, "").toLowerCase()}`)
                            .join(" · ")}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          </section>
        ))}

        <p className="border-t border-cream-dim pt-8 text-sm leading-relaxed text-muted">
          Consuming raw or undercooked meats, poultry, seafood, shellfish or eggs
          may increase your risk of foodborne illness, especially if you have
          certain medical conditions. Tell us about any allergy before you order.
        </p>
      </div>
    </>
  );
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
