/**
 * Save pipeline for the /edit-pdf editor: burns overlays into the PDF with
 * pdf-lib (+ @pdf-lib/fontkit for custom font embedding).
 *
 * Order of operations per page (painter's order):
 *  1. Whiteout rectangles (opaque — "burned" into the content stream).
 *  2. Background covers over edited original blocks (sampled page color).
 *  3. Edited + newly added text (multi-line, wrapped within block width,
 *     same baseline/size/color/rotation; chosen font embedded subset).
 *  4. Shapes, freehand paths.
 *  5. Images / signatures (rotation pre-baked by the UI).
 *  6. Text-markup annotations (highlight/underline/strike via QuadPoints).
 *  7. Link annotations (URI + internal page destinations).
 *  8. New AcroForm fields + fills for existing fields.
 *
 * Page operations (delete / rotate / reorder / insert blank) are applied by
 * copying pages into a fresh document in editor order, which preserves page
 * content, images, links and annotations. Fills for EXISTING AcroForm fields
 * are applied to the source document BEFORE copying so values + appearances
 * survive reordering.
 */
import {
  PDFDocument,
  StandardFonts,
  rgb,
  degrees,
  PDFName,
  PDFString,
  type PDFFont,
} from "pdf-lib";
// fontkit's Indic/complex-script shaper uses regeneratorRuntime (both UMD and
// ES builds). Provide it explicitly so Devanagari/Telugu embedding works in
// every bundler/runtime instead of throwing ReferenceError at save time.
import "regenerator-runtime/runtime";
import type {
  EditorPage,
  Overlay,
  EditTextOverlay,
  AddTextOverlay,
  FormFill,
  PdfRect,
} from "./types";
import { hexToRgb01 } from "./text-extraction";
import {
  getBundledFont,
  getStandardFontOption,
  isStandardFontId,
  ttfPathFor,
} from "./font-matching";

export interface SaveInput {
  originalBytes: Uint8Array;
  pages: EditorPage[];
  overlays: Overlay[];
  fills: FormFill[];
  /** Original block bboxes (blockId -> rect) used for invisible covering. */
  blockBoxById: Map<string, PdfRect>;
  /** Harvested embedded-subset bytes (blockId -> bytes). */
  embeddedBytesByBlock: Map<string, Uint8Array>;
  fontBytesProvider?: (path: string) => Promise<Uint8Array>;
}

async function defaultFontBytesProvider(path: string): Promise<Uint8Array> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Font fetch failed (${res.status}): ${path}`);
  return new Uint8Array(await res.arrayBuffer());
}

/** Wrap paragraphs to a max width using real font metrics. */
export function wrapTextToWidth(
  text: string,
  font: PDFFont,
  size: number,
  maxW: number
): string[] {
  const out: string[] = [];
  const paragraphs = text.split("\n");
  for (const para of paragraphs) {
    if (para.length === 0) {
      out.push("");
      continue;
    }
    const words = para.split(/(\s+)/).filter((w) => w.length > 0);
    let line = "";
    for (const word of words) {
      const trial = line + word;
      const w = font.widthOfTextAtSize(trial, size);
      if (w <= maxW || line.length === 0) {
        line = trial;
      } else {
        out.push(line.trimEnd());
        line = word.trimStart();
        // Single very long word: hard-break it.
        while (font.widthOfTextAtSize(line, size) > maxW && line.length > 1) {
          let k = line.length - 1;
          while (k > 1 && font.widthOfTextAtSize(line.slice(0, k), size) > maxW) k -= 1;
          out.push(line.slice(0, k));
          line = line.slice(k);
        }
      }
    }
    out.push(line);
  }
  return out;
}

interface FontResolver {
  getFont(fontId: string, bold: boolean, italic: boolean, embeddedBytes?: Uint8Array): Promise<PDFFont>;
}

async function createFontResolver(
  outDoc: PDFDocument,
  provider: (path: string) => Promise<Uint8Array>
): Promise<FontResolver> {
  const { default: fontkit } = await import("@pdf-lib/fontkit");
  outDoc.registerFontkit(fontkit);
  const cache = new Map<string, PDFFont>();
  const bytesCache = new Map<string, Uint8Array>();

  async function bytesFor(path: string): Promise<Uint8Array> {
    let b = bytesCache.get(path);
    if (!b) {
      b = await provider(path);
      bytesCache.set(path, b);
      if (bytesCache.size > 24) bytesCache.delete(bytesCache.keys().next().value as string);
    }
    return b;
  }

  async function embedBundled(fontId: string, bold: boolean, italic: boolean): Promise<PDFFont> {
    const key = `b:${fontId}:${bold ? 1 : 0}:${italic ? 1 : 0}`;
    const hit = cache.get(key);
    if (hit) return hit;
    const tried: string[] = [];
    const candidates: string[] = [];
    const direct = ttfPathFor(fontId, bold, italic);
    if (direct) candidates.push(direct);
    candidates.push("/fonts/edit-pdf/Arimo-Regular.ttf");
    let lastErr: unknown = null;
    for (const p of candidates) {
      try {
        tried.push(p);
        const bytes = await bytesFor(p);
        const f = await outDoc.embedFont(bytes, { subset: true });
        cache.set(key, f);
        return f;
      } catch (e) {
        lastErr = e;
      }
    }
    // Last resort: a standard font always works.
    const fallback = await outDoc.embedFont(StandardFonts.Helvetica);
    cache.set(key, fallback);
    void tried;
    void lastErr;
    return fallback;
  }

  return {
    async getFont(fontId, bold, italic, embeddedBytes) {
      if (isStandardFontId(fontId)) {
        const opt = getStandardFontOption(fontId);
        const key = `s:${fontId}`;
        let f = cache.get(key);
        if (!f) {
          f = await outDoc.embedFont(opt?.pdfLib ?? StandardFonts.Helvetica);
          cache.set(key, f);
        }
        return f;
      }
      if (fontId.startsWith("embedded:")) {
        if (embeddedBytes && embeddedBytes.length > 100) {
          const key = `e:${fontId}`;
          const hit = cache.get(key);
          if (hit) return hit;
          try {
            const f = await outDoc.embedFont(embeddedBytes, { subset: true });
            cache.set(key, f);
            return f;
          } catch {
            /* fall through to bundled */
          }
        }
        return embedBundled("Arimo", bold, italic);
      }
      if (getBundledFont(fontId)) return embedBundled(fontId, bold, italic);
      return embedBundled("Arimo", bold, italic);
    },
  };
}

function drawWrappedText(
  page: any,
  font: PDFFont,
  opts: {
    text: string;
    x: number;
    y: number;
    size: number;
    colorHex: string;
    rotation: number;
    wrapW: number;
    lineHeight: number;
    align: "left" | "center" | "right";
    underline: boolean;
  }
) {
  const { r, g, b } = hexToRgb01(opts.colorHex);
  const color = rgb(r, g, b);
  const lines = wrapTextToWidth(opts.text, font, opts.size, Math.max(10, opts.wrapW));
  const rad = (opts.rotation * Math.PI) / 180;
  const dir = { x: Math.cos(rad), y: Math.sin(rad) };
  const normal = { x: Math.sin(rad), y: -Math.cos(rad) }; // "down" in text space
  lines.forEach((line, i) => {
    const ox = opts.x + normal.x * opts.lineHeight * i;
    const oy = opts.y + normal.y * opts.lineHeight * i;
    const lineW = line.length > 0 ? font.widthOfTextAtSize(line, opts.size) : 0;
    const alignOff = opts.align === "center" ? lineW / 2 : opts.align === "right" ? lineW : 0;
    const lx = ox - dir.x * alignOff;
    const ly = oy - dir.y * alignOff;
    if (line.length > 0) {
      page.drawText(line, {
        x: lx,
        y: ly,
        size: opts.size,
        font,
        color,
        rotate: degrees(opts.rotation),
      });
    }
    if (opts.underline) {
      const uy = opts.size * 0.14;
      page.drawLine({
        start: { x: lx + normal.x * uy, y: ly + normal.y * uy },
        end: {
          x: lx + dir.x * Math.max(lineW, opts.size * 0.6) + normal.x * uy,
          y: ly + dir.y * Math.max(lineW, opts.size * 0.6) + normal.y * uy,
        },
        thickness: Math.max(0.5, opts.size / 14),
        color,
      });
    }
  });
}

export async function exportEditedPdf(
  input: SaveInput,
  onProgress?: (stage: string) => void
): Promise<Uint8Array> {
  const provider = input.fontBytesProvider ?? defaultFontBytesProvider;
  onProgress?.("Loading document…");
  const srcDoc = await PDFDocument.load(input.originalBytes.slice(), { ignoreEncryption: true });

  // Apply fills for EXISTING AcroForm fields before copying (survives reorder).
  if (input.fills.length > 0) {
    try {
      const srcForm = srcDoc.getForm();
      for (const fill of input.fills) {
        try {
          const field = srcForm.getFieldMaybe?.(fill.name) ?? srcForm.getField(fill.name);
          if (!field) continue;
          const ctor = field.constructor.name;
          if (ctor === "PDFTextField") {
            (field as any).setText(fill.value ?? "");
          } else if (ctor === "PDFCheckBox") {
            if (fill.value === "true" || fill.value === "Yes" || fill.value === "On") (field as any).check();
            else (field as any).uncheck();
          } else if (ctor === "PDFRadioGroup") {
            try {
              (field as any).select(fill.value);
            } catch {
              /* unknown option */
            }
          } else if (ctor === "PDFDropdown" || ctor === "PDFOptionList") {
            try {
              (field as any).select(fill.value);
            } catch {
              /* ignore */
            }
          }
        } catch {
          /* per-field best effort */
        }
      }
      try {
        srcForm.updateFieldAppearances();
      } catch {
        /* ignore */
      }
    } catch {
      /* no form in document */
    }
  }

  onProgress?.("Preparing pages…");
  const outDoc = await PDFDocument.create();
  const resolver = await createFontResolver(outDoc, provider);

  // Map editor page key -> outDoc page index + pdf-lib page.
  const pageIndexByKey = new Map<string, number>();
  const libPageByKey = new Map<string, any>();

  for (const ep of input.pages) {
    let libPage: any;
    if (ep.src.kind === "orig") {
      const [copied] = await outDoc.copyPages(srcDoc, [ep.src.index]);
      outDoc.addPage(copied);
      libPage = copied;
      const total = (ep.srcRotation + ep.rotateDelta) % 360;
      if (ep.rotateDelta % 360 !== 0) {
        try {
          libPage.setRotation(degrees(total));
        } catch {
          /* ignore */
        }
      }
    } else {
      libPage = outDoc.addPage([ep.src.width, ep.src.height]);
    }
    pageIndexByKey.set(ep.key, outDoc.getPageCount() - 1);
    libPageByKey.set(ep.key, libPage);
  }

  const overlaysByPage = new Map<string, Overlay[]>();
  for (const ov of input.overlays) {
    const arr = overlaysByPage.get(ov.pageKey) ?? [];
    arr.push(ov);
    overlaysByPage.set(ov.pageKey, arr);
  }

  const KIND_ORDER: Record<string, number> = {
    whiteout: 0,
    edit: 1,
    text: 2,
    shape: 3,
    draw: 4,
    image: 5,
    sign: 6,
    annot: 7,
    link: 8,
    form: 9,
  };

  let done = 0;
  for (const ep of input.pages) {
    const libPage = libPageByKey.get(ep.key);
    if (!libPage) continue;
    const { width: pw, height: ph } = libPage.getSize();
    const list = [...(overlaysByPage.get(ep.key) ?? [])].sort(
      (a, b) => (KIND_ORDER[a.kind] ?? 5) - (KIND_ORDER[b.kind] ?? 5)
    );

    for (const ov of list) {
      try {
        if (ov.kind === "whiteout") {
          const { r, g, b } = hexToRgb01(ov.colorHex);
          libPage.drawRectangle({
            x: Math.max(0, ov.rect.x),
            y: Math.max(0, ov.rect.y),
            width: Math.min(Math.max(0, ov.rect.w), pw),
            height: Math.min(Math.max(0, ov.rect.h), ph),
            color: rgb(r, g, b),
            borderWidth: 0,
            opacity: 1,
          });
        } else if (ov.kind === "edit") {
          const edit = ov as EditTextOverlay;
          // 1. Cover original block so old + new text never both show.
          const box = input.blockBoxById.get(edit.blockId);
          if (box) {
            const { r, g, b } = hexToRgb01(edit.bgHex || "#ffffff");
            libPage.drawRectangle({
              x: Math.max(0, box.x - 1),
              y: Math.max(0, box.y - 1),
              width: Math.min(pw, box.w + 2),
              height: Math.min(ph, box.h + 2),
              color: rgb(r, g, b),
              borderWidth: 0,
              opacity: 1,
            });
          }
          if (!edit.text || edit.text.trim().length === 0) continue; // deletion
          const embeddedBytes = input.embeddedBytesByBlock.get(edit.blockId);
          const useEmbedded = edit.fontId.startsWith("embedded:") && !!embeddedBytes;
          const font = await resolver.getFont(
            useEmbedded ? edit.fontId : edit.saveFontId || "Arimo",
            edit.bold,
            edit.italic,
            useEmbedded ? embeddedBytes : undefined
          );
          drawWrappedText(libPage, font, {
            text: edit.text,
            x: edit.x,
            y: edit.y,
            size: edit.fontSize,
            colorHex: edit.colorHex,
            rotation: edit.rotation,
            wrapW: Math.max(10, edit.wrapW),
            lineHeight: edit.lineHeight,
            align: edit.align,
            underline: edit.underline,
          });
        } else if (ov.kind === "text") {
          const t = ov as AddTextOverlay;
          if (!t.text || t.text.trim().length === 0) continue;
          const font = await resolver.getFont(t.fontId, t.bold, t.italic);
          drawWrappedText(libPage, font, {
            text: t.text,
            x: t.x,
            y: t.y,
            size: t.fontSize,
            colorHex: t.colorHex,
            rotation: t.rotation,
            wrapW: Math.max(10, t.wrapW),
            lineHeight: t.fontSize * 1.25,
            align: t.align,
            underline: t.underline,
          });
        } else if (ov.kind === "shape") {
          const { r, g, b } = hexToRgb01(ov.strokeHex);
          const stroke = rgb(r, g, b);
          const fill = ov.fillHex ? (() => { const c = hexToRgb01(ov.fillHex as string); return rgb(c.r, c.g, c.b); })() : undefined;
          const { x, y, w, h } = ov.rect;
          if (ov.shape === "rect") {
            libPage.drawRectangle({
              x, y, width: w, height: h,
              borderColor: stroke, borderWidth: ov.strokeW,
              color: fill, opacity: 1,
            });
          } else if (ov.shape === "ellipse") {
            libPage.drawEllipse({
              x: x + w / 2, y: y + h / 2, xScale: Math.abs(w) / 2, yScale: Math.abs(h) / 2,
              borderColor: stroke, borderWidth: ov.strokeW, color: fill, opacity: 1,
            });
          } else if (ov.shape === "line" || ov.shape === "arrow") {
            const x2 = x + w;
            const y2 = y + h;
            libPage.drawLine({ start: { x, y }, end: { x: x2, y: y2 }, thickness: ov.strokeW, color: stroke });
            if (ov.shape === "arrow") {
              const ang = Math.atan2(h, w);
              const headLen = Math.max(8, ov.strokeW * 4);
              for (const off of [Math.PI - 0.42, Math.PI + 0.42]) {
                const a2 = ang + off;
                libPage.drawLine({
                  start: { x: x2, y: y2 },
                  end: { x: x2 + Math.cos(a2) * headLen, y: y2 + Math.sin(a2) * headLen },
                  thickness: ov.strokeW,
                  color: stroke,
                });
              }
            }
          }
        } else if (ov.kind === "draw") {
          if (ov.points.length < 2) continue;
          const { r, g, b } = hexToRgb01(ov.strokeHex);
          const d = ov.points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
          try {
            libPage.drawSvgPath(d, {
              borderColor: rgb(r, g, b),
              borderWidth: ov.strokeW,
              borderOpacity: 1,
            });
          } catch {
            // Fallback: segment-by-segment lines.
            for (let i = 1; i < ov.points.length; i++) {
              libPage.drawLine({
                start: ov.points[i - 1],
                end: ov.points[i],
                thickness: ov.strokeW,
                color: rgb(r, g, b),
              });
            }
          }
        } else if (ov.kind === "image" || ov.kind === "sign") {
          const base64 = ov.dataUrl.split(",")[1] ?? "";
          if (!base64) continue;
          const bytes = Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0));
          let img: any = null;
          try {
            img = ov.mime.includes("png") ? await outDoc.embedPng(bytes) : await outDoc.embedJpg(bytes);
          } catch {
            try {
              img = await outDoc.embedPng(bytes);
            } catch {
              continue;
            }
          }
          libPage.drawImage(img, { x: ov.rect.x, y: ov.rect.y, width: ov.rect.w, height: ov.rect.h });
        } else if (ov.kind === "annot") {
          const xs: number[] = [];
          const ys: number[] = [];
          for (let i = 0; i + 1 < ov.quads.length; i += 2) {
            xs.push(ov.quads[i]);
            ys.push(ov.quads[i + 1]);
          }
          if (xs.length < 4) continue;
          const { r, g, b } = hexToRgb01(ov.colorHex);
          const subtype = ov.subtype === "highlight" ? "Highlight" : ov.subtype === "underline" ? "Underline" : "StrikeOut";
          const dict = outDoc.context.obj({
            Type: PDFName.of("Annot"),
            Subtype: PDFName.of(subtype),
            Rect: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)],
            QuadPoints: ov.quads,
            C: [r, g, b],
            F: 4,
          });
          const ref = outDoc.context.register(dict);
          let annots: any = null;
          try {
            annots = libPage.node.Annots();
          } catch {
            annots = null;
          }
          if (!annots) {
            annots = outDoc.context.obj([]);
            libPage.node.set(PDFName.of("Annots"), annots);
          }
          annots.push(ref);
        } else if (ov.kind === "link") {
          const hasUrl = ov.url.trim().length > 0;
          const destIdx = ov.destPageKey ? pageIndexByKey.get(ov.destPageKey) : undefined;
          if (!hasUrl && destIdx === undefined) continue;
          const base: Record<string, any> = {
            Type: PDFName.of("Annot"),
            Subtype: PDFName.of("Link"),
            Rect: [ov.rect.x, ov.rect.y, ov.rect.x + ov.rect.w, ov.rect.y + ov.rect.h],
            Border: [0, 0, 0],
          };
          if (hasUrl) {
            let uri = ov.url.trim();
            if (!/^[a-z][a-z0-9+.-]*:/i.test(uri)) uri = `https://${uri}`;
            base.A = outDoc.context.obj({ S: PDFName.of("URI"), URI: PDFString.of(uri) });
          } else if (destIdx !== undefined) {
            const target = outDoc.getPage(destIdx);
            base.Dest = [target.ref, PDFName.of("Fit")];
          }
          const ref = outDoc.context.register(outDoc.context.obj(base));
          let annots: any = null;
          try {
            annots = libPage.node.Annots();
          } catch {
            annots = null;
          }
          if (!annots) {
            annots = outDoc.context.obj([]);
            libPage.node.set(PDFName.of("Annots"), annots);
          }
          annots.push(ref);
        } else if (ov.kind === "form") {
          try {
            const form = outDoc.getForm();
            if (ov.fieldType === "text") {
              const tf = form.createTextField(ov.name);
              tf.setText(ov.value ?? "");
              tf.addToPage(libPage, { x: ov.rect.x, y: ov.rect.y, width: ov.rect.w, height: ov.rect.h });
            } else if (ov.fieldType === "check") {
              const cb = form.createCheckBox(ov.name);
              if (ov.value === "true") cb.check();
              cb.addToPage(libPage, { x: ov.rect.x, y: ov.rect.y, width: ov.rect.w, height: ov.rect.h });
            } else if (ov.fieldType === "radio") {
              const rg = form.createRadioGroup(ov.name);
              rg.addOptionToPage(ov.value || "Option 1", libPage, { x: ov.rect.x, y: ov.rect.y, width: ov.rect.w, height: ov.rect.h });
              try {
                rg.select(ov.value || "Option 1");
              } catch {
                /* ignore */
              }
            }
          } catch {
            /* best effort */
          }
        }
      } catch {
        /* per-overlay best effort: never fail the whole export */
      }
    }
    done += 1;
    if (done % 5 === 0) onProgress?.(`Burning edits… (${done}/${input.pages.length} pages)`);
  }

  try {
    outDoc.getForm().updateFieldAppearances();
  } catch {
    /* no form */
  }

  onProgress?.("Compressing PDF…");
  return await outDoc.save({ useObjectStreams: true });
}
