"use client";

import { useState } from "react";
import { Moon, Loader2, Download, RefreshCw } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { invertPdfColors, InvertMode } from "@/lib/pdf/invert";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

const MODES: { value: InvertMode; label: string }[] = [
  { value: "invert", label: "Invert" },
  { value: "dark", label: "Dark mode" },
  { value: "sepia", label: "Sepia" },
  { value: "grayscale", label: "Grayscale" },
  { value: "smart", label: "Smart invert" },
];

export default function InvertPdfPage() {
  const [file, setFile] = useState<{ name: string; size: number; bytes: Uint8Array } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [mode, setMode] = useState<InvertMode>("invert");
  const [dpi, setDpi] = useState(144);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setErrorMessage(null); setResultBytes(null);
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
      const bytes = await invertPdfColors(file.bytes, { mode, dpi }, (c, t) => setProgress({ current: c, total: t }));
      setResultBytes(bytes);
    } catch (err: any) {
      setErrorMessage(`Failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleDownload = () => {
    if (!resultBytes || !file) return;
    downloadBytes(resultBytes, file.name.replace(/\.pdf$/i, "") + `-${mode}.pdf`, "application/pdf");
  };

  const handleReset = () => { setFile(null); setResultBytes(null); setErrorMessage(null); };

  return (
    <ToolPageLayout toolId="invert" toolName="Invert PDF Colours" description="Create a permanent dark-mode, sepia or grayscale version of your PDF.">
      {!file ? (
        <DropZone accept=".pdf" multiple={false} title="Drop your PDF here" subtitle="or browse to transform" onFilesSelected={handleFileSelected} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Moon className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col">
              <span className="text-xs font-semibold mb-1">Mode</span>
              <select value={mode} onChange={(e) => setMode(e.target.value as InvertMode)} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs">
                {MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold mb-1">DPI</span>
              <input type="number" value={dpi} onChange={(e) => setDpi(Number(e.target.value))} className="w-20 rounded-lg border border-border bg-surface-base px-2 py-1.5 text-xs" />
            </div>
          </div>

          {isProcessing ? (
            <div className="flex flex-col items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="mt-3 text-sm">Transforming… {progress ? `page ${progress.current}/${progress.total}` : ""}</p></div>
          ) : (
            <button onClick={handleRun} className="rounded-lg bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-text hover:opacity-90">Transform PDF</button>
          )}

          {resultBytes && (
            <div className="rounded-xl border border-border bg-surface-raised p-4 text-xs">
              <p className="font-semibold">Done — {formatFileSize(resultBytes.length)}</p>
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