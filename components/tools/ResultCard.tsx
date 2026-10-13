"use client";

import React, { useState } from "react";
import { CheckCircle2, Download, RotateCcw, FileText, Archive, Eye } from "lucide-react";
import { formatFileSize } from "@/lib/utils";
import { PdfOutputViewer } from "@/components/pdf/PdfOutputViewer";

export interface ResultCardProps {
  filename: string;
  filesize?: number;
  reductionPercentage?: number;
  notes?: string;
  onDownload: (customFilename?: string) => void;
  onReset: () => void;
  // Enhanced Output Preview Props:
  pdfBytes?: Uint8Array | null;
  password?: string;
  textContent?: string | null;
  downloadButtonLabel?: string;
  fileExtension?: string;
}

export function ResultCard({
  filename,
  filesize,
  reductionPercentage,
  notes,
  onDownload,
  onReset,
  pdfBytes,
  password,
  textContent,
  downloadButtonLabel,
  fileExtension,
}: ResultCardProps) {
  // Infer file extension if not provided
  const detectedExt =
    fileExtension ||
    (filename.includes(".")
      ? filename.slice(filename.lastIndexOf("."))
      : ".pdf");

  const [userFilename, setUserFilename] = useState<string>(filename);

  // Sanitizes filename and guarantees correct extension
  const getSanitizedFilename = (): string => {
    let clean = userFilename.replace(/[\\/:*?"<>|\x00-\x1F]/g, "").trim();
    if (!clean) {
      clean = filename.replace(/\.[^/.]+$/, "") || "processed-document";
    }
    const ext = detectedExt.startsWith(".") ? detectedExt : `.${detectedExt}`;
    if (!clean.toLowerCase().endsWith(ext.toLowerCase())) {
      clean = `${clean}${ext}`;
    }
    return clean;
  };

  const handleExport = () => {
    const finalName = getSanitizedFilename();
    onDownload(finalName);
  };

  const isZip = detectedExt.toLowerCase() === ".zip";

  return (
    <div className="rounded-2xl border border-border bg-white p-4 sm:p-8 shadow-sm text-center animate-in fade-in-50 duration-300">
      {/* Success Badge */}
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
        <CheckCircle2 className="h-6 w-6" />
      </div>

      <h3 className="mt-3 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        Processing Complete!
      </h3>
      <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
        Your document was processed 100% locally in your browser. Review the output below before exporting.
      </p>

      {/* 1. ACTUAL GENERATED OUTPUT PREVIEW */}
      {pdfBytes && pdfBytes.byteLength > 0 ? (
        <div className="mt-6 text-left">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-primary" />
              <span>Generated Document Preview</span>
            </span>
            <span className="text-[11px] text-muted-foreground">
              Interactive local preview
            </span>
          </div>
          <PdfOutputViewer pdfBytes={pdfBytes} password={password} />
        </div>
      ) : textContent ? (
        <div className="mt-6 text-left">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-primary" />
              <span>Generated Output Preview</span>
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              Plain Text
            </span>
          </div>
          <textarea
            readOnly
            value={textContent}
            rows={10}
            className="w-full rounded-xl border border-border bg-muted/20 p-4 font-mono text-xs text-foreground focus:outline-none leading-relaxed resize-y"
          />
        </div>
      ) : null}

      {/* 2. File Summary Box */}
      <div className="mx-auto mt-6 flex max-w-lg items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3 text-left">
        <div className="flex items-center gap-3 overflow-hidden">
          {isZip ? (
            <Archive className="h-5 w-5 shrink-0 text-amber-600" />
          ) : (
            <FileText className="h-5 w-5 shrink-0 text-primary" />
          )}
          <div className="overflow-hidden">
            <p className="truncate text-xs sm:text-sm font-semibold text-foreground">
              {getSanitizedFilename()}
            </p>
            {filesize !== undefined && (
              <p className="text-[11px] text-muted-foreground">
                <span>{formatFileSize(filesize)}</span>
                {reductionPercentage !== undefined && (
                  reductionPercentage > 0 ? (
                    <span className="ml-1.5 font-medium text-success">
                      ({reductionPercentage}% smaller)
                    </span>
                  ) : reductionPercentage === 0 ? (
                    <span className="ml-1.5 font-medium text-muted-foreground">
                      (Already optimized)
                    </span>
                  ) : null
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {notes && (
        <p className="mx-auto mt-2 max-w-lg text-xs text-muted-foreground">
          {notes}
        </p>
      )}

      {/* 3. EDITABLE OUTPUT FILENAME */}
      <div className="mx-auto mt-6 max-w-lg text-left">
        <label
          htmlFor="output-file-name"
          className="block text-xs font-semibold text-foreground mb-1"
        >
          File name
        </label>
        <div className="relative">
          <input
            id="output-file-name"
            type="text"
            value={userFilename}
            onChange={(e) => setUserFilename(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2 text-xs sm:text-sm text-foreground shadow-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            placeholder={filename}
          />
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Output will be saved with extension <code className="font-mono text-foreground font-semibold">{detectedExt}</code>.
        </p>
      </div>

      {/* 4. ACTIONS: Export & Start Again */}
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <Download className="h-4 w-4" />
          <span>{downloadButtonLabel || (isZip ? "Export ZIP" : "Export PDF")}</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-border"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Start Again</span>
        </button>
      </div>
    </div>
  );
}
