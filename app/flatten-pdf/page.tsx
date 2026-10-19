"use client";

import { useState } from "react";
import { Layers, Loader2, Download, RefreshCw, CheckCircle2 } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { flattenPdf, FlattenReport } from "@/lib/pdf/flatten";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function FlattenPdfPage() {
  const [file, setFile] = useState<{ name: string; size: number; bytes: Uint8Array } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [report, setReport] = useState<FlattenReport | null>(null);
  const [flattenForms, setFlattenForms] = useState(true);
  const [removeAnnotations, setRemoveAnnotations] = useState(true);
  const [removeScripts, setRemoveScripts] = useState(true);
  const [rasterize, setRasterize] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setErrorMessage(null);
    setResultBytes(null);
    setReport(null);
    const f = files[0];
    try {
      const buffer = await f.arrayBuffer();
      setFile({ name: f.name, size: f.size, bytes: new Uint8Array(buffer) });
    } catch (err: any) {
      setErrorMessage(`Failed to read PDF: ${err?.message || "File error"}`);
    }
  };

  const handleFlatten = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const { bytes, report: r } = await flattenPdf(file.bytes, {
        flattenForms, removeAnnotations, removeScripts, rasterize,
      });
      setResultBytes(bytes);
      setReport(r);
    } catch (err: any) {
      setErrorMessage(`Failed to flatten: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBytes || !file) return;
    downloadBytes(resultBytes, file.name.replace(/\.pdf$/i, "") + "-flattened.pdf", "application/pdf");
  };

  const handleReset = () => {
    setFile(null); setResultBytes(null); setReport(null); setErrorMessage(null);
  };

  return (
    <ToolPageLayout toolId="flatten" toolName="Flatten PDF" description="Flatten form fields, annotations and scripts into fixed page content so the PDF can no longer be edited as a form.">
      {!file ? (
        <DropZone accept=".pdf" multiple={false} title="Drop your PDF here" subtitle="or browse to flatten" onFilesSelected={handleFileSelected} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Layers className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Flatten form fields", val: flattenForms, set: setFlattenForms },
              { label: "Remove annotations", val: removeAnnotations, set: setRemoveAnnotations },
              { label: "Remove scripts & XFA", val: removeScripts, set: setRemoveScripts },
              { label: "Rasterize to images (max safety)", val: rasterize, set: setRasterize },
            ].map((o) => (
              <label key={o.label} className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm cursor-pointer">
                <input type="checkbox" checked={o.val} onChange={(e) => o.set(e.target.checked)} className="h-4 w-4" />
                <span>{o.label}</span>
              </label>
            ))}
          </div>

          {isProcessing ? (
            <div className="flex flex-col items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="mt-3 text-sm">Flattening…</p></div>
          ) : (
            <button onClick={handleFlatten} className="rounded-lg bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-text hover:opacity-90">Flatten PDF</button>
          )}

          {report && resultBytes && (
            <div className="rounded-xl border border-border bg-surface-raised p-4 text-xs space-y-1">
              <div className="flex items-center gap-2 font-semibold text-foreground"><CheckCircle2 className="h-4 w-4 text-green-500" />Done</div>
              <p>Fields flattened: {report.fieldsFlattened}</p>
              <p>Annotations removed: {report.annotationsRemoved}</p>
              <p>Scripts removed: {report.scriptsRemoved ? "Yes" : "No"}</p>
              <p>XFA removed: {report.xfaRemoved ? "Yes" : "No"}</p>
              <button onClick={handleDownload} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-action-primary px-3 py-1.5 text-xs font-semibold text-action-primary-text hover:opacity-90">
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            </div>
          )}

          {errorMessage && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">{errorMessage}</div>}

          <button onClick={handleReset} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
            <RefreshCw className="h-3 w-3" /> Start Again
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}