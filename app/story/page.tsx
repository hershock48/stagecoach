import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import PageMasthead from "@/components/PageMasthead";

export const metadata: Metadata = {
  title: `Since ${SITE.since}`,
  description:
    "Built in 1838 on the Territorial Road between Detroit and Chicago, The Stagecoach Inn is a Greek Revival landmark in Marshall, Michigan, still open and still feeding travelers.",
  alternates: { canonical: "/story" },
};

// Everything on this page is sourced, because a history page is exactly where
// a website invents things. The marker text is quoted verbatim from the
// Historical Marker Database entry for the building; the road and the town
// facts come with it. Nothing here was inferred to sound good.
//
// SOURCE: hmdb.org marker 216535, "The Stagecoach Inn", at S Eagle St and W
// Michigan Ave. Linked at the foot of the page so a reader can check it.
export default function StoryPage() {
  return (
    <>
      <PageMasthead
        eyebrow={SITE.tagline}
        title={`Built in ${SITE.since}, on the road to Chicago.`}
      />

      <div className="mx-auto max-w-3xl px-5 py-16">
        <div className="space-y-6 text-lg leading-relaxed text-body" data-reveal>
          <p>
            Before Michigan Avenue was Michigan Avenue it was the Territorial
            Road, cut along trails that ran from Detroit to Chicago. Anyone
            crossing southern Michigan in the 1830s crossed it slowly, in a coach,
            with horses that needed changing and passengers who needed feeding.
          </p>
          <p>
            This building went up in {SITE.since} to meet them. Zenos Tillotson was
            the first proprietor, and by 1846 he was running stagecoach lines from
            Ann Arbor to Niles with Marshall as the main stop in the middle. The
            sign outside still says what the business was: the preferred stop.
          </p>
          <p>
            It is one of the better examples of Greek Revival architecture left in
            Michigan, and it never stopped doing the job it was built for. The
            coaches went away. The kitchen did not.
          </p>
        </div>

        <figure
          className="mt-12 border-y-2 border-ink bg-cream px-7 py-8"
          data-reveal
        >
          <blockquote className="font-display text-[clamp(1.3rem,3vw,1.75rem)] leading-snug text-ink">
            &ldquo;Today this is the oldest continuously open town between Detroit
            and Chicago and has become one of the rare, genuine early American
            places of historical interest in the Midwest. As always, a cordial
            welcome awaits you here.&rdquo;
          </blockquote>
          <figcaption className="mt-4 font-sans text-sm text-muted">
            From the historical marker outside, at Eagle and Michigan.{" "}
            <a
              href="https://www.hmdb.org/m.asp?m=216535"
              target="_blank"
              rel="noopener"
              className="text-red underline underline-offset-4"
            >
              Read the whole marker
            </a>
          </figcaption>
        </figure>

        <div className="mt-12 space-y-6 text-lg leading-relaxed text-body" data-reveal>
          <p>
            What happens here now is simpler than the history and about the same
            idea. Executive Chef {SITE.chef} runs a scratch kitchen. The bar makes
            its own syrups. Wednesday is trivia, Thursday is DJ bingo, Saturday
            there is usually a band, and Sunday somebody sings karaoke badly and
            everyone claps anyway.
          </p>
          <p>
            You are welcome to eat in. You are also welcome to order ahead and
            take it with you, which is roughly what the stagecoach passengers were
            doing, except faster.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap gap-3" data-reveal>
          <Link
            href="/menu"
            className="rounded-sm bg-red px-7 py-4 font-sans text-sm uppercase tracking-[0.14em] text-cream-light transition-colors hover:bg-red-deep"
          >
            See the menu
          </Link>
          <Link
            href="/visit"
            className="rounded-sm border-2 border-ink px-7 py-[14px] font-sans text-sm uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-cream-light"
          >
            Plan a visit
          </Link>
        </div>
      </div>
    </>
  );
}
