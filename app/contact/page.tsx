import Link from "next/link";
import { HelpCircle, Shield, FileQuestion, Bug, Sparkles, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Help & Support — EditMyPDF",
  description:
    "Self-service assistance, troubleshooting guidance, bug reporting channels, and architecture questions for EditMyPDF.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors pb-16">
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-border pb-8 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-foreground">
            <HelpCircle className="h-3.5 w-3.5 text-foreground" />
            <span>Help & Troubleshooting</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Support & Resources
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            EditMyPDF is designed for 100% local, client-side document processing. Because files never leave your computer, here is how to get help, report issues, and resolve common workflow questions.
          </p>
        </div>

        <div className="mt-10 max-w-3xl mx-auto space-y-8">
          {/* Privacy Note Banner */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-paper flex items-start gap-3.5">
            <Shield className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground block mb-0.5">Privacy First Workspace</span>
              EditMyPDF processes all documents directly in your browser&apos;s volatile RAM. We do not operate document servers, cloud databases, or remote file queues.
            </div>
          </div>

          {/* Direct contact */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-paper flex items-start gap-3.5">
            <Shield className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground block mb-0.5">Direct contact</span>
              For privacy, security, or partnership questions, email{" "}
              <a href="mailto:founder@editmypdf.co.in" className="font-semibold text-foreground hover:underline">
                founder@editmypdf.co.in
              </a>
              . We respond to every message.
            </div>
          </div>

          {/* Issue Reporting & Feedback Channels */}
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-paper space-y-6">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Issue Reporting & Feature Requests
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                EditMyPDF is an open-source client-side utility platform. All technical issues, browser compatibility errors, and tool suggestions are tracked publicly.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="https://github.com/Praveen1270/editmypdf/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between rounded-xl border border-border bg-surface-subtle/50 p-4 transition hover:border-foreground/40 hover:bg-surface"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-foreground">
                      <Bug className="h-4 w-4" />
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-foreground">
                    Report a Bug
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Found an issue with a PDF tool, formatting discrepancy, or layout glitch? Open a ticket on GitHub.
                  </p>
                </div>
                <span className="mt-4 text-xs font-semibold text-foreground flex items-center gap-1 group-hover:underline">
                  Submit Issue <span aria-hidden="true">&rarr;</span>
                </span>
              </a>

              <a
                href="https://github.com/Praveen1270/editmypdf/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between rounded-xl border border-border bg-surface-subtle/50 p-4 transition hover:border-foreground/40 hover:bg-surface"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-foreground">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-foreground">
                    Request a Feature
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Have an idea for a new PDF utility, workflow improvement, or format conversion? Let us know.
                  </p>
                </div>
                <span className="mt-4 text-xs font-semibold text-foreground flex items-center gap-1 group-hover:underline">
                  Propose Idea <span aria-hidden="true">&rarr;</span>
                </span>
              </a>
            </div>
          </div>

          {/* Common Self-Service Troubleshooting */}
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-paper space-y-5">
            <h2 className="text-base font-bold text-foreground">
              Frequently Asked Troubleshooting
            </h2>

            <div className="divide-y divide-border text-xs">
              <div className="py-3.5">
                <p className="font-semibold text-foreground mb-1">
                  Why does my PDF fail to process or display a password prompt?
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  If a document is encrypted with owner or user passwords, cryptographic protections prevent edits. Use our <Link href="/unlock-pdf" className="text-foreground font-semibold hover:underline">Unlock PDF</Link> tool with your password to decrypt the file before performing other operations.
                </p>
              </div>

              <div className="py-3.5">
                <p className="font-semibold text-foreground mb-1">
                  How large of a PDF can I process in browser memory?
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Because files process entirely inside browser RAM, we recommend documents under 150MB. For larger documents, closing background browser tabs will free up WebAssembly memory.
                </p>
              </div>

              <div className="py-3.5">
                <p className="font-semibold text-foreground mb-1">
                  Why can&apos;t I select text in my document?
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Some PDFs are created from scans or flattened raster images without underlying vector text streams. Scanned pages contain pixels rather than selectable font characters.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-2.5">
              <Link
                href="/faq"
                className="rounded-lg border border-border bg-surface-subtle px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface transition"
              >
                Browse Full FAQ &rarr;
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-lg border border-border bg-surface-subtle px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface transition"
              >
                How It Works &rarr;
              </Link>
              <Link
                href="/security"
                className="rounded-lg border border-border bg-surface-subtle px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface transition"
              >
                Security Architecture &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
