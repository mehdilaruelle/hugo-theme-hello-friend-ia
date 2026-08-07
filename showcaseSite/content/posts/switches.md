+++
title = "Every switch, and what it costs"
description = "What each option in the showcase configuration turns on, and what it adds to the page"
date = "2026-02-07"
type = ["posts","post"]
cover = "img/cover-switches.svg"
tags = ["hugo"]
categories = ["Development"]
series = ["Showcase"]
[author]
  name = "Jane Doe"
+++

This site has its own folder, `showcaseSite/`, holding only what differs from
the default demo: a configuration file and these two pages. The demo's content
and images are mounted rather than copied, and its configuration is layered
under this one — Hugo merges configuration rather than replacing it, so the file
only has to name what changes:

| option | what you see |
| --- | --- |
| `backgroundImage` | the image behind the front page |
| `defaultTheme` | the page arrives dark instead of settling there |
| `enableThumbnails` | cover images beside titles on the list |

None of them are on in the default demo, and that is deliberate: a theme should
look like itself out of the box, not like a feature list. This site is where the
feature list lives.

One option stays off even here. `gitUrl` with `enableGitInfo` links each page to
the commit that last changed it, which ties every build to the full commit
history and points at the theme's own history rather than at anything you are
reading.

The two posts carrying thumbnails are the only ones with a `cover`. The others
have none and render exactly as they always did — a list mixes the two without
looking broken, which is the part worth checking.
