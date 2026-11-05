import { getPdfInfo } from "@/lib/pdf/pdf-loader";

// Single PDF size limit for the whole app. The edit-pdf workspace imports
// this constant instead of keeping its own (previously 50MB) limit.
export const MAX_PDF_FILE_BYTES = 150 * 1024 * 1024;

export function validatePdfFile(
  file: File,
  maxBytes: number = MAX_PDF_FILE_BYTES
): { ok: true } | { ok: false; error: string } {
  if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
    return { ok: false, error: "Please select a valid PDF document." };
  }
  if (file.size > maxBytes) {
    return {
      ok: false,
      error: `"${file.name}" exceeds the recommended ${Math.round(maxBytes / (1024 * 1024))}MB browser RAM limit.`,
    };
  }
  return { ok: true };
}

export async function readPdfFile(file: File): Promise<{ bytes: Uint8Array; pageCount: number }> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const info = await getPdfInfo(bytes);
  return { bytes, pageCount: info.pageCount };
}
