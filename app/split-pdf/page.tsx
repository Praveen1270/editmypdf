"use client";

import { useState } from "react";
import { Scissors, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { ResultCard } from "@/components/tools/ResultCard";
import { splitPDF, SplitMode, parsePageRangeString } from "@/lib/pdf/split";
import { getPdfInfo } from "@/lib/pdf/pdf-loader";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function SplitPdfPage() {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    bytes: Uint8Array;
    pageCount: number;
  } | null>(null);

  const [mode, setMode] = useState<SplitMode>("extract-single");
  const [rangeInput, setRangeInput] = useState("1");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<{
    bytes: Uint8Array;
    filename: string;
    type: "pdf" | "zip";
    count: number;
  } | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setErrorMessage(null);
    const f = files[0];

    try {
      const buffer = await f.arrayBuffer();
      const uint8 = new Uint8Array(buffer);
      const info = await getPdfInfo(uint8);

      setFile({
        name: f.name,
        size: f.size,
        bytes: uint8,
        pageCount: info.pageCount,
      });

      // Default range: 1 to total (or 1 if 1 page)
      setRangeInput(info.pageCount > 1 ? `1-${Math.min(3, info.pageCount)}` : "1");
    } catch (err: any) {
      setErrorMessage(`Failed to read PDF: ${err?.message || "File error"}`);
    }
  };

  const handleSplit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Validate range if relevant
      if (mode !== "split-all") {
        parsePageRangeString(rangeInput, file.pageCount);
      }

      const res = await splitPDF(
        file.bytes,
        file.name,
        mode,
        rangeInput,
        (curr, total) => {
          setProgress({ current: curr, total });
        }
      );
      setResult(res);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to split PDF.");
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setErrorMessage(null);
  };

  const handleDownload = (customFilename?: string) => {
    if (result) {
      const finalName = customFilename || (result.type === "zip" ? "split-pages.zip" : "split-pages.pdf");
      downloadBytes(
        result.bytes,
        finalName,
        result.type === "zip" ? "application/zip" : "application/pdf"
      );
    }
  };

  return (
    <ToolPageLayout
      toolId="split"
      toolName="Split PDF"
      description="Extract specific pages, page ranges (e.g. 1-3, 5), or split every single page into separate files packaged in a ZIP archive."
    >
      {result ? (
        <ResultCard
          filename={result.type === "zip" ? "split-pages.zip" : "split-pages.pdf"}
          filesize={result.bytes.byteLength}
          pdfBytes={result.type === "pdf" ? result.bytes : undefined}
          fileExtension={result.type === "zip" ? ".zip" : ".pdf"}
          notes={
            result.type === "zip"
              ? `Packaged ${result.count} separated PDF files into a ZIP archive.`
              : `Extracted ${result.count} selected pages into a single clean PDF.`
          }
          onDownload={handleDownload}
          onReset={handleReset}
        />
      ) : !file ? (
        <DropZone
          accept=".pdf"
          multiple={false}
          title="Drop your PDF file here"
          subtitle="or browse to select a document to split"
          onFilesSelected={handleFileSelected}
        />
      ) : (
        <div className="space-y-6">
          {/* File summary */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <p className="font-semibold text-foreground text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)} · {file.pageCount} total pages
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="text-xs font-medium text-muted-foreground hover:text-destructive"
            >
              Choose different file
            </button>
          </div>

          {/* Split modes */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Choose How to Split
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label
                onClick={() => setMode("extract-single")}
                className={`flex cursor-pointer flex-col rounded-xl border p-4 transition ${
                  mode === "extract-single"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border bg-white hover:border-muted-foreground/30"
                }`}
              >
                <div className="font-semibold text-sm text-foreground">
                  Extract to Single PDF
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Save all selected pages combined into one new document.
                </div>
              </label>

              <label
                onClick={() => setMode("extract-separate")}
                className={`flex cursor-pointer flex-col rounded-xl border p-4 transition ${
                  mode === "extract-separate"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border bg-white hover:border-muted-foreground/30"
                }`}
              >
                <div className="font-semibold text-sm text-foreground">
                  Extract to ZIP Archive
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Save each selected page as an individual PDF inside a ZIP.
                </div>
              </label>

              <label
                onClick={() => setMode("split-all")}
                className={`flex cursor-pointer flex-col rounded-xl border p-4 transition ${
                  mode === "split-all"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border bg-white hover:border-muted-foreground/30"
                }`}
              >
                <div className="font-semibold text-sm text-foreground">
                  Split Every Page
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Export all {file.pageCount} pages as separate PDFs in a ZIP archive.
                </div>
              </label>
            </div>

            {/* Range input */}
            {mode !== "split-all" && (
              <div className="rounded-xl border border-border bg-white p-4">
                <label className="block text-xs font-semibold text-foreground">
                  Page Selection / Ranges
                </label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Example: <code className="bg-muted px-1 py-0.5 rounded">1-3, 5, 8-10</code> (Document has {file.pageCount} pages)
                </p>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="e.g. 1-3, 5"
                  className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              {errorMessage}
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center gap-3 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>
                Splitting PDF locally...{" "}
                {progress ? `(${progress.current} of ${progress.total})` : ""}
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              onClick={handleReset}
              disabled={isProcessing}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSplit}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:opacity-50"
            >
              <Scissors className="h-4 w-4" />
              <span>Split PDF</span>
            </button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
