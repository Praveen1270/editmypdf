"use client";

import { useState, useEffect } from "react";
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
import { getPdfInfo, renderAllThumbnails } from "@/lib/pdf/pdf-loader";
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
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [loadingThumbnails, setLoadingThumbnails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);

  // Progressive thumbnail rendering when file is loaded
  useEffect(() => {
    if (!file?.bytes) {
      setThumbnails({});
      return;
    }

    let isCancelled = false;
    setLoadingThumbnails(true);

    renderAllThumbnails(
      file.bytes,
      0.45,
      (pageIdx, dataUrl) => {
        if (!isCancelled) {
          setThumbnails((prev) => ({ ...prev, [pageIdx]: dataUrl }));
        }
      },
      () => isCancelled
    )
      .catch((err) => {
        console.error("Error rendering thumbnails:", err);
      })
      .finally(() => {
        if (!isCancelled) {
          setLoadingThumbnails(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [file?.bytes]);

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
    setThumbnails({});
    setResultBytes(null);
    setErrorMessage(null);
  };

  const handleDownload = (customFilename?: string) => {
    if (resultBytes) {
      downloadBytes(resultBytes, customFilename || (file ? `organized-${file.name}` : "organized.pdf"));
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
          filename={file ? `organized-${file.name}` : "organized.pdf"}
          filesize={resultBytes.byteLength}
          pdfBytes={resultBytes}
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white">
                <FileText className="h-5 w-5 stroke-[2]" />
              </div>
              <div>
                <p className="font-bold text-black dark:text-white text-sm">{file.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {formatFileSize(file.size)} · Original: {file.originalPageCount} pages · Current: {pageItems.length} pages
                  {loadingThumbnails && " · Rendering previews..."}
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white underline transition-colors"
            >
              Choose different file
            </button>
          </div>

          {/* Visual page organizer grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {pageItems.map((item, idx) => {
              const thumbnailSrc = thumbnails[item.originalIndex];

              return (
                <div
                  key={item.id}
                  className="group flex flex-col justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 shadow-xs transition hover:border-black dark:hover:border-white"
                >
                  {/* Header label */}
                  <div className="flex items-center justify-between px-1 pb-1.5 text-xs">
                    <span className="font-bold text-black dark:text-white">Page {idx + 1}</span>
                    <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                      (orig #{item.originalIndex + 1})
                    </span>
                  </div>

                  {/* Thumbnail representation — Real PDF Page Image */}
                  <div className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 shadow-inner">
                    {thumbnailSrc ? (
                      <div
                        style={{ transform: `rotate(${item.rotation}deg)` }}
                        className="flex h-full w-full items-center justify-center transition-transform duration-200 p-1"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumbnailSrc}
                          alt={`Page ${item.originalIndex + 1}`}
                          className="max-h-full max-w-full object-contain pointer-events-none select-none rounded shadow-xs"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1.5 p-4 text-zinc-400">
                        <Loader2 className="h-6 w-6 animate-spin text-black dark:text-white stroke-[2]" />
                        <span className="text-[10px] font-mono font-medium text-zinc-500 dark:text-zinc-400">
                          Loading #{item.originalIndex + 1}...
                        </span>
                      </div>
                    )}

                    {/* Rotation badge if rotated */}
                    {item.rotation > 0 && (
                      <div className="absolute top-1.5 right-1.5 rounded bg-black text-white dark:bg-white dark:text-black px-1.5 py-0.5 text-[10px] font-mono font-bold shadow-xs">
                        {item.rotation}°
                      </div>
                    )}
                  </div>

                  {/* Per-page action bar */}
                  <div className="mt-2.5 flex items-center justify-between gap-1 border-t border-zinc-100 dark:border-zinc-800 pt-2">
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveLeft(idx)}
                        disabled={idx === 0}
                        title="Move left"
                        className="rounded p-1 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white disabled:opacity-30 transition"
                      >
                        <ArrowLeft className="h-3.5 w-3.5 stroke-[2]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveRight(idx)}
                        disabled={idx === pageItems.length - 1}
                        title="Move right"
                        className="rounded p-1 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white disabled:opacity-30 transition"
                      >
                        <ArrowRight className="h-3.5 w-3.5 stroke-[2]" />
                      </button>
                    </div>

                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => rotatePage(idx)}
                        title="Rotate 90° clockwise"
                        className="rounded p-1 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition"
                      >
                        <RotateCw className="h-3.5 w-3.5 stroke-[2]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicatePage(idx)}
                        title="Duplicate page"
                        className="rounded p-1 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition"
                      >
                        <Copy className="h-3.5 w-3.5 stroke-[2]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePage(idx)}
                        title="Delete page"
                        className="rounded p-1 text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5 stroke-[2]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-600 dark:text-red-400 font-medium">
              {errorMessage}
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center gap-3 py-4 text-sm text-zinc-600 dark:text-zinc-400">
              <Loader2 className="h-5 w-5 animate-spin text-black dark:text-white stroke-[2]" />
              <span>
                Compiling organized PDF...{" "}
                {progress ? `(${progress.current} of ${progress.total})` : ""}
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={handleReset}
              disabled={isProcessing}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-xs font-bold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isProcessing || pageItems.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-black text-white dark:bg-white dark:text-black px-6 py-2.5 text-xs font-bold shadow-sm transition hover:opacity-90 disabled:opacity-50"
            >
              <Save className="h-4 w-4 stroke-[2]" />
              <span>Save Organized PDF ({pageItems.length} pages)</span>
            </button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
