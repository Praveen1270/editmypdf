"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown, Trash2, Plus, Loader2, Files, GripVertical } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { ResultCard } from "@/components/tools/ResultCard";
import { mergePDFs, MergeSourceFile } from "@/lib/pdf/merge";
import { getPdfInfo } from "@/lib/pdf/pdf-loader";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function MergePdfPage() {
  const [files, setFiles] = useState<MergeSourceFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [outputFilename, setOutputFilename] = useState("merged.pdf");

  const handleFilesSelected = async (newFiles: File[]) => {
    setErrorMessage(null);
    const addedItems: MergeSourceFile[] = [];

    for (const f of newFiles) {
      try {
        const buffer = await f.arrayBuffer();
        const uint8 = new Uint8Array(buffer);
        let count = 0;
        try {
          const info = await getPdfInfo(uint8);
          count = info.pageCount;
        } catch {
          count = 1;
        }

        addedItems.push({
          id: Math.random().toString(36).substring(2, 9),
          name: f.name,
          bytes: uint8,
          size: f.size,
          pageCount: count,
        });
      } catch (err: any) {
        setErrorMessage(`Failed to read "${f.name}": ${err?.message || "File error"}`);
      }
    }

    setFiles((prev) => [...prev, ...addedItems]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setErrorMessage("Please select at least 2 PDF files to merge.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const merged = await mergePDFs(files, (curr, total) => {
        setProgress({ current: curr, total });
      });
      setResultBytes(merged);
      setOutputFilename(`merged-${Date.now().toString().slice(-4)}.pdf`);
    } catch (err: any) {
      setErrorMessage(err?.message || "An error occurred while merging the PDF files.");
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResultBytes(null);
    setErrorMessage(null);
  };

  const handleDownload = () => {
    if (resultBytes) {
      downloadBytes(resultBytes, outputFilename);
    }
  };

  return (
    <ToolPageLayout
      toolId="merge"
      toolName="Merge PDF"
      description="Combine multiple PDF files into one document in your exact preferred order. 100% processed locally on your machine."
    >
      {resultBytes ? (
        <ResultCard
          filename={outputFilename}
          filesize={resultBytes.byteLength}
          notes={`Successfully combined ${files.length} documents into one PDF.`}
          onDownload={handleDownload}
          onReset={handleReset}
        />
      ) : files.length === 0 ? (
        <DropZone
          accept=".pdf"
          multiple={true}
          title="Drop your PDF files here"
          subtitle="or browse to select multiple files"
          onFilesSelected={handleFilesSelected}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Documents to Merge ({files.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                Reorder files using the arrow buttons to arrange page order.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-xs font-medium text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-2">
            {files.map((file, idx) => (
              <div
                key={file.id}
                className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-sm shadow-sm transition hover:border-muted-foreground/30"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {idx + 1}
                  </span>
                  <div className="overflow-hidden">
                    <p className="truncate font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} · {file.pageCount} {file.pageCount === 1 ? "page" : "pages"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    title="Move up"
                    className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 rounded hover:bg-muted"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === files.length - 1}
                    title="Move down"
                    className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 rounded hover:bg-muted"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeFile(file.id)}
                    title="Remove file"
                    className="p-1.5 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add more files dropzone */}
          <div className="pt-2">
            <DropZone
              accept=".pdf"
              multiple={true}
              title="Add more PDFs"
              subtitle="drop more files here"
              onFilesSelected={handleFilesSelected}
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
                Merging PDFs locally...{" "}
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
              onClick={handleMerge}
              disabled={isProcessing || files.length < 2}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:opacity-50"
            >
              <Files className="h-4 w-4" />
              <span>Merge {files.length} PDFs</span>
            </button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
