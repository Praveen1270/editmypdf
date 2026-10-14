import { ShieldCheck, Lock, HardDrive, Cpu, AlertCircle } from "lucide-react";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Privacy Policy — EditMyPDF",
  description: "Comprehensive privacy policy detailing client-side document processing, zero file transmission, and strict data protection practices.",
  canonical: "/privacy-policy",
  keywords: ["editmypdf privacy policy", "no upload privacy", "client side pdf privacy"],
});

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
        {/* Header */}
        <div className="border-b border-border pb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-3 py-1 text-xs font-semibold text-text-primary">
            <ShieldCheck className="h-3.5 w-3.5 text-text-primary" />
            <span>Strict Privacy Guarantee</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Last Updated & Effective Date: October 13, 2026
          </p>
        </div>

        {/* Content Body */}
        <div className="mt-8 max-w-3xl space-y-10 text-sm leading-relaxed text-text-primary">
          {/* Executive Summary */}
          <section className="rounded-xl border border-border bg-surface-raised p-6">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Lock className="h-5 w-5 text-text-primary" />
              <span>Core Principle: Your Documents Never Leave Your Device</span>
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              EditMyPDF was engineered from the very first line of code with a strict non-negotiable architectural constraint: <strong>zero remote file transmission</strong>. All PDF parsing, manipulation, text extraction, image generation, and cryptographic operations are executed locally inside your web browser’s memory using WebAssembly, Web Workers, and the native Web Crypto API.
            </p>
          </section>

          {/* Section 1: Information Collection */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">
              1. Information We Do Not Collect
            </h2>
            <p className="text-text-secondary">
              Because all document processing occurs in your browser’s local client runtime, EditMyPDF does <strong>NOT</strong> collect, view, store, transmit, or retain:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-text-secondary">
              <li>Your uploaded PDF files or images.</li>
              <li>Document text, titles, forms, or embedded metadata.</li>
              <li>Passwords entered into document protection or decryption tools.</li>
              <li>Rendered page images, extracted text, or output files.</li>
            </ul>
            <p className="text-xs text-text-secondary">
              Once you close or refresh your browser tab, all temporary memory objects (buffers, canvases, and Web Workers) are completely discarded by your operating system.
            </p>
          </section>

          {/* Section 2: Technical Logs */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">
              2. Technical Server Logs & Hosting
            </h2>
            <p className="text-text-secondary">
              When you load the static web assets of this website (HTML, CSS, JavaScript, WebAssembly workers), your HTTP request is received by our web hosting infrastructure. Like virtually all web servers on the internet, standard connection logs may record:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-text-secondary">
              <li>Your browser’s IP address.</li>
              <li>Requested static URL path (e.g. <code>/merge-pdf</code>).</li>
              <li>Browser User-Agent header and referral URL.</li>
              <li>HTTP status code and byte transfer size of the application bundle.</li>
            </ul>
            <p className="text-xs text-text-secondary">
              These technical logs contain only static asset delivery metrics. They never contain file names, file contents, or personal document data.
            </p>
          </section>

          {/* Section 3: Cookies & Local Storage */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">
              3. Cookies and Browser Storage
            </h2>
            <p className="text-text-secondary">
              EditMyPDF does <strong>not</strong> use tracking cookies, marketing cookies, or persistent profiling storage. We do not track you across sessions or other websites.
            </p>
            <p className="text-text-secondary">
              We may utilize standard browser caching (Cache API and Service Workers) exclusively to cache static application scripts so that tools continue to function offline without redownloading code. We never store document contents or passwords in <code>localStorage</code> or <code>IndexedDB</code>.
            </p>
          </section>

          {/* Section 4: Third-Party Services */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">
              4. Third-Party Services & Analytics
            </h2>
            <p className="text-text-secondary">
              We do not employ third-party behavioral analytics scripts (such as session replay trackers or cross-site tracking pixels) on tool processing interfaces. EditMyPDF does not sell, rent, or monetize your personal information or document activity.
            </p>
          </section>

          {/* Section 5: GDPR & Data Rights */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">
              5. Data Protection Rights (GDPR & CCPA/CPRA)
            </h2>
            <p className="text-text-secondary">
              Under international privacy frameworks including the General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA):
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-text-secondary">
              <li><strong>Right of Access & Deletion:</strong> Because we never store or receive your documents, there is no remote file data held by us to access, export, or delete.</li>
              <li><strong>Right to Object:</strong> You can use all 21 PDF utilities completely anonymously without providing any registration, personal details, or credit card.</li>
            </ul>
          </section>

          {/* Section 6: Security Safeguards */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">
              6. How to Verify Local Processing
            </h2>
            <p className="text-text-secondary">
              We encourage users to verify our claims directly:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs text-text-secondary">
              <li>Open your browser Developer Tools (press F12 or Cmd+Option+I).</li>
              <li>Select the <strong>Network</strong> tab.</li>
              <li>Upload a PDF file and run any tool (e.g. Merge, Compress, Protect).</li>
              <li>Observe that <strong>zero POST/PUT/multipart upload requests</strong> are transmitted across the network during processing.</li>
            </ol>
          </section>

          {/* Section 7: Contact */}
          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="text-lg font-bold text-text-primary">
              7. Contact & Privacy Inquiries
            </h2>
            <p className="text-text-secondary">
              If you have questions or concerns regarding our privacy architecture or policy, please visit our{" "}
              <Link href="/contact" className="text-text-primary hover:underline font-semibold">
                Contact Page
              </Link>{" "}
              or review our in-depth architecture disclosures on our{" "}
              <Link href="/security" className="text-text-primary hover:underline font-semibold">
                Security Architecture Page
              </Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
