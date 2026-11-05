import { PDFDocument } from "pdf-lib";
import { loadPdf, savePdf, openPdfJs } from "./core";

export interface RepairResult {
  bytes: Uint8Array;
  strategy: string;
  pagesRecovered: number;
}

/**
 * Attempts to recover a corrupted/truncated PDF using a cascade of strategies.
 * Stops at the first strategy that opens cleanly in pdf.js.
 */
export async function repairPdf(
  pdfBytes: Uint8Array,
  onProgress?: (msg: string) => void
): Promise<RepairResult> {
  let lastError: unknown = null;
  const recordFailure = (strategy: string, err: unknown) => {
    lastError = err;
    console.warn(`repairPdf: strategy "${strategy}" failed, trying next`, err);
  };

  // Strategy 1: lenient reload with pdf-lib and re-save
  try {
    onProgress?.("Trying lenient reload...");
    const doc = await loadPdf(pdfBytes);
    const bytes = await savePdf(doc);
    if (await opensCleanly(bytes)) {
      return { bytes, strategy: "Lenient reload", pagesRecovered: doc.getPageCount() };
    }
  } catch (e) {
    recordFailure("Lenient reload", e);
  }

  // Strategy 2: rebuild xref by scanning for objects
  try {
    onProgress?.("Rebuilding cross-reference table...");
    const bytes = rebuildXref(pdfBytes);
    if (bytes && (await opensCleanly(bytes))) {
      const doc = await loadPdf(bytes);
      return { bytes, strategy: "Rebuilt cross-reference table", pagesRecovered: doc.getPageCount() };
    }
  } catch (e) {
    recordFailure("Rebuilt cross-reference table", e);
  }

  // Strategy 3: truncated file - append missing endstream/endobj/trailer
  try {
    onProgress?.("Repairing truncated file...");
    const bytes = repairTruncated(pdfBytes);
    if (bytes && (await opensCleanly(bytes))) {
      const doc = await loadPdf(bytes);
      return { bytes, strategy: "Truncated file repair", pagesRecovered: doc.getPageCount() };
    }
  } catch (e) {
    recordFailure("Truncated file repair", e);
  }

  // Strategy 4: rebuild page tree from loose /Type /Page objects
  try {
    onProgress?.("Rebuilding page tree...");
    const bytes = rebuildPageTree(pdfBytes);
    if (bytes && (await opensCleanly(bytes))) {
      const doc = await loadPdf(bytes);
      return { bytes, strategy: "Rebuilt page tree", pagesRecovered: doc.getPageCount() };
    }
  } catch (e) {
    recordFailure("Rebuilt page tree", e);
  }

  // Strategy 5: salvage - render whatever pages pdf.js can draw into images
  try {
    onProgress?.("Salvaging recoverable pages...");
    const { bytes, count } = await salvagePages(pdfBytes);
    if (bytes && count > 0) {
      return { bytes, strategy: "Salvage (rendered pages to images)", pagesRecovered: count };
    }
  } catch (e) {
    recordFailure("Salvage", e);
  }

  const detail = lastError instanceof Error ? `: ${lastError.message}` : "";
  throw new Error(`Could not repair this PDF. The file may be too damaged to recover${detail}`);
}

async function opensCleanly(bytes: Uint8Array): Promise<boolean> {
  try {
    const doc = await openPdfJs(bytes);
    const n = doc.numPages;
    await doc.destroy();
    return n > 0;
  } catch {
    return false;
  }
}

function rebuildXref(input: Uint8Array): Uint8Array | null {
  const text = new TextDecoder("latin1").decode(input);
  const objRegex = /(\d+)\s+(\d+)\s+obj\b/g;
  const offsets: { num: number; gen: number; off: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = objRegex.exec(text)) !== null) {
    offsets.push({ num: parseInt(m[1]), gen: parseInt(m[2]), off: m.index });
  }
  if (offsets.length === 0) return null;

  let rootMatch = text.match(/\/Root\s+(\d+)\s+(\d+)\s+R/);
  let root = rootMatch ? `${rootMatch[1]} ${rootMatch[2]} R` : null;

  if (!root) {
    for (const o of offsets) {
      const slice = text.slice(o.off, o.off + 200);
      if (slice.includes("/Type") && slice.includes("/Catalog")) {
        root = `${o.num} ${o.gen} R`;
        break;
      }
    }
  }
  if (!root) return null;

  const maxObj = Math.max(...offsets.map((o) => o.num));
  const xrefOffset = text.length;
  let xref = "xref\n";
  xref += `0 ${maxObj + 1}\n`;
  xref += "0000000000 65535 f \n";
  const byNum = new Map<number, number>();
  for (const o of offsets) byNum.set(o.num, o.off);
  for (let i = 1; i <= maxObj; i++) {
    const off = byNum.get(i);
    if (off !== undefined) {
      xref += String(off).padStart(10, "0") + " 00000 n \n";
    } else {
      xref += "0000000000 65535 f \n";
    }
  }
  const trailer = `trailer\n<< /Size ${maxObj + 1} /Root ${root} >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  const out = text + "\n" + xref + trailer;
  return new TextEncoder().encode(out);
}

function repairTruncated(input: Uint8Array): Uint8Array | null {
  const text = new TextDecoder("latin1").decode(input);
  let fixed = text;
  if (!fixed.includes("%%EOF")) {
    if (!fixed.trimEnd().endsWith("endobj") && !fixed.trimEnd().endsWith("endstream")) {
      fixed = fixed.trimEnd() + "\nendstream\nendobj\n";
    }
    const rootMatch = fixed.match(/\/Root\s+(\d+)\s+(\d+)\s+R/);
    const root = rootMatch ? `${rootMatch[1]} ${rootMatch[2]} R` : null;
    if (!root) return null;
    const objRegex = /(\d+)\s+(\d+)\s+obj\b/g;
    let maxObj = 0;
    let m: RegExpExecArray | null;
    while ((m = objRegex.exec(fixed)) !== null) {
      maxObj = Math.max(maxObj, parseInt(m[1]));
    }
    const xrefOffset = fixed.length;
    let xref = "xref\n0 " + (maxObj + 1) + "\n";
    xref += "0000000000 65535 f \n";
    // approximate offsets: not accurate but try
    const trailer = `trailer\n<< /Size ${maxObj + 1} /Root ${root} >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
    fixed = fixed.trimEnd() + "\n" + xref + trailer;
  }
  return new TextEncoder().encode(fixed);
}

function rebuildPageTree(input: Uint8Array): Uint8Array | null {
  const text = new TextDecoder("latin1").decode(input);
  const pageObjNums: number[] = [];
  const objRegex = /(\d+)\s+(\d+)\s+obj\b/g;
  let m: RegExpExecArray | null;
  while ((m = objRegex.exec(text)) !== null) {
    const start = m.index;
    const slice = text.slice(start, start + 300);
    if (slice.includes("/Type") && /\/Type\s*\/Page[^s]/.test(slice)) {
      pageObjNums.push(parseInt(m[1]));
    }
  }
  if (pageObjNums.length === 0) return null;

  const maxObj = Math.max(...Array.from(text.matchAll(/(\d+)\s+\d+\s+obj/g)).map((x) => parseInt(x[1])));
  const pagesObjNum = maxObj + 1;
  const catalogMatch = text.match(/(\d+)\s+(\d+)\s+obj[^]*?\/Type\s*\/Catalog/);
  let catalogNum = catalogMatch ? parseInt(catalogMatch[1]) : null;

  const kids = pageObjNums.map((n) => `${n} 0 R`).join(" ");
  const pagesObj = `${pagesObjNum} 0 obj\n<< /Type /Pages /Kids [ ${kids} ] /Count ${pageObjNums.length} >>\nendobj\n`;

  let fixed = text;
  if (catalogNum) {
    fixed = fixed.replace(
      new RegExp(`(${catalogNum}\\s+0\\s+obj[^]*?)/Type\\s*/Catalog`),
      `$1/Type /Catalog`
    );
    if (!new RegExp(`${catalogNum}\\s+0\\s+obj[^]*?/Pages`).test(fixed)) {
      fixed = fixed.replace(
        new RegExp(`(${catalogNum}\\s+0\\s+obj)`),
        `$1\n<< /Type /Catalog /Pages ${pagesObjNum} 0 R >>`
      );
    }
  }

  fixed = fixed.trimEnd() + "\n" + pagesObj + "\n%%EOF\n";
  return new TextEncoder().encode(fixed);
}

async function salvagePages(input: Uint8Array): Promise<{ bytes: Uint8Array; count: number }> {
  let srcDoc: any;
  try {
    srcDoc = await openPdfJs(input);
  } catch (err) {
    console.warn("repairPdf: salvage open failed, retrying with disableAutoFetch", err);
    srcDoc = await openPdfJs(input, { disableAutoFetch: true });
  }
  const totalPages = srcDoc.numPages;
  const outDoc = await PDFDocument.create();
  let count = 0;
  for (let i = 1; i <= totalPages; i++) {
    try {
      const page = await srcDoc.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      await page.render({ canvasContext: ctx as any, viewport }).promise;
      const blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob((b) => (b ? res(b) : rej(new Error("blob"))), "image/jpeg", 0.9)
      );
      const buf = await blob.arrayBuffer();
      const img = await outDoc.embedJpg(new Uint8Array(buf));
      const unscaled = page.getViewport({ scale: 1 });
      const outPage = outDoc.addPage([unscaled.width, unscaled.height]);
      outPage.drawImage(img, { x: 0, y: 0, width: unscaled.width, height: unscaled.height });
      count++;
    } catch (err) {
      console.warn(`repairPdf: salvage could not render page ${i}, skipping it`, err);
    }
  }
  await srcDoc.destroy();
  if (count === 0) throw new Error("No pages recoverable");
  const bytes = await savePdf(outDoc);
  return { bytes, count };
}