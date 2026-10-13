"use client";

import { useState } from "react";
import { Stamp, Loader2, FileText } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { ResultCard } from "@/components/tools/ResultCard";
import { addWatermark, WatermarkPreset, WatermarkOptions } from "@/lib/pdf/watermark";
import { getPdfInfo } from "@/lib/pdf/pdf-loader";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function WatermarkPdfPage() {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    bytes: Uint8Array;
    pageCount: number;
  } | null>(null);

  const [text, setText] = useState("CONFIDENTIAL");
  const [preset, setPreset] = useState<WatermarkPreset>("diagonal");
  const [opacity, setOpacity] = useState(0.25);
  const [fontSize, setFontSize] = useState(48);
  const [rotation, setRotation] = useState(45);
  const [colorHex, setColorHex] = useState("#DC2626");
  const [allPages, setAllPages] = useState(true);
  const [pageRangeStr, setPageRangeStr] = useState("");

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

  const handleApplyPreset = (p: WatermarkPreset) => {
    setPreset(p);
    if (p === "diagonal") {
      setRotation(45);
      setFontSize(48);
    } else if (p === "center") {
      setRotation(0);
      setFontSize(48);
    } else if (p === "footer") {
      setRotation(0);
      setFontSize(14);
    }
  };

  const handleApplyWatermark = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const bytes = await addWatermark(file.bytes, {
        text,
        preset,
        opacity,
        fontSize,
        rotation,
        allPages,
        pageRangeStr: allPages ? undefined : pageRangeStr,
        colorHex,
      });
      setResultBytes(bytes);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to add watermark.");
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
      downloadBytes(resultBytes, customFilename || (file ? `watermarked-${file.name}` : "watermarked.pdf"));
    }
  };

  return (
    <ToolPageLayout
      toolId="watermark"
      toolName="Watermark PDF"
      description="Add customizable text watermarks across every page or specific ranges. Adjust opacity, angle, colors, and presets with live visual preview."
    >
      {resultBytes ? (
        <ResultCard
          filename={file ? `watermarked-${file.name}` : "watermarked.pdf"}
          filesize={resultBytes.byteLength}
          pdfBytes={resultBytes}
          notes={`Successfully stamped watermark "${text}" onto PDF.`}
          onDownload={handleDownload}
          onReset={handleReset}
        />
      ) : !file ? (
        <DropZone
          accept=".pdf"
          multiple={false}
          title="Drop your PDF file here"
          subtitle="or browse to select a document to watermark"
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
            {/* Controls */}
            <div className="space-y-4 rounded-xl border border-border bg-white p-5">
              <h3 className="text-sm font-semibold text-foreground">
                Watermark Settings
              </h3>

              <div>
                <label className="block text-xs font-semibold text-foreground">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. CONFIDENTIAL, DRAFT"
                  className="mt-1.5 w-full rounded-lg border border-border px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground">
                  Position Presets
                </label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("diagonal")}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                      preset === "diagonal"
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-white text-foreground hover:bg-muted"
                    }`}
                  >
                    Diagonal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("center")}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                      preset === "center"
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-white text-foreground hover:bg-muted"
                    }`}
                  >
                    Centered
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("footer")}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                      preset === "footer"
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-white text-foreground hover:bg-muted"
                    }`}
                  >
                    Footer
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground">
                    Opacity ({Math.round(opacity * 100)}%)
                  </label>
                  <input
                    type="range"
                    min={0.05}
                    max={1.0}
                    step={0.05}
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="mt-2 w-full accent-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground">
                    Font Size ({fontSize}pt)
                  </label>
                  <input
                    type="range"
                    min={12}
                    max={96}
                    step={2}
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                    className="mt-2 w-full accent-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground">
                    Rotation ({rotation}°)
                  </label>
                  <input
                    type="range"
                    min={-90}
                    max={90}
                    step={5}
                    value={rotation}
                    disabled={preset === "footer"}
                    onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                    className="mt-2 w-full accent-primary disabled:opacity-40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground">
                    Color
                  </label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      type="color"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      className="h-8 w-12 cursor-pointer rounded border border-border p-0.5"
                    />
                    <span className="text-xs font-mono text-muted-foreground">{colorHex}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="pageSelection"
                      checked={allPages}
                      onChange={() => setAllPages(true)}
                      className="text-primary focus:ring-primary"
                    />
                    <span>All Pages</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="pageSelection"
                      checked={!allPages}
                      onChange={() => setAllPages(false)}
                      className="text-primary focus:ring-primary"
                    />
                    <span>Custom Range</span>
                  </label>
                </div>
                {!allPages && (
                  <input
                    type="text"
                    value={pageRangeStr}
                    onChange={(e) => setPageRangeStr(e.target.value)}
                    placeholder="e.g. 1-3, 5"
                    className="mt-2 w-full rounded-lg border border-border px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                )}
              </div>
            </div>

            {/* Live Visual Preview */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/20 p-6">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Live Stamp Preview
              </span>
              <div className="relative aspect-[3/4] w-52 rounded-lg border-2 border-border bg-white shadow-sm p-4 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-15">
                  <div className="h-2 bg-muted-foreground rounded w-1/3" />
                  <div className="space-y-2">
                    <div className="h-1.5 bg-muted-foreground rounded w-full" />
                    <div className="h-1.5 bg-muted-foreground rounded w-5/6" />
                    <div className="h-1.5 bg-muted-foreground rounded w-4/5" />
                    <div className="h-1.5 bg-muted-foreground rounded w-full" />
                  </div>
                  <div className="h-1.5 bg-muted-foreground rounded w-1/4" />
                </div>

                <div
                  style={{
                    color: colorHex,
                    opacity: opacity,
                    transform: `rotate(${preset === "footer" ? 0 : rotation}deg)`,
                    fontSize: `${Math.max(10, fontSize / 3.5)}px`,
                  }}
                  className={`font-bold tracking-wider select-none text-center pointer-events-none transition-all ${
                    preset === "footer" ? "absolute bottom-3" : ""
                  }`}
                >
                  {text || "WATERMARK"}
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
              <span>Applying watermark locally...</span>
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
              onClick={handleApplyWatermark}
              disabled={isProcessing || !text.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:opacity-50"
            >
              <Stamp className="h-4 w-4" />
              <span>Add Watermark</span>
            </button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
