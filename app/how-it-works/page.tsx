import { Cpu, HardDrive, Shield, CheckCircle2, Terminal } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "How It Works — Client-Side PDF Architecture — PDFKit",
  description: "Learn how PDFKit processes PDF files entirely inside your browser using WebAssembly, Web Workers, and Web Crypto API.",
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
        <div className="border-b border-border pb-8 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-foreground">
            <Cpu className="h-3.5 w-3.5 text-primary" />
            <span>Technical Deep Dive</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            How Client-Side PDF Processing Works
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Discover the engineering behind private, in-browser PDF utilities that never upload your documents to a server.
          </p>
        </div>

        <div className="mt-12 max-w-3xl mx-auto space-y-12 text-sm leading-relaxed text-foreground">
          {/* Step-by-step visual architecture */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">
              The 4-Step Client Execution Pipeline
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-2">
                <span className="inline-block rounded-full bg-foreground px-2.5 py-0.5 text-xs font-bold text-white">
                  Step 1
                </span>
                <h3 className="font-semibold text-foreground text-sm">HTML5 File Ingestion</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  When you drag or select a PDF, the browser reads file bytes locally using the standard <code>FileReader</code> API into a <code>Uint8Array</code> buffer stored in device RAM.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-2">
                <span className="inline-block rounded-full bg-foreground px-2.5 py-0.5 text-xs font-bold text-white">
                  Step 2
                </span>
                <h3 className="font-semibold text-foreground text-sm">WebAssembly & Canvas Parsing</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Document structure is parsed using Mozilla’s <code>PDF.js</code> compiled engine and <code>pdf-lib</code>. Pages are rendered locally onto HTML5 <code>Canvas</code> elements for visual thumbnail inspection.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-2">
                <span className="inline-block rounded-full bg-foreground px-2.5 py-0.5 text-xs font-bold text-white">
                  Step 3
                </span>
                <h3 className="font-semibold text-foreground text-sm">Local Manipulation & Crypto</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Whether merging, splitting, watermarking, compressing, or encrypting with AES-256 via <code>crypto.subtle</code>, computation executes entirely on your device’s CPU.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-2">
                <span className="inline-block rounded-full bg-foreground px-2.5 py-0.5 text-xs font-bold text-white">
                  Step 4
                </span>
                <h3 className="font-semibold text-foreground text-sm">Direct Blob Download & Cleanup</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The generated PDF is assembled into a client-side <code>Blob</code>. Clicking download triggers an immediate browser save, followed by immediate <code>URL.revokeObjectURL()</code> to prevent memory leaks.
                </p>
              </div>
            </div>
          </section>

          {/* Verification Guide */}
          <section className="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                How to Verify Zero Uploads Yourself
              </h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Don’t just take our word for it. You can inspect the network activity of your browser at any time:
            </p>

            <ol className="list-decimal pl-5 space-y-2 text-xs text-muted-foreground">
              <li>
                Open the developer console in Chrome, Edge, Safari, or Firefox by pressing <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground">F12</kbd> (or <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground">Cmd + Option + I</kbd> on macOS).
              </li>
              <li>
                Switch to the <strong>Network</strong> tab and click the filter button to show <strong>All</strong> or <strong>Fetch/XHR</strong>.
              </li>
              <li>
                Select or drop a confidential PDF file into any tool (e.g. <Link href="/merge-pdf" className="text-primary hover:underline">Merge</Link> or <Link href="/protect-pdf" className="text-primary hover:underline">Protect</Link>).
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
            <h2 className="text-lg font-bold text-foreground">
              Self-Hosted Workers & Offline Readiness
            </h2>
            <p className="text-muted-foreground">
              Many web tools that claim to be client-side secretly fetch scripts, fonts, or tracking beacons from third-party CDNs during operation. PDFKit self-hosts its WebAssembly workers (<code>/pdf.worker.min.mjs</code>) directly on our origin. Once cached by your browser, all 20 PDF utilities operate with 100% independence from the internet.
            </p>
          </section>

          <div className="border-t border-border pt-6 text-center">
            <Link
              href="/#tools"
              className="inline-flex items-center justify-center rounded-lg bg-foreground px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-foreground/90 transition"
            >
              Explore All 20 PDF Tools
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
