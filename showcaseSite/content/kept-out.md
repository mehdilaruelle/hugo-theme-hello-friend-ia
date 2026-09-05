---
title: "A page kept out of the text outputs"
description: "Published, indexable, linked from the front page — and absent from llms.txt, from llms-full.txt and from the Markdown listings, because it asks to be."
date: 2026-01-05
noai: true
---

This page exists to be missing from somewhere.

`noai: true` in its front matter keeps it out of `llms.txt`, out of
`llms-full.txt` and out of the Markdown mirror's listings. Nothing else about it
changes: it is in the sitemap, a search engine may index it, this site's own
search will find it, and the HTML you are reading is served the way any other
page is.

That is the whole point of the switch. `searchable: false` is the other one, and
it does the opposite — out of this site's search, in everywhere else.

Its Markdown copy is still written, because whether a site publishes `.md` at
all is set once in `[outputs]` rather than per page. Nothing links to it and the
`<head>` above does not advertise it. A page that should not have one at all
says so itself:

```yaml
outputs: ["HTML"]
```
