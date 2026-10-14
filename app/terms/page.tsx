import Link from "next/link";
import { FileCheck, Shield, AlertTriangle } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Terms of Service — EditMyPDF",
  description: "Terms and conditions governing the use of EditMyPDF client-side PDF utilities and local document processing.",
  canonical: "/terms",
  keywords: ["editmypdf terms", "terms of service", "client side license"],
});

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
        {/* Header */}
        <div className="border-b border-border pb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-3 py-1 text-xs font-semibold text-text-primary">
            <FileCheck className="h-3.5 w-3.5 text-text-primary" />
            <span>Usage Agreement</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Last Updated & Effective Date: October 13, 2026
          </p>
        </div>

        {/* Content Body */}
        <div className="mt-8 max-w-3xl space-y-10 text-sm leading-relaxed text-text-primary">
          {/* Section 1: Agreement to Terms */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">
              1. Acceptance of Terms
            </h2>
            <p className="text-text-secondary">
              By accessing and using EditMyPDF, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not access or use this website.
            </p>
          </section>

          {/* Section 2: Service Description */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">
              2. Nature of Service & Local Execution
            </h2>
            <p className="text-text-secondary">
              EditMyPDF provides web-based PDF utility tools that run entirely client-side inside your browser environment. We do not host, store, or transmit your documents to external servers. Because processing is executed by your local device hardware and browser runtime, performance is governed by your computer’s processor, available RAM, and browser software.
            </p>
          </section>

          {/* Section 3: User Responsibilities */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">
              3. User Responsibilities & Acceptable Use
            </h2>
            <p className="text-text-secondary">
              You retain all ownership and intellectual property rights to the documents and images you process through EditMyPDF. You represent and warrant that:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-text-secondary">
              <li>You have the legal right, authorization, or license to modify, encrypt, decrypt, or convert the documents you process.</li>
              <li>You will not use the tools to violate copyrights, trademarks, confidentiality obligations, or privacy rights of any third party.</li>
              <li>You will not attempt to reverse engineer, disrupt, or exploit the static web delivery infrastructure of the service.</li>
            </ul>
          </section>

          {/* Section 4: Document Verification */}
          <section className="space-y-3 rounded-xl border border-border bg-surface-raised p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-text-primary" />
              <h2 className="text-base font-bold text-text-primary">
                4. Output Verification Advisory
              </h2>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              PDF documents vary widely in structural standards, font encodings, embedded vectors, and security filters. While EditMyPDF implements industry standards (ISO 32000), you must independently verify the output of all converted, merged, compressed, or split files before relying on them for critical legal, financial, architectural, or healthcare purposes.
            </p>
          </section>

          {/* Section 5: Intellectual Property */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">
              5. Intellectual Property of EditMyPDF
            </h2>
            <p className="text-text-secondary">
              The website design, branding, documentation, graphics, and custom front-end architecture of EditMyPDF are protected by copyright and intellectual property laws. Open-source libraries incorporated into the client software (such as PDF.js and pdf-lib) remain subject to their respective Apache 2.0 and MIT open-source licenses.
            </p>
          </section>

          {/* Section 6: Disclaimer of Warranties */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">
              6. Disclaimer of Warranties
            </h2>
            <p className="text-text-secondary">
              EditMyPDF is provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not guarantee that the tools will be uninterrupted, error-free, or compatible with non-standard or corrupt PDF documents.
            </p>
          </section>

          {/* Section 7: Limitation of Liability */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">
              7. Limitation of Liability
            </h2>
            <p className="text-text-secondary">
              To the fullest extent permitted by applicable law, EditMyPDF and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, loss of business, or computer failure, arising from your use of or inability to use the tools.
            </p>
          </section>

          {/* Section 8: Changes to Terms */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">
              8. Modifications to Terms
            </h2>
            <p className="text-text-secondary">
              We reserve the right to revise these Terms of Service at any time. When updates are published, the "Last Updated" date at the top of this document will be amended accordingly.
            </p>
          </section>

          {/* Section 9: Contact */}
          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="text-lg font-bold text-text-primary">
              9. Contact Information
            </h2>
            <p className="text-text-secondary">
              For questions concerning these Terms of Service, please visit our{" "}
              <Link href="/contact" className="text-text-primary hover:underline font-semibold">
                Contact Page
              </Link>{" "}
              or email <code>legal@editmypdf.co.in</code>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
