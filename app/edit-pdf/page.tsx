import Link from "next/link";
import { ShieldCheck, Type, Eraser, PenLine, Highlighter, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import { PDF_TOOLS } from "@/lib/tools-data";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { EditPdfLazy } from "@/components/edit-pdf/EditPdfLazy";

const toolMeta = PDF_TOOLS.find((t) => t.id === "edit-pdf");

export default function EditPdfPage() {
  return (
    <div className="min-h-screen bg-background pb-20 text-foreground">
      {/* SEO header */}
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-content px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span aria-hidden="true">/</span>
            <span>Edit PDF</span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Edit PDF Online — Full Visual Editor
          </h1>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Click any text to edit it in place with matched fonts, or whiteout, sign, highlight,
            add images, links and form fields. Free, no signup —{" "}
            <span className="font-medium text-foreground">your file stays on your device</span>.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-subtle px-2.5 py-1 font-medium text-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>100% In-Browser RAM</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-subtle px-2.5 py-1 text-muted-foreground">
              <Type className="h-3.5 w-3.5" />
              <span>In-place text editing</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-subtle px-2.5 py-1 text-muted-foreground">
              <PenLine className="h-3.5 w-3.5" />
              <span>Sign & annotate</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-subtle px-2.5 py-1 text-muted-foreground">
              <Highlighter className="h-3.5 w-3.5" />
              <span>Whiteout & highlights</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-subtle px-2.5 py-1 text-muted-foreground">
              <Eraser className="h-3.5 w-3.5" />
              <span>PDF only · ~50 MB max</span>
            </span>
          </div>
        </div>
      </div>

      {/* Editor (client-only, lazy) */}
      <EditPdfLazy />

      {/* Help content */}
      {toolMeta && (
        <div className="mx-auto max-w-content space-y-10 px-4 pt-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-lg font-bold text-foreground">How to edit a PDF</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {toolMeta.steps.map((step, idx) => (
                <div key={idx} className="rounded-xl border border-border bg-surface p-5 shadow-paper">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface-subtle text-xs font-bold text-foreground">
                    {idx + 1}
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-6 shadow-paper">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CheckCircle2 className="h-4 w-4" />
                <span>Capabilities & Features</span>
              </h3>
              <ul className="mt-3.5 space-y-2 text-xs text-muted-foreground">
                {toolMeta.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-0.5 font-bold">•</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6 shadow-paper">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span>Important Notes & Limitations</span>
              </h3>
              <ul className="mt-3.5 space-y-2 text-xs text-muted-foreground">
                {toolMeta.limitations.map((lim, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-0.5 font-bold">•</span>
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <HelpCircle className="h-5 w-5" />
              <span>Frequently Asked Questions</span>
            </h2>
            <div className="mt-4 space-y-3">
              {toolMeta.faq.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-border bg-surface p-5 shadow-paper">
                  <h3 className="text-sm font-semibold text-foreground">{item.q}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          <RelatedTools currentToolId="edit-pdf" />
        </div>
      )}
    </div>
  );
}
