// Builds public/pitch/og.jpg, the proposal's share card.
//
// The first one was made by hand, which meant that when the hero headline
// changed the card kept advertising the old one — a link preview saying
// something the page no longer says. This exists so the card is regenerated
// from the headline rather than remembered.
//
//   node tools/make-og.mjs
//
// Re-run it whenever the <h1> in public/pitch/stagecoach.html changes. The
// three HEADLINE lines below should read as the same sentence the hero does.
//
// 1200x630 is the size every platform crops from. Text stays inside the left
// 58% because that is what survives the square crop some clients apply.

import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

const HEADLINE = ["You own the building.", "You do not own", "the website."];
const KICKER = "Proposal";
const SUB = "Your menu is not on your website. Your events page says you have no events.";
const LEFT = "The Stagecoach Inn";
const RIGHT = "Glazed Web";

// Sampled from the logo, the same three the site's palette is built on.
const CREAM = "#E0D8C8";
const RED = "#902828";
const RED_PALE = "#e29288"; // 7.84 on ink; the hero's <em> colour

const b64 = (p) => fs.readFileSync(path.join(ROOT, p)).toString("base64");
const photo = `data:image/webp;base64,${b64("public/brand/exterior.webp")}`;
const badge = `data:image/png;base64,${b64("public/brand/logo.png")}`;

const html = `<!doctype html><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#000;position:relative;overflow:hidden;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
.photo{position:absolute;inset:0;background:url('${photo}') center/cover no-repeat;opacity:.42}
.shade{position:absolute;inset:0;background:linear-gradient(100deg,#000 34%,rgba(0,0,0,.55) 72%,rgba(0,0,0,.25) 100%)}
.body{position:absolute;inset:0 0 74px 0;display:flex;align-items:center;justify-content:space-between;padding:0 62px}
.copy{width:700px}
.kicker{font-size:21px;font-weight:800;letter-spacing:.26em;text-transform:uppercase;color:${RED_PALE};margin-bottom:22px}
h1{font-size:60px;font-weight:800;line-height:1.06;letter-spacing:-1.6px;color:${CREAM}}
h1 em{font-style:normal;color:${RED_PALE}}
.sub{margin-top:26px;font-size:23px;line-height:1.45;color:#B9AE9E;max-width:20em}
.badge{width:210px;height:auto;flex:0 0 auto}
.foot{position:absolute;left:0;right:0;bottom:0;height:74px;background:${RED};
  display:flex;align-items:center;justify-content:space-between;padding:0 62px;
  font-size:23px;font-weight:800;letter-spacing:.19em;text-transform:uppercase;color:#fff}
</style>
<div class="photo"></div><div class="shade"></div>
<div class="body">
  <div class="copy">
    <div class="kicker">${KICKER}</div>
    <h1>${HEADLINE[0]}<br><em>${HEADLINE[1]}<br>${HEADLINE[2]}</em></h1>
    <p class="sub">${SUB}</p>
  </div>
  <img class="badge" src="${badge}" alt="">
</div>
<div class="foot"><span>${LEFT}</span><span>${RIGHT}</span></div>`;

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "load" });
await page.waitForTimeout(300);

// Assert the copy actually fits before writing. A share card that silently
// clips its own headline is worse than no card.
const fit = await page.evaluate(() => {
  const h = document.querySelector("h1");
  const c = document.querySelector(".copy");
  return {
    headlineWidth: Math.ceil(h.getBoundingClientRect().width),
    copyWidth: Math.ceil(c.getBoundingClientRect().width),
    bodyOverflow: document.body.scrollHeight > 630 || document.body.scrollWidth > 1200,
  };
});
if (fit.headlineWidth > fit.copyWidth) {
  throw new Error(`headline overflows its column: ${fit.headlineWidth} > ${fit.copyWidth}`);
}
if (fit.bodyOverflow) throw new Error("card overflows 1200x630");

const out = path.join(ROOT, "public/pitch/og.jpg");
await page.screenshot({ path: out, type: "jpeg", quality: 88 });
await browser.close();
console.log(`wrote ${out} (headline ${fit.headlineWidth}px in a ${fit.copyWidth}px column)`);
