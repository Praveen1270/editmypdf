"use client";

import { useState } from "react";
import { Maximize, Loader2, FileText } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { ResultCard } from "@/components/tools/ResultCard";
import { resizePdfPages, TargetPageSize, ResizeOrientation } from "@/lib/pdf/resize";
import { getPdfInfo } from "@/lib/pdf/pdf-loader";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function ResizePdfPage() {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    bytes: Uint8Array;
    pageCount: number;
  } | null>(null);

  const [targetSize, setTargetSize] = useState<TargetPageSize>("a4");
  const [orientation, setOrientation] = useState<ResizeOrientation>("auto");
  const [customWidth, setCustomWidth] = useState(612);
  const [customHeight, setCustomHeight] = useState(792);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);

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

  const handleResize = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const bytes = await resizePdfPages(
        file.bytes,
        {
          pageSize: targetSize,
          orientation,
          customWidth,
          customHeight,
        },
        (curr, total) => {
          setProgress({ current: curr, total });
        }
      );

      setResultBytes(bytes);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to resize PDF pages.");
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResultBytes(null);
    setErrorMessage(null);
  };

  const handleDownload = () => {
    if (resultBytes && file) {
      downloadBytes(resultBytes, `resized-${targetSize.toUpperCase()}-${file.name}`);
    }
  };

  return (
    <ToolPageLayout
      toolId="resize"
      toolName="Resize PDF Pages"
      description="Change PDF page dimensions to international standard sizes (A4, US Letter, A3, Legal) or custom dimensions with proportional content scaling."
    >
      {resultBytes ? (
        <ResultCard
          filename={`resized-${targetSize.toUpperCase()}-${file?.name}`}
          filesize={resultBytes.byteLength}
          notes={`Successfully resized ${file?.pageCount} pages to ${targetSize.toUpperCase()}.`}
          onDownload={handleDownload}
          onReset={handleReset}
        />
      ) : !file ? (
        <DropZone
          accept=".pdf"
          multiple={false}
          title="Drop your PDF here"
          subtitle="or browse to change page dimensions"
          onFilesSelected={handleFileSelected}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <p className="font-semibold text-foreground text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)} · {file.pageCount} pages
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground">
                  Target Page Size
                </label>
                <select
                  value={targetSize}
                  onChange={(e) => setTargetSize(e.target.value as any)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="a4">A4 (210 × 297 mm / 595 × 842 pt)</option>
                  <option value="letter">US Letter (8.5 × 11 in / 612 × 792 pt)</option>
                  <option value="legal">US Legal (8.5 × 14 in / 612 × 1008 pt)</option>
                  <option value="a3">A3 (297 × 420 mm / 842 × 1191 pt)</option>
                  <option value="custom">Custom Dimensions (in points)</option>
                </select>
              </div>

              {targetSize === "custom" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground">Width (pt)</label>
                    <input
                      type="number"
                      min={50}
                      value={customWidth}
                      onChange={(e) => setCustomWidth(parseInt(e.target.value) || 612)}
                      className="mt-1 w-full rounded-lg border border-border px-3 py-1.5 text-xs text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground">Height (pt)</label>
                    <input
                      type="number"
                      min={50}
                      value={customHeight}
                      onChange={(e) => setCustomHeight(parseInt(e.target.value) || 792)}
                      className="mt-1 w-full rounded-lg border border-border px-3 py-1.5 text-xs text-foreground"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground">
                  Page Orientation
                </label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="auto">Auto (Preserve source page orientation)</option>
                  <option value="portrait">Force Portrait</option>
                  <option value="landscape">Force Landscape</option>
                </select>
              </div>

              <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Vector-Accurate Scaling:</span> Page contents are scaled proportionally to fit inside the new page dimensions without clipping or text stretching.
              </div>
            </div>
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
                Rescaling pages...{" "}
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
              onClick={handleResize}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:opacity-50"
            >
              <Maximize className="h-4 w-4" />
              <span>Resize PDF Pages</span>
            </button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
