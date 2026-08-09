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
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] || "public";

const css = readdirSync(root).filter((f) => f.endsWith(".css"));
if (!css.length) {
  console.log(`  BAD  no stylesheet in ${root}`);
  process.exit(1);
}

let bad = 0;
for (const f of css) {
  const s = readFileSync(join(root, f), "utf8");

  // The minifier drops spaces and the final semicolon of a block, so match the
  // declarations rather than a literal rule.
  const rules = [...s.matchAll(/(?:^|})([^{}]*\bimg\b[^{}]*)\{([^}]*)\}/g)];
  const sizing = rules.filter(([, , body]) => /max-width:\s*100%/.test(body));

  if (!sizing.length) {
    console.log(`  ${f}: BAD  no img rule sets max-width: 100%`);
    bad++;
    continue;
  }

  const released = sizing.some(([, , body]) => /height:\s*auto/.test(body));
  console.log(
    `  ${f}: max-width ok   height:auto ${released ? "ok " : "BAD"}` +
      `   (${sizing.length} rule${sizing.length > 1 ? "s" : ""})`
  );
  if (!released) bad++;
}

console.log(
  bad
    ? `\n  ${bad} stylesheet(s) would stretch images`
    : "\n  images keep their aspect ratio when the container is narrower"
);
process.exit(bad ? 1 : 0);
