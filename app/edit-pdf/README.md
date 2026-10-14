# /edit-pdf — visual PDF editor

Route: `/edit-pdf` · Stack: Next.js App Router + React + Tailwind (existing
site design tokens) + `pdfjs-dist` (render/extract) + `pdf-lib` +
`@pdf-lib/fontkit` (write). 100% client-side; files never uploaded.

## Structure

- `components/edit-pdf/EditPdfWorkspace.tsx` — upload, password gate, page
  store, history (undo/redo), overlays, export, success screen.
- `components/edit-pdf/PageView.tsx` — DPR-aware canvas, viewport math,
  hover highlights, drag drafts, text-selection → annotation quads, overlay
  items with move/resize handles, inline editor host.
- `components/edit-pdf/TextBlockOverlay.tsx` — inline content editor +
  floating format bar (font/size/B/I/U/color/align/delete/drag/width).
- `components/edit-pdf/EditorToolbar.tsx` — all tools, undo/redo, zoom,
  page ops, download.
- `components/edit-pdf/SignatureModal.tsx` — draw/type/upload signatures
  persisted in `localStorage`.
- `lib/pdf/edit-pdf/types.ts` — overlay/page/snapshot types (PDF-point
  coordinate convention documented at the top).
- `lib/pdf/edit-pdf/viewport.ts` — pdf.js viewport transform helpers
  (handles rotated pages + CropBox/MediaBox origins).
- `lib/pdf/edit-pdf/text-extraction.ts` — `getTextContent`,
  line/block grouping, operator-list colors, embedded-font harvest +
  FontFace registration, background sampling.
- `lib/pdf/edit-pdf/font-matching.ts` — subset-prefix stripping, script
  detection, bundled-font map, fontkit cmap coverage check.
- `lib/pdf/edit-pdf/save.ts` — `exportEditedPdf` (page ops via `copyPages`,
  covers, wrapped text, shapes, images, annot/link/form dicts, AcroForm).
- `public/fonts/edit-pdf/` — 26 self-hosted TTFs + `LICENSES.md`.
- `scripts/download-edit-pdf-fonts.mjs` — regenerates the font bundle.
- `scripts/make-edit-pdf-test-pdfs.mjs` + `tests/verify-edit-pdf.mjs` —
  generate + verify test documents (`npm run test:edit-pdf`).

## Known limitations (v1)

1. **Cover, not content-stream surgery.** Edited originals are covered with an
   opaque rectangle sampled from the page background (never both visible).
   On flat backgrounds the patch is invisible; on photos/gradients a faint
   patch edge can remain. Rewriting `Tj`/`TJ` operators was evaluated and
   rejected: producer-specific encodings (custom Encoding diffs, hex strings,
   inline positioning) make it unreliable across Word/Docs/LaTeX/InDesign
   outputs and risk corrupting the stream.
2. **Save embeds metric-compatible fonts, not original subsets.** The overlay
   uses the real embedded subset (FontFace); harvested TTF/OTF subsets are
   re-embedded when the whole edited run is covered by their cmap, otherwise
   the matched bundled font is embedded (with an on-screen notice). Type1/CFF
   subsets and symbol fonts always fall back. Metrics-compatible ⇒ layout and
   reflow stay faithful, but glyph outlines may differ microscopically.
   Note: for complex scripts (Devanagari/Telugu) subset cmaps are partial by
   design (shaped/conjunct glyphs), so the coverage check conservatively
   falls back to the full bundled Noto font — output verified correct.
3. **Variable Noto fonts embed at Regular weight.** Bold/italic Noto
   (Sans/Serif/Devanagari/Telugu) save at Regular weight; preview still shows
   synthesized emphasis. Static Arimo/Tinos/Cousine/Carlito/Caladea keep all
   four styles exactly.
4. **Rotated text overlay is axis-aligned.** Editing works and save keeps the
   exact rotation, but the inline box is the axis-aligned bbox for |angle|>0.
5. **Link destinations by page index.** Internal link targets are resolved to
   final page order at save; links pointing at deleted pages are dropped.
6. **AcroForm fills are best-effort.** Values are applied pre-copy so they
   survive reorder; exotic field types (rich text, XFA) are skipped.
7. **Large documents.** 100-page files render lazily; text indexing runs per
   visible page with progress. History snapshots include image data-URLs
   (capped at 60 steps) — very image-heavy sessions use more RAM.
8. **No OCR.** Scanned pages report “No editable text found”; add
   text/whiteout/sign still work.
