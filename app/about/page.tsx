import { PDF_TOOLS } from "@/lib/tools-data";
import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Shield, ArrowRight, Zap } from "lucide-react";
import { PrivacyBadge } from "@/components/layout/PrivacyBadge";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "About EditMyPDF — Minimal, Privacy-First PDF Utilities",
  description:
    "Learn about EditMyPDF, an open, privacy-first PDF utility suite designed with minimal design and zero cloud dependencies.",
  canonical: "/about",
  keywords: ["about editmypdf", "privacy pdf tools", "offline pdf philosophy"],
});

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-foreground text-background shadow-sm">
            <FileText className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
            About EditMyPDF
          </h1>
          <p className="mt-3 text-base text-text-secondary">
            A fast, simple, trustworthy PDF utility suite that respects your privacy.
          </p>
          <div className="mt-4">
            <PrivacyBadge />
          </div>
        </div>

        <div className="mt-12 space-y-8 text-sm leading-relaxed text-text-secondary">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Our Philosophy</h2>
            <p className="mt-2 text-text-secondary">
              For years, common PDF tasks—merging contracts, splitting receipts, removing pages,
              or encrypting sensitive tax documents—required either expensive bloated desktop
              software or untrustworthy online converters that silently upload your private
              documents to remote servers.
            </p>
            <p className="mt-2 text-text-secondary">
              EditMyPDF was created to demonstrate a better alternative: using modern web standards to
              bring workstation-grade PDF manipulation entirely inside your browser. No cloud
              processing. No accounts. No subscriptions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4">
            <div className="rounded-xl border border-border bg-surface-raised p-5">
              <Zap className="h-5 w-5 text-text-primary" />
              <h3 className="mt-3 font-semibold text-text-primary">Instant & Local</h3>
              <p className="mt-1 text-xs text-text-secondary">
                Zero network latency for uploads or downloads. Your CPU handles processing
                instantaneously.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface-raised p-5">
              <Shield className="h-5 w-5 text-text-primary" />
              <h3 className="mt-3 font-semibold text-text-primary">Zero Compromise Privacy</h3>
              <p className="mt-1 text-xs text-text-secondary">
                Your medical, legal, and financial PDFs remain securely on your computer.
              </p>
            </div>
          </div>

          <div className="pt-6">
            <h2 className="text-lg font-bold text-text-primary">Minimalist Design</h2>
            <p className="mt-2 text-text-secondary">
              EditMyPDF eliminates intrusive popups, complicated dashboards, noisy animations, and fabricated statistics. We focus purely on providing simple, functional utilities that get the job done reliably.
            </p>
          </div>

          <div className="mt-8 rounded-xl border border-border bg-surface-base p-6 text-center shadow-sm">
            <p className="font-semibold text-text-primary">Ready to work with your PDFs?</p>
            <div className="mt-4">
              <Link
                href="/#tools"
                className="inline-flex items-center gap-1.5 rounded-lg bg-action-primary px-5 py-2.5 text-xs font-semibold text-action-primary-text transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <span>Explore All {PDF_TOOLS.length} Tools</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
