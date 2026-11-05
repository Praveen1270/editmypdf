import { PDFDocument, rgb } from "pdf-lib";
import Tesseract from "tesseract.js";
import { savePdf, openPdfJs, ProgressFn, PDF_ERRORS } from "./core";

export interface OcrOptions {
  language?: string;
  dpi?: number;
  mode?: "searchable-pdf" | "text";
  onProgress?: ProgressFn;
}

export interface OcrResult {
  text: string;
  bytes?: Uint8Array; // searchable pdf
  confidence?: number;
}

/**
 * OCR a PDF: render pages, recognize text, build a searchable PDF (invisible text layer)
 * or return plain text.
 */
export async function ocrPdf(
  pdfBytes: Uint8Array,
  options: OcrOptions = {}
): Promise<OcrResult> {
  const { language = "eng", dpi = 250, mode = "searchable-pdf", onProgress } = options;

  const srcDoc = await openPdfJs(pdfBytes);
  const totalPages = srcDoc.numPages;

  const worker = await Tesseract.createWorker(language, 1, {
    logger: (m: any) => {
    },
  });

  let fullText = "";
  let totalConf = 0;
  let wordCount = 0;
  let skippedWords = 0;

  const outDoc = mode === "searchable-pdf" ? await PDFDocument.create() : null;

  // If searchable pdf, we keep original page images. Need to render originals anyway.
  for (let p = 1; p <= totalPages; p++) {
    onProgress?.(p, totalPages, `Rendering page ${p}…`);
    const page = await srcDoc.getPage(p);
    const unscaled = page.getViewport({ scale: 1 });
    const scale = dpi / 72;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error(PDF_ERRORS.canvasUnavailable);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx as any, viewport }).promise;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const g = (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
      const v = g > 140 ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = v;
    }
    ctx.putImageData(imgData, 0, 0);

    onProgress?.(p, totalPages, `Recognizing page ${p}…`);
    const { data: ocrData } = await worker.recognize(canvas);
    const pageText = ocrData.text || "";
    fullText += `\n===== Page ${p} =====\n${pageText}\n`;

    for (const w of (ocrData as any).words || []) {
      totalConf += w.confidence || 0;
      wordCount++;
    }

    if (mode === "searchable-pdf" && outDoc) {
      // Render original (color) page image for visual fidelity
      const origCanvas = document.createElement("canvas");
      origCanvas.width = Math.floor(viewport.width);
      origCanvas.height = Math.floor(viewport.height);
      const octx = origCanvas.getContext("2d");
      if (octx) {
        octx.fillStyle = "#ffffff";
        octx.fillRect(0, 0, origCanvas.width, origCanvas.height);
        await page.render({ canvasContext: octx as any, viewport }).promise;
      }
      const blob = await new Promise<Blob>((res, rej) =>
        origCanvas.toBlob((b) => (b ? res(b) : rej(new Error("blob"))), "image/jpeg", 0.9)
      );
      const buf = await blob.arrayBuffer();
      const img = await outDoc.embedJpg(new Uint8Array(buf));
      const outPage = outDoc.addPage([unscaled.width, unscaled.height]);
      outPage.drawImage(img, { x: 0, y: 0, width: unscaled.width, height: unscaled.height });

      // Scale factor from canvas (dpi) to page points
      const sx = unscaled.width / canvas.width;
      const sy = unscaled.height / canvas.height;
      for (const w of (ocrData as any).words || []) {
        const b = w.bbox;
        const x = b.x0 * sx;
        const y = unscaled.height - b.y1 * sy;
        const wPt = (b.x1 - b.x0) * sx;
        const hPt = (b.y1 - b.y0) * sy;
        const fontSize = Math.max(6, hPt * 0.85);
        try {
          outPage.drawText(w.text, {
            x,
            y,
            size: fontSize,
            color: rgb(0, 0, 0),
            opacity: 0,
          });
        } catch {
          skippedWords++;
        }
        void wPt;
      }
    }
  }

  if (skippedWords > 0) {
    console.warn(`ocrPdf: skipped ${skippedWords} unencodable word(s) in the invisible text layer`);
  }

  await worker.terminate();
  await srcDoc.destroy();

  const result: OcrResult = {
    text: fullText.trim(),
    confidence: wordCount ? totalConf / wordCount : 0,
  };

  if (mode === "searchable-pdf" && outDoc) {
    try {
      outDoc.setTitle("");
      outDoc.setAuthor("");
    } catch (err) {
      console.warn("ocrPdf: could not strip metadata from searchable PDF", err);
    }
    result.bytes = await savePdf(outDoc);
  }

  return result;
}