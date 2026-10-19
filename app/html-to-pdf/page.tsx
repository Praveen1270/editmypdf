"use client";

import { useState } from "react";
import { Code2, Loader2, Download, RefreshCw } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { htmlToPdf } from "@/lib/pdf/html-to-pdf";
import { downloadBytes } from "@/lib/files/download";

export default function HtmlToPdfPage() {
  const [html, setHtml] = useState("<h1>Hello</h1><p>This is <b>HTML</b> converted to PDF.</p><ul><li>One</li><li>Two</li></ul>");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [pageSize, setPageSize] = useState<"a4" | "letter">("a4");

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    const text = await f.text();
    setHtml(text);
  };

  const handleRun = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const bytes = await htmlToPdf(html, { pageSize });
      setResultBytes(bytes);
    } catch (err: any) {
      setErrorMessage(`Failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBytes) return;
    downloadBytes(resultBytes, "document.pdf", "application/pdf");
  };

  const handleReset = () => { setHtml(""); setResultBytes(null); setErrorMessage(null); };

  return (
    <ToolPageLayout toolId="html-to-pdf" toolName="HTML to PDF" description="Convert an HTML file or pasted code into a PDF.">
      <div className="space-y-6">
        {errorMessage && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">{errorMessage}</div>}

        <div className="flex gap-3">
          <select value={pageSize} onChange={(e) => setPageSize(e.target.value as any)} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs">
            <option value="a4">A4</option>
            <option value="letter">Letter</option>
          </select>
        </div>

        <DropZone accept=".html,.htm" multiple={false} title="Drop an HTML file" subtitle="or paste below" onFilesSelected={handleFileSelected} />

        <textarea value={html} onChange={(e) => setHtml(e.target.value)} rows={14} className="w-full rounded-xl border border-border bg-muted/20 p-4 font-mono text-xs text-foreground resize-y" />

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

        <button onClick={handleReset} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
          <RefreshCw className="h-3 w-3" /> Start Again
        </button>
      </div>
    </ToolPageLayout>
  );
}