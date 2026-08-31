// A broken llms.txt is still a valid text file, so only an assertion on the
// built output catches one.
//
//   node .github/scripts/check-llms.mjs <public-dir> <base-url>
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] || "public";
const base = process.argv[3] || "https://example.com/";
const langs = { en: "", fr: "fr/", ja: "ja/", ar: "ar/" };

const walk = (d) => readdirSync(d).flatMap((e) => {
  const p = join(d, e);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

let bad = 0;
const fail = (msg) => { console.log(`  BAD  ${msg}`); bad++; };

// An entity is wrong in prose and right inside a tag: a shortcode expands to
// the HTML it would have produced, and alt="d&#39;écran" is that HTML being
// correct. Only what is left after the tags is read.
const prose = (s) => s.replace(/<[^>]*>/g, "");
const entities = (s) => prose(s).match(/&(?:[a-zA-Z][a-zA-Z0-9]*|#(?:\d+|x[0-9a-fA-F]+));/g);

// A title carrying a ] is escaped to \], which a class stopping at the first ]
// never reads past.
const mdLinks = (s) => [...s.matchAll(/\[(?:\\.|[^\\\]])*\]\(([^)]+)\)/g)].map((m) => m[1]);

// Where a URL under the base lands on disk. A text output is a file; anything
// else is a directory with an index.html in it.
const target = (url) => {
  const rel = decodeURIComponent(url.slice(base.length));
  return /\.(md|txt)$/.test(rel) ? join(root, rel) : join(root, rel, "index.html");
};

for (const [lang, prefix] of Object.entries(langs)) {
  const file = join(root, prefix, "llms.txt");
  const before = bad;
  if (!existsSync(file)) { fail(`${lang}: no llms.txt`); continue; }
  const s = readFileSync(file, "utf8");

  if (!/^# \S/m.test(s)) fail(`${lang}: no title heading`);
  if (!/^## \S/m.test(s)) fail(`${lang}: no section heading`);

  const found = entities(s);
  if (found) fail(`${lang}: ${found.length} HTML entities, e.g. ${found[0]}`);

  const links = [...s.matchAll(/^- \[(?:\\.|[^\\\]])*\]\(([^)]+)\)/gm)].map((m) => m[1]);
  if (!links.length) fail(`${lang}: no links`);
  for (const url of links) {
    if (!url.startsWith(base)) { fail(`${lang}: ${url} is outside ${base}`); continue; }
    if (!existsSync(target(url))) fail(`${lang}: ${url} resolves to nothing`);
  }
  if (bad === before) console.log(`  ${lang.padEnd(3)} llms.txt  ${links.length} links, all resolve`);
}

const beforeMd = bad;
const mds = walk(root).filter((f) => f.endsWith("index.md"));
if (!mds.length) fail("no Markdown pages were written");
let edges = 0;
for (const f of mds) {
  const s = readFileSync(f, "utf8");
  if (!s.startsWith("# ")) fail(`${f}: does not open with a heading`);
  if (/^(\+\+\+|---)$/m.test(s.split("\n")[0])) fail(`${f}: front matter leaked`);
  if (s.includes("{{<") || s.includes("{{%")) fail(`${f}: an unrendered shortcode`);
  const found = entities(s);
  if (found) fail(`${f}: ${found.length} HTML entities, e.g. ${found[0]}`);
  // Anywhere in the file would pass on a page that merely links to the site.
  const last = s.trimEnd().split("\n").pop().trim();
  if (!last.split(/\s+/).pop().startsWith(base)) fail(`${f}: does not end with a canonical URL`);
  // The mirror is only walkable if its own links land somewhere. A list page
  // links its children, the front page links the sections, and nothing but an
  // assertion on the built files says those files exist.
  for (const url of mdLinks(s).filter((u) => u.startsWith(base))) {
    edges++;
    if (!existsSync(target(url))) fail(`${f}: ${url} resolves to nothing`);
  }
}
if (bad === beforeMd) console.log(`  md       ${mds.length} pages, each a heading then prose, ${edges} links between them`);

if (bad) { console.log(`\n${bad} problem(s)`); process.exit(1); }
console.log("\n  llms.txt and the Markdown copies are usable as text");
