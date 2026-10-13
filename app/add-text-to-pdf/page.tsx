"use client";

import { useState } from "react";
import { Type, Loader2, FileText, Info } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { ResultCard } from "@/components/tools/ResultCard";
import { addTextToPdf } from "@/lib/pdf/add-text";
import { getPdfInfo } from "@/lib/pdf/pdf-loader";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function AddTextToPdfPage() {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    bytes: Uint8Array;
    pageCount: number;
  } | null>(null);

  const [text, setText] = useState("");
  const [targetMode, setTargetMode] = useState<"all" | "single">("all");
  const [targetPage, setTargetPage] = useState<number>(1);
  const [positionPreset, setPositionPreset] = useState<"header" | "footer" | "center" | "custom">("footer");
  const [customX, setCustomX] = useState<number>(50);
  const [customY, setCustomY] = useState<number>(50);
  const [fontSize, setFontSize] = useState<number>(12);
  const [colorHex, setColorHex] = useState<string>("#111111");

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

  const handleApply = async () => {
    if (!file) return;
    if (!text.trim()) {
      setErrorMessage("Please enter text to add.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const pageIndices =
        targetMode === "all"
          ? Array.from({ length: file.pageCount }, (_, i) => i)
          : [Math.max(0, Math.min(targetPage - 1, file.pageCount - 1))];

      const bytes = await addTextToPdf(file.bytes, {
        text,
        pageIndices,
        positionPreset: positionPreset as any,
        x: customX,
        y: customY,
        fontSize,
        colorHex,
      });

      setResultBytes(bytes);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to add text to PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResultBytes(null);
    setText("");
    setErrorMessage(null);
  };

  const handleDownload = (customFilename?: string) => {
    if (resultBytes) {
      downloadBytes(resultBytes, customFilename || (file ? `text-added-${file.name}` : "text-added.pdf"));
    }
  };

  return (
    <ToolPageLayout
      toolId="add-text"
      toolName="Add Text to PDF"
      description="Place text notes, headers, footers, or annotations on PDF pages. Customize position, font size, and text color."
    >
      {resultBytes ? (
        <ResultCard
          filename={file ? `text-added-${file.name}` : "text-added.pdf"}
          filesize={resultBytes.byteLength}
          pdfBytes={resultBytes}
          notes={`Successfully stamped text overlay onto ${file?.name}.`}
          onDownload={handleDownload}
          onReset={handleReset}
        />
      ) : !file ? (
        <DropZone
          accept=".pdf"
          multiple={false}
          title="Drop your PDF here"
          subtitle="or browse to add custom text overlays"
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

          {/* Important distinction notice */}
          <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Text Overlay vs Text Editing:</strong> This tool places new text annotations on top of the document. PDF is a fixed-layout format, so underlying text cannot be reflowed or edited in-place.
            </p>
          </div>

          {/* Configuration Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground">
                  Text to Insert
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. APPROVED, Internal Note, or date"
                  className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground">
                    Target Pages
                  </label>
                  <select
                    value={targetMode}
                    onChange={(e) => setTargetMode(e.target.value as any)}
                    className="mt-1.5 w-full rounded-lg border border-border bg-surface-base px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-focus"
                  >
                    <option value="all">All Pages ({file.pageCount})</option>
                    <option value="single">Specific Page</option>
                  </select>
                </div>

                {targetMode === "single" && (
                  <div>
                    <label className="block text-xs font-semibold text-foreground">
                      Page Number (1 - {file.pageCount})
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={file.pageCount}
                      value={targetPage}
                      onChange={(e) => setTargetPage(parseInt(e.target.value) || 1)}
                      className="mt-1.5 w-full rounded-lg border border-border bg-surface-base px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-focus"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground">
                  Position Preset
                </label>
                <select
                  value={positionPreset}
                  onChange={(e) => setPositionPreset(e.target.value as any)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-surface-base px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-focus"
                >
                  <option value="footer">Bottom Left / Footer (X: 54, Y: 40)</option>
                  <option value="header">Top Left / Header (X: 54, Y: 750)</option>
                  <option value="center">Center of Page</option>
                  <option value="custom">Custom Coordinates (X, Y)</option>
                </select>
              </div>

              {positionPreset === "custom" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground">X Coordinate (pt from left)</label>
                    <input
                      type="number"
                      value={customX}
                      onChange={(e) => setCustomX(parseInt(e.target.value) || 0)}
                      className="mt-1 w-full rounded-lg border border-border px-3 py-1.5 text-xs text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground">Y Coordinate (pt from bottom)</label>
                    <input
                      type="number"
                      value={customY}
                      onChange={(e) => setCustomY(parseInt(e.target.value) || 0)}
                      className="mt-1 w-full rounded-lg border border-border px-3 py-1.5 text-xs text-foreground"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground">
                    Font Size (pt)
                  </label>
                  <input
                    type="number"
                    min={8}
                    max={72}
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value) || 12)}
                    className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground">
                    Text Color
                  </label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      type="color"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      className="h-8 w-12 cursor-pointer rounded border border-border p-0.5"
                    />
                    <span className="font-mono text-xs text-foreground">{colorHex}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
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
              onClick={handleApply}
              disabled={isProcessing || !text.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-action-primary px-6 py-2 text-sm font-semibold text-action-primary-text shadow-sm transition hover:opacity-90 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Applying Text...</span>
                </>
              ) : (
                <>
                  <Type className="h-4 w-4" />
                  <span>Apply Text to PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
