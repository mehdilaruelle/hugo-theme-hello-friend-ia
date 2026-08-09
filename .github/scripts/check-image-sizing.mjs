// Asserts that the stylesheet keeps images in proportion.
//
// The image partial sets width and height on the element so the browser can
// reserve the space before the file arrives. Those attributes fix the used
// height, so a rule that narrows the box — max-width: 100%, which applies on
// every viewport smaller than the declared width — stretches the picture
// vertically unless height is released with auto.
//
// The build is silent either way, and so is the HTML: the markup is identical
// and only the rendered geometry is wrong, so only an assertion on the CSS
// catches it.
//
//   node .github/scripts/check-image-sizing.mjs <public-dir>
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// A selector counts only when it targets the img *element*. ".img" and "#img"
// are ordinary class and id names that would otherwise let a stylesheet with no
// rule for real images pass the gate.
const targetsImgElement = (selector) =>
  selector
    .split(",")
    .some((part) =>
      part
        // An attribute selector can carry "img" in its value.
        .replace(/\[[^\]]*\]/g, " ")
        // Descendant, child, sibling: each yields its own compound selector.
        .split(/[\s>+~]+/)
        .some((compound) => /^img(?=$|[.#:[])/.test(compound.trim()))
    );

// Innermost blocks only: their body holds no braces, which skips the @media
// wrappers around them and matches the rules inside.
const rules = (css) =>
  [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({
    selector,
    body,
  }));

function audit(css) {
  const sizing = rules(css).filter(
    (r) => targetsImgElement(r.selector) && /max-width:\s*100%/.test(r.body)
  );
  return {
    sizing: sizing.length,
    released: sizing.some((r) => /height:\s*auto/.test(r.body)),
  };
}

// The matcher is the part that can silently go wrong, so it is exercised before
// it is trusted.
const CASES = [
  ["img{max-width:100%;height:auto}", true, true],
  ["img,video{max-width:100%;height:auto}", true, true],
  ["img{max-width:100%}", true, false],
  ["@media(max-width:600px){img{max-width:100%;height:auto}}", true, true],
  ["img.left{max-width:100%;height:auto}", true, true],
  [".post-content img{max-width:100%;height:auto}", true, true],
  // Negative fixtures: none of these target the element.
  [".img{max-width:100%;height:auto}", false, false],
  ["#img{max-width:100%;height:auto}", false, false],
  [".image-wrapper{max-width:100%;height:auto}", false, false],
  ['[class*="img"]{max-width:100%;height:auto}', false, false],
  [".imgbox{max-width:100%;height:auto}", false, false],
];

for (const [css, shouldMatch, shouldPass] of CASES) {
  const r = audit(css);
  if (!!r.sizing !== shouldMatch || (shouldMatch && r.released !== shouldPass)) {
    console.log(`  self-test BAD  ${css}`);
    console.log(`    matched ${r.sizing} rule(s), height:auto ${r.released}`);
    process.exit(2);
  }
}

const root = process.argv[2] || "public";
const sheets = readdirSync(root).filter((f) => f.endsWith(".css"));
if (!sheets.length) {
  console.log(`  BAD  no stylesheet in ${root}`);
  process.exit(1);
}

let bad = 0;
for (const f of sheets) {
  const { sizing, released } = audit(readFileSync(join(root, f), "utf8"));
  if (!sizing) {
    console.log(`  ${f}: BAD  no img element rule sets max-width: 100%`);
    bad++;
    continue;
  }
  console.log(
    `  ${f}: ${sizing} img rule${sizing > 1 ? "s" : ""} with max-width` +
      `   height:auto ${released ? "ok " : "BAD"}`
  );
  if (!released) bad++;
}

console.log(
  bad
    ? `\n  ${bad} stylesheet(s) would stretch images`
    : "\n  images keep their aspect ratio when the container is narrower"
);
process.exit(bad ? 1 : 0);
