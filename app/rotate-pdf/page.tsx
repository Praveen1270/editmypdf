"use client";

import { useState } from "react";
import { RotateCw, RotateCcw, Loader2, FileText, CheckSquare, Square } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { ResultCard } from "@/components/tools/ResultCard";
import { PageThumbnailGrid } from "@/components/pdf/PageThumbnailGrid";
import { rotatePdf, PageRotationMap } from "@/lib/pdf/rotate";
import { getPdfInfo } from "@/lib/pdf/pdf-loader";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function RotatePdfPage() {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    bytes: Uint8Array;
    pageCount: number;
  } | null>(null);

  const [rotations, setRotations] = useState<PageRotationMap>({});
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
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
      // By default all pages selected
      setSelectedPages(Array.from({ length: info.pageCount }, (_, i) => i));
      setRotations({});
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

  const rotateSinglePage = (pageIdx: number) => {
    setRotations((prev) => ({
      ...prev,
      [pageIdx]: ((prev[pageIdx] || 0) + 90) % 360,
    }));
  };

  const rotateSelected = (degreesToAdd: number) => {
    if (!file) return;
    setRotations((prev) => {
      const updated = { ...prev };
      for (const pageIdx of selectedPages) {
        updated[pageIdx] = ((updated[pageIdx] || 0) + degreesToAdd + 360) % 360;
      }
      return updated;
    });
  };

  const handleApplyRotation = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const bytes = await rotatePdf(file.bytes, rotations);
      setResultBytes(bytes);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to rotate PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setRotations({});
    setSelectedPages([]);
    setResultBytes(null);
    setErrorMessage(null);
  };

  const handleDownload = (customFilename?: string) => {
    if (resultBytes) {
      downloadBytes(resultBytes, customFilename || (file ? `rotated-${file.name}` : "rotated.pdf"));
    }
  };

  return (
    <ToolPageLayout
      toolId="rotate"
      toolName="Rotate PDF"
      description="Permanently adjust page orientation by 90°, 180°, or 270°. Select individual pages or rotate the whole document at once."
    >
      {resultBytes ? (
        <ResultCard
          filename={file ? `rotated-${file.name}` : "rotated.pdf"}
          filesize={resultBytes.byteLength}
          pdfBytes={resultBytes}
          notes="Orientation saved successfully into a newly generated document."
          onDownload={handleDownload}
          onReset={handleReset}
        />
      ) : !file ? (
        <DropZone
          accept=".pdf"
          multiple={false}
          title="Drop your PDF file here"
          subtitle="or browse to select a document to rotate"
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
                  {formatFileSize(file.size)} · {file.pageCount} pages · {selectedPages.length} selected
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

          {/* Rotation Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-4">
            <span className="text-xs font-semibold text-foreground">
              Rotate Selected ({selectedPages.length} pages):
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => rotateSelected(-90)}
                disabled={selectedPages.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>90° Left</span>
              </button>
              <button
                type="button"
                onClick={() => rotateSelected(90)}
                disabled={selectedPages.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40"
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span>90° Right</span>
              </button>
              <button
                type="button"
                onClick={() => rotateSelected(180)}
                disabled={selectedPages.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40"
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span>180° Flip</span>
              </button>
            </div>
          </div>

          {/* Interactive Thumbnails */}
          <PageThumbnailGrid
            pdfBytes={file.bytes}
            pageCount={file.pageCount}
            rotations={rotations}
            selectedPages={selectedPages}
            onToggleSelect={handleToggleSelectPage}
            onRotatePage={rotateSinglePage}
            selectable={true}
            rotatable={true}
          />

          {errorMessage && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              {errorMessage}
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center gap-3 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Saving rotated document locally...</span>
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
              onClick={handleApplyRotation}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:opacity-50"
            >
              <RotateCw className="h-4 w-4" />
              <span>Save & Download PDF</span>
            </button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
