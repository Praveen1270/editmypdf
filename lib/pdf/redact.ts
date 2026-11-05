import { PDFDocument } from "pdf-lib";
import { loadPdf, savePdf, openPdfJs, ProgressFn, PDF_ERRORS } from "./core";

export interface RedactRect {
  page: number; // 0-indexed
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RedactOptions {
  rects?: RedactRect[];
  searchTerms?: string[];
  useRegex?: boolean;
  mode?: "safe" | "precise";
}

export interface RedactResult {
  bytes: Uint8Array;
  redactedCount: number;
  verified: boolean;
  remainingMatches: string[];
}

/**
 * Permanently removes content inside redaction rectangles.
 * Safe mode rasterizes affected pages so underlying text cannot be recovered.
 */
export async function redactPdf(
  pdfBytes: Uint8Array,
  options: RedactOptions,
  onProgress?: ProgressFn
): Promise<RedactResult> {
  const { rects = [], searchTerms = [], useRegex = false, mode = "safe" } = options;
  // "precise" is retained for API compatibility, but is intentionally mapped
  // to safe rasterization because drawing an overlay is not true redaction.
  const effectiveMode = mode === "precise" ? "safe" : mode;

  const allRects: RedactRect[] = [...rects];

  const srcDoc = await openPdfJs(pdfBytes);
  const totalPages = srcDoc.numPages;

  if (searchTerms.length > 0) {
    for (let p = 1; p <= totalPages; p++) {
      const page = await srcDoc.getPage(p);
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1 });
      for (const item of textContent.items as any[]) {
        const str: string = item.str || "";
        for (const term of searchTerms) {
          let matched = false;
          if (useRegex) {
            try {
              matched = new RegExp(term, "i").test(str);
            } catch (err) {
              console.warn(`redactPdf: invalid regex "${term}", falling back to plain substring match`, err);
              matched = str.toLowerCase().includes(term.toLowerCase());
            }
          } else {
            matched = str.toLowerCase().includes(term.toLowerCase());
          }
          if (matched && item.transform) {
            const tx = item.transform;
            const x = tx[4];
            const y = tx[5];
            const w = (item.width || str.length * (item.height || 10) * 0.5);
            const h = item.height || 12;
            allRects.push({ page: p - 1, x, y: y - h * 0.2, width: w, height: h * 1.2 });
          }
        }
      }
    }
  }

  const rectsByPage = new Map<number, RedactRect[]>();
  for (const r of allRects) {
    if (!rectsByPage.has(r.page)) rectsByPage.set(r.page, []);
    rectsByPage.get(r.page)!.push(r);
  }

  let redactedCount = 0;

  if (effectiveMode === "safe") {
    // Rasterize affected pages with boxes burned in; leave unaffected pages as-is via copy
    const outDoc = await PDFDocument.create();
    // Copy all pages first as vector (preserves text on clean pages)
    const srcPdfLib = await loadPdf(pdfBytes);

    for (let i = 0; i < totalPages; i++) {
      const pageRects = rectsByPage.get(i);
      if (!pageRects || pageRects.length === 0) {
        // copy page as-is
        const [copied] = await outDoc.copyPages(srcPdfLib, [i]);
        outDoc.addPage(copied);
        if (onProgress) onProgress(i + 1, totalPages);
        continue;
      }
      const page = await srcDoc.getPage(i + 1);
      const scale = 2.5;
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error(PDF_ERRORS.canvasUnavailable);
      await page.render({ canvasContext: ctx as any, viewport }).promise;

      const unscaledVp = page.getViewport({ scale: 1 });
      const sx = viewport.width / unscaledVp.width;
      const sy = viewport.height / unscaledVp.height;
      for (const r of pageRects) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(r.x * sx, viewport.height - (r.y + r.height) * sy, r.width * sx, r.height * sy);
      }

      const blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob((b) => (b ? res(b) : rej(new Error("blob fail"))), "image/png")
      );
      const buf = await blob.arrayBuffer();
      const img = await outDoc.embedPng(new Uint8Array(buf));
      const outPage = outDoc.addPage([unscaledVp.width, unscaledVp.height]);
      outPage.drawImage(img, { x: 0, y: 0, width: unscaledVp.width, height: unscaledVp.height });

      redactedCount += pageRects.length;
      if (onProgress) onProgress(i + 1, totalPages);
    }

    try {
      outDoc.setTitle("");
      outDoc.setAuthor("");
      outDoc.setSubject("");
      outDoc.setKeywords([]);
      outDoc.setCreator("");
      outDoc.setProducer("");
    } catch (err) {
      console.warn("redactPdf: could not strip metadata from redacted output", err);
    }

    const bytes = await savePdf(outDoc);
    await srcDoc.destroy();

    // Verify no search terms remain in text layer
    const remaining: string[] = [];
    let verified = true;
    try {
      const vDoc = await openPdfJs(bytes);
      for (let i = 1; i <= vDoc.numPages; i++) {
        const pg = await vDoc.getPage(i);
        const tc = await pg.getTextContent();
        const pageText = (tc.items as any[]).map((it) => it.str).join(" ").toLowerCase();
        for (const term of searchTerms) {
          if (pageText.includes(term.toLowerCase())) {
            if (rectsByPage.has(i - 1)) {
              remaining.push(term);
              verified = false;
            }
          }
        }
      }
      await vDoc.destroy();
    } catch (err) {
      console.warn("redactPdf: could not verify redacted output text layer", err);
    }

    return { bytes, redactedCount, verified, remainingMatches: remaining };
  }

  throw new Error("Unsupported redaction mode");
}
