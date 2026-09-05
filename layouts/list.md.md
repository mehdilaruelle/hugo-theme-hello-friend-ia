{{- /* Children listed whole, not one pager at a time: pagination is a reading
       aid for a screen. Taxonomies by title, as in list.html. */ -}}
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
