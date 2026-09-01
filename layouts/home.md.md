{{- /*
  The front page as Markdown, and the root of the mirror. llms.txt is the flat
  map — every page on one screen; this is the first node of a graph you walk.
*/ -}}
{{- $desc := .Description | default site.Params.homeSubtitle | default site.Params.description -}}
{{- /* .Pages is the top-level sections and the pages at the root. It leaves
       out the ones Hugo generates, so /tags/ and /categories/ were published
       and nothing linked them. */ -}}
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
