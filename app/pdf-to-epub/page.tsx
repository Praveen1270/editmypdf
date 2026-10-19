"use client";

import { useState } from "react";
import { BookOpen, Loader2, Download, RefreshCw } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { convertPdfToEpub } from "@/lib/pdf/pdf-to-epub";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function PdfToEpubPage() {
  const [file, setFile] = useState<{ name: string; size: number; bytes: Uint8Array } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setErrorMessage(null); setResultBytes(null);
    const f = files[0];
    try {
      const buffer = await f.arrayBuffer();
      setFile({ name: f.name, size: f.size, bytes: new Uint8Array(buffer) });
      setTitle(f.name.replace(/\.pdf$/i, ""));
    } catch (err: any) {
      setErrorMessage(`Failed to read PDF: ${err?.message || "File error"}`);
    }
  };

  const handleRun = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const bytes = await convertPdfToEpub(file.bytes, { title, author });
      setResultBytes(bytes);
    } catch (err: any) {
      setErrorMessage(`Failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBytes || !file) return;
    downloadBytes(resultBytes, file.name.replace(/\.pdf$/i, "") + ".epub", "application/epub+zip");
  };

  const handleReset = () => { setFile(null); setResultBytes(null); setErrorMessage(null); };

  return (
    <ToolPageLayout toolId="pdf-to-epub" toolName="PDF to EPUB" description="Convert a PDF into an EPUB e-book for Kindle, Kobo and Apple Books.">
      {!file ? (
        <DropZone accept=".pdf" multiple={false} title="Drop your PDF here" subtitle="or browse to convert" onFilesSelected={handleFileSelected} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <BookOpen className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-semibold mb-1">Title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold mb-1">Author</span>
              <input value={author} onChange={(e) => setAuthor(e.target.value)} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs" />
            </div>
          </div>

          {isProcessing ? (
            <div className="flex flex-col items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="mt-3 text-sm">Converting…</p></div>
          ) : (
            <button onClick={handleRun} className="rounded-lg bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-text hover:opacity-90">Convert to EPUB</button>
          )}

          {resultBytes && (
            <div className="rounded-xl border border-border bg-surface-raised p-4 text-xs">
              <p className="font-semibold">Done — {formatFileSize(resultBytes.length)}</p>
              <button onClick={handleDownload} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-action-primary px-3 py-1.5 text-xs font-semibold text-action-primary-text hover:opacity-90">
                <Download className="h-3.5 w-3.5" /> Download EPUB
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