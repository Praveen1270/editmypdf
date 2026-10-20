"use client";

import { useState } from "react";
import { Workflow, Loader2, FileText, Download, RefreshCw } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { mergePDFs } from "@/lib/pdf/merge";
import { compressPDF } from "@/lib/pdf/compress";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function WorkflowsPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [stats, setStats] = useState<{ original: number; final: number } | null>(null);

  const handleFiles = (selected: File[]) => {
    setFiles(selected);
    setResultBytes(null); setErrorMessage(null); setStats(null);
  };

  const handleRun = async () => {
    if (files.length < 2) { setErrorMessage("Select at least two PDFs."); return; }
    setIsProcessing(true); setErrorMessage(null);
    try {
      const inputs = await Promise.all(files.map(async (f) => ({ name: f.name, bytes: new Uint8Array(await f.arrayBuffer()) })));
      const merged = await mergePDFs(inputs);
      const originalSize = merged.byteLength;
      const compressed = await compressPDF(merged, "recommended");
      setResultBytes(compressed.bytes);
      setStats({ original: merged.byteLength, final: compressed.bytes.byteLength });
    } catch (err: any) {
      setErrorMessage(err?.message || "Workflow failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBytes) return;
    downloadBytes(resultBytes, "workflow-result.pdf", "application/pdf");
  };

  const handleReset = () => { setFiles([]); setResultBytes(null); setErrorMessage(null); setStats(null); };

  return (
    <ToolPageLayout toolId="workflows" toolName="Workflows" description="Run common multi-step PDF tasks. This workflow merges selected PDFs, then compresses the result.">
      {resultBytes ? (
        <div className="space-y-4">
          <p className="text-sm text-foreground">Workflow complete.</p>
          {stats && <p className="text-xs text-muted-foreground">Merged size {formatFileSize(stats.original)} → compressed {formatFileSize(stats.final)}</p>}
          <div className="flex gap-2">
            <button onClick={handleDownload} className="inline-flex items-center gap-1.5 rounded-lg bg-action-primary px-3 py-1.5 text-xs font-semibold text-action-primary-text hover:opacity-90"><Download className="h-3.5 w-3.5" /> Download</button>
            <button onClick={handleReset} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"><RefreshCw className="h-3 w-3" /> Start Again</button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <DropZone accept=".pdf" multiple={true} title="Drop PDFs here" subtitle="or browse to select (at least two)" onFilesSelected={handleFiles} />
          {files.length > 0 && <p className="text-xs text-muted-foreground">{files.length} file(s) selected</p>}
          {errorMessage && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">{errorMessage}</div>}
          {isProcessing ? <div className="flex items-center gap-3 py-4 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" /><span>Running workflow…</span></div> : (
            <button onClick={handleRun} disabled={files.length < 2} className="rounded-lg bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-text hover:opacity-90 disabled:opacity-50">Run: Merge → Compress</button>
          )}
        </div>
      )}
    </ToolPageLayout>
  );
}
