{{- /*
  A section, taxonomy or term page as Markdown.

  page.md.md covered the leaves only, so a reader that had been handed
  /posts/index.md for the section it wanted found nothing there and fell back
  to the HTML — the Markdown mirror was missing exactly the nodes that exist to
  be navigated through. This is those nodes: what the page says about itself,
  its own body, then its children as links to their own Markdown.

  The children are listed whole rather than one pager at a time. Pagination is
  a reading aid for a screen, and a file fetched in one request has no reason
  to make the second half of a section a second request.

  A taxonomy page is sorted by title, which is the order list.html puts its
  terms in; everything else keeps the order it already has.
*/ -}}
{{- $children := .Pages -}}
{{- if eq .Kind "taxonomy" -}}{{- $children = .Pages.ByTitle -}}{{- end -}}
{{- $children = where $children "Params.searchable" "!=" false -}}
# {{ partial "title.html" . }}
{{ with partial "description.html" . }}
> {{ . | plainify | htmlUnescape | replaceRE `\s+` " " | strings.TrimSpace }}
{{ end }}
{{- with .RenderShortcodes | strings.TrimSpace }}
{{ . }}
{{ end }}
{{- with $children }}
## {{ partial "i18n.html" (dict "key" "contents" "fallback" "Contents") }}

{{ range . -}}
- [{{ partial "md/label.html" . }}]({{ partial "md/url.html" . }}){{ with (partial "md/note.html" .) }}: {{ . }}{{ end }}
{{ end }}
{{- end }}
---

{{ partial "i18n.html" (dict "key" "llmsCanonical" "fallback" "Originally published at") }} {{ .Permalink }}
