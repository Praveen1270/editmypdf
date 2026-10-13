import { Cookie, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Cookie Policy — PDFKit",
  description: "Accurate disclosure of cookies, local storage, and volatile memory practices at PDFKit.",
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
        <div className="border-b border-border pb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-foreground">
            <Cookie className="h-3.5 w-3.5 text-primary" />
            <span>Browser Storage Disclosure</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Cookie & Storage Policy
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last Updated & Effective Date: October 13, 2026
          </p>
        </div>

        <div className="mt-8 max-w-3xl space-y-8 text-sm leading-relaxed text-foreground">
          {/* Summary Box */}
          <div className="rounded-xl border border-success/30 bg-success/5 p-5 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Zero Tracking Cookies:</strong> PDFKit does not set any advertising, tracking, marketing, or profiling cookies on your computer. You can use all 20 PDF utilities without giving cookie consent or managing cookie preference banners because no tracking mechanisms exist.
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">
              1. What Are Cookies?
            </h2>
            <p className="text-muted-foreground">
              Cookies are small text files placed on your device by websites to store state, remember user logins, or track user activity across different domains.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">
              2. Does PDFKit Use Cookies?
            </h2>
            <p className="text-muted-foreground">
              <strong>No.</strong> PDFKit does not use HTTP cookies for session tracking, user identification, advertising, or cross-site profiling. We do not require an account or login to access any tool.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">
              3. Browser Storage Technologies We Use
            </h2>
            <p className="text-muted-foreground">
              To operate effectively and support offline functionality, PDFKit utilizes standard modern browser client-side storage technologies as follows:
            </p>

            <div className="space-y-3 pt-2">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <h3 className="font-semibold text-foreground text-xs">
                  • Volatile RAM (Heap Memory & Uint8Array Buffers)
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  <strong>Purpose:</strong> Used during active PDF processing. When you drop a file, it is loaded into your browser’s temporary RAM. As soon as you navigate away or click reset, this memory is automatically released by the browser garbage collector.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <h3 className="font-semibold text-foreground text-xs">
                  • Service Worker & Cache Storage (Static Assets Only)
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  <strong>Purpose:</strong> Used exclusively to cache static web scripts (such as <code>pdf.worker.min.mjs</code> and JavaScript bundles). This enables offline readiness so that tools continue functioning without an active internet connection. Documents are <strong>never</strong> cached in the Service Worker.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">
              4. User Controls & Clearing Storage
            </h2>
            <p className="text-muted-foreground">
              You maintain total control over your browser storage. You can clear your browser cache, service workers, and site data at any time through your browser settings:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
              <li><strong>Chrome / Edge:</strong> Settings → Privacy and security → Clear browsing data.</li>
              <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data → Clear Data.</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data.</li>
            </ul>
          </section>

          <section className="border-t border-border pt-6">
            <p className="text-xs text-muted-foreground">
              For complete details on our data protection commitments, read our{" "}
              <Link href="/privacy-policy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
