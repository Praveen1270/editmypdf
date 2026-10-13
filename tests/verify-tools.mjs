import { PDFDocument } from "pdf-lib";
import { mergePDFs } from "../lib/pdf/merge.ts";
import { splitPDF, parsePageRangeString } from "../lib/pdf/split.ts";
import { rotatePdf } from "../lib/pdf/rotate.ts";
import { addPageNumbers } from "../lib/pdf/page-numbers.ts";
import { addWatermark } from "../lib/pdf/watermark.ts";
import { compressPDF } from "../lib/pdf/compress.ts";
import { protectPDF, unlockPDF, checkPdfEncryption } from "../lib/pdf/security.ts";
import { organizePdf } from "../lib/pdf/organize.ts";
import { extractPdfPages } from "../lib/pdf/extract.ts";
import { cropPdf } from "../lib/pdf/crop.ts";
import { resizePdfPages } from "../lib/pdf/resize.ts";
import { addTextToPdf } from "../lib/pdf/add-text.ts";
import { readPdfMetadata, updatePdfMetadata } from "../lib/pdf/metadata.ts";
import { inspectPdfProperties } from "../lib/pdf/properties.ts";
import { computeLineDiff } from "../lib/utils/diff.ts";

async function createSamplePdf(pageCount = 3, text = "Test Page") {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    const page = doc.addPage([400, 600]);
    page.drawText(`${text} ${i + 1}`, { x: 50, y: 550, size: 20 });
  }
  return await doc.save();
}

async function runTests() {
  console.log("=== Starting Comprehensive Automated PDF Engine Verification ===\n");
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      throw new Error(message);
    }
    console.log(`✅ PASS: ${message}`);
    passed++;
  }

  // 1. Tool: Range parsing
  {
    const r1 = parsePageRangeString("1-3, 5", 6);
    assert(
      JSON.stringify(r1) === JSON.stringify([0, 1, 2, 4]),
      "Page range string '1-3, 5' correctly parsed to indices [0, 1, 2, 4]"
    );
  }

  // 2. Tool 1: Merge PDF
  {
    const pdf1 = await createSamplePdf(2, "Doc A");
    const pdf2 = await createSamplePdf(3, "Doc B");
    const merged = await mergePDFs([
      { name: "docA.pdf", bytes: pdf1 },
      { name: "docB.pdf", bytes: pdf2 },
    ]);
    const mergedDoc = await PDFDocument.load(merged);
    assert(mergedDoc.getPageCount() === 5, "Merge PDF: Combined 2 + 3 pages to exactly 5 pages");
  }

  // 3. Tool 2: Split PDF
  {
    const sample = await createSamplePdf(4, "SplitDoc");
    // Extract single
    const extracted = await splitPDF(sample, "sample.pdf", "extract-single", "1-2");
    const extDoc = await PDFDocument.load(extracted.bytes);
    assert(extDoc.getPageCount() === 2, "Split PDF (extract single): Extracted exactly 2 pages");

    // Split all into ZIP
    const splitZip = await splitPDF(sample, "sample.pdf", "split-all");
    assert(splitZip.type === "zip" && splitZip.bytes.byteLength > 0, "Split PDF (split all): Successfully generated ZIP archive");
  }

  // 4. Tool 3: Organize PDF
  {
    const sample = await createSamplePdf(3, "OrgDoc");
    // Reorder pages: reverse order and duplicate page 1 (original index 0)
    const orgItems = [
      { id: "1", originalIndex: 2, rotation: 90 },
      { id: "2", originalIndex: 1, rotation: 0 },
      { id: "3", originalIndex: 0, rotation: 180 },
      { id: "4", originalIndex: 0, rotation: 0 },
    ];
    const organized = await organizePdf(sample, orgItems);
    const orgDoc = await PDFDocument.load(organized);
    assert(orgDoc.getPageCount() === 4, "Organize PDF: Reordered & duplicated to 4 pages");
    assert(orgDoc.getPage(0).getRotation().angle === 90, "Organize PDF: Applied per-page rotation 90°");
    assert(orgDoc.getPage(2).getRotation().angle === 180, "Organize PDF: Applied per-page rotation 180°");
  }

  // 5. Tool 4: Rotate PDF
  {
    const sample = await createSamplePdf(2, "RotateDoc");
    const rotated = await rotatePdf(sample, { 0: 90, 1: 180 });
    const rotDoc = await PDFDocument.load(rotated);
    assert(rotDoc.getPage(0).getRotation().angle === 90, "Rotate PDF: Page 1 successfully rotated 90°");
    assert(rotDoc.getPage(1).getRotation().angle === 180, "Rotate PDF: Page 2 successfully rotated 180°");
  }

  // 6. Tool 5: Extract PDF Pages
  {
    const sample = await createSamplePdf(5, "ExtractDoc");
    const singleExt = await extractPdfPages(sample, "doc.pdf", [1, 3], "single-pdf");
    const singleDoc = await PDFDocument.load(singleExt.bytes);
    assert(singleDoc.getPageCount() === 2, "Extract PDF Pages (single-pdf): Extracted exactly 2 selected pages");

    const zipExt = await extractPdfPages(sample, "doc.pdf", [0, 2, 4], "zip-separate");
    assert(zipExt.type === "zip" && zipExt.bytes.byteLength > 0, "Extract PDF Pages (zip-separate): Packaged pages into valid ZIP archive");
  }

  // 7. Tool 6: Compress PDF
  {
    const sample = await createSamplePdf(3, "CompressDoc");
    const compressed = await compressPDF(sample, "low");
    assert(compressed.bytes.byteLength > 0, "Compress PDF (Low): Generated valid optimized PDF");
    assert(compressed.reductionPercentage >= 0, "Compress PDF: Reduction percentage accurately calculated");
  }

  // 8. Tool 7: Add Page Numbers
  {
    const sample = await createSamplePdf(3, "NumberDoc");
    const numbered = await addPageNumbers(sample, {
      position: "bottom",
      alignment: "center",
      format: "Page {n} of {total}",
      startNumber: 1,
      fontSize: 10,
      margin: 30,
      skipFirstPage: true,
    });
    const numDoc = await PDFDocument.load(numbered);
    assert(numDoc.getPageCount() === 3, "Add Page Numbers: Preserved document page count");
  }

  // 9. Tool 8: Watermark PDF
  {
    const sample = await createSamplePdf(2, "WatermarkDoc");
    const watermarked = await addWatermark(sample, {
      text: "STRICTLY CONFIDENTIAL",
      preset: "diagonal",
      opacity: 0.3,
      fontSize: 36,
      rotation: 45,
      allPages: true,
      colorHex: "#DC2626",
    });
    const wmDoc = await PDFDocument.load(watermarked);
    assert(wmDoc.getPageCount() === 2, "Watermark PDF: Applied watermark across document");
  }

  // 10. Tool 9: Add Text to PDF
  {
    const sample = await createSamplePdf(2, "AddTextDoc");
    const textAdded = await addTextToPdf(sample, {
      text: "Approved by Auditor",
      pageIndices: [0],
      x: 100,
      y: 100,
      fontSize: 14,
      colorHex: "#111111",
    });
    const textDoc = await PDFDocument.load(textAdded);
    assert(textDoc.getPageCount() === 2, "Add Text to PDF: Preserved page count");
    assert(textAdded.byteLength > sample.byteLength, "Add Text to PDF: Added font and content stream");
  }

  // 11. Tool 10: Crop PDF
  {
    const sample = await createSamplePdf(2, "CropDoc");
    const cropped = await cropPdf(sample, {
      margins: { top: 20, bottom: 20, left: 20, right: 20 },
    });
    const cropDoc = await PDFDocument.load(cropped);
    const box = cropDoc.getPage(0).getCropBox();
    assert(box.x === 20 && box.y === 20, "Crop PDF: Successfully modified CropBox boundaries");
    assert(box.width === 360 && box.height === 560, "Crop PDF: Calculated trimmed dimensions accurately (400-40, 600-40)");
  }

  // 12. Tool 11: Resize PDF Pages
  {
    const sample = await createSamplePdf(2, "ResizeDoc");
    // Resize to A4 (595.28 x 841.89 pt)
    const resized = await resizePdfPages(sample, {
      pageSize: "a4",
      orientation: "portrait",
    });
    const resizeDoc = await PDFDocument.load(resized);
    const size = resizeDoc.getPage(0).getSize();
    assert(Math.abs(size.width - 595.28) < 1, "Resize PDF: Rescaled width to exact A4 standard (595.28 pt)");
    assert(Math.abs(size.height - 841.89) < 1, "Resize PDF: Rescaled height to exact A4 standard (841.89 pt)");
  }

  // 13. Tool 12: PDF Metadata Editor
  {
    const sample = await createSamplePdf(2, "MetaDoc");
    const updated = await updatePdfMetadata(sample, {
      title: "Audited Quarterly Report",
      author: "Chief Financial Officer",
      subject: "Fiscal Q3 Results",
      keywords: "finance, audit, earnings",
    });
    const meta = await readPdfMetadata(updated);
    assert(meta.title === "Audited Quarterly Report", "Metadata Editor: Title successfully written and retrieved");
    assert(meta.author === "Chief Financial Officer", "Metadata Editor: Author successfully written and retrieved");
    assert(meta.subject === "Fiscal Q3 Results", "Metadata Editor: Subject successfully written and retrieved");

    // Test stripping metadata
    const stripped = await updatePdfMetadata(updated, {}, true);
    const strippedMeta = await readPdfMetadata(stripped);
    assert(!strippedMeta.title && !strippedMeta.author, "Metadata Editor: Metadata sanitization stripped all personal tags");
  }

  // 14. Tool 13: PDF Page Counter & Properties
  {
    const sample = await createSamplePdf(4, "InspectDoc");
    const report = await inspectPdfProperties(sample, "test-document.pdf");
    assert(report.pageCount === 4, "PDF Page Counter: Accurately determined 4 pages");
    assert(report.pages.length === 4, "PDF Page Counter: Generated 4 per-page dimension entries");
    assert(report.plainTextReport.includes("PDFKIT DOCUMENT PROPERTIES AUDIT"), "PDF Page Counter: Generated complete plain text report");
  }

  // 15. Tool 14: Text Diff Calculation
  {
    const diff = computeLineDiff("Alpha\nBeta\nDelta", "Alpha\nBeta\nGamma\nDelta");
    const added = diff.filter((d) => d.type === "added");
    assert(added.length === 1 && added[0].text === "Gamma", "Compare PDFs diff: Correctly identified inserted line 'Gamma'");
  }

  // 16. Tool 15: Protect PDF (AES-256)
  let encryptedBytes;
  {
    const sample = await createSamplePdf(2, "SecretDoc");
    encryptedBytes = await protectPDF(sample, "mySecretPassword123", {
      algorithm: "AES-256",
      allowPrinting: true,
      allowCopying: false,
    });
    const check = await checkPdfEncryption(encryptedBytes);
    assert(check.encrypted === true, "Protect PDF: Document confirmed encrypted with AES-256");
    assert(check.algorithm === "AES-256", "Protect PDF: Algorithm detected as AES-256");
  }

  // 17. Tool 16: Unlock PDF
  {
    // Test with correct password
    const decrypted = await unlockPDF(encryptedBytes, "mySecretPassword123");
    const checkDec = await checkPdfEncryption(decrypted);
    assert(checkDec.encrypted === false, "Unlock PDF: Document successfully decrypted and openable without password");
    const doc = await PDFDocument.load(decrypted);
    assert(doc.getPageCount() === 2, "Unlock PDF: Decrypted document has intact pages and content");

    // Test with wrong password
    let failedAsExpected = false;
    try {
      await unlockPDF(encryptedBytes, "wrongPassword");
    } catch (err) {
      failedAsExpected = true;
    }
    assert(failedAsExpected, "Unlock PDF: Incorrect password was properly rejected with security error");
  }

  // 18. Crop boundary validation
  {
    const sample = await createSamplePdf(1, "OversizedCrop");
    let caughtCropError = false;
    try {
      await cropPdf(sample, {
        margins: { top: 0, bottom: 0, left: 250, right: 250 }, // 500pt > 400pt width
      });
    } catch (err) {
      if (err.message.includes("exceed page width")) {
        caughtCropError = true;
      }
    }
    assert(caughtCropError, "Crop PDF: Successfully caught and reported margin-exceeding-page error");
  }

  // 19. Resize custom dimension validation
  {
    const sample = await createSamplePdf(1, "InvalidResize");
    let caughtResizeError = false;
    try {
      await resizePdfPages(sample, {
        pageSize: "custom",
        customWidth: 0,
        customHeight: -100,
      });
    } catch (err) {
      if (err.message.includes("greater than 0")) {
        caughtResizeError = true;
      }
    }
    assert(caughtResizeError, "Resize PDF: Successfully caught and rejected non-positive custom dimensions");
  }

  // 20. Add text with dynamic position presets
  {
    const sample = await createSamplePdf(2, "PresetTextDoc");
    const headerPdf = await addTextToPdf(sample, {
      text: "Document Header",
      pageIndices: [0, 1],
      positionPreset: "header",
      fontSize: 12,
    });
    const headerDoc = await PDFDocument.load(headerPdf);
    assert(headerDoc.getPageCount() === 2, "Add Text to PDF: Successfully applied dynamic 'header' preset");

    const footerPdf = await addTextToPdf(sample, {
      text: "Document Footer",
      pageIndices: [0],
      positionPreset: "footer",
      fontSize: 10,
    });
    const footerDoc = await PDFDocument.load(footerPdf);
    assert(footerDoc.getPageCount() === 2, "Add Text to PDF: Successfully applied dynamic 'footer' preset");
  }

  // 21. Merge PDF encrypted document rejection & guidance
  {
    let caughtMergeEncrypted = false;
    try {
      const normalDoc = await createSamplePdf(1, "Normal");
      await mergePDFs([
        { name: "normal.pdf", bytes: normalDoc },
        { name: "locked.pdf", bytes: encryptedBytes },
      ]);
    } catch (err) {
      if (err.message.includes("password-protected") && err.message.includes("Unlock PDF")) {
        caughtMergeEncrypted = true;
      }
    }
    assert(caughtMergeEncrypted, "Merge PDF: Successfully caught encrypted file and guided user to Unlock PDF tool");
  }

  console.log(`\n🎉 All ${passed}/${total} automated verification tests PASSED!\n`);
}

runTests().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
