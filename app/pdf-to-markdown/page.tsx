"use client";

import { useState } from "react";
import { FileText, Loader2, Download, RefreshCw } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { pdfToMarkdown } from "@/lib/pdf/pdf-to-markdown";
import { getPdfInfo } from "@/lib/pdf/pdf-loader";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function PdfToMarkdownPage() {
  const [file, setFile] = useState<{ name: string; size: number; bytes: Uint8Array; pageCount: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState<string | null>(null);

  const handleFile = async (files: File[]) => {
    if (files.length === 0) return;
    setErrorMessage(null); setMarkdown(null);
    const f = files[0];
    try {
      const buffer = await f.arrayBuffer();
      const uint8 = new Uint8Array(buffer);
      const info = await getPdfInfo(uint8);
      setFile({ name: f.name, size: f.size, bytes: uint8, pageCount: info.pageCount });
    } catch (err: any) {
      setErrorMessage(`Failed to read PDF: ${err?.message || "File error"}`);
    }
  };

  const handleRun = async () => {
    if (!file) return;
    setIsProcessing(true); setErrorMessage(null);
    try {
      const md = await pdfToMarkdown(file.bytes);
      setMarkdown(md);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to convert.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!markdown || !file) return;
    const bytes = new TextEncoder().encode(markdown);
    downloadBytes(bytes, file.name.replace(/\.pdf$/i, "") + ".md", "text/markdown");
  };

  const handleReset = () => { setFile(null); setMarkdown(null); setErrorMessage(null); };

  return (
    <ToolPageLayout toolId="pdf-to-markdown" toolName="PDF to Markdown" description="Extract text from a PDF and format it as Markdown with headings.">
      {markdown ? (
        <div className="space-y-4">
          <textarea readOnly value={markdown} className="w-full h-96 rounded-lg border border-border bg-surface-base p-3 text-xs font-mono" />
          <div className="flex gap-2">
            <button onClick={handleDownload} className="inline-flex items-center gap-1.5 rounded-lg bg-action-primary px-3 py-1.5 text-xs font-semibold text-action-primary-text hover:opacity-90"><Download className="h-3.5 w-3.5" /> Download .md</button>
            <button onClick={handleReset} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"><RefreshCw className="h-3 w-3" /> Start Again</button>
          </div>
        </div>
      ) : !file ? (
        <DropZone accept=".pdf" multiple={false} title="Drop your PDF here" subtitle="or browse to convert" onFilesSelected={handleFile} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)} · {file.pageCount} pages</p>
            </div>
            <button onClick={handleReset} className="ml-auto text-xs text-muted-foreground hover:text-destructive">Change File</button>
          </div>
          {errorMessage && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">{errorMessage}</div>}
          {isProcessing ? <div className="flex items-center gap-3 py-4 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" /><span>Converting…</span></div> : (
            <button onClick={handleRun} className="rounded-lg bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-text hover:opacity-90">Convert to Markdown</button>
          )}
        </div>
      )}
    </ToolPageLayout>
  );
}
