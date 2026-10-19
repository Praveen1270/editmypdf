"use client";

import { useState } from "react";
import { FileText, Loader2, Download, RefreshCw } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { pdfToWord } from "@/lib/pdf/pdf-to-word";
import { downloadBytes } from "@/lib/files/download";

export default function PdfToWordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);

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
      const buf = await file.arrayBuffer();
      const bytes = await pdfToWord(new Uint8Array(buf));
      setResultBytes(bytes);
    } catch (err: any) {
      setErrorMessage(`Failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBytes || !file) return;
    downloadBytes(resultBytes, file.name.replace(/\.pdf$/i, "") + ".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  };

  const handleReset = () => { setFile(null); setResultBytes(null); setErrorMessage(null); };

  return (
    <ToolPageLayout toolId="pdf-to-word" toolName="PDF to Word" description="Convert a PDF's text into an editable Word document.">
      {!file ? (
        <DropZone accept=".pdf" multiple={false} title="Drop your PDF here" subtitle="or browse to convert" onFilesSelected={handleFileSelected} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <FileText className="h-6 w-6 text-primary" />
            <p className="font-semibold text-foreground text-sm">{file.name}</p>
          </div>
          {isProcessing ? (
            <div className="flex flex-col items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="mt-3 text-sm">Converting…</p></div>
          ) : (
            <button onClick={handleRun} className="rounded-lg bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-text hover:opacity-90">Convert to Word</button>
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