import type { Metadata } from "next";
import { Lock, EyeOff, ServerOff, Cpu, RefreshCw } from "lucide-react";
import { PrivacyBadge } from "@/components/layout/PrivacyBadge";

export const metadata: Metadata = {
  title: "Privacy Policy & Architecture — EditMyPDF",
  description:
    "Learn how EditMyPDF operates 100% locally in your browser. No file uploads, no tracking, and total document confidentiality.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
            Privacy Policy & Local Architecture
          </h1>
          <p className="mt-3 text-base text-text-secondary">
            Transparency is fundamental. Here is exactly how EditMyPDF processes documents.
          </p>
          <div className="mt-4">
            <PrivacyBadge />
          </div>
        </div>

        <div className="mt-12 space-y-8 text-sm leading-relaxed text-text-secondary">
          <section className="rounded-xl border border-border bg-surface-raised p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background shadow-sm">
                <ServerOff className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-text-primary">
                1. Zero Server Uploads
              </h2>
            </div>
            <p className="mt-3 text-text-secondary">
              Unlike conventional online PDF converters that send your files to remote cloud
              servers or worker clusters, EditMyPDF executes all PDF manipulation directly inside
              your browser instance. When you select a document, it is read into your browser's
              local memory (`Uint8Array`) using standard HTML5 File APIs. No byte of document data,
              text, or image is ever uploaded to a remote server.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-surface-raised p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background shadow-sm">
                <Cpu className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-text-primary">
                2. Client-Side Processing Stack
              </h2>
            </div>
            <p className="mt-3 text-text-secondary">
              We leverage browser-standard WebAssembly, HTML5 OffscreenCanvas, Web Crypto API,
              `pdf-lib`, and Mozilla's `PDF.js`. Rendering, parsing, compression, page numbering,
              watermarking, and encryption occur on your CPU and GPU.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-surface-raised p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background shadow-sm">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-text-primary">
                3. Encryption & Password Confidentiality
              </h2>
            </div>
            <p className="mt-3 text-text-secondary">
              EditMyPDF implements ISO 32000-2 standard **AES-256 bit encryption** using the native Web
              Crypto API (`crypto.subtle`). Passwords you enter to protect or unlock documents are
              used locally to derive decryption keys in memory. Passwords are never sent across any
              network, logged, or recorded.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-surface-raised p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background shadow-sm">
                <RefreshCw className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-text-primary">
                4. Memory Lifecycle & File Cleanup
              </h2>
            </div>
            <p className="mt-3 text-text-secondary">
              We do not persist your files in `localStorage`, `IndexedDB`, or browser cookies. All
              documents reside exclusively in volatile memory for the duration of your session.
              Temporary object URLs (`blob:`) are revoked promptly after download, and clicking
              "Clear Files" or "Start Again" immediately releases memory references.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-surface-raised p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background shadow-sm">
                <EyeOff className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-text-primary">
                5. Complete Offline Capability
              </h2>
            </div>
            <p className="mt-3 text-text-secondary">
              After initial page loading, all EditMyPDF tools are capable of working entirely offline.
              You can turn off Wi-Fi or enable Airplane Mode and continue merging, splitting,
              compressing, converting, and watermarking files without interruption.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
