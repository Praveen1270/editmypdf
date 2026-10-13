"use client";

import { useState } from "react";
import { Crop, Loader2, FileText, Info } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { ResultCard } from "@/components/tools/ResultCard";
import { cropPdf, CropMargins } from "@/lib/pdf/crop";
import { getPdfInfo } from "@/lib/pdf/pdf-loader";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function CropPdfPage() {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    bytes: Uint8Array;
    pageCount: number;
  } | null>(null);

  const [margins, setMargins] = useState<CropMargins>({
    top: 36, // 0.5 inch default (36 points)
    bottom: 36,
    left: 36,
    right: 36,
  });

  const [applyMode, setApplyMode] = useState<"all" | "custom">("all");
  const [pageRange, setPageRange] = useState("1");
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleCrop = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      let pageIndices: number[] | undefined;
      if (applyMode === "custom") {
        const pages = pageRange
          .split(/[,]/)
          .map((p) => parseInt(p.trim()) - 1)
          .filter((p) => !isNaN(p) && p >= 0 && p < file.pageCount);
        if (pages.length === 0) {
          throw new Error("Invalid page selection.");
        }
        pageIndices = pages;
      }

      const bytes = await cropPdf(file.bytes, {
        margins,
        pageIndices,
      });

      setResultBytes(bytes);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to crop PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResultBytes(null);
    setErrorMessage(null);
  };

  const handleDownload = (customFilename?: string) => {
    if (resultBytes) {
      downloadBytes(resultBytes, customFilename || (file ? `cropped-${file.name}` : "cropped.pdf"));
    }
  };

  return (
    <ToolPageLayout
      toolId="crop"
      toolName="Crop PDF"
      description="Trim unwanted page margins and adjust document canvas boundaries. Configure margin dimensions in points for all or selected pages."
    >
      {resultBytes ? (
        <ResultCard
          filename={file ? `cropped-${file.name}` : "cropped.pdf"}
          filesize={resultBytes.byteLength}
          pdfBytes={resultBytes}
          notes={`Successfully applied CropBox margin trim to ${file?.name}.`}
          onDownload={handleDownload}
          onReset={handleReset}
        />
      ) : !file ? (
        <DropZone
          accept=".pdf"
          multiple={false}
          title="Drop your PDF here"
          subtitle="or browse to adjust page margins and crop canvas"
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

          <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">ISO 32000 Standard CropBox:</strong> Values are measured in typographical points (72 points = 1 inch; ~28 points = 1 cm). Trimming adjusts the document viewing frame in all compliant PDF viewers.
            </p>
          </div>

          {/* Margin Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-surface-raised p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Margin Trim Settings (Points)
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground">Top Margin (pt)</label>
                  <input
                    type="number"
                    min={0}
                    value={margins.top}
                    onChange={(e) =>
                      setMargins((m) => ({ ...m, top: Math.max(0, parseInt(e.target.value) || 0) }))
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-focus"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground">Bottom Margin (pt)</label>
                  <input
                    type="number"
                    min={0}
                    value={margins.bottom}
                    onChange={(e) =>
                      setMargins((m) => ({ ...m, bottom: Math.max(0, parseInt(e.target.value) || 0) }))
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-focus"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground">Left Margin (pt)</label>
                  <input
                    type="number"
                    min={0}
                    value={margins.left}
                    onChange={(e) =>
                      setMargins((m) => ({ ...m, left: Math.max(0, parseInt(e.target.value) || 0) }))
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-focus"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground">Right Margin (pt)</label>
                  <input
                    type="number"
                    min={0}
                    value={margins.right}
                    onChange={(e) =>
                      setMargins((m) => ({ ...m, right: Math.max(0, parseInt(e.target.value) || 0) }))
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-focus"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface-raised p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Target Pages
              </h3>

              <div className="space-y-3">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="applyMode"
                      checked={applyMode === "all"}
                      onChange={() => setApplyMode("all")}
                      className="accent-action-primary"
                    />
                    <span>All Pages ({file.pageCount})</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="applyMode"
                      checked={applyMode === "custom"}
                      onChange={() => setApplyMode("custom")}
                      className="text-primary"
                    />
                    <span>Selected Pages</span>
                  </label>
                </div>

                {applyMode === "custom" && (
                  <div>
                    <label className="block text-xs text-muted-foreground">
                      Page Numbers (e.g. 1, 3, 5)
                    </label>
                    <input
                      type="text"
                      value={pageRange}
                      onChange={(e) => setPageRange(e.target.value)}
                      placeholder="e.g. 1, 2"
                      className="mt-1 w-full rounded-lg border border-border px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-border bg-surface-raised p-3 text-xs text-text-primary">
              {errorMessage}
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
              onClick={handleCrop}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 rounded-lg bg-action-primary px-6 py-2 text-sm font-semibold text-action-primary-text shadow-sm transition hover:opacity-90 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-action-primary-text" />
                  <span>Cropping PDF...</span>
                </>
              ) : (
                <>
                  <Crop className="h-4 w-4" />
                  <span>Apply Crop</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
