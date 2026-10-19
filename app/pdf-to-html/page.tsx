"use client";

import { useState } from "react";
import { Code, Loader2, Download, RefreshCw } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { convertPdfToHtml } from "@/lib/pdf/pdf-to-html";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function PdfToHtmlPage() {
  const [file, setFile] = useState<{ name: string; size: number; bytes: Uint8Array } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [html, setHtml] = useState("");
  const [mode, setMode] = useState<"positioned" | "reflowable">("reflowable");

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setErrorMessage(null); setHtml("");
    const f = files[0];
    try {
      const buffer = await f.arrayBuffer();
      setFile({ name: f.name, size: f.size, bytes: new Uint8Array(buffer) });
    } catch (err: any) {
      setErrorMessage(`Failed to read PDF: ${err?.message || "File error"}`);
    }
  };

  const handleRun = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const out = await convertPdfToHtml(file.bytes, { mode });
      setHtml(out);
    } catch (err: any) {
      setErrorMessage(`Failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!html || !file) return;
    const encoder = new TextEncoder();
    downloadBytes(encoder.encode(html), file.name.replace(/\.pdf$/i, "") + ".html", "text/html;charset=utf-8");
  };

  const handleReset = () => { setFile(null); setHtml(""); setErrorMessage(null); };

  return (
    <ToolPageLayout toolId="pdf-to-html" toolName="PDF to HTML" description="Convert a PDF into a single HTML file with positioned or reflowable text.">
      {!file ? (
        <DropZone accept=".pdf" multiple={false} title="Drop your PDF here" subtitle="or browse to convert" onFilesSelected={handleFileSelected} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Code className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-semibold mb-1">Layout</span>
            <select value={mode} onChange={(e) => setMode(e.target.value as any)} className="w-48 rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs">
              <option value="reflowable">Reflowable</option>
              <option value="positioned">Positioned</option>
            </select>
          </div>

          {isProcessing ? (
            <div className="flex flex-col items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="mt-3 text-sm">Converting…</p></div>
          ) : (
            <button onClick={handleRun} className="rounded-lg bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-text hover:opacity-90">Convert to HTML</button>
          )}

          {html && (
            <div className="space-y-3">
              <textarea readOnly value={html} rows={12} className="w-full rounded-xl border border-border bg-muted/20 p-4 font-mono text-xs text-foreground resize-y" />
              <button onClick={handleDownload} className="inline-flex items-center gap-1.5 rounded-lg bg-action-primary px-3 py-1.5 text-xs font-semibold text-action-primary-text hover:opacity-90">
                <Download className="h-3.5 w-3.5" /> Download HTML
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