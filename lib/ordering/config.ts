// Jelly ordering: the numbers, in one place. Stagecoach edition.
//
// Same model as the Copper build this was ported from: a 99 cent order fee
// paid by the guest at online checkout, split 50/49 with the house at payment
// time (Stripe application_fee_amount once payments are wired). The dining
// room, the bar and their register are untouched by any of this.

export const ORDERING = {
  feeCents: 99,
  feeStudioCents: 49,
  feeLabel: "99¢ order fee",
  feeExplainer: "Half of it stays with the house.",
  timezone: "America/Detroit",

  // Michigan 6% on prepared food. The demo computes it for display; the live
  // build hands this to Stripe Tax on the restaurant's connected account.
  taxRate: 0.06,

  // A full kitchen with a fryer and a grill, not a window. Their Toast page
  // quotes nothing, so this is the honest starting point and the kitchen can
  // dial it up on a busy night from the board.
  basePickupMinutes: 20,

  tipPercents: [10, 15, 20] as const,

  // Their posted hours: Mon-Sat 11am to midnight, Sunday 10am to 10pm. Last
  // online order goes in well before close so the kitchen is not cooking for
  // a pickup nobody can collect.
  window: {
    // minutes from midnight, indexed Sunday = 0
    openMinutes: [10 * 60, 11 * 60, 11 * 60, 11 * 60, 11 * 60, 11 * 60, 11 * 60],
    lastOrderMinutes: [21 * 60, 22 * 60, 22 * 60, 22 * 60, 22 * 60, 22 * 60, 22 * 60],
  },

  demoNoticeShort: "Demo checkout. No card is charged.",
} as const;

// PLACEHOLDER: demo PIN, the building's street number. Set KITCHEN_PIN in
// Vercel before any staff member uses the board for real.
export const KITCHEN_PIN_FALLBACK = "0201";
