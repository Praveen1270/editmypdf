"use client";

import { useState } from "react";
import {
  LayoutGrid,
  ArrowLeft,
  ArrowRight,
  Copy,
  Trash2,
  RotateCw,
  Loader2,
  FileText,
  Save,
} from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { ResultCard } from "@/components/tools/ResultCard";
import { organizePdf, OrganizedPageItem } from "@/lib/pdf/organize";
import { getPdfInfo } from "@/lib/pdf/pdf-loader";
import { PageThumbnailGrid } from "@/components/pdf/PageThumbnailGrid";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function OrganizePdfPage() {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    bytes: Uint8Array;
    originalPageCount: number;
  } | null>(null);

  const [pageItems, setPageItems] = useState<OrganizedPageItem[]>([]);
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
        originalPageCount: info.pageCount,
      });

      // Initial sequential page list
      const initialItems: OrganizedPageItem[] = Array.from(
        { length: info.pageCount },
        (_, i) => ({
          id: Math.random().toString(36).substring(2, 9),
          originalIndex: i,
          rotation: 0,
        })
      );
      setPageItems(initialItems);
    } catch (err: any) {
      setErrorMessage(`Failed to read PDF: ${err?.message || "File error"}`);
    }
  };

  const moveLeft = (index: number) => {
    if (index === 0) return;
    setPageItems((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const moveRight = (index: number) => {
    if (index === pageItems.length - 1) return;
    setPageItems((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const duplicatePage = (index: number) => {
    setPageItems((prev) => {
      const copy = [...prev];
      const itemToDup = copy[index];
      const newItem: OrganizedPageItem = {
        id: Math.random().toString(36).substring(2, 9),
        originalIndex: itemToDup.originalIndex,
        rotation: itemToDup.rotation,
      };
      copy.splice(index + 1, 0, newItem);
      return copy;
    });
  };

  const deletePage = (index: number) => {
    if (pageItems.length <= 1) {
      setErrorMessage("You must keep at least one page in the document.");
      return;
    }
    setPageItems((prev) => prev.filter((_, i) => i !== index));
  };

  const rotatePage = (index: number) => {
    setPageItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        rotation: (copy[index].rotation + 90) % 360,
      };
      return copy;
    });
  };

  const handleSave = async () => {
    if (!file || pageItems.length === 0) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const bytes = await organizePdf(file.bytes, pageItems, (curr, total) => {
        setProgress({ current: curr, total });
      });
      setResultBytes(bytes);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to organize PDF pages.");
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPageItems([]);
    setResultBytes(null);
    setErrorMessage(null);
  };

  const handleDownload = () => {
    if (resultBytes && file) {
      downloadBytes(resultBytes, `organized-${file.name}`);
    }
  };

  return (
    <ToolPageLayout
      toolId="organize"
      toolName="Organize PDF Pages"
      description="View page thumbnails and reorder, duplicate, rotate, or delete individual pages with live visual preview."
    >
      {resultBytes ? (
        <ResultCard
          filename={`organized-${file?.name}`}
          filesize={resultBytes.byteLength}
          notes={`Successfully reorganized document to ${pageItems.length} pages.`}
          onDownload={handleDownload}
          onReset={handleReset}
        />
      ) : !file ? (
        <DropZone
          accept=".pdf"
          multiple={false}
          title="Drop your PDF here"
          subtitle="or browse to organize, reorder, or delete pages"
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
                  {formatFileSize(file.size)} · Original: {file.originalPageCount} pages · Current: {pageItems.length} pages
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

          {/* Visual page organizer grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {pageItems.map((item, idx) => (
              <div
                key={item.id}
                className="group flex flex-col justify-between rounded-xl border border-border bg-white p-2.5 shadow-sm transition hover:border-foreground/30"
              >
                {/* Header label */}
                <div className="flex items-center justify-between px-1 pb-1 text-xs">
                  <span className="font-bold text-foreground">Page {idx + 1}</span>
                  <span className="text-[10px] text-muted-foreground">
                    (orig #{item.originalIndex + 1})
                  </span>
                </div>

                {/* Thumbnail representation */}
                <div className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/20">
                  <div
                    style={{ transform: `rotate(${item.rotation}deg)` }}
                    className="flex h-full w-full items-center justify-center transition-transform"
                  >
                    <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
                      <FileText className="h-8 w-8 text-muted-foreground/60" />
                      <span className="text-xs font-mono">#{item.originalIndex + 1}</span>
                      {item.rotation > 0 && (
                        <span className="text-[10px] font-semibold text-primary">
                          {item.rotation}°
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Per-page action bar */}
                <div className="mt-2 flex items-center justify-between gap-1 border-t border-border pt-2">
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveLeft(idx)}
                      disabled={idx === 0}
                      title="Move left"
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveRight(idx)}
                      disabled={idx === pageItems.length - 1}
                      title="Move right"
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => rotatePage(idx)}
                      title="Rotate 90° clockwise"
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicatePage(idx)}
                      title="Duplicate page"
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePage(idx)}
                      title="Delete page"
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
                Compiling organized PDF...{" "}
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
              onClick={handleSave}
              disabled={isProcessing || pageItems.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>Save Organized PDF ({pageItems.length} pages)</span>
            </button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
