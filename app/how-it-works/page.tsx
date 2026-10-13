import { Cpu, Terminal } from "lucide-react";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "How It Works — Client-Side PDF Architecture — PDFKit",
  description:
    "Learn how PDFKit processes PDF files entirely inside your browser using WebAssembly, Web Workers, and native Web Crypto API with zero server uploads.",
  canonical: "/how-it-works",
  keywords: ["how client side pdf works", "webassembly pdf", "private pdf architecture"],
});

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
        <div className="border-b border-border pb-8 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-3 py-1 text-xs font-semibold text-text-primary">
            <Cpu className="h-3.5 w-3.5 text-text-primary" />
            <span>Technical Deep Dive</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
            How Client-Side PDF Processing Works
          </h1>
          <p className="mt-3 text-sm text-text-secondary leading-relaxed">
            Discover the engineering behind private, in-browser PDF utilities that never upload your documents to a server.
          </p>
        </div>

        <div className="mt-12 max-w-3xl mx-auto space-y-12 text-sm leading-relaxed text-text-primary">
          {/* Step-by-step visual architecture */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-text-primary">
              The 4-Step Client Execution Pipeline
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface-raised p-5 space-y-2">
                <span className="inline-block rounded-full bg-action-primary px-2.5 py-0.5 text-xs font-bold text-action-primary-text">
                  Step 1
                </span>
                <h3 className="font-semibold text-text-primary text-sm">HTML5 File Ingestion</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  When you drag or select a PDF, the browser reads file bytes locally using the standard <code>FileReader</code> API into a <code>Uint8Array</code> buffer stored in device RAM.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface-raised p-5 space-y-2">
                <span className="inline-block rounded-full bg-action-primary px-2.5 py-0.5 text-xs font-bold text-action-primary-text">
                  Step 2
                </span>
                <h3 className="font-semibold text-text-primary text-sm">WebAssembly & Canvas Parsing</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Document structure is parsed using Mozilla’s <code>PDF.js</code> compiled engine and <code>pdf-lib</code>. Pages are rendered locally onto HTML5 <code>Canvas</code> elements for visual thumbnail inspection.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface-raised p-5 space-y-2">
                <span className="inline-block rounded-full bg-action-primary px-2.5 py-0.5 text-xs font-bold text-action-primary-text">
                  Step 3
                </span>
                <h3 className="font-semibold text-text-primary text-sm">Local Manipulation & Crypto</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Whether merging, splitting, watermarking, compressing, or encrypting with AES-256 via <code>crypto.subtle</code>, computation executes entirely on your device’s CPU.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface-raised p-5 space-y-2">
                <span className="inline-block rounded-full bg-action-primary px-2.5 py-0.5 text-xs font-bold text-action-primary-text">
                  Step 4
                </span>
                <h3 className="font-semibold text-text-primary text-sm">Direct Blob Download & Cleanup</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  The generated PDF is assembled into a client-side <code>Blob</code>. Clicking download triggers an immediate browser save, followed by immediate <code>URL.revokeObjectURL()</code> to prevent memory leaks.
                </p>
              </div>
            </div>
          </section>

          {/* Verification Guide */}
          <section className="rounded-2xl border border-border bg-surface-base p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-text-primary" />
              <h2 className="text-base font-bold text-text-primary">
                How to Verify Zero Uploads Yourself
              </h2>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Don’t just take our word for it. You can inspect the network activity of your browser at any time:
            </p>

            <ol className="list-decimal pl-5 space-y-2 text-xs text-text-secondary">
              <li>
                Open the developer console in Chrome, Edge, Safari, or Firefox by pressing <kbd className="rounded border border-border bg-surface-raised px-1 py-0.5 font-mono text-[11px] text-text-primary">F12</kbd> (or <kbd className="rounded border border-border bg-surface-raised px-1 py-0.5 font-mono text-[11px] text-text-primary">Cmd + Option + I</kbd> on macOS).
              </li>
              <li>
                Switch to the <strong>Network</strong> tab and click the filter button to show <strong>All</strong> or <strong>Fetch/XHR</strong>.
              </li>
              <li>
                Select or drop a confidential PDF file into any tool (e.g. <Link href="/merge-pdf" className="text-text-primary hover:underline font-semibold">Merge</Link> or <Link href="/protect-pdf" className="text-text-primary hover:underline font-semibold">Protect</Link>).
              </li>
              <li>
                Execute the tool. Notice that <strong>no POST requests</strong>, multipart form payloads, or document transmissions occur. Only local memory processing takes place.
              </li>
              <li>
                Turn off your Wi-Fi or unplug your internet cable. The tool will continue to function flawlessly.
              </li>
            </ol>
          </section>

          {/* Offline readiness */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">
              Self-Hosted Workers & Offline Readiness
            </h2>
            <p className="text-text-secondary">
              Many web tools that claim to be client-side secretly fetch scripts, fonts, or tracking beacons from third-party CDNs during operation. PDFKit self-hosts its WebAssembly workers (<code>/pdf.worker.min.mjs</code>) directly on our origin. Once cached by your browser, all 20 PDF utilities operate with 100% independence from the internet.
            </p>
          </section>

          <div className="border-t border-border pt-6 text-center">
            <Link
              href="/#tools"
              className="inline-flex items-center justify-center rounded-lg bg-action-primary px-6 py-2.5 text-xs font-semibold text-action-primary-text shadow-sm hover:opacity-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              Explore All 20 PDF Tools
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
