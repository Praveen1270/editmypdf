import { extractTextLines, ProgressFn } from "./core";

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
  onProgress?: ProgressFn
): Promise<ExtractTextResult> {
  const pages = await extractTextLines(pdfBytes, { onProgress });
  const pageResults: PageTextResult[] = [];
  let aggregateFullText = "";
  let totalWords = 0;
  let totalChars = 0;

  for (let pageNum = 1; pageNum <= pages.length; pageNum++) {
    const pageText = pages[pageNum - 1].join("\n").trim();
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
  }

  return {
    pages: pageResults,
    fullText: aggregateFullText.trim(),
    totalWords,
    totalChars,
    hasText: totalWords > 0,
  };
}
