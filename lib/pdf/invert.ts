import { PDFDocument } from "pdf-lib";
import { getPdfJs } from "./pdf-loader";

export type InvertMode = "invert" | "dark" | "sepia" | "grayscale" | "smart";

export interface InvertOptions {
  mode?: InvertMode;
  dpi?: number;
}

/**
 * Creates a dark-mode / inverted / sepia / grayscale version of a PDF.
 * Renders pages to images with the chosen colour transform applied.
 */
export async function invertPdfColors(
  pdfBytes: Uint8Array,
  options: InvertOptions = {},
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  const { mode = "invert", dpi = 144 } = options;
  const pdfjs = await getPdfJs();
  const loadingTask = pdfjs.getDocument({ data: pdfBytes.slice() });
  const srcDoc = await loadingTask.promise;
  const totalPages = srcDoc.numPages;
  const scale = dpi / 72;

  const outDoc = await PDFDocument.create();

  try {
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await srcDoc.getPage(pageNum);
      const unscaledViewport = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Canvas context unavailable");

      // white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx as any, viewport }).promise;

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const len = data.length;

      for (let i = 0; i < len; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        let nr = r, ng = g, nb = b;
        if (mode === "invert") {
          nr = 255 - r; ng = 255 - g; nb = 255 - b;
        } else if (mode === "grayscale") {
          const gray = (r * 77 + g * 150 + b * 29) >> 8;
          nr = ng = nb = gray;
        } else if (mode === "sepia") {
          nr = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
          ng = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
          nb = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        } else if (mode === "dark") {
          // invert then slight hue rotate toward cool
          nr = 255 - r; ng = 255 - g; nb = 255 - b;
          // soften: blend toward dark blue-gray
          nr = Math.round(nr * 0.85 + 20);
          ng = Math.round(ng * 0.85 + 20);
          nb = Math.round(nb * 0.9 + 30);
        } else if (mode === "smart") {
          // invert everything; (image detection omitted for simplicity)
          nr = 255 - r; ng = 255 - g; nb = 255 - b;
        }
        data[i] = nr; data[i + 1] = ng; data[i + 2] = nb;
      }
      ctx.putImageData(imgData, 0, 0);

      const blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob((b) => (b ? res(b) : rej(new Error("blob fail"))), "image/jpeg", 0.9)
      );
      const buf = await blob.arrayBuffer();
      const img = await outDoc.embedJpg(new Uint8Array(buf));

      const outPage = outDoc.addPage([unscaledViewport.width, unscaledViewport.height]);
      outPage.drawImage(img, { x: 0, y: 0, width: unscaledViewport.width, height: unscaledViewport.height });

      if (onProgress) onProgress(pageNum, totalPages);
    }

    return await outDoc.save({ useObjectStreams: true });
  } finally {
    await srcDoc.destroy();
  }
}