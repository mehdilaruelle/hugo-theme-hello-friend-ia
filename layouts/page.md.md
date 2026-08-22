{{- $body := .RenderShortcodes -}}
{{- $note := .Description | default .Summary -}}
# {{ .Title }}
{{ with $note }}
> {{ . | plainify | htmlUnescape | replaceRE `\s+` " " | strings.TrimSpace }}
{{ end }}
{{- with .Date }}{{ if not .IsZero }}
{{ time.Format "2006-01-02" . }}{{ with $.Params.tags }} · {{ delimit . ", " }}{{ end }}
{{ end }}{{ end }}
{{ $body | strings.TrimSpace }}

---

{{ i18n "llmsCanonical" | default "Originally published at" }} {{ .Permalink }}
