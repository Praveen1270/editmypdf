"use client";

import { Info } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";

export default function PdfToPdfaPage() {
  return (
    <ToolPageLayout toolId="pdf-to-pdfa" toolName="PDF to PDF/A" description="Convert a PDF to a PDF/A archival document.">
      <div className="space-y-4 text-sm text-muted-foreground">
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-700 dark:text-amber-300">
          <Info className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Not available in this browser build</p>
            <p className="mt-1 text-xs">
              Producing a verifiably conformant PDF/A file requires an archival validation engine that is not bundled here.
              This tool does not re-save a file and label it PDF/A. Use a desktop archival tool (e.g. Ghostscript with pdfa
              device, or Adobe Acrobat) for guaranteed PDF/A conformance.
            </p>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
