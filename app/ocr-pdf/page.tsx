"use client";

import { useState } from "react";
import { ScanText, Loader2, Download, RefreshCw, Copy, Check } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { ocrPdf, OcrResult } from "@/lib/pdf/ocr";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

const LANGS = [
  { value: "eng", label: "English" },
  { value: "fra", label: "French" },
  { value: "deu", label: "German" },
  { value: "spa", label: "Spanish" },
  { value: "ita", label: "Italian" },
  { value: "por", label: "Portuguese" },
  { value: "rus", label: "Russian" },
  { value: "chi_sim", label: "Chinese (Simplified)" },
  { value: "jpn", label: "Japanese" },
  { value: "ara", label: "Arabic" },
  { value: "hin", label: "Hindi" },
];

export default function OcrPdfPage() {
  const [file, setFile] = useState<{ name: string; size: number; bytes: Uint8Array } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [language, setLanguage] = useState("eng");
  const [mode, setMode] = useState<"searchable-pdf" | "text">("searchable-pdf");
  const [dpi, setDpi] = useState(250);
  const [progress, setProgress] = useState<{ current: number; total: number; status?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setErrorMessage(null); setResult(null);
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
    setResult(null);
    try {
      const res = await ocrPdf(file.bytes, {
        language, mode, dpi,
        onProgress: (c, t, s) => setProgress({ current: c, total: t, status: s }),
      });
      setResult(res);
    } catch (err: any) {
      setErrorMessage(`OCR failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    if (mode === "searchable-pdf" && result.bytes) {
      downloadBytes(result.bytes, file.name.replace(/\.pdf$/i, "") + "-ocr.pdf", "application/pdf");
    } else {
      const enc = new TextEncoder();
      downloadBytes(enc.encode(result.text), file.name.replace(/\.pdf$/i, "") + "-ocr.txt", "text/plain;charset=utf-8");
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorMessage("Clipboard copy failed.");
    }
  };

  const handleReset = () => { setFile(null); setResult(null); setErrorMessage(null); };

  return (
    <ToolPageLayout toolId="ocr" toolName="OCR (Searchable PDF)" description="Recognise text in scanned PDFs and create a searchable PDF with an invisible text layer, or export plain text.">
      {!file ? (
        <DropZone accept=".pdf" multiple={false} title="Drop your PDF here" subtitle="or browse to OCR" onFilesSelected={handleFileSelected} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <ScanText className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col">
              <span className="text-xs font-semibold mb-1">Language</span>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs">
                {LANGS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold mb-1">Output</span>
              <select value={mode} onChange={(e) => setMode(e.target.value as any)} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs">
                <option value="searchable-pdf">Searchable PDF</option>
                <option value="text">Plain text</option>
              </select>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold mb-1">DPI</span>
              <input type="number" value={dpi} onChange={(e) => setDpi(Number(e.target.value))} className="w-20 rounded-lg border border-border bg-surface-base px-2 py-1.5 text-xs" />
            </div>
          </div>

          {isProcessing ? (
            <div className="flex flex-col items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 text-sm">OCR running… {progress ? `page ${progress.current}/${progress.total}` : ""}</p>
              {progress?.status && <p className="text-xs text-muted-foreground mt-1">{progress.status}</p>}
            </div>
          ) : (
            <button onClick={handleRun} className="rounded-lg bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-text hover:opacity-90">Run OCR</button>
          )}

          {result && (
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-surface-raised p-4 text-xs">
                <p className="font-semibold">Done — confidence {result.confidence?.toFixed(1)}%</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={handleDownload} className="inline-flex items-center gap-1.5 rounded-lg bg-action-primary px-3 py-1.5 text-xs font-semibold text-action-primary-text hover:opacity-90">
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                  <button onClick={handleCopy} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-subtle">
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} Copy Text
                  </button>
                </div>
              </div>
              <textarea readOnly value={result.text} rows={12} className="w-full rounded-xl border border-border bg-muted/20 p-4 font-mono text-xs text-foreground resize-y" />
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