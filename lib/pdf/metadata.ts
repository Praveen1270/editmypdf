import { PDFDocument } from "pdf-lib";

export interface PdfMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  producer: string;
  creator: string;
  creationDate?: string;
  modificationDate?: string;
}

/**
 * Reads metadata fields from a PDF document.
 */
export async function readPdfMetadata(pdfBytes: Uint8Array): Promise<PdfMetadata> {
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

  const rawKeywords = doc.getKeywords();
  let keywordsStr = "";
  if (Array.isArray(rawKeywords)) {
    keywordsStr = rawKeywords.join(", ");
  } else if (typeof rawKeywords === "string") {
    keywordsStr = rawKeywords;
  }

  return {
    title: doc.getTitle() || "",
    author: doc.getAuthor() || "",
    subject: doc.getSubject() || "",
    keywords: keywordsStr,
    producer: doc.getProducer() || "",
    creator: doc.getCreator() || "",
    creationDate: doc.getCreationDate() ? doc.getCreationDate()!.toISOString() : undefined,
    modificationDate: doc.getModificationDate() ? doc.getModificationDate()!.toISOString() : undefined,
  };
}

/**
 * Updates metadata fields in a PDF document.
 */
export async function updatePdfMetadata(
  pdfBytes: Uint8Array,
  metadata: Partial<PdfMetadata>,
  stripAll: boolean = false
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

  if (stripAll) {
    doc.setTitle("");
    doc.setAuthor("");
    doc.setSubject("");
    doc.setKeywords([]);
    doc.setProducer("");
    doc.setCreator("");
  } else {
    if (metadata.title !== undefined) doc.setTitle(metadata.title);
    if (metadata.author !== undefined) doc.setAuthor(metadata.author);
    if (metadata.subject !== undefined) doc.setSubject(metadata.subject);
    if (metadata.keywords !== undefined) {
      const kwArray = metadata.keywords
        .split(/[,;]/)
        .map((k) => k.trim())
        .filter(Boolean);
      doc.setKeywords(kwArray);
    }
    if (metadata.producer !== undefined) doc.setProducer(metadata.producer);
    if (metadata.creator !== undefined) doc.setCreator(metadata.creator);
    doc.setModificationDate(new Date());
  }

  return await doc.save({ useObjectStreams: true });
}
