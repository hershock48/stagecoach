// What is on tonight. Domain logic, deliberately kept out of the component so
// it can be tested against a supplied clock rather than only against whatever
// day it happens to be when someone looks at the site.
//
// Two traps, both from the glaze.md failure log:
//   - new Date() in a statically generated page freezes at build time, so
//     every route that renders this must be force-dynamic.
//   - getHours() on a UTC lambda would roll the day over at 8pm Michigan time
//     and call it tomorrow. localNow uses Intl and the venue's own timezone.

import { localNow } from "@/lib/ordering/time";
import { WEEKLY_EVENTS, type WeeklyEvent } from "@/lib/site";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Their listed nights all end by 10pm. After 10:30 the night is over, and a
// line still promising karaoke at 11:30 on a Sunday is worse than no line.
const NIGHT_OVER_MINUTES = 22 * 60 + 30;

export type Tonight =
  | { when: "tonight" | "tomorrow" | "later"; event: WeeklyEvent }
  | null;

export function tonightsEvent(now: Date = new Date()): Tonight {
  const { day, minutes } = localNow(now);
  const today = DAY_NAMES[day];

  const todays = WEEKLY_EVENTS.find((e) => e.day === today);
  if (todays && minutes < NIGHT_OVER_MINUTES) {
    return { when: "tonight", event: todays };
  }

  for (let ahead = 1; ahead <= 7; ahead++) {
    const name = DAY_NAMES[(day + ahead) % 7];
    const next = WEEKLY_EVENTS.find((e) => e.day === name);
    if (next) return { when: ahead === 1 ? "tomorrow" : "later", event: next };
  }
  return null;
}
