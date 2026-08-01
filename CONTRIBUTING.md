# How to contribute

This is a fork of
[hugo-theme-hello-friend-ng](https://github.com/rhazdon/hugo-theme-hello-friend-ng)
by Djordje Atlialp, kept current with Hugo.

Where to report what:

- Anything specific to this fork — a Hugo deprecation, the CI, the demo site —
  belongs in this repository's
  [issues](https://github.com/mehdilaruelle/hugo-theme-hello-friend-ng-ia/issues)
  and [pull requests](https://github.com/mehdilaruelle/hugo-theme-hello-friend-ng-ia/pulls).
- Anything about the theme itself is worth sending
  [upstream](https://github.com/rhazdon/hugo-theme-hello-friend-ng/issues) too,
  so every user benefits rather than only those on this fork.

## Pull request titles

Pull requests are squashed when merged, so the **title becomes the single
commit on `master`** — it is the whole history of that change, and the version
is read from it.

Titles follow [Conventional Commits](https://www.conventionalcommits.org):

```
type(optional scope)!: description
```

`type` is one of:

| type | what it covers |
| --- | --- |
| `feat` | a new capability for people using the theme |
| `fix` | a bug fix |
| `docs` | documentation only |
| `style` | formatting that does not change behaviour |
| `refactor` | a change that neither fixes a bug nor adds a feature |
| `perf` | a performance improvement |
| `test` | tests only |
| `build` | the build itself, or dependencies |
| `ci` | workflows and CI configuration |
| `chore` | anything else, e.g. repository housekeeping |
| `revert` | reverts an earlier commit |

The scope is optional and names the area touched — `fix(menu):`,
`feat(social):`, `ci(pages):`.

Append `!` before the colon for a breaking change, and explain the break in the
body:

```
feat(social)!: match icon names case-insensitively

BREAKING CHANGE: names are lowercased before matching, so a custom svg.html
override keyed on mixed case no longer matches.
```

CI checks the title on every pull request, and this is the only check that
gates a merge.

## Commits on a branch

Commits pushed to a branch are squashed away on merge, so CI does not check
them. Write them in the same form anyway: a branch whose subjects read
`fix(menu): …`, `docs: …` is far easier to review commit by commit, and to
reorder or drop a change from, than one reading `wip`, `wip 2`, `fix tests`.

The rule of thumb: the branch is for whoever reviews the change, the title is
for whoever reads the history a year later.

## Versioning

Releases follow [Semantic Versioning](https://semver.org), and the version is
derived from the commit subjects since the previous tag:

| what landed | bump |
| --- | --- |
| any `!` or `BREAKING CHANGE:` | major |
| at least one `feat` | minor |
| only `fix`, `perf` and the rest | patch |

This is why the subject line matters beyond tidiness: it is what the next
version number is read from. A bug fix labelled `chore` silently understates
the release.

Tags on this fork carry a `v` prefix — `v2.0.0`, not `2.0.0`. Upstream tags do
not (`1.0.9`), so the prefix also makes it unambiguous at a glance which of the
two a tag belongs to.

## Before opening a pull request

Build the exampleSite and make sure it stays warning-free:

```bash
cd exampleSite
hugo --themesDir ../.. --gc --panicOnWarning
```

That needs Hugo extended and Dart Sass — see
[Requirements](README.md#requirements). CI runs exactly this, plus a second
build without Dart Sass to keep the LibSass fallback working.
