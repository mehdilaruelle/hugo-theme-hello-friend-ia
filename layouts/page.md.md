{{- $body := .RenderShortcodes -}}
{{- $note := .Description | default .Summary -}}
# {{ partial "title.html" . }}
{{ with $note }}
> {{ . | plainify | htmlUnescape | replaceRE `\s+` " " | strings.TrimSpace }}
{{ end }}
{{- with .Date }}{{ if not .IsZero }}
{{ time.Format "2006-01-02" . }}{{ with $.Params.tags }} · {{ delimit . ", " }}{{ end }}
{{ end }}{{ end }}
{{ $body | strings.TrimSpace }}

---

{{ partial "i18n.html" (dict "key" "llmsCanonical" "fallback" "Originally published at") }} {{ .Permalink }}
