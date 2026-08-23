# Configuration

There are some settings you can set in your `config.toml`. 

## Default area

The settings in the default area are usually provided by Hugo itself. Check [Configure Hugo](https://gohugo.io/getting-started/configuration/#all-configuration-settings) for more information. But I want to list some important things here which are relevant to this theme.

### paginate

```
paginate = 10
```

This setting will paginate your list views. Set to `0` to disable it. For more information check (https://gohugo.io/templates/pagination/).

## Params, and where to put them when you have several languages

A param can be set once under `[params]`, or once per language under
`[languages.<code>.params]`. Set in both places, the language value wins, so the
one under `[params]` is the fallback for any language that does not override it.

For a single language, `[params]` is all you need:

```toml
[params]
  subtitle     = "Hello Friend NG Theme"
  description  = "Nice theme for homepages and blogs"
  homeSubtitle = "Hello Friend NG powered by <strong>IA</strong>"
```

For several, move anything a visitor *reads* under each language, and leave the
rest — dates, feature switches, colours — at the root where it is written once:

```toml
[languages.en]
  weight = 1
  locale = "en-US"
  label  = "English"
[languages.en.params]
  subtitle     = "Hello Friend NG Theme"
  description  = "Nice theme for homepages and blogs"
  homeSubtitle = "Hello Friend NG powered by <strong>IA</strong>"

[languages.fr]
  weight = 2
  locale = "fr-FR"
  label  = "Français"
[languages.fr.params]
  subtitle     = "Thème Hello Friend NG"
  description  = "Un thème soigné pour pages d'accueil et blogs"
  homeSubtitle = "Hello Friend NG propulsé par l'<strong>IA</strong>"
```

The three above are the ones most easily forgotten, because none of them come
from your content:

| param | where it shows |
| --- | --- |
| `subtitle` | appended to every `<title>`, after the site title |
| `description` | search results and social cards, via `<meta>` and `og:description` |
| `homeSubtitle` | the line under the heading on the front page |

`params.portrait.alt` belongs with them — it is read aloud, so it is text like
any other. `path` and `maxWidth` stay at the root, and a language that sets only
`alt` inherits them.

Set `locale` on every language. The root `locale` is only the default, so
without it each feed and each `og:locale` announces the same language whatever
the page is in.

Give it a territory — `en-US`, not `en`. The value goes straight into the feed's
`<language>` and into `og:locale`, and Open Graph expects `language_TERRITORY`.
A language with no obvious country still needs one picked: Modern Standard
Arabic is `ar-001` in CLDR, but `001` is a UN region code rather than a
two-letter country, so `og:locale` comes out as the invalid `ar_001`. `ar-SA`
is valid everywhere, and no more of an approximation than calling English
`en-US`.

The two demo sites are the worked examples: `exampleSite/` is the single
language shape, `showcaseSite/` the multilingual one, in four languages.

### Menus

Menus follow the same rule with one difference: a menu defined at the root
applies to every language, and there is then no way to translate a single entry.
So once you have more than one language, define the menu under each of them
rather than at the root:

```toml
[languages.fr.menu]
  [[languages.fr.menu.main]]
    identifier = "posts"
    name       = "Articles"
    url        = "posts/"
    weight     = 20
```

`url` is language-relative — `posts/` resolves to `/fr/posts/` under `fr`. Give
the same `identifier` to entries that are the same link in different languages.

Translate the page it lands on too, or the menu says *Articles* and the page it
opens is headed *Posts*. For a section that is generated rather than written,
that means adding `content/<section>/_index.<code>.md` with a `title`.

### The language switcher

`params.enableGlobalLanguageMenu` puts the other languages in the menu, each as
its two-letter code. It renders nothing on a single-language site, so it is safe
to leave on.

Strings the theme itself renders, such as *Reading time* or *Table of contents*,
come from `i18n/<code>.toml` and are already translated for the languages
shipped with the theme. Nothing to configure.

### Right-to-left languages

Set `direction` on any language that reads right to left:

```toml
[languages.ar]
  weight = 3
  locale = "ar-SA"
  label  = "العربية"
  direction = "rtl"
```

That renders `dir="rtl"` on `<html>`, and the layout follows: margins, list
indentation, the blockquote rule, the menu and the skip link all mirror. They
are written as CSS logical properties — `margin-inline-start` rather than
`margin-left` — so there is no second stylesheet and no `[dir]` overrides to
keep in step.

Two things deliberately do not mirror:

- The `position` argument of the `image` shortcode. `position="left"` means the
  left of the page; an author who asks for left means left, whatever direction
  the language reads in.
- Code blocks, which stay left to right because code does.

Nothing changes for a site without an `rtl` language. The attribute is only
emitted when a language declares a direction, and every logical property
resolves to the physical one it replaced.

Arabic ships with the theme as `i18n/ar.toml`, carrying the five plural forms
the language distinguishes, so a reading time reads correctly at one, two, a few
and many minutes rather than only at one and many.

## Proving you own the site

Every search console offers two ways to verify ownership: upload a file to the
site root, or put a meta tag on the home page. The tag is the one that survives
a rebuild, so the theme emits it for you:

```toml
[params.verification]
  google    = "your-token"
  bing      = "your-token"
  yandex    = "your-token"
  baidu     = "your-token"
  pinterest = "your-token"
```

Set only the ones you use — an unset entry emits nothing, and with no
`[params.verification]` at all nothing changes. The tags go on the home page
only, which is where each console looks, rather than on all of them.

## Footer copyright year

`params.footer.trademark` accepts either:

- `true` — renders the current year, so it never goes stale
- any value — rendered as given, for a fixed year or a range such as
  `"2019–2026"`

## Mermaid diagrams

Pages containing a ```mermaid code block load Mermaid from jsDelivr, pinned to
an exact version. Bump it in `layouts/_partials/javascript.html` when you want
to move on.

The library is fetched from a third party, so visitors to pages with diagrams
resolve jsDelivr. Pages without a diagram request nothing.

### Content-Security-Policy

The initialiser is a file rather than an inline script, so a strict policy does
not need `script-src 'unsafe-inline'`. What it does need, on pages with a
diagram:

```text
script-src  'self' https://cdn.jsdelivr.net
style-src   'self' 'unsafe-inline'
```

`style-src 'unsafe-inline'` is Mermaid's doing, not the theme's: it writes a
<style> element into the SVG it generates, and sets a style attribute on around
forty of the shapes. A nonce cannot reach either, since both are created at
runtime. Nothing else on the page needs it.

No font directive is required — Mermaid draws with the fonts already on the
page.

Mermaid is pinned to an exact version, which also fixes the chunk tree — the
chunks it pulls in at runtime sit under the same versioned path, so a release
cannot change what runs without a reviewed change to the theme.

There is no integrity hash, and the reason is worth stating rather than leaving
as an omission. The entry module is 29 KB and imports the bulk of its code as
further chunks — a hash on the entry would cover none of them. The single-file
build that could carry one weighs **3.4 MB**.

Measured on the showcase's flowchart, the chunked build fetches **230 KB across
27 requests**, and only the chunks that diagram type needs. Full integrity would
therefore cost roughly fifteen times the bytes, on every page with a diagram.

Nor is it a matter of swapping the URL. `import()` takes no integrity
parameter, so a hash on the initialiser covers the initialiser and nothing it
loads; and `dist/mermaid.min.js`, the single file that could carry one, is a
global bundle with no ES module exports — a dynamic import of it would find no
`default` to call. Doing this properly means loading that bundle as a classic
`<script src integrity>` and driving it through the global it defines, which is
a different mechanism rather than a setting.

## Mathematics

Set `math = true` in a page's front matter, or `params.math` for a whole site,
and KaTeX renders the formulas on that page:

```markdown
Inline \(a^2 + b^2 = c^2\), and set apart:

$$
\int_0^\infty e^{-x}\,dx = 1
$$
```

It is opt-in rather than detected from the content, because `$$` is ordinary
text in a shell snippet and a false positive would fetch 300 KB for nothing. A
page without it requests neither the stylesheet nor the script.

You have to enable Goldmark's **passthrough** extension yourself, in your own
configuration. Without it a formula is treated as ordinary Markdown before KaTeX
ever sees it: underscores open emphasis, and a backslash before punctuation is
swallowed as an escape.

A theme cannot do this for you — Hugo merges a theme's params but not its markup
settings — so it belongs in your site config:

```toml
[markup.goldmark.extensions.passthrough]
  enable = true
  [markup.goldmark.extensions.passthrough.delimiters]
    block  = [['\[', '\]'], ['$$', '$$']]
    inline = [['\(', '\)']]
```

`exampleSite/config.toml` carries it, and the showcase layers over that file, so
both demo sites exercise it.

KaTeX is pinned to an **exact** version, and each file carries an `integrity`
hash, so neither a new release nor a compromised CDN can change what runs for
your visitors. Upgrading is deliberate: bump the version in
`layouts/_partials/head.html` and `javascript.html` and recompute the hashes.

The call that renders the formulas lives in `assets/js/katex-render.js` rather
than an inline `onload` attribute, so turning this on does not oblige your site
to allow `script-src 'unsafe-inline'`.

## Default color scheme

`params.defaultTheme` accepts `"dark"` or `"light"`. Unset, the theme follows
the visitor's operating system preference, which is the previous behaviour.

The value is rendered server-side onto `<html>`, so the page arrives in the
right scheme rather than switching once JavaScript runs. A visitor who picks a
scheme with the toggle still overrides it, on every later visit.

## Post thumbnails

`params.enableThumbnails` shows each post's `cover` image beside its title in
list pages. It is off by default, and a post without a `cover` is unaffected —
a list with no thumbnails renders exactly as it did before.

```toml
[params]
  enableThumbnails = true
```

The image is taken from the page's `cover` front matter, the same value the
article page already uses. When it resolves to a page resource or an asset,
Hugo's dimensions are emitted so the row reserves its space before the image
arrives; a path under `static/` or a remote URL is used as given.

## Everything else the theme reads

The options below all work and none of them were written down anywhere. Three of
them — `mainSections`, `themeColor` and the `noindex` front matter — did not
even appear in the exampleSite, so the only way to find them was to read the
templates.

### Site params

| param | what it does |
| --- | --- |
| `enableThemeToggle` | shows the light/dark button in the menu |
| `enableReadingTime` | shows an estimated reading time on articles |
| `enableSharingButtons` | shows the sharing row under an article |
| `disableReadOtherPosts` | hides the previous/next links |
| `backgroundImage` | an image behind the front page, `cover`-sized and fixed. Used in dark mode |
| `backgroundImageLight` | the same for light mode. Without it light mode shows no image, rather than putting dark text over a dark picture |
| `themeColor` | `<meta name="theme-color">`, the browser UI tint on mobile |
| `keywords` | site-wide `<meta name="keywords">`, joined with each page's tags |
| `ogImage` | the picture a social card falls back to when a page has no `cover`. Use PNG or JPEG — no platform renders an SVG card |
| `mainSections` | which section the footer's RSS icon and the 404 page point at. Defaults to `posts` |
| `customCSS` / `customJS` | extra files to load, each a path under `static/` or a remote URL |
| `gitUrl` | prefix for the commit link under an article. Needs `enableGitInfo = true` at the root |
| `plausibleDataDomain` / `plausibleScriptSource` | [Plausible](https://plausible.io) analytics; both are required |

```toml
[params]
  themeColor   = "#1b1c1d"
  mainSections = ["posts"]
  customCSS    = ["css/extra.css"]
  customJS     = ["js/extra.js"]
```

`themeColor` and `keywords` are only emitted when set. An empty `content` is not
a neutral default — it is a tag asserting the value is blank.

A page's `cover` becomes its `og:image` and `twitter:image`, falling back to
`ogImage`. Setting `params.images` yourself hands both tags back to Hugo's own
Open Graph partial instead.

One trap in that partial, which the theme cannot reach: it absolutises `audio`
and `videos` with `absURL`, and a leading slash there resolves against the host
rather than the base URL. On a site served from a subpath, write them without
one — `audio = ["video/demo.mp4"]`, not `["/video/demo.mp4"]`.

### Front matter

| key | what it does |
| --- | --- |
| `cover` / `coverCaption` | image above the article, caption takes Markdown |
| `toc` | table of contents above the article. `notoc` on a heading keeps it out |
| `audio` | an audio player above the article. **A list**, see below |
| `noindex` | `<meta name="robots" content="noindex">` on that page alone |
| `comments` | set to `"false"` to hide Disqus on that page |
| `description` | overrides the summary in `<meta name="description">` and Open Graph |
| `author` | overrides the site author for that page |

`audio` has to be a list, even for one file:

```yaml
audio: ["audio/episode-01.mp3"]
```

Hugo's own Open Graph partial ranges over this key, so a bare string stops the
build before the theme is reached — and it absolutises what it finds with
`absURL`, which is why there is no leading slash above. See
[Everything else the theme reads](#everything-else-the-theme-reads).

`noindex` is the one to know about: it is how you keep a page out of search
results without touching `robots.txt`.

## Search

Search is off until the site publishes an index, which is the home page
rendered as JSON:

```toml
[outputs]
  home = ["HTML", "RSS", "JSON"]
```

Then add a page and give it the `search` layout. Where it lives and what it is
called is yours to choose:

```markdown
---
title: "Search"
layout: search
searchable: false
---

Type a word or two.
```

`searchable: false` keeps the search page out of its own results. Any page can
use it to stay out of the index.

Add it to the menu like any other entry.

### What it costs

One JSON file, fetched the first time someone types — not on page load, and
not at all on any other page. The script is only loaded on the page using the
`search` layout.

The index carries each page's title, URL, date, tags, summary and the first
4000 characters of its text. Raise or lower that with
`params.searchContentLimit`. The showcase's four languages come to 10–17 KB
each.

There is no library and no third-party service. Matching is done in the
browser over that array.

### How it matches

Every word typed has to appear somewhere in the page — two words narrow the
result rather than widening it. Case is ignored, and so are accents: *resume*
finds *résumé*, because a reader searching for a word is not making that
distinction. A hit in the title counts for more than one in the body, and a
hit in a tag for more than that; ties are broken by date, newest first.

Each language gets its own index and searches only itself.

### Without JavaScript

The form is hidden in the markup and revealed by the script, so a visitor with
JavaScript off is told search is unavailable instead of being handed a box
that does nothing.
