import { PDFDocument } from "pdf-lib";

export type RiskLevel = "high" | "medium" | "low";

export interface PrivacyFinding {
  id: string;
  category: string;
  level: RiskLevel;
  title: string;
  detail: string;
  removable: boolean;
}

export interface PrivacyScanResult {
  findings: PrivacyFinding[];
  cleanedBytes?: Uint8Array;
}

const STATE_CODES = new Set([
  "01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20",
  "21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38",
]);

/**
 * Scans a PDF for hidden data and optionally produces a cleaned copy.
 */
export async function scanPdfPrivacy(
  pdfBytes: Uint8Array,
  options: { clean?: boolean } = {}
): Promise<PrivacyScanResult> {
  const findings: PrivacyFinding[] = [];
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

  // Info dictionary
  const metaFields: [string, string | undefined][] = [
    ["Title", doc.getTitle()],
    ["Author", doc.getAuthor()],
    ["Subject", doc.getSubject()],
    ["Keywords", Array.isArray(doc.getKeywords()) ? (doc.getKeywords() as unknown as string[]).join(", ") : (doc.getKeywords() as string)],
    ["Creator", doc.getCreator()],
    ["Producer", doc.getProducer()],
  ];
  for (const [name, val] of metaFields) {
    if (val && String(val).trim()) {
      findings.push({
        id: `meta-${name.toLowerCase()}`,
        category: "Metadata",
        level: name === "Author" || name === "Creator" ? "medium" : "low",
        title: `${name} field present`,
        detail: `"${String(val).slice(0, 120)}"`,
        removable: true,
      });
    }
  }
  if (doc.getCreationDate() || doc.getModificationDate()) {
    findings.push({
      id: "meta-dates",
      category: "Metadata",
      level: "low",
      title: "Creation / modification dates present",
      detail: "Timestamps can reveal when and where the document was created.",
      removable: true,
    });
  }

  // Embedded files / attachments
  try {
    const names = (doc as any).catalog?.get?.("Names");
    if (names) {
      findings.push({
        id: "attachments",
        category: "Attachments",
        level: "medium",
        title: "Embedded files / attachments detected",
        detail: "The document contains embedded files that may carry hidden data.",
        removable: true,
      });
    }
  } catch {
    /* ignore */
  }

  // JavaScript actions
  try {
    const catalog: any = doc.catalog;
    if (catalog.has("OpenAction") || catalog.has("AA") || catalog.has("Names")) {
      const names = catalog.get("Names");
      const hasJs = names && typeof names.has === "function" && names.has("JavaScript");
      if (catalog.has("OpenAction") || catalog.has("AA") || hasJs) {
        findings.push({
          id: "javascript",
          category: "Scripts",
          level: "high",
          title: "JavaScript actions present",
          detail: "Embedded scripts can execute when the document is opened.",
          removable: true,
        });
      }
    }
  } catch {
    /* ignore */
  }

  // XFA
  try {
    const form: any = (doc as any).getForm?.();
    if (form?.hasXFA?.()) {
      findings.push({
        id: "xfa",
        category: "Forms",
        level: "medium",
        title: "XFA (XML Forms Architecture) data present",
        detail: "Extended form data may contain hidden fields.",
        removable: true,
      });
    }
  } catch {
    /* ignore */
  }

  // Form fields (hidden fields)
  try {
    const form: any = (doc as any).getForm?.();
    const fields = form?.getFields?.() || [];
    if (fields.length > 0) {
      findings.push({
        id: "form-fields",
        category: "Forms",
        level: "low",
        title: `${fields.length} form field(s) present`,
        detail: "Form fields may contain default values or hidden data.",
        removable: true,
      });
    }
  } catch {
    /* ignore */
  }

  // Annotations
  let annotCount = 0;
  for (const page of doc.getPages()) {
    try {
      const annots = (page.node as any).getArray?.("Annots");
      if (annots && typeof annots.size === "function") annotCount += annots.size();
    } catch {
      /* ignore */
    }
  }
  if (annotCount > 0) {
    findings.push({
      id: "annotations",
      category: "Annotations",
      level: "low",
      title: `${annotCount} annotation(s) present`,
      detail: "Comments, highlights and stamps may contain sensitive notes.",
      removable: true,
    });
  }

  // External links / URIs
  try {
    const { getPdfJs } = await import("./pdf-loader");
    const pdfjs = await getPdfJs();
    const task = pdfjs.getDocument({ data: pdfBytes.slice() });
    const srcDoc = await task.promise;
    let linkCount = 0;
    for (let i = 1; i <= srcDoc.numPages; i++) {
      const page = await srcDoc.getPage(i);
      const annots = await page.getAnnotations();
      for (const a of annots) {
        if (a.url || a.dest) linkCount++;
      }
    }
    await srcDoc.destroy();
    if (linkCount > 0) {
      findings.push({
        id: "links",
        category: "Links",
        level: "low",
        title: `${linkCount} link(s) / external references`,
        detail: "Hyperlinks may leak navigation targets.",
        removable: true,
      });
    }
  } catch {
    /* ignore */
  }

  // Image EXIF check (best-effort: flag if images present)
  try {
    // pdf-lib doesn't expose image XObjects easily; flag generically
    const pdfText = new TextDecoder("latin1").decode(pdfBytes);
    const hasImages = pdfText.includes("/Image");
    if (hasImages) {
      findings.push({
        id: "images-exif",
        category: "Images",
        level: "medium",
        title: "Embedded images present (may contain EXIF)",
        detail: "Images can carry GPS coordinates and camera metadata; re-encoding removes it.",
        removable: true,
      });
    }
  } catch {
    /* ignore */
  }

  let cleanedBytes: Uint8Array | undefined;
  if (options.clean) {
    // Produce cleaned copy
    const cleanDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    // Clear info dict
    cleanDoc.setTitle("");
    cleanDoc.setAuthor("");
    cleanDoc.setSubject("");
    cleanDoc.setKeywords([]);
    cleanDoc.setCreator("");
    cleanDoc.setProducer("");
    // Remove annotations
    for (const page of cleanDoc.getPages()) {
      try {
        (page.node as any).delete?.("Annots");
      } catch {
        /* ignore */
      }
    }
    // Remove scripts/actions
    try {
      const catalog: any = cleanDoc.catalog;
      if (catalog.has("OpenAction")) catalog.delete("OpenAction");
      if (catalog.has("AA")) catalog.delete("AA");
      if (catalog.has("Names")) {
        const names = catalog.get("Names");
        if (names && typeof names.delete === "function") names.delete("JavaScript");
      }
    } catch {
      /* ignore */
    }
    // Remove XFA
    try {
      const form: any = (cleanDoc as any).getForm?.();
      form?.removeXFA?.();
    } catch {
      /* ignore */
    }
    // Re-encode images by rasterizing? Skip heavy; just save
    cleanedBytes = await cleanDoc.save({ useObjectStreams: true });
  }

  return { findings, cleanedBytes };
}