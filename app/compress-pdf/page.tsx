"use client";

import { useState } from "react";
import { Minimize2, Loader2, FileText, Info } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { ResultCard } from "@/components/tools/ResultCard";
import { compressPDF, CompressionPreset, CompressResult } from "@/lib/pdf/compress";
import { getPdfInfo } from "@/lib/pdf/pdf-loader";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function CompressPdfPage() {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    bytes: Uint8Array;
    pageCount: number;
  } | null>(null);

  const [preset, setPreset] = useState<CompressionPreset>("recommended");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<CompressResult | null>(null);

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
    } catch (err: any) {
      setErrorMessage(`Failed to read PDF: ${err?.message || "File error"}`);
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await compressPDF(file.bytes, preset, (curr, total) => {
        setProgress({ current: curr, total });
      });
      setResult(res);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to compress PDF.");
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
      downloadBytes(result.bytes, customFilename || (file ? `compressed-${file.name}` : "compressed.pdf"));
    }
  };

  return (
    <ToolPageLayout
      toolId="compress"
      toolName="Compress PDF"
      description="Reduce PDF document file size in your browser without uploading to external servers. Choose between structural or balanced image compression presets."
    >
      {result ? (
        <ResultCard
          filename={file ? `compressed-${file.name}` : "compressed.pdf"}
          filesize={result.compressedSize}
          reductionPercentage={result.reductionPercentage}
          pdfBytes={result.bytes}
          notes={result.notes}
          onDownload={handleDownload}
          onReset={handleReset}
        />
      ) : !file ? (
        <DropZone
          accept=".pdf"
          multiple={false}
          title="Drop your PDF file here"
          subtitle="or browse to select a document to compress"
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
                  Original size: {formatFileSize(file.size)} · {file.pageCount} pages
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

          {/* Preset selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Compression Preset
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label
                onClick={() => setPreset("low")}
                className={`flex cursor-pointer flex-col rounded-xl border p-4 transition ${
                  preset === "low"
                    ? "border-foreground bg-surface-raised ring-1 ring-border-strong"
                    : "border-border bg-surface-base hover:border-border-strong"
                }`}
              >
                <div className="font-semibold text-sm text-foreground">
                  Low Compression
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Lossless structural & stream cleanup. Retains 100% vector resolution and text clarity.
                </div>
              </label>

              <label
                onClick={() => setPreset("recommended")}
                className={`flex cursor-pointer flex-col rounded-xl border p-4 transition ${
                  preset === "recommended"
                    ? "border-foreground bg-surface-raised ring-1 ring-border-strong"
                    : "border-border bg-surface-base hover:border-border-strong"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground">
                    Recommended
                  </span>
                  <span className="rounded border border-border bg-surface-raised px-1.5 py-0.5 text-[10px] font-semibold text-text-primary">
                    Popular
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Good compression with high visual quality (150 DPI, 75% JPEG). Best for most documents.
                </div>
              </label>

              <label
                onClick={() => setPreset("high")}
                className={`flex cursor-pointer flex-col rounded-xl border p-4 transition ${
                  preset === "high"
                    ? "border-foreground bg-surface-raised ring-1 ring-border-strong"
                    : "border-border bg-surface-base hover:border-border-strong"
                }`}
              >
                <div className="font-semibold text-sm text-foreground">
                  High Compression
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Maximum size reduction (100 DPI, 55% JPEG). Ideal for emailing scanned documents.
                </div>
              </label>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 text-foreground mt-0.5" />
              <span>
                <strong>Trade-off notice:</strong> Recommended and High presets recompress embedded raster imagery. Text and vector graphics remain sharp, but image details may show slight compression artifacts. If your document already contains fully optimized streams, size reduction may be modest.
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              {errorMessage}
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center gap-3 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-text-primary" />
              <span>
                Optimizing PDF locally...{" "}
                {progress ? `(processing page ${progress.current} of ${progress.total})` : ""}
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              onClick={handleReset}
              disabled={isProcessing}
              className="rounded-lg border border-border bg-surface-base px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-raised"
            >
              Cancel
            </button>
            <button
              onClick={handleCompress}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 rounded-lg bg-action-primary px-6 py-2 text-sm font-semibold text-action-primary-text shadow-sm transition hover:opacity-90 disabled:opacity-50"
            >
              <Minimize2 className="h-4 w-4" />
              <span>Compress PDF</span>
            </button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
