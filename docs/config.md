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
  locale = "en-us"
  label  = "English"
[languages.en.params]
  subtitle     = "Hello Friend NG Theme"
  description  = "Nice theme for homepages and blogs"
  homeSubtitle = "Hello Friend NG powered by <strong>IA</strong>"

[languages.fr]
  weight = 2
  locale = "fr-fr"
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

Give it a territory — `en-us`, not `en`. The value goes straight into the feed's
`<language>` and into `og:locale`, and Open Graph expects `language_TERRITORY`.
A language with no obvious country still needs one picked: Modern Standard
Arabic is `ar-001` in CLDR, but `001` is a UN region code rather than a
two-letter country, so `og:locale` comes out as the invalid `ar_001`. `ar-sa`
is valid everywhere, and no more of an approximation than calling English
`en-us`.

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
  locale = "ar"
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

## Footer copyright year

`params.footer.trademark` accepts either:

- `true` — renders the current year, so it never goes stale
- any value — rendered as given, for a fixed year or a range such as
  `"2019–2026"`

## Mermaid diagrams

Pages containing a ```mermaid code block load Mermaid from jsDelivr, pinned to
the current major version. Pinning means a future Mermaid major cannot silently
change how existing diagrams render; bump the version in
`layouts/_partials/javascript.html` when you want to move to the next one.

The library is fetched from a third party, so visitors to pages with diagrams
resolve jsDelivr. Pages without a diagram request nothing.

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
| `backgroundImage` | an image behind the front page, `cover`-sized and fixed |
| `themeColor` | `<meta name="theme-color">`, the browser UI tint on mobile |
| `keywords` | site-wide `<meta name="keywords">`, joined with each page's tags |
| `mainSections` | which section the footer's RSS icon and the 404 page point at. Defaults to `posts` |
| `customCSS` / `customJS` | extra files to load, each a path relative to `static/` or an absolute URL |
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
audio: ["/audio/episode-01.mp3"]
```

Hugo's own Open Graph partial ranges over this key, so a bare string stops the
build before the theme is reached.

`noindex` is the one to know about: it is how you keep a page out of search
results without touching `robots.txt`.
