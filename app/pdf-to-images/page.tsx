"use client";

import { useState } from "react";
import { Image as ImageIcon, Loader2, FileText, Download, Archive, Check } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { convertPdfToImages, createImagesZip, ConvertedImagePage } from "@/lib/pdf/to-images";
import { getPdfInfo } from "@/lib/pdf/pdf-loader";
import { downloadBlob, downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function PdfToImagesPage() {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    bytes: Uint8Array;
    pageCount: number;
  } | null>(null);

  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [scale, setScale] = useState<number>(1.5); // 1.0 = standard, 1.5 = high, 2.0 = ultra
  const [rangeInput, setRangeInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [convertedImages, setConvertedImages] = useState<ConvertedImagePage[] | null>(null);

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

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const results = await convertPdfToImages(
        file.bytes,
        file.name,
        {
          format,
          scale,
          quality: 0.9,
          rangeStr: rangeInput.trim() || undefined,
        },
        (curr, total) => {
          setProgress({ current: curr, total });
        }
      );
      setConvertedImages(results);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to convert PDF pages to images.");
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleDownloadAllZip = async () => {
    if (!convertedImages || !file) return;
    try {
      const zipName = `${file.name.replace(/\.pdf$/i, "")}-images.zip`;
      const zip = await createImagesZip(convertedImages, zipName);
      downloadBytes(zip.bytes, zip.filename, "application/zip");
    } catch (err: any) {
      setErrorMessage("Failed to generate ZIP bundle.");
    }
  };

  const handleDownloadSingle = (img: ConvertedImagePage) => {
    downloadBlob(img.blob, img.filename);
  };

  const handleReset = () => {
    if (convertedImages) {
      convertedImages.forEach((img) => URL.revokeObjectURL(img.dataUrl));
    }
    setFile(null);
    setConvertedImages(null);
    setErrorMessage(null);
    setRangeInput("");
  };

  return (
    <ToolPageLayout
      toolId="pdf-to-images"
      toolName="PDF to Images"
      description="Convert PDF pages into crisp PNG or JPG images directly in your browser. Download pages individually or packaged as a convenient ZIP file."
    >
      {convertedImages ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Converted Images ({convertedImages.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                Click any image to download individually, or save all pages as a ZIP.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadAllZip}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover"
              >
                <Archive className="h-4 w-4" />
                <span>Download All (ZIP)</span>
              </button>
              <button
                onClick={handleReset}
                className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
              >
                Convert Another
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {convertedImages.map((img) => (
              <div
                key={img.pageNumber}
                className="group flex flex-col justify-between rounded-xl border border-border bg-white p-2 shadow-sm transition hover:border-foreground/30"
              >
                <div className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-lg bg-muted/20">
                  <img
                    src={img.dataUrl}
                    alt={`Page ${img.pageNumber}`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between px-1">
                  <span className="text-xs font-medium text-foreground">
                    Page {img.pageNumber}
                  </span>
                  <button
                    onClick={() => handleDownloadSingle(img)}
                    title="Download this image"
                    className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : !file ? (
        <DropZone
          accept=".pdf"
          multiple={false}
          title="Drop your PDF file here"
          subtitle="or browse to convert pages into images"
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

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-foreground">
                Output Format
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat("png")}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    format === "png"
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white text-foreground hover:bg-muted"
                  }`}
                >
                  PNG (Lossless)
                </button>
                <button
                  type="button"
                  onClick={() => setFormat("jpeg")}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    format === "jpeg"
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white text-foreground hover:bg-muted"
                  }`}
                >
                  JPG (Compact)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                Resolution / Quality
              </label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setScale(1.0)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    scale === 1.0
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white text-foreground hover:bg-muted"
                  }`}
                >
                  1x (72 DPI)
                </button>
                <button
                  type="button"
                  onClick={() => setScale(1.5)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    scale === 1.5
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white text-foreground hover:bg-muted"
                  }`}
                >
                  1.5x (110 DPI)
                </button>
                <button
                  type="button"
                  onClick={() => setScale(2.0)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    scale === 2.0
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white text-foreground hover:bg-muted"
                  }`}
                >
                  2x (150 DPI)
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <label className="block text-xs font-semibold text-foreground">
              Pages to Convert (Optional)
            </label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Leave blank to convert all {file.pageCount} pages, or specify ranges like <code className="bg-muted px-1 py-0.5 rounded">1-3, 5</code>.
            </p>
            <input
              type="text"
              value={rangeInput}
              onChange={(e) => setRangeInput(e.target.value)}
              placeholder="e.g. 1-5 (all pages if empty)"
              className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                Rendering pages to images...{" "}
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
              onClick={handleConvert}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:opacity-50"
            >
              <ImageIcon className="h-4 w-4" />
              <span>Convert to Images</span>
            </button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
