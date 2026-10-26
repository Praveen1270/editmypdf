"use client";

import dynamic from "next/dynamic";

// Lazy-load the heavy editor bundle (pdf.js + pdf-lib + fontkit stay out of
// the initial page load; the pdf.js worker already runs in a web worker).
const EditPdfWorkspace = dynamic(
  () => import("./EditPdfWorkspace").then((m) => ({ default: m.EditPdfWorkspace })),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto max-w-3xl px-4 py-14 text-center" aria-label="Loading editor">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
        <p className="mt-3 text-sm font-semibold text-foreground">Loading the PDF editor…</p>
        <p className="mt-1 text-xs text-muted-foreground">The editor bundle loads only when you open this page.</p>
      </div>
    ),
  }
);

export function EditPdfLazy(props?: { onStageChange?: (stage: string) => void }) {
  return <EditPdfWorkspace onStageChange={props?.onStageChange as any} />;
}
