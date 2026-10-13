"use client";

import { useState } from "react";
import {
  FileText,
  Copy,
  Download,
  Check,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { extractTextFromPdf, ExtractTextResult } from "@/lib/pdf/text-extract";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function PdfToTextPage() {
  const [file, setFile] = useState<{ name: string; size: number; bytes: Uint8Array } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractTextResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setErrorMessage(null);
    setResult(null);
    const f = files[0];

    try {
      const buffer = await f.arrayBuffer();
      const uint8 = new Uint8Array(buffer);
      setFile({ name: f.name, size: f.size, bytes: uint8 });

      // Automatically start extraction
      setIsProcessing(true);
      const textResult = await extractTextFromPdf(uint8, (current, total) => {
        setProgress({ current, total });
      });
      setResult(textResult);
    } catch (err: any) {
      setErrorMessage(`Failed to extract text: ${err?.message || "File error"}`);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorMessage("Clipboard copy failed. Please select text manually.");
    }
  };

  const [outputFilename, setOutputFilename] = useState<string>("extracted-text.txt");

  const handleDownload = () => {
    if (!result || !file) return;
    let clean = outputFilename.replace(/[\\/:*?"<>|\x00-\x1F]/g, "").trim();
    if (!clean) clean = "extracted-text.txt";
    if (!clean.toLowerCase().endsWith(".txt")) clean = `${clean}.txt`;
    const encoder = new TextEncoder();
    const textBytes = encoder.encode(result.fullText);
    downloadBytes(textBytes, clean, "text/plain;charset=utf-8");
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setErrorMessage(null);
    setCopied(false);
    setOutputFilename("extracted-text.txt");
  };

  return (
    <ToolPageLayout
      toolId="pdf-to-text"
      toolName="PDF to Text"
      description="Extract digital text content directly from your PDF document. Copy text instantly or download a formatted plain text (.txt) file."
    >
      {!file ? (
        <DropZone
          accept=".pdf"
          multiple={false}
          title="Drop your PDF here"
          subtitle="or browse to extract readable text"
          onFilesSelected={handleFileSelected}
        />
      ) : isProcessing ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm font-semibold text-foreground">Extracting Text</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {progress
              ? `Processing page ${progress.current} of ${progress.total}...`
              : "Reading document streams..."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <p className="font-semibold text-foreground text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)} · {result?.pages.length || 0} pages parsed ·{" "}
                  {result?.totalWords.toLocaleString() || 0} words ({result?.totalChars.toLocaleString() || 0} characters)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!result || !result.hasText}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm hover:bg-muted disabled:opacity-50"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-success" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={!result || !result.hasText}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export .txt</span>
              </button>

              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Start Again</span>
              </button>
            </div>
          </div>

          {/* Labeled File name field */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 max-w-md">
            <label htmlFor="txt-filename" className="block text-xs font-semibold text-foreground mb-1">
              File name
            </label>
            <div className="flex gap-2">
              <input
                id="txt-filename"
                type="text"
                value={outputFilename}
                onChange={(e) => setOutputFilename(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                placeholder="extracted-text.txt"
              />
              <button
                type="button"
                onClick={handleDownload}
                disabled={!result || !result.hasText}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover disabled:opacity-50 shrink-0"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
              </button>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Saves text content as standard UTF-8 encoded plain text (.txt).
            </p>
          </div>

          {/* Scanned PDF Notice if no text found */}
          {result && !result.hasText && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold">No selectable text found in this document</p>
                <p className="text-amber-700 leading-relaxed">
                  This PDF appears to consist of scanned bitmap images or non-selectable graphics without an embedded text layer. Scanned paper documents require Optical Character Recognition (OCR) to convert pixels into digital text characters.
                </p>
              </div>
            </div>
          )}

          {/* Text Content Preview Area */}
          {result && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-foreground">Extracted Content Preview</span>
                <span className="text-[10px] text-muted-foreground">UTF-8 Encoded Plain Text</span>
              </div>
              <textarea
                readOnly
                value={result.fullText}
                rows={16}
                className="w-full rounded-xl border border-border bg-muted/20 p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-y"
              />
            </div>
          )}

          {errorMessage && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              {errorMessage}
            </div>
          )}
        </div>
      )}
    </ToolPageLayout>
  );
}
