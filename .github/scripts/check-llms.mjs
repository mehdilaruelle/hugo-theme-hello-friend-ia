// Asserts that llms.txt and the Markdown copies are text a model can use.
//
// The build succeeds whatever comes out: a summary that arrived as
// "world&rsquo;s", a link pointing at a file that was never written, or a
// {{< image >}} left verbatim all render as a perfectly valid text file. Only
// an assertion on the built output catches them.
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

for (const [lang, prefix] of Object.entries(langs)) {
  const file = join(root, prefix, "llms.txt");
  const before = bad;
  if (!existsSync(file)) { fail(`${lang}: no llms.txt`); continue; }
  const s = readFileSync(file, "utf8");

  if (!/^# \S/m.test(s)) fail(`${lang}: no title heading`);
  if (!/^## \S/m.test(s)) fail(`${lang}: no section heading`);

  const entities = s.match(/&(?:[a-zA-Z]+|#\d+);/g);
  if (entities) fail(`${lang}: ${entities.length} HTML entities, e.g. ${entities[0]}`);

  const links = [...s.matchAll(/^- \[[^\]]*\]\(([^)]+)\)/gm)].map((m) => m[1]);
  if (!links.length) fail(`${lang}: no links`);
  for (const url of links) {
    if (!url.startsWith(base)) { fail(`${lang}: ${url} is outside ${base}`); continue; }
    const rel = decodeURIComponent(url.slice(base.length));
    const target = rel.endsWith(".md") ? join(root, rel) : join(root, rel, "index.html");
    if (!existsSync(target)) fail(`${lang}: ${url} resolves to nothing`);
  }
  if (bad === before) console.log(`  ${lang.padEnd(3)} llms.txt  ${links.length} links, all resolve`);
}

const beforeMd = bad;
const mds = walk(root).filter((f) => f.endsWith("index.md"));
if (!mds.length) fail("no Markdown pages were written");
for (const f of mds) {
  const s = readFileSync(f, "utf8");
  if (!s.startsWith("# ")) fail(`${f}: does not open with a heading`);
  if (/^(\+\+\+|---)$/m.test(s.split("\n")[0])) fail(`${f}: front matter leaked`);
  if (s.includes("{{<") || s.includes("{{%")) fail(`${f}: an unrendered shortcode`);
  if (!s.includes(base)) fail(`${f}: no canonical URL`);
}
if (bad === beforeMd) console.log(`  md       ${mds.length} pages, each a heading then prose`);

if (bad) { console.log(`\n${bad} problem(s)`); process.exit(1); }
console.log("\n  llms.txt and the Markdown copies are usable as text");
