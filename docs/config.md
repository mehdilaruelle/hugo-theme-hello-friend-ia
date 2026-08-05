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

`params.enableGlobalLanguageMenu` shows a flag per language in the menu. It
renders nothing on a single-language site — the flag stylesheet is not even
requested — so it is safe to leave on.

Strings the theme itself renders, such as *Reading time* or *Table of contents*,
come from `i18n/<code>.toml` and are already translated for the languages
shipped with the theme. Nothing to configure.

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
