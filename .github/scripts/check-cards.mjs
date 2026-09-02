// Asserts that the two halves of a social card name the same picture.
//
// Open Graph and Twitter tags are written by two different partials, and for a
// while by two different sources of truth: head.html deferred og:image to
// Hugo's embedded opengraph.html whenever images was set, while twitter_cards
// took its picture from social-image.html, which ranks cover higher. A site
// setting params.images then showed one picture and named another on every page
// with a cover, and nothing failed. The theme owns opengraph.html now; this is
// the assertion that keeps them from drifting apart again.
//
//   node .github/scripts/check-cards.mjs <public-dir>

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Quoted, single-quoted or bare: the demo deploys with --minify, which drops
// the quotes around any value that does not need them, so a pattern requiring
// them would pass by never matching anything. Same shape as check-sharing.mjs.
const META = /<meta\b[^>]*>/gi;
const ATTR = (name) =>
  new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");

const PROPERTY = ATTR("property");
const NAME = ATTR("name");
const CONTENT = ATTR("content");

function attr(tag, re) {
  const m = tag.match(re);
  return m ? (m[1] ?? m[2] ?? m[3] ?? "") : null;
}

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (full.endsWith(".html")) yield full;
  }
}

const root = process.argv[2] || "public";
const failures = [];
let pages = 0;
let withImage = 0;

for (const file of walk(root)) {
  const html = readFileSync(file, "utf8");
  const tags = { "og:image": [], "og:image:alt": [], "twitter:image": [], "twitter:image:alt": [] };

  for (const m of html.matchAll(META)) {
    const tag = m[0];
    const key = attr(tag, PROPERTY) ?? attr(tag, NAME);
    if (key === null) continue;
    const k = key.toLowerCase();
    if (k in tags) tags[k].push(attr(tag, CONTENT) ?? "");
  }

  // A page with none of these is a page with no card to get wrong.
  if (!Object.values(tags).some((v) => v.length)) continue;
  pages++;

  // A card shows one picture. Two og:image tags let the crawler pick, and the
  // one it picks is the one nobody chose.
  for (const k of ["og:image", "twitter:image", "og:image:alt", "twitter:image:alt"]) {
    if (tags[k].length > 1) {
      failures.push([file, `${tags[k].length} × ${k}`, "a card names one picture"]);
    }
  }

  const og = tags["og:image"][0];
  const tw = tags["twitter:image"][0];

  if (og && tw) {
    withImage++;
    if (og !== tw) {
      failures.push([file, `og:image ${og}\n    twitter:image ${tw}`, "the two halves name different pictures"]);
    }
  } else if (og || tw) {
    // One without the other is a card that is half a card.
    failures.push([file, og ? "og:image with no twitter:image" : "twitter:image with no og:image",
      "both tag sets carry the picture, or neither does"]);
  }

  // An alt describes a picture. Without one it describes nothing, which is
  // exactly how the og:image:alt used to outlive the image it belonged to.
  if (tags["og:image:alt"].length && !og) {
    failures.push([file, "og:image:alt with no og:image", "an alt with no picture to describe"]);
  }
  if (tags["twitter:image:alt"].length && !tw) {
    failures.push([file, "twitter:image:alt with no twitter:image", "an alt with no picture to describe"]);
  }
}

console.log(`checked ${pages} pages carrying card tags, ${withImage} of them with a picture`);
if (failures.length) {
  console.error(`\n${failures.length} broken:\n`);
  for (const [file, what, why] of failures) console.error(`  ${file}\n    ${what}  (${why})`);
  process.exit(1);
}
console.log("every card names one picture, and both halves agree on it");
