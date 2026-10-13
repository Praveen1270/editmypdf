"use client";

import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, Trash2, Loader2, FileImage, FilePlus } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { ResultCard } from "@/components/tools/ResultCard";
import {
  convertImagesToPdf,
  ImageSourceItem,
  PageSizeOption,
  OrientationOption,
  MarginOption,
  ImageFitOption,
} from "@/lib/pdf/images-to-pdf";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function ImagesToPdfPage() {
  const [images, setImages] = useState<ImageSourceItem[]>([]);
  const [pageSize, setPageSize] = useState<PageSizeOption>("a4");
  const [orientation, setOrientation] = useState<OrientationOption>("auto");
  const [margin, setMargin] = useState<MarginOption>("small");
  const [fit, setFit] = useState<ImageFitOption>("contain");

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [outputFilename, setOutputFilename] = useState("images-to-pdf.pdf");

  const handleFilesSelected = (newFiles: File[]) => {
    setErrorMessage(null);
    const added: ImageSourceItem[] = [];

    for (const f of newFiles) {
      if (!f.type.startsWith("image/")) {
        setErrorMessage(`"${f.name}" is not a supported image file.`);
        continue;
      }
      const previewUrl = URL.createObjectURL(f);
      added.push({
        id: Math.random().toString(36).substring(2, 9),
        file: f,
        name: f.name,
        size: f.size,
        type: f.type,
        previewUrl,
      });
    }

    setImages((prev) => [...prev, ...added]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const moveDown = (index: number) => {
    if (index === images.length - 1) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleGeneratePdf = async () => {
    if (images.length === 0) {
      setErrorMessage("Please select at least one image.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const bytes = await convertImagesToPdf(
        images,
        {
          pageSize,
          orientation,
          margin,
          fit,
        },
        (curr, total) => {
          setProgress({ current: curr, total });
        }
      );
      setResultBytes(bytes);
      setOutputFilename(`images-${Date.now().toString().slice(-4)}.pdf`);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to create PDF from images.");
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleReset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setResultBytes(null);
    setErrorMessage(null);
  };

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [images]);

  const handleDownload = (customFilename?: string) => {
    if (resultBytes) {
      downloadBytes(resultBytes, customFilename || outputFilename || "images-to-pdf.pdf");
    }
  };

  return (
    <ToolPageLayout
      toolId="images-to-pdf"
      toolName="Images to PDF"
      description="Convert JPG, PNG, and WebP images into a beautifully formatted PDF with custom page sizes, orientations, and margins."
    >
      {resultBytes ? (
        <ResultCard
          filename="images-to-pdf.pdf"
          filesize={resultBytes.byteLength}
          pdfBytes={resultBytes}
          notes={`Converted ${images.length} photos into a standardized PDF.`}
          onDownload={handleDownload}
          onReset={handleReset}
        />
      ) : images.length === 0 ? (
        <DropZone
          accept="image/png,image/jpeg,image/webp,image/jpg"
          multiple={true}
          title="Drop your images here"
          subtitle="JPG, PNG, or WebP files"
          onFilesSelected={handleFilesSelected}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Images ({images.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                Reorder images to adjust page order.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-xs font-medium text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="flex items-center justify-between rounded-lg border border-border bg-white p-3 shadow-sm"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
                    <img
                      src={img.previewUrl}
                      alt={img.name}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 text-[9px] font-bold text-white">
                      #{idx + 1}
                    </span>
                  </div>
                  <div className="overflow-hidden">
                    <p className="truncate text-xs font-medium text-foreground">{img.name}</p>
                    <p className="text-[10px] text-muted-foreground">{formatFileSize(img.size)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === images.length - 1}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => removeImage(img.id)}
                    className="p-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <DropZone
              accept="image/png,image/jpeg,image/webp,image/jpg"
              multiple={true}
              title="Add more images"
              subtitle="drop additional photos here"
              onFilesSelected={handleFilesSelected}
            />
          </div>

          {/* Options grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-xl border border-border bg-muted/20 p-4">
            <div>
              <label className="block text-xs font-semibold text-foreground">
                Page Size
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as PageSizeOption)}
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="a4">A4 Standard</option>
                <option value="letter">US Letter</option>
                <option value="fit">Fit to Image Size</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                Orientation
              </label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as OrientationOption)}
                disabled={pageSize === "fit"}
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              >
                <option value="auto">Auto (Match Image)</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                Margins
              </label>
              <select
                value={margin}
                onChange={(e) => setMargin(e.target.value as MarginOption)}
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="none">No Margin</option>
                <option value="small">Small (20pt)</option>
                <option value="normal">Normal (40pt)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                Image Fit
              </label>
              <select
                value={fit}
                onChange={(e) => setFit(e.target.value as ImageFitOption)}
                disabled={pageSize === "fit"}
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              >
                <option value="contain">Contain (Entire Image)</option>
                <option value="cover">Cover (Fill Page)</option>
              </select>
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
              <span>
                Generating PDF locally...{" "}
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
              onClick={handleGeneratePdf}
              disabled={isProcessing || images.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:opacity-50"
            >
              <FileImage className="h-4 w-4" />
              <span>Create PDF ({images.length} images)</span>
            </button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
