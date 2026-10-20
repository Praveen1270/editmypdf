"use client";

import { useState } from "react";
import { Trash2, Loader2, FileText, CheckSquare, Square } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { ResultCard } from "@/components/tools/ResultCard";
import { PageThumbnailGrid } from "@/components/pdf/PageThumbnailGrid";
import { removePdfPages } from "@/lib/pdf/remove-pages";
import { getPdfInfo } from "@/lib/pdf/pdf-loader";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function RemovePdfPagesPage() {
  const [file, setFile] = useState<{ name: string; size: number; bytes: Uint8Array; pageCount: number } | null>(null);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setErrorMessage(null); setResultBytes(null);
    const f = files[0];
    try {
      const buffer = await f.arrayBuffer();
      const uint8 = new Uint8Array(buffer);
      const info = await getPdfInfo(uint8);
      setFile({ name: f.name, size: f.size, bytes: uint8, pageCount: info.pageCount });
      setSelectedPages([]);
    } catch (err: any) {
      setErrorMessage(`Failed to read PDF: ${err?.message || "File error"}`);
    }
  };

  const handleToggle = (idx: number) => {
    setSelectedPages((prev) => prev.includes(idx) ? prev.filter((p) => p !== idx) : [...prev, idx]);
  };

  const handleSelectAll = () => {
    if (!file) return;
    if (selectedPages.length === file.pageCount) setSelectedPages([]);
    else setSelectedPages(Array.from({ length: file.pageCount }, (_, i) => i));
  };

  const handleRun = async () => {
    if (!file) return;
    if (selectedPages.length === 0) { setErrorMessage("Select at least one page to remove."); return; }
    if (selectedPages.length === file.pageCount) { setErrorMessage("Cannot remove all pages."); return; }
    setIsProcessing(true); setErrorMessage(null);
    try {
      const out = await removePdfPages(file.bytes, selectedPages);
      setResultBytes(out);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to remove pages.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => { setFile(null); setSelectedPages([]); setResultBytes(null); setErrorMessage(null); };
  const handleDownload = () => {
    if (!resultBytes || !file) return;
    downloadBytes(resultBytes, file.name.replace(/\.pdf$/i, "") + "-removed.pdf", "application/pdf");
  };

  return (
    <ToolPageLayout toolId="remove-pages" toolName="Remove PDF Pages" description="Select pages to delete and export the remaining document.">
      {resultBytes ? (
        <ResultCard filename="removed-pages.pdf" filesize={resultBytes.byteLength} pdfBytes={resultBytes} fileExtension=".pdf" notes={`Removed ${selectedPages.length} page(s).`} onDownload={handleDownload} onReset={handleReset} />
      ) : !file ? (
        <DropZone accept=".pdf" multiple={false} title="Drop your PDF here" subtitle="or browse to select pages to remove" onFilesSelected={handleFileSelected} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)} · {file.pageCount} pages · {selectedPages.length} selected for removal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleSelectAll} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
              {selectedPages.length === file.pageCount ? <><Square className="h-3.5 w-3.5" /><span>Deselect All</span></> : <><CheckSquare className="h-3.5 w-3.5" /><span>Select All</span></>}
            </button>
            <button onClick={handleReset} className="text-xs font-medium text-muted-foreground hover:text-destructive px-2">Change File</button>
          </div>
          <PageThumbnailGrid pdfBytes={file.bytes} pageCount={file.pageCount} selectedPages={selectedPages} onToggleSelect={handleToggle} selectable={true} rotatable={false} />
          {errorMessage && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">{errorMessage}</div>}
          {isProcessing && <div className="flex items-center justify-center gap-3 py-4 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" /><span>Removing pages…</span></div>}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button onClick={handleReset} disabled={isProcessing} className="rounded-lg border border-border bg-surface-base px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-raised">Cancel</button>
            <button onClick={handleRun} disabled={isProcessing || selectedPages.length === 0} className="inline-flex items-center gap-2 rounded-lg bg-action-primary px-6 py-2 text-sm font-semibold text-action-primary-text shadow-sm transition hover:opacity-90 disabled:opacity-50">
              <Trash2 className="h-4 w-4" /><span>Remove {selectedPages.length} Page(s)</span>
            </button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
