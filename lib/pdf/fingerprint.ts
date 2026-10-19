import { PDFDocument, rgb } from "pdf-lib";
import JSZip from "jszip";

export interface FingerprintRecipient {
  name: string;
  id: string;
}

export function generateId(): string {
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
  const zip = new JSZip();

  const srcDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();
  const markPages = pagesToMark && pagesToMark.length ? pagesToMark : [0, Math.floor(totalPages / 2), totalPages - 1].filter((v, i, a) => a.indexOf(v) === i && v >= 0 && v < totalPages);

  for (const r of recipients) {
    const id = generateId();
    table.push({ name: r.name, id });

    const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    // Layer 1: metadata
    doc.setTitle(`FP:${id}`);
    doc.setSubject(`fingerprint:${id}`);
    doc.setKeywords([`fp-${id}`]);
    doc.setCreator(`fp-${id}`);

    // Layer 2: near-invisible text on selected pages
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
      // also place at a couple of positions
      page.drawText(id, {
        x: width - 40,
        y: height - 10,
        size: 2.5,
        color: rgb(0.9, 0.9, 0.9),
        opacity: 0.1,
      });
    }

    const bytes = await doc.save({ useObjectStreams: true });
    const safeName = r.name.replace(/[^a-z0-9]/gi, "_").slice(0, 40) || "recipient";
    zip.file(`${safeName}-${id}.pdf`, bytes);
  }

  const zipBytes = await zip.generateAsync({ type: "uint8array" });
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
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const found = new Set<string>();

  // metadata layer
  const title = doc.getTitle() || "";
  const subject = doc.getSubject() || "";
  const keywords = doc.getKeywords();
  const kwStr = Array.isArray(keywords) ? keywords.join(" ") : String(keywords || "");
  for (const t of [title, subject, kwStr]) {
    const m = t.match(/FP:([A-Z0-9]{8})/i) || t.match(/fingerprint:([A-Z0-9]{8})/i) || t.match(/fp-([A-Z0-9]{8})/i);
    if (m) found.add(m[1].toUpperCase());
  }

  // text layer: extract with pdf.js
  try {
    const { getPdfJs } = await import("./pdf-loader");
    const pdfjs = await getPdfJs();
    const task = pdfjs.getDocument({ data: pdfBytes.slice() });
    const srcDoc = await task.promise;
    for (let p = 1; p <= srcDoc.numPages; p++) {
      const page = await srcDoc.getPage(p);
      const tc = await page.getTextContent();
      const text = (tc.items as any[]).map((i) => i.str).join(" ");
      for (const entry of table) {
        if (text.includes(entry.id)) found.add(entry.id);
      }
    }
    await srcDoc.destroy();
  } catch {
    /* ignore */
  }

  const matched = table.filter((e) => found.has(e.id));
  return { foundIds: Array.from(found), matched };
}