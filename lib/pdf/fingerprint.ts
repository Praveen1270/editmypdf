import { rgb } from "pdf-lib";
import { loadPdf, savePdf, openPdfJs, zipFiles } from "./core";

function generateId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export interface FingerprintOptions {
  recipients: { name: string }[];
  pagesToMark?: number[]; // 0-indexed; default first 3 pages
}

export interface FingerprintResult {
  zip: Uint8Array;
  table: { name: string; id: string }[];
}

/**
 * Creates one fingerprinted copy per recipient, zipped together.
 * Layers: metadata key + near-invisible text on selected pages.
 */
export async function fingerprintPdf(
  pdfBytes: Uint8Array,
  options: FingerprintOptions
): Promise<FingerprintResult> {
  const { recipients, pagesToMark } = options;
  const table: { name: string; id: string }[] = [];
  const files: { name: string; data: Uint8Array }[] = [];

  const srcDoc = await loadPdf(pdfBytes);
  const totalPages = srcDoc.getPageCount();
  const markPages = pagesToMark && pagesToMark.length ? pagesToMark : [0, Math.floor(totalPages / 2), totalPages - 1].filter((v, i, a) => a.indexOf(v) === i && v >= 0 && v < totalPages);

  for (const r of recipients) {
    const id = generateId();
    table.push({ name: r.name, id });

    const doc = await loadPdf(pdfBytes);
    doc.setTitle(`FP:${id}`);
    doc.setSubject(`fingerprint:${id}`);
    doc.setKeywords([`fp-${id}`]);
    doc.setCreator(`fp-${id}`);

    for (const pi of markPages) {
      const page = doc.getPage(pi);
      const { width, height } = page.getSize();
      // tiny, colour-matched-to-white (near invisible) text at bottom
      page.drawText(id, {
        x: 5,
        y: 5,
        size: 3,
        color: rgb(0.92, 0.92, 0.92),
        opacity: 0.15,
      });
      page.drawText(id, {
        x: width - 40,
        y: height - 10,
        size: 2.5,
        color: rgb(0.9, 0.9, 0.9),
        opacity: 0.1,
      });
    }

    const bytes = await savePdf(doc);
    const safeName = r.name.replace(/[^a-z0-9]/gi, "_").slice(0, 40) || "recipient";
    files.push({ name: `${safeName}-${id}.pdf`, data: bytes });
  }

  const zipBytes = await zipFiles(files);
  return { zip: zipBytes, table };
}

export interface VerifyResult {
  foundIds: string[];
  matched: { name: string; id: string }[];
}

/**
 * Reads fingerprint layers from a suspect PDF and matches against a table.
 */
export async function verifyFingerprint(
  pdfBytes: Uint8Array,
  table: { name: string; id: string }[]
): Promise<VerifyResult> {
  const doc = await loadPdf(pdfBytes);
  const found = new Set<string>();

  const title = doc.getTitle() || "";
  const subject = doc.getSubject() || "";
  const keywords = doc.getKeywords();
  const kwStr = Array.isArray(keywords) ? keywords.join(" ") : String(keywords || "");
  for (const t of [title, subject, kwStr]) {
    const m = t.match(/FP:([A-Z0-9]{8})/i) || t.match(/fingerprint:([A-Z0-9]{8})/i) || t.match(/fp-([A-Z0-9]{8})/i);
    if (m) found.add(m[1].toUpperCase());
  }

  try {
    const srcDoc = await openPdfJs(pdfBytes);
    for (let p = 1; p <= srcDoc.numPages; p++) {
      const page = await srcDoc.getPage(p);
      const tc = await page.getTextContent();
      const text = (tc.items as any[]).map((i) => i.str).join(" ");
      for (const entry of table) {
        if (text.includes(entry.id)) found.add(entry.id);
      }
    }
    await srcDoc.destroy();
  } catch (err) {
    console.warn("verifyFingerprint: pdf.js text-layer check failed, matching metadata only", err);
  }

  const matched = table.filter((e) => found.has(e.id));
  return { foundIds: Array.from(found), matched };
}