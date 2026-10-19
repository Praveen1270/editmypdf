import { PDFDocument } from "pdf-lib";

export interface ScanPage {
  dataUrl: string; // image data url
}

export interface ScanToPdfOptions {
  pageSize?: "fit" | "a4" | "letter";
  filter?: "original" | "grayscale" | "bw" | "color";
}

/**
 * Builds a PDF from captured scan images (data URLs).
 */
export async function scanToPdf(
  pages: ScanPage[],
  options: ScanToPdfOptions = {}
): Promise<Uint8Array> {
  if (pages.length === 0) throw new Error("No scanned pages.");
  const { pageSize = "a4", filter = "original" } = options;
  const doc = await PDFDocument.create();

  const STANDARD = { a4: { w: 595.28, h: 841.89 }, letter: { w: 612, h: 792 } };

  for (const p of pages) {
    // Load image into canvas for filter + dimensions
    const img = await loadImage(p.dataUrl);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(img, 0, 0);

    if (filter === "grayscale") {
      const d = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < d.data.length; i += 4) {
        const g = (d.data[i] * 77 + d.data[i + 1] * 150 + d.data[i + 2] * 29) >> 8;
        d.data[i] = d.data[i + 1] = d.data[i + 2] = g;
      }
      ctx.putImageData(d, 0, 0);
    } else if (filter === "bw") {
      const d = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < d.data.length; i += 4) {
        const g = (d.data[i] * 77 + d.data[i + 1] * 150 + d.data[i + 2] * 29) >> 8;
        const v = g > 128 ? 255 : 0;
        d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
      }
      ctx.putImageData(d, 0, 0);
    }

    const blob = await new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error("blob"))), "image/jpeg", 0.92)
    );
    const buf = await blob.arrayBuffer();
    const embedded = await doc.embedJpg(new Uint8Array(buf));

    let pageW: number, pageH: number;
    if (pageSize === "fit") {
      pageW = embedded.width; pageH = embedded.height;
    } else {
      const base = STANDARD[pageSize];
      pageW = base.w; pageH = base.h;
      // auto orientation
      if (embedded.width > embedded.height && pageW < pageH) [pageW, pageH] = [pageH, pageW];
    }

    const page = doc.addPage([pageW, pageH]);
    const scale = Math.min(pageW / embedded.width, pageH / embedded.height);
    const dw = embedded.width * scale;
    const dh = embedded.height * scale;
    page.drawImage(embedded, { x: (pageW - dw) / 2, y: (pageH - dh) / 2, width: dw, height: dh });
  }

  return await doc.save();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}