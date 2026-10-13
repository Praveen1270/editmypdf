import JSZip from "jszip";
import { renderPageToImageBlob, getPdfInfo } from "./pdf-loader";
import { parsePageRangeString } from "./split";

export interface ConvertedImagePage {
  pageNumber: number;
  blob: Blob;
  dataUrl: string;
  filename: string;
  width: number;
  height: number;
}

export interface ConvertToImagesOptions {
  format: "png" | "jpeg";
  scale: number; // 1, 1.5, 2
  quality: number; // 0.1 - 1.0 (for jpeg)
  rangeStr?: string; // empty means all pages
}

export async function convertPdfToImages(
  pdfBytes: Uint8Array,
  baseFilename: string,
  options: ConvertToImagesOptions,
  onProgress?: (current: number, total: number) => void
): Promise<ConvertedImagePage[]> {
  const cleanBase = baseFilename.replace(/\.pdf$/i, "");
  const info = await getPdfInfo(pdfBytes);
  const totalPages = info.pageCount;

  let pageIndices: number[];
  if (options.rangeStr && options.rangeStr.trim()) {
    pageIndices = parsePageRangeString(options.rangeStr, totalPages);
  } else {
    pageIndices = Array.from({ length: totalPages }, (_, i) => i);
  }

  const mimeType = options.format === "png" ? "image/png" : "image/jpeg";
  const extension = options.format === "png" ? "png" : "jpg";

  const results: ConvertedImagePage[] = [];

  for (let i = 0; i < pageIndices.length; i++) {
    const pageIndex = pageIndices[i];
    const pageNumber = pageIndex + 1;
    onProgress?.(i + 1, pageIndices.length);

    const blob = await renderPageToImageBlob(
      pdfBytes,
      pageNumber,
      options.scale,
      mimeType,
      options.quality
    );

    const dataUrl = URL.createObjectURL(blob);
    const filename = `${cleanBase}-page-${pageNumber}.${extension}`;

    results.push({
      pageNumber,
      blob,
      dataUrl,
      filename,
      width: 0,
      height: 0,
    });
  }

  return results;
}

export async function createImagesZip(
  images: ConvertedImagePage[],
  zipFilename: string
): Promise<{ bytes: Uint8Array; filename: string }> {
  const zip = new JSZip();
  for (const img of images) {
    const buffer = await img.blob.arrayBuffer();
    zip.file(img.filename, buffer);
  }
  const zipBytes = await zip.generateAsync({ type: "uint8array" });
  return { bytes: zipBytes, filename: zipFilename };
}
