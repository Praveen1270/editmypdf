"use client";

import { useState } from "react";
import { FolderOutput, Loader2, FileText, CheckSquare, Square, Archive } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { ResultCard } from "@/components/tools/ResultCard";
import { PageThumbnailGrid } from "@/components/pdf/PageThumbnailGrid";
import { extractPdfPages, ExtractMode } from "@/lib/pdf/extract";
import { parsePageRangeString } from "@/lib/pdf/split";
import { getPdfInfo } from "@/lib/pdf/pdf-loader";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function ExtractPdfPagesPage() {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    bytes: Uint8Array;
    pageCount: number;
  } | null>(null);

  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [rangeInput, setRangeInput] = useState("");
  const [mode, setMode] = useState<ExtractMode>("single-pdf");
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

      // Default: select first page
      setSelectedPages([0]);
    } catch (err: any) {
      setErrorMessage(`Failed to read PDF: ${err?.message || "File error"}`);
    }
  };

  const handleToggleSelectPage = (pageIdx: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageIdx) ? prev.filter((p) => p !== pageIdx) : [...prev, pageIdx]
    );
  };

  const handleSelectAll = () => {
    if (!file) return;
    if (selectedPages.length === file.pageCount) {
      setSelectedPages([]);
    } else {
      setSelectedPages(Array.from({ length: file.pageCount }, (_, i) => i));
    }
  };

  const handleApplyRange = () => {
    if (!file || !rangeInput.trim()) return;
    try {
      const indices = parsePageRangeString(rangeInput, file.pageCount);
      setSelectedPages(indices);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid page range format.");
    }
  };

  const handleExtract = async () => {
    if (!file) return;
    if (selectedPages.length === 0) {
      setErrorMessage("Please select at least one page to extract.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await extractPdfPages(
        file.bytes,
        file.name,
        selectedPages,
        mode,
        (curr, total) => {
          setProgress({ current: curr, total });
        }
      );
      setResult(res);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to extract pages.");
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleReset = () => {
    setFile(null);
    setSelectedPages([]);
    setRangeInput("");
    setResult(null);
    setErrorMessage(null);
  };

  const handleDownload = () => {
    if (result) {
      downloadBytes(
        result.bytes,
        result.filename,
        result.type === "zip" ? "application/zip" : "application/pdf"
      );
    }
  };

  return (
    <ToolPageLayout
      toolId="extract"
      toolName="Extract PDF Pages"
      description="Cherry-pick specific pages from your PDF document. Select pages visually on live thumbnails and save them as a single PDF or separate files in a ZIP archive."
    >
      {result ? (
        <ResultCard
          filename={result.filename}
          filesize={result.bytes.byteLength}
          notes={
            result.type === "zip"
              ? `Extracted ${result.count} pages into individual files in a ZIP archive.`
              : `Extracted ${result.count} selected pages into a new combined PDF.`
          }
          onDownload={handleDownload}
          onReset={handleReset}
        />
      ) : !file ? (
        <DropZone
          accept=".pdf"
          multiple={false}
          title="Drop your PDF here"
          subtitle="or browse to select pages to extract"
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
                  {formatFileSize(file.size)} · {file.pageCount} total pages ·{" "}
                  <strong className="text-foreground">{selectedPages.length} selected</strong>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
              >
                {selectedPages.length === file.pageCount ? (
                  <>
                    <Square className="h-3.5 w-3.5" />
                    <span>Deselect All</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-3.5 w-3.5" />
                    <span>Select All</span>
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                className="text-xs font-medium text-muted-foreground hover:text-destructive px-2"
              >
                Change File
              </button>
            </div>
          </div>

          {/* Range selection bar & Export mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-border bg-muted/20 p-4">
            <div>
              <label className="block text-xs font-semibold text-foreground">
                Select by Range (Optional)
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="e.g. 1-3, 5"
                  className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                />
                <button
                  type="button"
                  onClick={handleApplyRange}
                  className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-white hover:bg-foreground/90"
                >
                  Apply
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                Extraction Output Mode
              </label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode("single-pdf")}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    mode === "single-pdf"
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white text-foreground hover:bg-muted"
                  }`}
                >
                  Single Combined PDF
                </button>
                <button
                  type="button"
                  onClick={() => setMode("zip-separate")}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    mode === "zip-separate"
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white text-foreground hover:bg-muted"
                  }`}
                >
                  Separate PDFs (ZIP)
                </button>
              </div>
            </div>
          </div>

          {/* Interactive visual thumbnail picker */}
          <div>
            <div className="mb-2 text-xs text-muted-foreground">
              Click thumbnails to toggle page selection:
            </div>
            <PageThumbnailGrid
              pdfBytes={file.bytes}
              pageCount={file.pageCount}
              selectedPages={selectedPages}
              onToggleSelect={handleToggleSelectPage}
              selectable={true}
              rotatable={false}
            />
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
                Extracting pages locally...{" "}
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
              onClick={handleExtract}
              disabled={isProcessing || selectedPages.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:opacity-50"
            >
              <FolderOutput className="h-4 w-4" />
              <span>Extract {selectedPages.length} Selected Pages</span>
            </button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
