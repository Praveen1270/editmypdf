"use client";

import { useState } from "react";
import { Presentation, Loader2, FileText, Download, RefreshCw } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { powerpointToPdf } from "@/lib/pdf/powerpoint-to-pdf";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function PowerpointToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);

  const handleFile = async (files: File[]) => {
    if (files.length === 0) return;
    setErrorMessage(null); setResultBytes(null);
    setFile(files[0]);
  };

  const handleRun = async () => {
    if (!file) return;
    setIsProcessing(true); setErrorMessage(null);
    try {
      const buffer = await file.arrayBuffer();
      const out = await powerpointToPdf(new Uint8Array(buffer));
      setResultBytes(out);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to convert.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBytes || !file) return;
    downloadBytes(resultBytes, file.name.replace(/\.(pptx|ppt)$/i, "") + ".pdf", "application/pdf");
  };

  const handleReset = () => { setFile(null); setResultBytes(null); setErrorMessage(null); };

  return (
    <ToolPageLayout toolId="powerpoint-to-pdf" toolName="PowerPoint to PDF" description="Convert a PowerPoint presentation to PDF. Layout is approximated from extracted slide text.">
      {resultBytes ? (
        <div className="space-y-4">
          <p className="text-sm text-foreground">Conversion complete.</p>
          <div className="flex gap-2">
            <button onClick={handleDownload} className="inline-flex items-center gap-1.5 rounded-lg bg-action-primary px-3 py-1.5 text-xs font-semibold text-action-primary-text hover:opacity-90"><Download className="h-3.5 w-3.5" /> Download .pdf</button>
            <button onClick={handleReset} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"><RefreshCw className="h-3 w-3" /> Start Again</button>
          </div>
        </div>
      ) : !file ? (
        <DropZone accept=".pptx" multiple={false} title="Drop your PowerPoint file here" subtitle="or browse to convert" onFilesSelected={handleFile} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <FileText className="h-6 w-6 text-primary" />
            <p className="font-semibold text-foreground text-sm">{file.name}</p>
            <button onClick={handleReset} className="ml-auto text-xs text-muted-foreground hover:text-destructive">Change File</button>
          </div>
          {errorMessage && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">{errorMessage}</div>}
          {isProcessing ? <div className="flex items-center gap-3 py-4 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" /><span>Converting…</span></div> : (
            <button onClick={handleRun} className="rounded-lg bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-text hover:opacity-90">Convert to PDF</button>
          )}
        </div>
      )}
    </ToolPageLayout>
  );
}
