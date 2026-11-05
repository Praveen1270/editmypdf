import { PDFDocument } from "pdf-lib";
import { savePdf, openPdfJs, ProgressFn, PDF_ERRORS } from "./core";

/**
 * Converts a PDF to grayscale by rendering each page through a calibrated luminance filter (0.299R + 0.587G + 0.114B).
 * Preserves original page dimensions and aspect ratios.
 */
export async function convertPdfToGrayscale(
  pdfBytes: Uint8Array,
  onProgress?: ProgressFn
): Promise<Uint8Array> {
  const srcDoc = await openPdfJs(pdfBytes);
  const totalPages = srcDoc.numPages;

  const outDoc = await PDFDocument.create();

  try {
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await srcDoc.getPage(pageNum);
      const unscaledViewport = page.getViewport({ scale: 1 });
      const scale = 2.0; // 144 DPI for crisp text and graphics
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (!ctx) {
        throw new Error(PDF_ERRORS.canvasUnavailable);
      }

      await page.render({
        canvasContext: ctx as any,
        viewport,
      }).promise;

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const len = data.length;

      for (let i = 0; i < len; i += 4) {
        const gray = (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8; // fast integer 0.299R + 0.587G + 0.114B
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
      ctx.putImageData(imgData, 0, 0);

      const jpegBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error("Canvas to blob conversion failed"));
          },
          "image/jpeg",
          0.88
        );
      });

      const buffer = await jpegBlob.arrayBuffer();
      const embeddedImg = await outDoc.embedJpg(new Uint8Array(buffer));

      const outPage = outDoc.addPage([unscaledViewport.width, unscaledViewport.height]);
      outPage.drawImage(embeddedImg, {
        x: 0,
        y: 0,
        width: unscaledViewport.width,
        height: unscaledViewport.height,
      });

      if (onProgress) {
        onProgress(pageNum, totalPages);
      }
    }

    return await savePdf(outDoc);
  } finally {
    await srcDoc.destroy();
  }
}
