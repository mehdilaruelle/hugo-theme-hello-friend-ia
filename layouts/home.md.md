{{- /*
  The front page as Markdown: the root of the Markdown mirror.

  llms.txt is the flat map — every page of the site on one screen. This is the
  first node of the graph instead: the site's name and summary, its front-page
  body, then the top-level sections and pages, each linking to its own
  Markdown. Follow those and every page is reachable without reading a line of
  HTML, which is what the mirror promised and only half delivered.

  The two files are not the same thing said twice. One is for a reader that
  wants the whole shape at once, the other for a reader that walks it.
*/ -}}
{{- $desc := .Description | default site.Params.homeSubtitle | default site.Params.description -}}
{{- /*
  .Pages on the home page is the top-level sections and the pages at the root.
  It leaves out the ones Hugo generates — /tags/, /categories/ — so the mirror
  published those and nothing linked them: two subtrees reachable only by
  guessing a URL. A graph with an unreachable half is not a graph.
*/ -}}
{{- $children := slice -}}
{{- range .Pages -}}{{- $children = $children | append . -}}{{- end -}}
{{- range where site.Pages "Kind" "taxonomy" -}}{{- $children = $children | append . -}}{{- end -}}
{{- $children = where $children "Params.searchable" "!=" false -}}
# {{ site.Title }}
{{ with $desc }}
> {{ . | plainify | htmlUnescape | replaceRE `\s+` " " | strings.TrimSpace }}
{{ end }}
{{- with .RenderShortcodes | strings.TrimSpace }}
{{ . }}
{{ end }}
{{- with site.Params.llmsNote }}
{{ . | plainify | htmlUnescape | replaceRE `\s+` " " | strings.TrimSpace }}
{{ end }}
{{- with $children }}
## {{ partial "i18n.html" (dict "key" "contents" "fallback" "Contents") }}

{{ range . -}}
- [{{ partial "md/label.html" . }}]({{ partial "md/url.html" . }}){{ with (partial "md/note.html" .) }}: {{ . }}{{ end }}
{{ end }}
{{- end }}
---

{{ partial "i18n.html" (dict "key" "llmsCanonical" "fallback" "Originally published at") }} {{ .Permalink }}
