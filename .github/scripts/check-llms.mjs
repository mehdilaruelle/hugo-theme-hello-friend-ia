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
// the HTML it would have produced, and alt="d&#39;ecran" is that HTML being
// correct. Only what is left after the tags is read.
//
// A tag, rather than anything between angle brackets: "A < B &amp; C > D" is
// prose, and treating it as markup took the entity out with it — a hole in
// the one assertion here that exists to find entities.
const prose = (s) => s.replace(/<\/?[A-Za-z][^>]*>/g, "");
const entities = (s) => prose(s).match(/&(?:[a-zA-Z][a-zA-Z0-9]*|#(?:\d+|x[0-9a-fA-F]+));/g);

// A Markdown destination, without the title that may follow it: in
// [About](/about/ "About") the page is /about/, not the six characters after
// it. An angle-bracketed destination keeps what is inside the brackets.
const destination = (raw) => {
  const d = raw.trim();
  if (d.startsWith("<")) {
    const end = d.indexOf(">");
    return end < 0 ? d.slice(1) : d.slice(1, end);
  }
  return d.split(/\s+/)[0];
};

// A title carrying a ] is escaped to \], which a class stopping at the first ]
// never reads past.
const LINK = /\[(?:\\.|[^\\\]])*\]\(([^)]+)\)/g;
const LIST_LINK = /^- \[(?:\\.|[^\\\]])*\]\(([^)]+)\)/gm;
const mdLinks = (s) => [...s.matchAll(LINK)].map((m) => destination(m[1]));

// Where a URL under the base lands on disk. The path decides that and nothing
// else: a query or a fragment is for whoever opens the page, and joining one
// into a filename looks for a file nobody wrote.
const basePath = new URL(base).pathname;
const relative = (path) => {
  const p = path.startsWith(basePath) ? path.slice(basePath.length) : path.replace(/^\//, "");
  return decodeURIComponent(p);
};
const target = (url) => {
  let path;
  try { path = new URL(url).pathname; } catch { return null; }
  const rel = relative(path);
  return /\.(md|txt)$/.test(rel) ? join(root, rel) : join(root, rel, "index.html");
};
const resolves = (url) => { const t = target(url); return t !== null && existsSync(t); };

for (const [lang, prefix] of Object.entries(langs)) {
  const file = join(root, prefix, "llms.txt");
  const before = bad;
  if (!existsSync(file)) { fail(`${lang}: no llms.txt`); continue; }
  const s = readFileSync(file, "utf8");

  if (!/^# \S/m.test(s)) fail(`${lang}: no title heading`);
  if (!/^## \S/m.test(s)) fail(`${lang}: no section heading`);

  const found = entities(s);
  if (found) fail(`${lang}: ${found.length} HTML entities, e.g. ${found[0]}`);

  const links = [...s.matchAll(LIST_LINK)].map((m) => destination(m[1]));
  if (!links.length) fail(`${lang}: no links`);
  for (const url of links) {
    if (!url.startsWith(base)) { fail(`${lang}: ${url} is outside ${base}`); continue; }
    if (!resolves(url)) fail(`${lang}: ${url} resolves to nothing`);
  }
  if (bad === before) console.log(`  ${lang.padEnd(3)} llms.txt  ${links.length} links, all resolve`);

  // llms-full.txt is optional — a site asks for it in [outputs] or does not
  // have one — but a site that does publish one has made llms.txt a promise
  // about it: the same pages, in the same order, carrying their text.
  const fullFile = join(root, prefix, "llms-full.txt");
  if (!existsSync(fullFile)) continue;
  const beforeFull = bad;
  const full = readFileSync(fullFile, "utf8").split("\r\n").join("\n");

  const fullUrl = `${base}${prefix}llms-full.txt`;
  if (!s.includes(fullUrl)) fail(`${lang}: llms.txt does not name ${fullUrl}`);
  if (!full.startsWith("# ")) fail(`${lang}: llms-full.txt does not open with a heading`);
  if (full.includes("{{<") || full.includes("{{%")) fail(`${lang}: llms-full.txt has an unrendered shortcode`);
  const fullEntities = entities(full);
  if (fullEntities) fail(`${lang}: llms-full.txt has ${fullEntities.length} HTML entities, e.g. ${fullEntities[0]}`);

  // Every entry closes the way page.md.md closes: a rule, a blank line, then
  // the page URL. The entries are read out of the file itself rather than
  // looked up one URL at a time, because looking up only the URLs the map
  // names can never notice a page in here that the map never named.
  const lines = full.split("\n");
  const carried = [];
  for (let i = 2; i < lines.length; i++) {
    if (lines[i - 2].trim() !== "---" || lines[i - 1].trim() !== "") continue;
    const last = lines[i].trim().split(/\s+/).pop();
    if (last && last.startsWith(base)) carried.push(last);
  }
  const pages = links.filter((u) => u.startsWith(base)).map((u) => u.replace(/index\.md$/, ""));
  if (!carried.length) fail(`${lang}: llms-full.txt carries none of the ${pages.length} pages llms.txt maps`);
  // params.llmsFullLimit cuts the tail off, and that is all it may do: it
  // cannot leave a hole in the middle, reorder what is left, or add a page
  // the map never listed.
  const expected = pages.slice(0, carried.length);
  for (let i = 0; i < Math.max(carried.length, expected.length); i++) {
    if (carried[i] !== expected[i]) {
      fail(`${lang}: llms-full.txt entry ${i + 1} is ${carried[i] || "missing"}, the map says ${expected[i] || "there should be none"}`);
      break;
    }
  }
  if (bad === beforeFull) {
    console.log(`  ${lang.padEnd(3)} llms-full  ${carried.length < pages.length
      ? `${carried.length} of ${pages.length} pages, the rest cut by llmsFullLimit`
      : `${carried.length} page${carried.length === 1 ? "" : "s"}, the whole map`}`);
  }
}

const beforeMd = bad;
const slash = (p) => p.split("\\").join("/");
const rootPrefix = slash(root).replace(/\/$/, "") + "/";
const mds = walk(root).filter((f) => f.endsWith("index.md"));
const rels = mds.map((f) => slash(f).slice(rootPrefix.length));
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
    if (!resolves(url)) fail(`${f}: ${url} resolves to nothing`);
  }
}
if (bad === beforeMd) console.log(`  md       ${mds.length} pages, each a heading then prose, ${edges} links between them`);

// Reachability, which is the part resolving links does not prove. A page with
// pages under it is a node the mirror exists to be walked through, so it has
// to be reachable from the front page of its language: /tags/ published itself
// and its terms, nothing linked it, and every other assertion here passed.
//
// A page with nothing under it is exempt. That is what a page kept out with
// searchable looks like from disk, and a leaf nobody links is a choice rather
// than a hole.
const beforeGraph = bad;
const outgoing = (rel) => mdLinks(readFileSync(join(root, rel), "utf8"))
  .filter((u) => u.startsWith(base))
  .map((u) => { const t = target(u); return t === null ? null : slash(t).slice(rootPrefix.length); })
  .filter((r) => r && r.endsWith("index.md"));
const prefixes = Object.values(langs).filter(Boolean);
const langOf = (rel) => prefixes.find((p) => rel.startsWith(p)) || "";
let walked = 0;
for (const prefix of Object.values(langs)) {
  const home = `${prefix}index.md`;
  if (!rels.includes(home)) continue;
  const seen = new Set([home]);
  const queue = [home];
  while (queue.length) {
    for (const next of outgoing(queue.shift())) {
      if (rels.includes(next) && !seen.has(next)) { seen.add(next); queue.push(next); }
    }
  }
  walked += seen.size;
  for (const rel of rels) {
    if (langOf(rel) !== prefix) continue;
    const dir = rel.slice(0, -"index.md".length);
    const hasChildren = rels.some((r) => r !== rel && r.startsWith(dir) && langOf(r) === prefix);
    if (hasChildren && !seen.has(rel)) fail(`${rel}: has pages under it and nothing links it from ${home}`);
  }
}
if (bad === beforeGraph) console.log(`  graph    ${walked} pages reachable by following the Markdown from each front page`);

if (bad) { console.log(`\n${bad} problem(s)`); process.exit(1); }
console.log("\n  llms.txt and the Markdown copies are usable as text");
