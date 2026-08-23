# Hello Friend NG

**[See the theme live →](https://mehdilaruelle.github.io/hugo-theme-hello-friend-ng-ia/)**
&nbsp;·&nbsp;
[every option turned on →](https://mehdilaruelle.github.io/hugo-theme-hello-friend-ng-ia/showcase/)

[![Hello Friend NG](images/screenshot.png)](https://mehdilaruelle.github.io/hugo-theme-hello-friend-ng-ia/)

> **This is a fork.** All the credit for the theme goes to
> [Djordje Atlialp (@rhazdon)](https://github.com/rhazdon), who wrote
> [hugo-theme-hello-friend-ng](https://github.com/rhazdon/hugo-theme-hello-friend-ng).
> This fork exists to keep the theme current with Hugo; upstream has not shipped
> a change since November 2025. See [Differences from upstream](#differences-from-upstream).
>
> Fork maintained by [@mehdilaruelle](https://github.com/mehdilaruelle)
> ([X](https://x.com/mehdilaruelle)). Report anything specific to this fork
> here; anything about the theme itself belongs upstream.

## General informations

This theme was highly inspired by the [hello-friend](https://github.com/panr/hugo-theme-hello-friend) and [hermit](https://github.com/Track3/hermit). A lot of kudos for their great work.

## Differences from upstream

- Builds warning-free on Hugo 0.164: `languageCode`, `.Site.Data`,
  `.Site.LanguageCode` and the LibSass transpiler have all been migrated off
  their deprecated forms.
- Uses the template layout introduced in Hugo 0.146 (`layouts/_partials/`,
  `_shortcodes/`, `_markup/`, `page.html`, `list.html`, `home.html`).
- SCSS uses the Sass module system (`@use`) and compiles with Dart Sass, with
  an automatic fallback to LibSass when Dart Sass is not installed.
- Fixes two selectors that made inline code lose its styling entirely.
- Emits JSON-LD structured data, and completes the `hreflang` set with
  `x-default`. See [SEO](#seo).
- Renders `content/_index.md` on the front page, which upstream ignores. See
  [Front page content](#front-page-content).
- CI builds the exampleSite on every change and fails on any new deprecation.
- The exampleSite is published as a
  [live demo](https://mehdilaruelle.github.io/hugo-theme-hello-friend-ng-ia/) on
  every push, so what you see is what the current code produces. A second build
  of the same site, with
  [every option turned on](https://mehdilaruelle.github.io/hugo-theme-hello-friend-ng-ia/showcase/),
  is published alongside it — and built in CI, so an optional feature cannot
  break unnoticed.

---

## Table of Contents

- [Differences from upstream](#differences-from-upstream)
- [Features](#features)
- [SEO](#seo)
- [Requirements](#requirements)
- [How to start](#how-to-start)
- [How to configure](#how-to-configure)
- [More](#more-things)
  - [Front page content](#front-page-content)
  - [Built in shortcodes](#built-in-shortcodes)
    - [image](#image)
    - [video](#video)
  - [Code highlighting](#code-highlighting)
  - [Favicon](#favicon)
  - [Audio Support](#audio-support)
- [Social Icons](#social-icons)
- [Known issues](#known-issues)
- [How to edit the theme](#how-to-edit-the-theme)
- [Sponsoring](#sponsoring)
- [Licence](#licence)

---

## Features

- Theming: **dark/light mode**, depending on your system preferences or the users choice
- Great reading experience thanks to [**Inter font**](https://rsms.me/inter/), made by [Rasmus Andersson](https://rsms.me/about/)
- Nice code highlighting thanks to [**PrismJS**](https://prismjs.com)
- An easy way to modify the theme with Hugo tooling
- Fully responsive
- Support for audio in posts (thanks to [@talbotp](https://github.com/talbotp))
- Builtin (enableable/disableable) multilanguage menu
- Support for social icons
- Support for sharing buttons
- Support for [Commento](https://gitlab.com/commento/commento) (commento.io is gone; see also [Comentario](https://comentario.app), its maintained successor)
- Support for [Plausible](https://plausible.io) (thanks to [@Joffcom](https://github.com/Joffcom))
- Support for [utterances](https://utteranc.es/) comment system
- Front page content from `content/_index.md`, see [Front page content](#front-page-content)
- JSON-LD structured data and a complete `hreflang` set, see [SEO](#seo)

## SEO

Nothing to configure. Every page already carries a canonical link, Open Graph
and Twitter Card tags, and microdata from Hugo's embedded `schema.html`. On top
of that:

**JSON-LD.** Google reads JSON-LD in preference to microdata, so the theme emits
it as well. The home page is described as a `WebSite`, and any dated single page
as a `BlogPosting` carrying its headline, description, dates, author, publisher,
language, word count, and its image and tags when it has them. Pages that are
neither are left alone rather than described badly.

The values come from what you already set: `author` (a string or a map with a
`name`, in the page or in the site params), `description` — falling back to a
trimmed summary — and `images`, falling back to the site-wide list.

**`Person`.** A name on its own is a string. What makes it an entity a search
engine can recognise is the evidence tying it to the same person elsewhere, so
the author of the site is described as a `Person` carrying `sameAs` — every
`params.social` URL, which is the same claim `rel="me"` already makes on the
links themselves. An email entry is an address rather than a profile and is left
out. `params.portrait.path` becomes the image, and `params.author.jobTitle`, if
you set one, the job title:

```toml
[params.author]
  name     = "Jane Doe"
  jobTitle = "Platform Engineer"
```

The same `Person` is the author of every article, under one `@id`, so it reads
as one person rather than as a name repeated. An article that names its own
author in its front matter gets that name and nothing else — the site owner's
profiles and job title are not theirs to claim.

**`hreflang="x-default"`.** Translated pages list every language, and the
primary one is additionally tagged `x-default`, which is what a search engine
serves to a visitor whose language matches none of them. Primary means first in
`hugo.Sites`, i.e. the language with the lowest `weight`, so ordering your
languages orders this too.

## Requirements

- **Hugo extended**, version **0.158.0 or newer** (tested against 0.164.0). The
  extended edition is required because the theme compiles SCSS.
- **[Dart Sass](https://sass-lang.com/install/)** — recommended, but optional.

Hugo has deprecated LibSass and will remove it in a future release, so the theme
compiles its SCSS with Dart Sass, which Hugo does *not* bundle. Install it with
one of:

``` bash
brew install sass/sass/sass          # macOS / Linuxbrew
choco install sass                   # Windows
snap install dart-sass               # Linux
npm install -g sass-embedded         # any platform
```

If Dart Sass is not found, the theme automatically falls back to LibSass so the
site still builds; Hugo then prints a deprecation warning until you install it.

## How to start

You can download the theme manually by going to [https://github.com/mehdilaruelle/hugo-theme-hello-friend-ng-ia](https://github.com/mehdilaruelle/hugo-theme-hello-friend-ng-ia) and pasting it to `themes/hello-friend-ng` in your root directory.

You can also clone it directly to your Hugo folder:

``` bash
git clone https://github.com/mehdilaruelle/hugo-theme-hello-friend-ng-ia.git themes/hello-friend-ng
```

If you don't want to make any radical changes, it's the best option, because you can get new updates when they are available. To do so, include it as a git submodule:

``` bash
git submodule add https://github.com/mehdilaruelle/hugo-theme-hello-friend-ng-ia.git themes/hello-friend-ng
```

The directory name matters: keep it `hello-friend-ng`, since that is the value `theme` takes in your configuration.

For the original, unforked theme, use
[rhazdon/hugo-theme-hello-friend-ng](https://github.com/rhazdon/hugo-theme-hello-friend-ng) instead.

## How to configure

The theme doesn't require any advanced configuration. Just copy the following config file.
To see all possible configurations, [check the docs](docs/config.md).
Note: There are more options to configure. Take a look into the `config.toml` in `exampleSite`.

``` toml
baseurl      = "localhost"
title        = "My Blog"
locale       = "en-us"
theme        = "hello-friend-ng"
pagination.pagerSize     = 10

[params]
  dateform        = "Jan 2, 2006"
  dateformShort   = "Jan 2"
  dateformNum     = "2006-01-02"
  dateformNumTime = "2006-01-02 15:04"

  # Subtitle for home
  homeSubtitle = "A simple and beautiful blog"

  # Set disableReadOtherPosts to true in order to hide the links to other posts.
  disableReadOtherPosts = false

  # Enable sharing buttons, if you like
  enableSharingButtons = true
  
  # Show a global language switcher in the navigation bar
  enableGlobalLanguageMenu = true

  # Metadata mostly used in document's head
  description = "My new homepage or blog"
  keywords = "homepage, blog"
  images = [""]

[taxonomies]
    category = "blog"
    tag      = "tags"
    series   = "series"

[languages]
  [languages.en]
    title = "Hello Friend NG"
    keywords = ""
    copyright = '<a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noopener">CC BY-NC 4.0</a>'
    readOtherPosts = "Read other posts"

  [languages.en.params]
    subtitle  = "A simple theme for Hugo"

    [languages.en.params.logo]
      logoText = "hello friend ng"
      logoHomeLink = "/"
    # or
    #
    # path = "/img/your-example-logo.svg"
    # alt = "Your example logo alt text"

  # And you can even create generic menu
  [[menu.main]]
    identifier = "blog"
    name       = "Blog"
    url        = "/posts"

  # and submenus
  [[menu.main]]
    identifier  = "parent"
    name        = "Parent"
    url         = "/parent"
    hasChildren = true

  [[menu.main]]
    identifier  = "child"
    name        = "Child"
    url         = "/parent/child"
    parent      = "parent"
```

## More things

### Front page content

The front page shows a portrait, the site title, `homeSubtitle` and the social
icons. Add a `content/_index.md` and its body is rendered between the subtitle
and the icons:

```markdown
---
title: "Home"
---

Platform engineer, writing about AWS and Terraform. Start with
[the Terraform series]({{< ref "/posts/terraform" >}}).
```

Ordinary Markdown, set to the same measure and alignment as a post rather than
centred with the title. A site with no `_index.md` gets the front page exactly
as before.

Worth having: the front page is the page search engines weigh most, and a name
with a one-line subtitle gives them, and a first-time visitor, nothing to read.

A `description` in its front matter also becomes the page's meta description,
in place of `homeSubtitle` — that line is written to be read on the page, and a
search result gives you more room than it uses. Without one, `homeSubtitle`
stays the fallback.

### Built-in shortcodes

Of course you are able to use all default shortcodes from hugo (https://gohugo.io/content-management/shortcodes/).

#### image

Properties:

  - `src` (required)
  - `alt` (optional)
  - `position` (optional, default: `left`, options: [`left`, `center`, `right`])
  - `style`

Example:

``` golang
{{< image src="/img/hello.png" alt="Hello Friend" position="center" style="border-radius: 8px;" >}}
```

#### video

Plays a clip in place of an animated GIF: the same silent loop, a fraction of
the weight. Encode once with ffmpeg and drop the files next to your images.

Properties:

  - `src` (required, the path **without** an extension)
  - `poster` (optional, an image shown before the clip loads)
  - `width` / `height` (optional but recommended — a video has no size until it
    loads, and the page jumps around without them)
  - `alt` (optional, becomes the accessible name)
  - `controls` (optional, default `false`; `true` shows the player controls and
    drops the autoplay, which lets a reader stop the clip — something a GIF
    never allowed)
  - `position` (optional, options: [`left`, `center`, `right`])
  - `formats` (optional, default `webm,mp4`; emitted in that order and the
    browser takes the first it can play, so put the smaller encoding first)

Example:

``` golang
{{< video src="/video/demo" poster="/video/demo.jpg" width="1600" height="900" alt="A session being recorded" >}}
```

Converting a GIF, scaled to twice the width the theme renders. Both encodings
need `-pix_fmt yuv420p`: a GIF carries an alpha channel that neither H.264 nor
VP9 will accept.

``` bash
ffmpeg -i demo.gif -vf "scale=1600:-2:flags=lanczos" -c:v libvpx-vp9 -crf 34 -b:v 0 -pix_fmt yuv420p -an demo.webm
ffmpeg -i demo.gif -vf "scale=1600:-2:flags=lanczos" -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart -an demo.mp4
ffmpeg -i demo.gif -vf "scale=1600:-2:flags=lanczos" -frames:v 1 demo.jpg
```

### Code highlighting

By default the theme is using PrismJS to color your code syntax. All you need to do is to wrap you code like this:

<pre>
``` html
  // your code here
```
</pre>

Prism weighs 178 KB, so it is loaded on the pages that have a code block
and nowhere else. Nothing to configure — a fence is what turns it on.

### Favicon

Check the [docs](docs/favicons.md).

### Audio Support

You wrote an article and recorded it? Or do you have a special music that you would like to put on a certain article? Then you can do this now without further ado.

In your article add to your front matters part:

```yaml
audio: path/to/file.mp3
```

## Social Icons:

A large variety of social icons are available and can be configured like this:

```toml
[[params.social]]
  name = "<site>"
  url = "<profile_URL>"
```

Take a look into this [list](docs/svgs.md) of available icon options. 

If you need another one, just open an issue or create a pull request with your wished icon. :)

## Known issues

There is a bug in Hugo that sometimes causes the main page not to render correctly. The reason is an taxonomy part with empty entries.
Related issue tickets: [!14](https://github.com/rhazdon/hugo-theme-hello-friend-ng/issues/14) [!59](https://github.com/rhazdon/hugo-theme-hello-friend-ng/issues/59).

Either you comment it out completely or you write the following in

``` toml
[taxonomies]
  tag      = "tags"
  category = "categories"
```

In case you'd like to actually have an empty taxonomy, you can do so by specifying the following (i.e. without adding any entries to the taxonomy part):

``` toml
[taxonomies]
```

## How to edit the theme

Just edit it. You don't need any node stuff. ;)

The theme follows the template layout introduced in Hugo 0.146, so when you
override something in your own site, mind these locations:

| What | Where |
| --- | --- |
| Partials | `layouts/_partials/` |
| Shortcodes | `layouts/_shortcodes/` |
| Markdown render hooks | `layouts/_markup/` |
| Home page | `layouts/home.html` |
| Single pages | `layouts/page.html` |
| List pages (section, taxonomy, term) | `layouts/list.html` |
| Base template | `layouts/baseof.html` |
| Extra `<head>` tags | `layouts/_partials/extra-head.html` |

Styles live in `assets/scss/`. They use the Sass module system (`@use`), so a
partial that needs a variable or a mixin loads it explicitly, e.g.
`@use "variables" as *;`.

## Sponsoring

The theme is Djordje Atlialp's work, so the coffee should go to him: <br />
<a href="https://www.buymeacoffee.com/djordjeatlialp" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-green.png" alt="Buy Me A Coffee" style="height: 51px !important;width: 217px !important;" ></a>

## Licence

Original work Copyright © 2018 Track3, © 2019 panr <br />
Modified work Copyright © 2019-2025 Djordje Atlialp <br />
Modified work Copyright © 2026 mehdilaruelle

The theme is released under the MIT License. See [LICENSE.md](LICENSE.md), and the [upstream license](https://github.com/rhazdon/hugo-theme-hello-friend-ng/blob/master/LICENSE.md) for additional licensing information.
