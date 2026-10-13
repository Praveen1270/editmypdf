"use client";

import { useState } from "react";
import { Hash, Loader2, FileText } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { ResultCard } from "@/components/tools/ResultCard";
import {
  addPageNumbers,
  PositionVertical,
  AlignmentHorizontal,
} from "@/lib/pdf/page-numbers";
import { getPdfInfo } from "@/lib/pdf/pdf-loader";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function AddPageNumbersPage() {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    bytes: Uint8Array;
    pageCount: number;
  } | null>(null);

  const [position, setPosition] = useState<PositionVertical>("bottom");
  const [alignment, setAlignment] = useState<AlignmentHorizontal>("center");
  const [formatTemplate, setFormatTemplate] = useState("Page {n} of {total}");
  const [startNumber, setStartNumber] = useState(1);
  const [fontSize, setFontSize] = useState(11);
  const [margin, setMargin] = useState(30);
  const [skipFirstPage, setSkipFirstPage] = useState(false);

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

  const handleApplyNumbers = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const bytes = await addPageNumbers(file.bytes, {
        position,
        alignment,
        format: formatTemplate,
        startNumber,
        fontSize,
        margin,
        skipFirstPage,
      });
      setResultBytes(bytes);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to add page numbers.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResultBytes(null);
    setErrorMessage(null);
  };

  const handleDownload = () => {
    if (resultBytes && file) {
      downloadBytes(resultBytes, `numbered-${file.name}`);
    }
  };

  const samplePreview = formatTemplate
    .replace(/\{n\}/g, String(startNumber))
    .replace(/\{total\}/g, String(file ? file.pageCount : 10));

  return (
    <ToolPageLayout
      toolId="page-numbers"
      toolName="Add Page Numbers"
      description="Add customizable page numbering to your PDF with fine-tuned placement, format patterns, and cover page exclusions."
    >
      {resultBytes ? (
        <ResultCard
          filename={`numbered-${file?.name}`}
          filesize={resultBytes.byteLength}
          notes={`Added page numbers across ${file?.pageCount} pages.`}
          onDownload={handleDownload}
          onReset={handleReset}
        />
      ) : !file ? (
        <DropZone
          accept=".pdf"
          multiple={false}
          title="Drop your PDF file here"
          subtitle="or browse to select a document to number"
          onFilesSelected={handleFileSelected}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-4">
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
            {/* Settings */}
            <div className="space-y-4 rounded-xl border border-border bg-white p-5">
              <h3 className="text-sm font-semibold text-foreground">
                Numbering Settings
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground">
                    Position
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as PositionVertical)}
                    className="mt-1.5 w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="bottom">Bottom of page</option>
                    <option value="top">Top of page</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground">
                    Alignment
                  </label>
                  <select
                    value={alignment}
                    onChange={(e) => setAlignment(e.target.value as AlignmentHorizontal)}
                    className="mt-1.5 w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                    <option value="left">Left</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground">
                  Format Template
                </label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    type="text"
                    value={formatTemplate}
                    onChange={(e) => setFormatTemplate(e.target.value)}
                    className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <select
                    onChange={(e) => e.target.value && setFormatTemplate(e.target.value)}
                    className="rounded-lg border border-border bg-white px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Presets</option>
                    <option value="Page {n} of {total}">Page &#123;n&#125; of &#123;total&#125;</option>
                    <option value="{n} / {total}">&#123;n&#125; / &#123;total&#125;</option>
                    <option value="Page {n}">Page &#123;n&#125;</option>
                    <option value="{n}">&#123;n&#125;</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground">
                    Start At
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={startNumber}
                    onChange={(e) => setStartNumber(parseInt(e.target.value, 10) || 1)}
                    className="mt-1.5 w-full rounded-lg border border-border px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground">
                    Font Size
                  </label>
                  <input
                    type="number"
                    min={8}
                    max={24}
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value, 10) || 11)}
                    className="mt-1.5 w-full rounded-lg border border-border px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground">
                    Margin (pt)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={margin}
                    onChange={(e) => setMargin(parseInt(e.target.value, 10) || 30)}
                    className="mt-1.5 w-full rounded-lg border border-border px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={skipFirstPage}
                    onChange={(e) => setSkipFirstPage(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span>Skip first page (e.g. cover page)</span>
                </label>
              </div>
            </div>

            {/* Live Visual Placement Mockup */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/20 p-6">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Placement Preview
              </span>
              <div className="relative aspect-[3/4] w-48 rounded-lg border-2 border-border bg-white shadow-sm p-4 flex flex-col justify-between">
                <div
                  className={`text-[10px] text-foreground font-mono transition-all ${
                    position === "top" ? "opacity-100" : "opacity-0"
                  } ${
                    alignment === "left"
                      ? "text-left"
                      : alignment === "center"
                      ? "text-center"
                      : "text-right"
                  }`}
                >
                  {samplePreview}
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <div className="w-full space-y-2 opacity-20">
                    <div className="h-2 bg-muted-foreground rounded w-3/4 mx-auto" />
                    <div className="h-2 bg-muted-foreground rounded w-5/6 mx-auto" />
                    <div className="h-2 bg-muted-foreground rounded w-2/3 mx-auto" />
                  </div>
                </div>

                <div
                  className={`text-[10px] text-foreground font-mono transition-all ${
                    position === "bottom" ? "opacity-100" : "opacity-0"
                  } ${
                    alignment === "left"
                      ? "text-left"
                      : alignment === "center"
                      ? "text-center"
                      : "text-right"
                  }`}
                >
                  {samplePreview}
                </div>
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
              <span>Stamping page numbers locally...</span>
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
              onClick={handleApplyNumbers}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:opacity-50"
            >
              <Hash className="h-4 w-4" />
              <span>Apply Page Numbers</span>
            </button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
