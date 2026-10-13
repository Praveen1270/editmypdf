import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Shield, ArrowRight, Zap, Heart } from "lucide-react";
import { PrivacyBadge } from "@/components/layout/PrivacyBadge";

import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "About PDFKit — Minimal, Privacy-First PDF Utilities",
  description:
    "Learn about PDFKit, an open, privacy-first PDF utility suite designed with minimal design and zero cloud dependencies.",
  canonical: "/about",
  keywords: ["about pdfkit", "privacy pdf tools", "offline pdf philosophy"],
});

export default function AboutPage() {
  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-foreground text-white">
            <FileText className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            About PDFKit
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            A fast, simple, trustworthy PDF utility suite that respects your privacy.
          </p>
          <div className="mt-4">
            <PrivacyBadge />
          </div>
        </div>

        <div className="mt-12 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <div>
            <h2 className="text-lg font-bold text-foreground">Our Philosophy</h2>
            <p className="mt-2">
              For years, common PDF tasks—merging contracts, splitting receipts, removing pages,
              or encrypting sensitive tax documents—required either expensive bloated desktop
              software or untrustworthy online converters that silently upload your private
              documents to remote servers.
            </p>
            <p className="mt-2">
              PDFKit was created to demonstrate a better alternative: using modern web standards to
              bring workstation-grade PDF manipulation entirely inside your browser. No cloud
              processing. No accounts. No subscriptions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4">
            <div className="rounded-xl border border-border bg-muted/20 p-5">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-semibold text-foreground">Instant & Local</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Zero network latency for uploads or downloads. Your CPU handles processing
                instantaneously.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-5">
              <Shield className="h-5 w-5 text-success" />
              <h3 className="mt-3 font-semibold text-foreground">Zero Compromise Privacy</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Your medical, legal, and financial PDFs remain securely on your computer.
              </p>
            </div>
          </div>

          <div className="pt-6">
            <h2 className="text-lg font-bold text-foreground">Minimalist Design</h2>
            <p className="mt-2">
              Inspired by Apple’s minimal aesthetic, PDFKit eliminates intrusive popups,
              complicated dashboards, noisy animations, and fabricated statistics. We focus purely
              on providing simple, functional utilities that get the job done reliably.
            </p>
          </div>

          <div className="mt-8 rounded-xl border border-border bg-white p-6 text-center">
            <p className="font-medium text-foreground">Ready to work with your PDFs?</p>
            <div className="mt-4">
              <Link
                href="/#tools"
                className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-foreground/90"
              >
                <span>Explore All 20 Tools</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
