import type { Metadata } from "next";
import Link from "next/link";
import OrderClient from "@/components/ordering/OrderClient";
import { guestMenu } from "@/lib/ordering/menu";
import { getStore } from "@/lib/ordering/store";
import { SITE } from "@/lib/site";
import PageMasthead from "@/components/PageMasthead";

export const metadata: Metadata = {
  title: "Order pickup",
  description:
    "Order ahead for pickup at The Stagecoach Inn in downtown Marshall, Michigan. Burgers, handhelds, wings and salads from the scratch kitchen.",
  alternates: { canonical: "/order" },
};

// The menu is editable data and the window depends on the clock, so this
// renders per request. Never statically generated.
export const dynamic = "force-dynamic";

export default async function OrderPage() {
  const { sections } = await guestMenu(getStore());
  return (
    <>
      {/* What the guest does, nothing about how the ordering is built. Who
          runs the checkout is pitch material, not menu copy. */}
      <PageMasthead
        eyebrow={`${SITE.city}, Michigan`}
        title="Order pickup."
        lede="Order ahead, pick it up at the bar."
      />

      <div className="mx-auto max-w-5xl px-5 py-12">
        <OrderClient sections={sections} />
        <div className="mt-10 space-y-3 border-t border-cream-dim pt-8 text-xs leading-relaxed text-muted">
          <p>
            A 99&cent; order fee applies at checkout. Pickup at {SITE.street},{" "}
            {SITE.city}. Questions about an order in progress?{" "}
            <a href={SITE.phoneHref} className="text-red underline underline-offset-4">
              Call {SITE.phone}
            </a>
            . Drinks are poured for the room, not for takeout, so the bar menu is{" "}
            <Link href="/visit" className="text-red underline underline-offset-4">
              in house only
            </Link>
            .
          </p>
          <p>
            Consuming raw or undercooked meats, poultry, seafood, shellfish or
            eggs may increase your risk of foodborne illness, especially if you
            have certain medical conditions. Tell us about any allergy before you
            order.
          </p>
        </div>
      </div>
    </>
  );
}
