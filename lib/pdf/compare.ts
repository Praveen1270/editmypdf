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
  const resultA = await extractTextFromPdf(pdfA.bytes);
  const textA = resultA.fullText;
  const pageCountA = resultA.pages.length;

  if (onProgress) onProgress("Extracting text from Document B...");
  const resultB = await extractTextFromPdf(pdfB.bytes);
  const textB = resultB.fullText;
  const pageCountB = resultB.pages.length;

  if (onProgress) onProgress("Computing structural diff...");
  const diffLines = computeLineDiff(textA, textB);

  let addedCount = 0;
  let removedCount = 0;
  let identicalCount = 0;

  for (const line of diffLines) {
    if (line.type === "added") addedCount++;
    else if (line.type === "removed") removedCount++;
    else identicalCount++;
  }

  const wordsA = resultA.totalWords;
  const wordsB = resultB.totalWords;
  const isIdentical =
    addedCount === 0 &&
    removedCount === 0 &&
    pageCountA === pageCountB;

  return {
    nameA: pdfA.name,
    nameB: pdfB.name,
    sizeA: pdfA.bytes.byteLength,
    sizeB: pdfB.bytes.byteLength,
    sizeFormattedA: formatFileSize(pdfA.bytes.byteLength),
    sizeFormattedB: formatFileSize(pdfB.bytes.byteLength),
    pageCountA,
    pageCountB,
    wordsA,
    wordsB,
    diffLines,
    addedCount,
    removedCount,
    identicalCount,
    hasTextA: resultA.hasText,
    hasTextB: resultB.hasText,
    isIdentical,
  };
}
