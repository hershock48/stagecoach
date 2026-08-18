import { SITE } from "@/lib/site";

/**
 * The masthead every page below the homepage wears.
 *
 * One component rather than five copies, because the first pass gave each
 * inner page its own dark hero band and the result was a site that changed
 * character every time you clicked something. A printed thing is consistent:
 * the same rules, the same standing line, the same fat-face heading, page
 * after page. That consistency is most of what separates this from a template
 * with the colors changed.
 */
export default function PageMasthead({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="bg-cream-light">
      <div className="mx-auto max-w-5xl px-5 pt-8 sm:pt-12">
        <div className="rule-double" />
        <div className="flex flex-wrap items-center justify-between gap-3 py-2.5">
          <p className="eyebrow text-red">{eyebrow}</p>
          <p className="eyebrow text-muted">
            Established {SITE.since} &middot; {SITE.city}, Michigan
          </p>
        </div>
        <div className="rule-hair" />

        <div className="py-10 sm:py-14">
          <h1 className="font-display text-[clamp(2.4rem,7vw,4.4rem)] leading-[0.95] text-ink">
            {title}
          </h1>
          {lede && (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-body">{lede}</p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}
