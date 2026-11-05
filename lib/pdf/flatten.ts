import { PDFDocument } from "pdf-lib";
import { loadPdf, savePdf, openPdfJs, PDF_ERRORS } from "./core";

export interface FlattenOptions {
  /** Flatten AcroForm fields (default true) */
  flattenForms?: boolean;
  /** Remove annotations (default true) */
  removeAnnotations?: boolean;
  /** Remove JavaScript actions and XFA (default true) */
  removeScripts?: boolean;
  /** Render pages to images for maximum safety (default false) */
  rasterize?: boolean;
}

export interface FlattenReport {
  fieldsFlattened: number;
  annotationsRemoved: number;
  scriptsRemoved: boolean;
  xfaRemoved: boolean;
}

/**
 * Flattens form fields, annotations and embedded scripts into fixed page content
 * so the document can no longer be edited as a form.
 */
export async function flattenPdf(
  pdfBytes: Uint8Array,
  options: FlattenOptions = {}
): Promise<{ bytes: Uint8Array; report: FlattenReport }> {
  const {
    flattenForms = true,
    removeAnnotations = true,
    removeScripts = true,
    rasterize = false,
  } = options;

  const doc = await loadPdf(pdfBytes);

  const report: FlattenReport = {
    fieldsFlattened: 0,
    annotationsRemoved: 0,
    scriptsRemoved: false,
    xfaRemoved: false,
  };

  try {
    const form = doc.getForm();
    const fields = form.getFields();
    report.fieldsFlattened = fields.length;
    if (flattenForms && fields.length > 0) {
      // Update appearances before flattening so values are drawn
      try {
        form.updateFieldAppearances();
      } catch (err) {
        console.warn("flattenPdf: could not update field appearances before flattening", err);
      }
      form.flatten();
    }
  } catch (err) {
    console.warn("flattenPdf: could not read form fields (document may have no form)", err);
  }

  if (removeAnnotations) {
    for (const page of doc.getPages()) {
      try {
        const annots = (page.node as any).getArray?.("Annots") || (page.node as any).Annots;
        if (annots) {
          const arr = (annots as any).size ? (annots as any).size() : 0;
          report.annotationsRemoved += arr;
        }
        (page.node as any).delete?.("Annots");
      } catch (err) {
        console.warn("flattenPdf: could not remove annotations from a page", err);
      }
    }
  }

  if (removeScripts) {
    try {
      const catalog: any = doc.catalog;
      if (catalog.has("OpenAction")) {
        catalog.delete("OpenAction");
        report.scriptsRemoved = true;
      }
      if (catalog.has("AA")) {
        catalog.delete("AA");
        report.scriptsRemoved = true;
      }
      if (catalog.has("Names")) {
        const names = catalog.get("Names");
        if (names && (names as any).has && (names as any).has("JavaScript")) {
          (names as any).delete("JavaScript");
          report.scriptsRemoved = true;
        }
      }
    } catch (err) {
      console.warn("flattenPdf: could not remove JavaScript actions", err);
    }
    try {
      const form = (doc as any).getForm?.();
      if (form && (form as any).hasXFA?.()) {
        (form as any).removeXFA?.();
        report.xfaRemoved = true;
      }
    } catch (err) {
      console.warn("flattenPdf: could not remove XFA", err);
    }
    try {
      const catalog: any = doc.catalog;
      if (catalog.has("AcroForm")) {
        const af = catalog.get("AcroForm");
        if (af && typeof (af as any).delete === "function") {
          (af as any).delete("XFA");
          (af as any).delete("JavaScript");
        }
      }
    } catch (err) {
      console.warn("flattenPdf: could not strip AcroForm entries", err);
    }
  }

  if (rasterize) {
    const srcDoc = await openPdfJs(pdfBytes);
    const totalPages = srcDoc.numPages;
    const newDoc = await PDFDocument.create();
    try {
      for (let i = 1; i <= totalPages; i++) {
        const page = await srcDoc.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error(PDF_ERRORS.canvasUnavailable);
        await page.render({ canvasContext: ctx as any, viewport }).promise;
        const blob = await new Promise<Blob>((res, rej) =>
          canvas.toBlob((b) => (b ? res(b) : rej(new Error("blob fail"))), "image/jpeg", 0.9)
        );
        const buf = await blob.arrayBuffer();
        const img = await newDoc.embedJpg(new Uint8Array(buf));
        const unscaled = page.getViewport({ scale: 1 });
        const outPage = newDoc.addPage([unscaled.width, unscaled.height]);
        outPage.drawImage(img, { x: 0, y: 0, width: unscaled.width, height: unscaled.height });
      }
      const bytes = await savePdf(newDoc);
      await srcDoc.destroy();
      return { bytes, report };
    } finally {
      await srcDoc.destroy();
    }
  }

  const bytes = await savePdf(doc);
  return { bytes, report };
}