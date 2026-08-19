/**
 * Tonight's-event logic, checked against a supplied clock.
 *
 * There is no test runner in this project and adding one for a single pure
 * function is not worth the dependency, so this is a script: it asserts, it
 * prints, and it exits non-zero if anything is wrong. Run it after touching
 * lib/tonight.ts or the weekly events.
 *
 *   node tools/test-tonight.mjs
 *
 * It transpiles the TypeScript through Next's own SWC so it is testing the
 * real module rather than a hand-copied version of it, which is the trap this
 * kind of script usually falls into.
 */
import { transform, loadBindings } from "next/dist/build/swc/index.js";
import { readFileSync, writeFileSync, mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

// SWC bindings are native and load lazily; ask for them before the first
// transform or every call throws "bindings not loaded yet".
await loadBindings();
const dir = mkdtempSync(join(tmpdir(), "tonight-"));
async function load(file, name, rewrites = []) {
  let src = readFileSync(file, "utf8");
  for (const [from, to] of rewrites) src = src.replaceAll(from, to);
  const out = await transform(src, { jsc: { parser: { syntax: "typescript" }, target: "es2022" }, module: { type: "es6" } });
  const p = join(dir, name);
  writeFileSync(p, out.code);
  return p;
}

// site.ts and time.ts are the real dependencies; only the import specifiers
// change, because node cannot resolve the "@/" alias.
await load("lib/site.ts", "site.mjs");
await load("lib/ordering/config.ts", "config.mjs");
await load("lib/ordering/time.ts", "time.mjs", [['from "./config"', 'from "./config.mjs"']]);
const tonight = await load("lib/tonight.ts", "tonight.mjs", [
  ['from "@/lib/ordering/time"', 'from "./time.mjs"'],
  ['from "@/lib/site"', 'from "./site.mjs"'],
]);
const { tonightsEvent } = await import(tonight);

// Michigan is UTC-4 in August, so 23:00Z is 7pm the same day in Detroit and
// 03:00Z is 11pm the PREVIOUS day: the case a naive getHours() gets wrong.
const cases = [
  ["2026-08-19T23:00:00Z", "Wed 7pm", "tonight", "Trivia Night"],
  ["2026-08-20T23:00:00Z", "Thu 7pm", "tonight", "DJ Bingo"],
  ["2026-08-23T23:00:00Z", "Sun 7pm", "tonight", "Karaoke"],
  ["2026-08-22T20:00:00Z", "Sat 4pm", "tonight", "Live Music"],
  // after the night is over, it must stop saying tonight
  ["2026-08-20T03:00:00Z", "Wed 11pm", "tomorrow", "DJ Bingo"],
  // days with nothing on look ahead
  ["2026-08-17T20:00:00Z", "Mon 4pm", "later", "Trivia Night"],
  ["2026-08-18T20:00:00Z", "Tue 4pm", "tomorrow", "Trivia Night"],
  ["2026-08-21T20:00:00Z", "Fri 4pm", "tomorrow", "Live Music"],
];

let bad = 0;
for (const [iso, label, when, name] of cases) {
  const got = tonightsEvent(new Date(iso));
  const ok = got && got.when === when && got.event.name === name;
  if (!ok) bad++;
  console.log(`${ok ? "ok  " : "FAIL"} ${label.padEnd(9)} expected ${when}/${name}` +
    (ok ? "" : `  got ${got ? got.when + "/" + got.event.name : "null"}`));
}
console.log(bad ? `\n${bad} failing` : "\nall passing");
process.exit(bad ? 1 : 0);
