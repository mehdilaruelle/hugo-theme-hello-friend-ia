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
// that required them would silently check a subset. The lookbehind is the name
// test \b is not: a word boundary sits between "-" and a letter too, so \brel
// reads the rel inside data-rel. Same shape as HREF in check-sharing.mjs, which
// is where both were learned.
const attr = (name) => String.raw`(?<![-\w])${name}\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))`;
const pick = (m) => (m ? (m[1] ?? m[2] ?? m[3] ?? "") : null);

// Every occurrence, not the last one. Open Graph allows a property to repeat --
// Hugo's partial writes up to six og:image -- and a map keyed by property kept
// only the final value, so an SVG card picture followed by a usable one passed.
const add = (map, key, value) => map.set(key, [...(map.get(key) ?? []), value]);
const all = (map, key) => map.get(key) ?? [];
const isSvg = (v) => new URL(v, "https://example.invalid/").pathname.toLowerCase().endsWith(".svg");

// A Hugo alias is a redirect stub: a meta refresh and a canonical, with no head
// of its own. It is not a page these invariants describe, and requiring an
// og:url of one would fail on markup Hugo writes.
const ALIAS = /http-equiv\s*=\s*["']?refresh/i;

const LINK = /<link\b[^>]*>/gi;
// The tags whose content is prose a person reads, not a URL or a token.
const DESCRIBES = /^(?:description|og:description|twitter:description|og:image:alt|twitter:image:alt|og:title|twitter:title)$/;
// One decode, matching what a parser does to an attribute value: whatever is
// still an entity afterwards was escaped twice.
const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
const decode = (v) =>
  v.replace(/&(#[0-9]+|#x[0-9a-f]+|[a-z]+[0-9]*);/gi, (m, n) => {
    const k = n.toLowerCase();
    if (k in ENTITIES) return ENTITIES[k];
    if (k.startsWith("#x")) return String.fromCodePoint(parseInt(k.slice(2), 16));
    if (k.startsWith("#")) return String.fromCodePoint(parseInt(k.slice(1), 10));
    return m;
  });

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
  if (ALIAS.test(html)) continue;

  const canonicals = [];
  for (const tag of html.match(LINK) ?? []) {
    if ((pick(tag.match(REL)) ?? "").toLowerCase() === "canonical") canonicals.push(pick(tag.match(HREF)));
  }

  const robots = [];
  const og = new Map();
  const named = new Map();
  for (const tag of html.match(META) ?? []) {
    const property = (pick(tag.match(PROPERTY)) ?? "").toLowerCase();
    const name = (pick(tag.match(NAME)) ?? "").toLowerCase();
    const content = pick(tag.match(CONTENT)) ?? "";
    if (name === "robots") robots.push(content);
    if (property) add(og, property, content);
    if (name) add(named, name, content);
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

  // 1. The page names one URL as its own, in both places. og:url is the
  //    canonical Facebook and LinkedIn read; disagreeing with the link element
  //    asserts two. Presence is asserted as well as agreement -- comparing only
  //    when both are there made deleting either of them a way to pass.
  const ogUrls = all(og, "og:url");
  if (canonicals.length !== 1 || ogUrls.length !== 1) {
    failures.push([file, `${canonicals.length} canonical, ${ogUrls.length} og:url`, "a page names its own URL once in each"]);
  } else if (canonicals[0] !== ogUrls[0]) {
    failures.push([file, `canonical ${canonicals[0]}`, `og:url says ${ogUrls[0]}`]);
  }

  // 2. One robots meta, never two. A second is a directive nobody can order
  //    against the first.
  if (robots.length > 1) {
    failures.push([file, `${robots.length} robots tags: ${robots.join(" | ")}`, "a page may carry one"]);
  }

  // 3. No SVG on a card. Facebook, X and LinkedIn render none, so the card is
  //    announced and then arrives empty.
  for (const key of ["og:image", "og:image:secure_url", "twitter:image"]) {
    for (const v of [...all(og, key), ...all(named, key)]) {
      if (v && isSvg(v)) failures.push([file, `${key} ${v}`, "no platform renders an SVG on a card"]);
    }
  }

  // 4. An article whose picture is its own says so in its structured data.
  //    og:image:alt is the marker: head.html offers it only for a picture that
  //    belongs to the page, which is exactly the case json-ld.html takes.
  const article = blocks.find((b) => b && b["@type"] === "BlogPosting");
  if (article && all(og, "og:image").length && all(og, "og:image:alt").length && !article.image) {
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
  //    can generate URLs from one without end. Split into directives rather
  //    than searched as a substring, which "noindexing" would have satisfied.
  const directives = robots.flatMap((r) => r.toLowerCase().split(/[\s,]+/)).filter(Boolean);
  if (SEARCH_FORM.test(html) && !directives.includes("noindex")) {
    failures.push([file, "a search page", "is not marked noindex"]);
  }

  // 7. An entity that survived into the text. plainify strips tags and leaves
  //    entities behind, and Goldmark makes them out of ordinary punctuation, so
  //    an apostrophe reached the attribute as &rsquo; and was escaped a second
  //    time: the tag shipped "site&rsquo;s" for a search engine to read as text.
  //    The parser has already decoded the value once, so anything still shaped
  //    like an entity here was escaped twice over.
  for (const [key, values] of [...og, ...named]) {
    if (!DESCRIBES.test(key)) continue;
    for (const value of values) {
      const m = decode(value).match(/&(?:#[0-9]+|#x[0-9a-f]+|[a-z]+[0-9]*);/i);
      if (m) failures.push([file, key + " carries " + m[0], "an entity escaped twice, read as text"]);
    }
  }

  // 8. One sentence per page, not three. head.html, opengraph.html and
  //    twitter_cards.html publish the same description; opengraph.html used
  //    Hugo's own .Description-then-.Summary chain instead, so 45 of the
  //    showcase's 87 described pages said one thing in the meta tag and
  //    another in the card -- a tag page announced itself with the site's
  //    description. They all ask description-meta.html now.
  const said = [all(named, "description"), all(og, "og:description"), all(named, "twitter:description")];
  if (said.every((v) => v.length === 1)) {
    const [meta, ogDesc, twitter] = said.map((v) => v[0]);
    if (meta !== ogDesc || meta !== twitter) {
      failures.push([file, `description "${meta}"
    og:description "${ogDesc}"
    twitter:description "${twitter}"`,
        "one page, three different sentences"]);
    }
  } else if (said.some((v) => v.length > 1)) {
    failures.push([file, "a description tag is repeated", "a page describes itself once in each"]);
  }
}

// A directory that exists and holds no pages is the shape a wrong path takes,
// and every assertion above is vacuously true over nothing.
if (checked === 0) {
  console.error(`no pages under ${root}: nothing was checked`);
  process.exit(1);
}

console.log(`checked ${checked} pages`);
if (failures.length) {
  console.error(`\n${failures.length} broken:\n`);
  for (const [file, what, why] of failures) console.error(`  ${file}\n    ${what}  (${why})`);
  process.exit(1);
}
console.log("canonical and og:url agree, one robots tag each, no SVG on a card");
console.log("every JSON-LD block parses, an owned picture is in its BlogPosting, search is noindex");
console.log("no description or alt carries an entity that was escaped twice");
console.log("the meta, Open Graph and Twitter descriptions are the same sentence");
