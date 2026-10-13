"use client";

import { useState } from "react";
import { Palette, Loader2, FileText, Info } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { ResultCard } from "@/components/tools/ResultCard";
import { convertPdfToGrayscale } from "@/lib/pdf/grayscale";
import { getPdfInfo } from "@/lib/pdf/pdf-loader";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function PdfToGrayscalePage() {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    bytes: Uint8Array;
    pageCount: number;
  } | null>(null);

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
      const bytes = await convertPdfToGrayscale(file.bytes, (curr, total) => {
        setProgress({ current: curr, total });
      });
      setResultBytes(bytes);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to convert PDF to grayscale.");
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResultBytes(null);
    setErrorMessage(null);
  };

  const handleDownload = (customFilename?: string) => {
    if (resultBytes) {
      downloadBytes(resultBytes, customFilename || (file ? `grayscale-${file.name}` : "grayscale.pdf"));
    }
  };

  return (
    <ToolPageLayout
      toolId="pdf-to-grayscale"
      toolName="PDF to Grayscale"
      description="Convert color PDF documents to clean black-and-white grayscale directly in your browser. Perfect for saving printer toner and standardizing forms."
    >
      {resultBytes ? (
        <ResultCard
          filename={file ? `grayscale-${file.name}` : "grayscale.pdf"}
          filesize={resultBytes.byteLength}
          pdfBytes={resultBytes}
          notes={`Successfully converted ${file?.pageCount} pages to monochrome grayscale.`}
          onDownload={handleDownload}
          onReset={handleReset}
        />
      ) : !file ? (
        <DropZone
          accept=".pdf"
          multiple={false}
          title="Drop your color PDF here"
          subtitle="or browse to convert to black and white grayscale"
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

          {/* Grayscale settings and information */}
          <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs space-y-1.5 text-muted-foreground">
                <p className="font-semibold text-foreground">Client-Side Grayscale Conversion</p>
                <p className="leading-relaxed">
                  Each page will be rendered through a standard luminance filter (0.299R + 0.587G + 0.114B) to preserve photographic and chart tonal balance while removing color.
                </p>
                <p className="leading-relaxed text-[11px]">
                  <strong>Note:</strong> To guarantee consistent grayscale appearance across all printer hardware, pages are rasterized at high resolution (144 DPI). Original page dimensions are strictly preserved.
                </p>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              {errorMessage}
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center gap-3 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>
                Converting pages to grayscale...{" "}
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
              <Palette className="h-4 w-4" />
              <span>Convert to Grayscale</span>
            </button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
