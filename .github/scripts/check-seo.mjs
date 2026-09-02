// Asserts the six invariants the theme's head and structured data rest on.
//
// Every one of them is a thing a build reports nothing about. A page can name
// two different URLs as its own, announce a card picture no platform renders,
// or carry two contradictory robots directives, and Hugo will call that a
// successful build -- which is how each of the six got in.
//
// The four the theme has actually shipped:
//
//   og:url was .Permalink on every pager of a list, while the canonical link
//   beside it named the pager, so page two claimed to be two URLs at once.
//
//   an SVG cover became the og:image and the twitter:image, and the card was
//   announced as summary_large_image and then arrived empty, because no
//   platform renders one.
//
//   the search page carried no robots tag and sat in every sitemap: an empty
//   results list and a form, in four languages.
//
//   a post with a cover had it in its card and nothing in its BlogPosting,
//   where Google's Article guidance asks for it.
//
// The other two have never failed, which is the point of a regression test.
//
//   node .github/scripts/check-seo.mjs <public-dir>

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Quoted, single-quoted or bare. The demo deploys with --minify, which drops
// the quotes around any attribute value that does not need them, so a pattern
// that required them would silently check a subset. Same shape as HREF in
// check-sharing.mjs, which is where that was learned.
const attr = (name) => String.raw`\b${name}\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))`;
const pick = (m) => (m ? (m[1] ?? m[2] ?? m[3] ?? "") : null);

const LINK = /<link\b[^>]*>/gi;
const META = /<meta\b[^>]*>/gi;
const REL = new RegExp(attr("rel"), "i");
const HREF = new RegExp(attr("href"), "i");
const NAME = new RegExp(attr("name"), "i");
const PROPERTY = new RegExp(attr("property"), "i");
const CONTENT = new RegExp(attr("content"), "i");
const LD = /<script[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi;

// The search layout is not knowable from the markup, so the form it is the only
// template to render stands in for it.
const SEARCH_FORM = /<form\b[^>]*\bclass\s*=\s*(?:"[^"]*search-form[^"]*"|'[^']*search-form[^']*'|[^\s>]*search-form[^\s>]*)/i;

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (full.endsWith(".html")) yield full;
  }
}

const root = process.argv[2] || "public";
const failures = [];
let checked = 0;

for (const file of walk(root)) {
  const html = readFileSync(file, "utf8");

  let canonical = null;
  for (const tag of html.match(LINK) ?? []) {
    if ((pick(tag.match(REL)) ?? "").toLowerCase() === "canonical") canonical = pick(tag.match(HREF));
  }

  const robots = [];
  const og = new Map();
  const named = new Map();
  for (const tag of html.match(META) ?? []) {
    const property = (pick(tag.match(PROPERTY)) ?? "").toLowerCase();
    const name = (pick(tag.match(NAME)) ?? "").toLowerCase();
    const content = pick(tag.match(CONTENT)) ?? "";
    if (name === "robots") robots.push(content);
    if (property) og.set(property, content);
    if (name) named.set(name, content);
  }

  const blocks = [];
  for (const m of html.matchAll(LD)) {
    try {
      blocks.push(JSON.parse(m[1]));
    } catch {
      failures.push([file, "a JSON-LD block", "does not parse as JSON"]);
    }
  }
  checked++;

  // 1. The page names one URL as its own. og:url is the canonical Facebook and
  //    LinkedIn read; disagreeing with the link element asserts two.
  const ogUrl = og.get("og:url");
  if (canonical && ogUrl && canonical !== ogUrl) {
    failures.push([file, `canonical ${canonical}`, `og:url says ${ogUrl}`]);
  }

  // 2. One robots meta, never two. A second is a directive nobody can order
  //    against the first.
  if (robots.length > 1) {
    failures.push([file, `${robots.length} robots tags: ${robots.join(" | ")}`, "a page may carry one"]);
  }

  // 3. No SVG on a card. Facebook, X and LinkedIn render none, so the card is
  //    announced and then arrives empty.
  for (const key of ["og:image", "og:image:secure_url"]) {
    const v = og.get(key);
    if (v && new URL(v, "https://example.invalid/").pathname.toLowerCase().endsWith(".svg")) {
      failures.push([file, `${key} ${v}`, "no platform renders an SVG on a card"]);
    }
  }
  const twitterImage = named.get("twitter:image");
  if (twitterImage && new URL(twitterImage, "https://example.invalid/").pathname.toLowerCase().endsWith(".svg")) {
    failures.push([file, `twitter:image ${twitterImage}`, "no platform renders an SVG on a card"]);
  }

  // 4. An article whose picture is its own says so in its structured data.
  //    og:image:alt is the marker: head.html offers it only for a picture that
  //    belongs to the page, which is exactly the case json-ld.html takes.
  const article = blocks.find((b) => b && b["@type"] === "BlogPosting");
  if (article && og.get("og:image") && og.has("og:image:alt") && !article.image) {
    failures.push([file, "a BlogPosting with the page's own og:image", "carries no image of its own"]);
  }

  // 5. Structured data that parses, and says what it is. Cheap, and it has
  //    never caught anything, which is what a regression test is for.
  for (const b of blocks) {
    if (!b || !b["@context"] || !b["@type"]) {
      failures.push([file, "a JSON-LD block", "has no @context or no @type"]);
    }
  }

  // 6. A search page is not for an index. Thin by construction, and a crawler
  //    can generate URLs from one without end.
  if (SEARCH_FORM.test(html) && !robots.some((r) => r.toLowerCase().includes("noindex"))) {
    failures.push([file, "a search page", "is not marked noindex"]);
  }
}

console.log(`checked ${checked} pages`);
if (failures.length) {
  console.error(`\n${failures.length} broken:\n`);
  for (const [file, what, why] of failures) console.error(`  ${file}\n    ${what}  (${why})`);
  process.exit(1);
}
console.log("canonical and og:url agree, one robots tag each, no SVG on a card");
console.log("every JSON-LD block parses, an owned picture is in its BlogPosting, search is noindex");
