import { getPdfJs } from "./pdf-loader";

export interface PageTextResult {
  pageNumber: number;
  text: string;
  wordCount: number;
  charCount: number;
}

export interface ExtractTextResult {
  pages: PageTextResult[];
  fullText: string;
  totalWords: number;
  totalChars: number;
  hasText: boolean; // false if purely scanned images with no embedded text
}

/**
 * Extracts selectable text from all pages of a PDF document using PDF.js.
 */
export async function extractTextFromPdf(
  pdfBytes: Uint8Array,
  onProgress?: (current: number, total: number) => void
): Promise<ExtractTextResult> {
  const pdfjs = await getPdfJs();
  const loadingTask = pdfjs.getDocument({ data: pdfBytes });
  const doc = await loadingTask.promise;

  const totalPages = doc.numPages;
  const pageResults: PageTextResult[] = [];
  let aggregateFullText = "";
  let totalWords = 0;
  let totalChars = 0;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();

    // Reconstruct text lines
    const lineParts: string[] = [];
    let lastY: number | null = null;

    for (const item of content.items as any[]) {
      if (!item.str) continue;

      // Group by vertical coordinates to reconstruct approximate lines
      if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
        lineParts.push("\n");
      } else if (lineParts.length > 0 && !lineParts[lineParts.length - 1].endsWith("\n") && !lineParts[lineParts.length - 1].endsWith(" ")) {
        lineParts.push(" ");
      }

      lineParts.push(item.str);
      lastY = item.transform[5];
    }

    const pageText = lineParts.join("").trim();
    const words = pageText ? pageText.split(/\s+/).filter(Boolean).length : 0;
    const chars = pageText.length;

    totalWords += words;
    totalChars += chars;

    pageResults.push({
      pageNumber: pageNum,
      text: pageText,
      wordCount: words,
      charCount: chars,
    });

    aggregateFullText += `--- Page ${pageNum} ---\n` + (pageText || "[No selectable text on this page]") + "\n\n";

    if (onProgress) {
      onProgress(pageNum, totalPages);
    }
  }

  return {
    pages: pageResults,
    fullText: aggregateFullText.trim(),
    totalWords,
    totalChars,
    hasText: totalWords > 0,
  };
}
