import { AlertTriangle, FileWarning, ShieldAlert } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Disclaimer — PDFKit",
  description: "Technical limitations, file structure variability, and output verification advisory for PDFKit tools.",
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
        <div className="border-b border-border pb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-foreground">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span>Document Processing Notice</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Disclaimer & Output Advisory
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please read this notice before relying on processed output documents for critical purposes.
          </p>
        </div>

        <div className="mt-8 max-w-3xl space-y-8 text-sm leading-relaxed text-foreground">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">
              1. Document Structure Variability
            </h2>
            <p className="text-muted-foreground">
              The Portable Document Format (PDF) is an exceptionally complex specification spanning dozens of versions from PDF 1.0 to ISO 32000-2 (PDF 2.0). Documents may contain proprietary font encodings, non-standard vector streams, embedded XFA forms, or vendor-specific structural objects.
            </p>
            <p className="text-muted-foreground">
              While PDFKit utilizes compliant, standards-based parsers (`pdf-lib` and Mozilla `PDF.js`), files that diverge from standard PDF specifications or contain corrupt cross-reference tables may experience rendering anomalies, missing characters, or compression variations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">
              2. Scanned Documents & Optical Character Recognition (OCR)
            </h2>
            <p className="text-muted-foreground">
              PDFs created by scanning physical paper with office copiers or mobile cameras typically store pages as bitmap images without a digital text layer.
            </p>
            <p className="text-muted-foreground">
              Tools that operate on digital text (such as <strong>PDF to Text</strong> and <strong>Compare PDFs</strong>) require selectable text characters. They cannot extract text from pure raster images without Optical Character Recognition (OCR). If an uploaded document lacks a digital text layer, text extraction will return empty.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">
              3. Independent Output Verification Required
            </h2>
            <p className="text-muted-foreground">
              <strong>Always review your output documents.</strong> You are strictly advised to inspect and confirm all pages, numbering sequences, layout alignments, and watermarks before submitting output files for:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
              <li>Legal filings, court submissions, and notarized contracts.</li>
              <li>Financial statements, tax filings, and banking records.</li>
              <li>Medical charts, prescription records, and healthcare documentation.</li>
              <li>High-volume commercial printing jobs.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">
              4. Local Processing & Hardware Dependencies
            </h2>
            <p className="text-muted-foreground">
              All tools execute directly within your browser’s JavaScript/WebAssembly memory allocation. Processing very large documents (exceeding hundreds of pages or several hundred megabytes) requires adequate available RAM on your local device. We are not liable for browser crashes resulting from insufficient device memory.
            </p>
          </section>

          <section className="border-t border-border pt-6">
            <p className="text-xs text-muted-foreground">
              Have questions regarding specific PDF formats or limitations? Visit our{" "}
              <Link href="/faq" className="text-primary hover:underline font-medium">
                FAQ
              </Link>{" "}
              or{" "}
              <Link href="/contact" className="text-primary hover:underline font-medium">
                contact our support team
              </Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
