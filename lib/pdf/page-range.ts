/**
 * Parses user input page ranges like "1-3, 5, 8-10" into 0-indexed page indices.
 * Validates against maxPages.
 */
export function parsePageRangeString(rangeStr: string, maxPages: number): number[] {
  const trimmed = rangeStr.trim();
  if (!trimmed) {
    throw new Error("Page range cannot be empty.");
  }

  const parts = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  const selectedIndices = new Set<number>();

  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-").map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (isNaN(start) || isNaN(end)) {
        throw new Error(`Invalid range format: "${part}". Expected format like "1-5".`);
      }
      if (start < 1 || end < 1) {
        throw new Error(`Page numbers must be greater than or equal to 1: "${part}".`);
      }
      if (start > end) {
        throw new Error(`Invalid range "${part}": start page (${start}) is greater than end page (${end}).`);
      }
      if (start > maxPages || end > maxPages) {
        throw new Error(`Page range "${part}" exceeds document length (${maxPages} pages).`);
      }

      for (let i = start; i <= end; i++) {
        selectedIndices.add(i - 1);
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (isNaN(pageNum)) {
        throw new Error(`Invalid page number: "${part}".`);
      }
      if (pageNum < 1 || pageNum > maxPages) {
        throw new Error(`Page number ${pageNum} is out of range. Document has ${maxPages} pages.`);
      }
      selectedIndices.add(pageNum - 1);
    }
  }

  const sorted = Array.from(selectedIndices).sort((a, b) => a - b);
  if (sorted.length === 0) {
    throw new Error("No valid pages were selected.");
  }
  return sorted;
}
