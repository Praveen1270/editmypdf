import { extractTextFromPdf } from "./text-extract";
import { computeLineDiff, DiffLine } from "@/lib/utils/diff";
import { formatFileSize } from "@/lib/utils";

export interface CompareSummary {
  nameA: string;
  nameB: string;
  sizeA: number;
  sizeB: number;
  sizeFormattedA: string;
  sizeFormattedB: string;
  pageCountA: number;
  pageCountB: number;
  wordsA: number;
  wordsB: number;
  diffLines: DiffLine[];
  addedCount: number;
  removedCount: number;
  identicalCount: number;
  hasTextA: boolean;
  hasTextB: boolean;
  isIdentical: boolean;
}

export async function comparePdfDocuments(
  pdfA: { name: string; bytes: Uint8Array },
  pdfB: { name: string; bytes: Uint8Array },
  onProgress?: (step: string) => void
): Promise<CompareSummary> {
  if (onProgress) onProgress("Extracting text from Document A...");
  const textA = await extractTextFromPdf(pdfA.bytes);

  if (onProgress) onProgress("Extracting text from Document B...");
  const textB = await extractTextFromPdf(pdfB.bytes);

  if (onProgress) onProgress("Computing structural diff...");
  const diffLines = computeLineDiff(textA.fullText, textB.fullText);

  let addedCount = 0;
  let removedCount = 0;
  let identicalCount = 0;

  for (const line of diffLines) {
    if (line.type === "added") addedCount++;
    else if (line.type === "removed") removedCount++;
    else identicalCount++;
  }

  const isIdentical =
    addedCount === 0 &&
    removedCount === 0 &&
    textA.pages.length === textB.pages.length;

  return {
    nameA: pdfA.name,
    nameB: pdfB.name,
    sizeA: pdfA.bytes.byteLength,
    sizeB: pdfB.bytes.byteLength,
    sizeFormattedA: formatFileSize(pdfA.bytes.byteLength),
    sizeFormattedB: formatFileSize(pdfB.bytes.byteLength),
    pageCountA: textA.pages.length,
    pageCountB: textB.pages.length,
    wordsA: textA.totalWords,
    wordsB: textB.totalWords,
    diffLines,
    addedCount,
    removedCount,
    identicalCount,
    hasTextA: textA.hasText,
    hasTextB: textB.hasText,
    isIdentical,
  };
}
