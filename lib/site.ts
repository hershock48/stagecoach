// Every fact about the business, in one file.
//
// The glaze.md rule: a correction is one edit, not six. Anything typed into a
// component instead of imported from here is a fact that will go stale
// silently. Two surfaces cannot read from this file and are named in the
// README: the OG image (public/og.jpg) and the logo artwork itself.
//
// SOURCES. Everything below was taken from the client's own live properties on
// August 18 2026, not inferred:
//   - stagecoach1838.com (their WordPress site): address, hours, founding
//     year, the "Preferred Stop" line, the three weekly events, chef's name
//   - thecoach.toast.site (Toast's mirror of them): phone number, Saturday
//     live music
//   - order.toasttab.com/online/the-coach-201-west-michigan-avenue: the menu
//
// PLACEHOLDER items are marked and repeated on the README checklist.

export const SITE = {
  name: "The Stagecoach Inn",
  shortName: "Stagecoach Inn",
  // The logo's own words, and the site's hero. Lifted, not invented.
  tagline: "The Preferred Stop",
  since: 1838,

  street: "201 West Michigan Avenue",
  city: "Marshall",
  state: "MI",
  zip: "49068",
  get address() {
    return `${this.street}, ${this.city}, ${this.state} ${this.zip}`;
  },

  phone: "(269) 781-3571",
  phoneHref: "tel:+12697813571",

  // PLACEHOLDER: the current site publishes no email address anywhere, only a
  // contact form. Ask the owner which inbox a real human reads, then set this
  // and INQUIRY_TO. Until then the contact form routes to Glazed Web's own
  // verified sender with replyTo set to the guest.
  email: "hello@stagecoach1838.com",

  // The canonical home of the site once it launches on their own domain.
  url: "https://stagecoach1838.com",

  facebook: "https://www.facebook.com/profile.php?id=61561039580321",

  // Their existing Toast surfaces. Kept so the demo can link out honestly
  // where it has not replaced something yet, and so the proposal can cite
  // exactly what a guest is handed off to today.
  toast: {
    order: "https://order.toasttab.com/online/the-coach-201-west-michigan-avenue",
    waitlist:
      "https://tables.toasttab.com/restaurants/3ae4160e-0c02-4ed7-8831-2dc8ab2accf8/joinWaitlist",
    rewards:
      "https://www.toasttab.com/the-coach-201-west-michigan-avenue/rewardsSignup",
    mirrorSite: "https://thecoach.toast.site/",
  },

  // Sunday differs from the rest of the week, which is exactly the kind of
  // thing that gets typed wrong in six places.
  hours: [
    { days: "Monday to Saturday", open: "11:00am", close: "Midnight" },
    { days: "Sunday", open: "10:00am", close: "10:00pm" },
  ],

  // Their own words, from their homepage.
  chef: "Jared Knight",
  historyLine:
    "Established in 1838, The Stagecoach Inn is one of Michigan's oldest stagecoach stops, now a bar and restaurant where history meets hospitality.",
} as const;

// The week, as the venue actually runs it. Times from their homepage; the
// Saturday line is from their Toast mirror, which advertises live music with
// no time attached, so no time is invented here.
export type WeeklyEvent = {
  day: string;
  name: string;
  time: string | null;
  blurb: string;
  image: string | null;
};

export const WEEKLY_EVENTS: WeeklyEvent[] = [
  {
    day: "Wednesday",
    name: "Trivia Night",
    time: "7:00 to 9:00pm",
    blurb: "Bring a team, or borrow one at the bar.",
    image: "/brand/trivia.jpg",
  },
  {
    day: "Thursday",
    name: "DJ Bingo",
    time: "7:00 to 9:00pm",
    blurb: "Bingo, except the numbers are songs.",
    image: "/brand/dj-bingo.jpg",
  },
  {
    day: "Saturday",
    name: "Live Music",
    // PLACEHOLDER: their Toast page advertises Saturday live music without a
    // start time, and the WordPress site does not mention it at all. Ask.
    time: null,
    blurb: "Local players, most Saturdays.",
    image: null,
  },
  {
    day: "Sunday",
    name: "Karaoke",
    time: "7:00 to 10:00pm",
    blurb: "The one night the room sings back.",
    image: "/brand/karaoke.jpg",
  },
];

// Their homepage's own featured lists, kept verbatim. The cocktails are not
// orderable online (Michigan lets a licensee sell cocktails to go, but this
// build does not assume they want to; that is a conversation, not a guess).
export const FEATURED_COCKTAILS = [
  "Coach Old Fashioned",
  "Espresso Martini",
  "Coach Margarita",
] as const;
