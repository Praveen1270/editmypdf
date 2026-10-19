"use client";

import { useState } from "react";
import { Book, Loader2, Download, RefreshCw } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { ebookToPdf } from "@/lib/pdf/ebook-to-pdf";
import { downloadBytes } from "@/lib/files/download";

export default function EbookToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [pageSize, setPageSize] = useState<"a4" | "letter">("a4");

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setErrorMessage(null); setResultBytes(null);
    setFile(files[0]);
  };

  const handleRun = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const bytes = await ebookToPdf(file, { pageSize });
      setResultBytes(bytes);
    } catch (err: any) {
      setErrorMessage(`Failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBytes || !file) return;
    downloadBytes(resultBytes, file.name.replace(/\.(epub|mobi|azw3)$/i, "") + ".pdf", "application/pdf");
  };

  const handleReset = () => { setFile(null); setResultBytes(null); setErrorMessage(null); };

  return (
    <ToolPageLayout toolId="ebook-to-pdf" toolName="eBook to PDF" description="Convert DRM-free EPUB e-books to a paginated PDF.">
      {!file ? (
        <DropZone accept=".epub" multiple={false} title="Drop your eBook here" subtitle="or browse to convert" onFilesSelected={handleFileSelected} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Book className="h-6 w-6 text-primary" />
            <p className="font-semibold text-foreground text-sm">{file.name}</p>
          </div>
          <select value={pageSize} onChange={(e) => setPageSize(e.target.value as any)} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs">
            <option value="a4">A4</option>
            <option value="letter">Letter</option>
          </select>
          {isProcessing ? (
            <div className="flex flex-col items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="mt-3 text-sm">Converting…</p></div>
          ) : (
            <button onClick={handleRun} className="rounded-lg bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-text hover:opacity-90">Convert to PDF</button>
          )}
          {resultBytes && (
            <div className="rounded-xl border border-border bg-surface-raised p-4 text-xs">
              <p className="font-semibold">Done</p>
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