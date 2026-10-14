# Bundled fonts for the /edit-pdf editor

All fonts below are self-hosted under `public/fonts/edit-pdf/` so the editor
works offline and no file ever leaves the device. Full license texts:
`OFL.txt` (SIL Open Font License 1.1) and `Apache-2.0.txt` (Apache License 2.0).

## Latin / metric-compatible families (static TTFs)

| File(s) | Family | Role | License | Source |
|---|---|---|---|---|
| `Arimo-Regular/Italic/Bold/BoldItalic.ttf` | Arimo (Ascender, Steve Matteson) | Arial/Helvetica metric match | Apache-2.0 | google/fonts `apache/arimo/static` @ 7252eca |
| `Tinos-Regular/Italic/Bold/BoldItalic.ttf` | Tinos (Ascender) | Times New Roman metric match | Apache-2.0 | google/fonts `apache/tinos` @ 8f97561 |
| `Cousine-Regular/Italic/Bold/BoldItalic.ttf` | Cousine (Ascender) | Courier New metric match | Apache-2.0 | google/fonts `apache/cousine` @ b8df781 |
| `Carlito-Regular/Italic/Bold/BoldItalic.ttf` | Carlito (Łukasz Dziedzic) | Calibri metric match | OFL-1.1 | google/fonts `ofl/carlito` @ main |
| `Caladea-Regular/Italic/Bold/BoldItalic.ttf` | Caladea (HuiaFonts) | Cambria metric match | OFL-1.1 | google/fonts `ofl/caladea` @ main |

Arimo/Tinos/Cousine are the Ascender equivalents of Liberation Sans/Serif/Mono
(same Arial/Times/Courier metrics, Apache-2.0 instead of OFL).

## Extended coverage (variable TTFs, default instance embedded)

| File | Family | Role | License | Source |
|---|---|---|---|---|
| `NotoSans-Variable.ttf` | Noto Sans | Universal fallback | OFL-1.1 | google/fonts `ofl/notosans` @ main |
| `NotoSerif-Variable.ttf` | Noto Serif | Georgia/Garamond/Palatino + serif fallback | OFL-1.1 | google/fonts `ofl/notoserif` @ main |
| `NotoSansDevanagari-Variable.ttf` | Noto Sans Devanagari | Hindi/Marathi (Devanagari script) | OFL-1.1 | google/fonts `ofl/notosansdevanagari` @ main |
| `NotoSansTelugu-Variable.ttf` | Noto Sans Telugu | Telugu script | OFL-1.1 | google/fonts `ofl/notosanstelugu` @ main |

Variable fonts embed with `pdf-lib` + `@pdf-lib/fontkit` (`subset: true`) using
the default (Regular 400) instance.

## On-screen rendering

The editor also loads the same families as woff2 through `@fontsource/*`
npm packages (same licenses) for crisp overlay text. See `package.json`.

## Regenerating

Run `node scripts/download-edit-pdf-fonts.mjs` (pinned commits/URLs) to
re-download every file into this directory.
