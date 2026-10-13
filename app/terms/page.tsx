import Link from "next/link";
import { FileCheck, Shield, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Terms of Service — PDFKit",
  description: "Terms and conditions governing the use of PDFKit client-side PDF utilities.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
        {/* Header */}
        <div className="border-b border-border pb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-foreground">
            <FileCheck className="h-3.5 w-3.5 text-primary" />
            <span>Usage Agreement</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last Updated & Effective Date: October 13, 2026
          </p>
        </div>

        {/* Content Body */}
        <div className="mt-8 max-w-3xl space-y-10 text-sm leading-relaxed text-foreground">
          {/* Section 1: Agreement to Terms */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground">
              By accessing and using PDFKit, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not access or use this website.
            </p>
          </section>

          {/* Section 2: Service Description */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">
              2. Nature of Service & Local Execution
            </h2>
            <p className="text-muted-foreground">
              PDFKit provides web-based PDF utility tools that run entirely client-side inside your browser environment. We do not host, store, or transmit your documents to external servers. Because processing is executed by your local device hardware and browser runtime, performance is governed by your computer’s processor, available RAM, and browser software.
            </p>
          </section>

          {/* Section 3: User Responsibilities */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">
              3. User Responsibilities & Acceptable Use
            </h2>
            <p className="text-muted-foreground">
              You retain all ownership and intellectual property rights to the documents and images you process through PDFKit. You represent and warrant that:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
              <li>You have the legal right, authorization, or license to modify, encrypt, decrypt, or convert the documents you process.</li>
              <li>You will not use the tools to violate copyrights, trademarks, confidentiality obligations, or privacy rights of any third party.</li>
              <li>You will not attempt to reverse engineer, disrupt, or exploit the static web delivery infrastructure of the service.</li>
            </ul>
          </section>

          {/* Section 4: Document Verification */}
          <section className="space-y-3 rounded-xl border border-border bg-muted/20 p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h2 className="text-base font-bold text-foreground">
                4. Output Verification Advisory
              </h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              PDF documents vary widely in structural standards, font encodings, embedded vectors, and security filters. While PDFKit implements industry standards (ISO 32000), you must independently verify the output of all converted, merged, compressed, or split files before relying on them for critical legal, financial, architectural, or healthcare purposes.
            </p>
          </section>

          {/* Section 5: Intellectual Property */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">
              5. Intellectual Property of PDFKit
            </h2>
            <p className="text-muted-foreground">
              The website design, branding, documentation, graphics, and custom front-end architecture of PDFKit are protected by copyright and intellectual property laws. Open-source libraries incorporated into the client software (such as PDF.js and pdf-lib) remain subject to their respective Apache 2.0 and MIT open-source licenses.
            </p>
          </section>

          {/* Section 6: Disclaimer of Warranties */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">
              6. Disclaimer of Warranties
            </h2>
            <p className="text-muted-foreground">
              PDFKit is provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not guarantee that the tools will be uninterrupted, error-free, or compatible with non-standard or corrupt PDF documents.
            </p>
          </section>

          {/* Section 7: Limitation of Liability */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">
              7. Limitation of Liability
            </h2>
            <p className="text-muted-foreground">
              To the fullest extent permitted by applicable law, PDFKit and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, loss of business, or computer failure, arising from your use of or inability to use the tools.
            </p>
          </section>

          {/* Section 8: Changes to Terms */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">
              8. Modifications to Terms
            </h2>
            <p className="text-muted-foreground">
              We reserve the right to revise these Terms of Service at any time. When updates are published, the "Last Updated" date at the top of this document will be amended accordingly.
            </p>
          </section>

          {/* Section 9: Contact */}
          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="text-lg font-bold text-foreground">
              9. Contact Information
            </h2>
            <p className="text-muted-foreground">
              For questions concerning these Terms of Service, please visit our{" "}
              <Link href="/contact" className="text-primary hover:underline font-medium">
                Contact Page
              </Link>{" "}
              or email <code>legal@pdfkit.local</code>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
