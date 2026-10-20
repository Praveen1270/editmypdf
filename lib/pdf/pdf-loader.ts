/**
 * Client-side PDF.js rendering and thumbnail generation.
 * All operations run 100% locally in the browser with offline worker.
 */

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;

export async function getPdfjs() {
  if (typeof window === "undefined") {
    throw new Error("PDF.js can only run in the browser.");
  }
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      // Use locally hosted worker from public/ to guarantee offline capability
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

export const getPdfJs = getPdfjs;

export interface PDFDocInfo {
  pageCount: number;
  fingerprint: string;
}

export async function getPdfInfo(bytes: Uint8Array, password?: string): Promise<PDFDocInfo> {
  const pdfjs = await getPdfjs();
  const loadingTask = pdfjs.getDocument({
    data: bytes.slice(), // pass a copy to avoid neutering ArrayBuffer
    password: password || undefined,
  });

  try {
    const doc = await loadingTask.promise;
    try {
      const pageCount = doc.numPages;
      const fingerprint = doc.fingerprints?.[0] || String(Math.random());
      return { pageCount, fingerprint };
    } finally {
      await doc.destroy();
    }
  } catch (err: any) {
    if (err?.name === "PasswordException" || (err?.message && err.message.toLowerCase().includes("password"))) {
      throw new Error("This document is password-protected. Please unlock it using the Unlock PDF tool first.");
    }
    throw err;
  }
}

export async function renderPageToCanvas(
  bytes: Uint8Array,
  pageNumber: number, // 1-indexed
  canvas: HTMLCanvasElement,
  scale: number = 1.0,
  password?: string
): Promise<{ width: number; height: number }> {
  const pdfjs = await getPdfjs();
  const loadingTask = pdfjs.getDocument({
    data: bytes.slice(),
    password: password || undefined,
  });
  const doc = await loadingTask.promise;

  try {
    const page = await doc.getPage(pageNumber);

    const viewport = page.getViewport({ scale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not acquire 2D canvas context.");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const renderContext = {
      canvasContext: ctx,
      viewport,
    };

    await page.render(renderContext).promise;
    return { width: viewport.width, height: viewport.height };
  } finally {
    await doc.destroy();
  }
}

export async function renderPageToImageBlob(
  bytes: Uint8Array,
  pageNumber: number,
  scale: number = 1.5,
  format: "image/png" | "image/jpeg" = "image/png",
  quality: number = 0.9,
  password?: string
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  await renderPageToCanvas(bytes, pageNumber, canvas, scale, password);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob failed"));
      },
      format,
      format === "image/jpeg" ? quality : undefined
    );
  });
}


export async function renderAllThumbnails(
  bytes: Uint8Array,
  scale: number = 0.45,
  onThumbnail?: (pageIndex: number, dataUrl: string) => void,
  isCancelled?: () => boolean
): Promise<string[]> {
  const pdfjs = await getPdfjs();
  const loadingTask = pdfjs.getDocument({ data: bytes.slice() });
  const doc = await loadingTask.promise;
  const urls: string[] = [];

  try {
    for (let i = 0; i < doc.numPages; i++) {
      if (isCancelled && isCancelled()) break;
      const page = await doc.getPage(i + 1);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        await page.render({ canvasContext: ctx, viewport }).promise;
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        urls[i] = dataUrl;
        if (onThumbnail) {
          onThumbnail(i, dataUrl);
        }
      }
    }
    return urls;
  } finally {
    await doc.destroy();
  }
}
