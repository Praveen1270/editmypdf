"use client";

import { useState, useRef, useEffect } from "react";
import { ScanLine, Camera, Trash2, Download, RefreshCw, Loader2 } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { scanToPdf, ScanPage } from "@/lib/pdf/scan-to-pdf";
import { downloadBytes } from "@/lib/files/download";

export default function ScanToPdfPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [pages, setPages] = useState<ScanPage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<"original" | "grayscale" | "bw" | "color">("original");
  const [pageSize, setPageSize] = useState<"fit" | "a4" | "letter">("a4");

  useEffect(() => {
    let s: MediaStream | null = null;
    (async () => {
      try {
        s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (err: any) {
        setErrorMessage("Camera access denied or unavailable. You can still upload images via Images to PDF.");
      }
    })();
    return () => { s?.getTracks().forEach((t) => t.stop()); };
  }, []);

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setPages((p) => [...p, { dataUrl }]);
  };

  const removePage = (idx: number) => setPages((p) => p.filter((_, i) => i !== idx));

  const handleExport = async () => {
    if (pages.length === 0) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const bytes = await scanToPdf(pages, { pageSize, filter });
      downloadBytes(bytes, "scanned-document.pdf", "application/pdf");
    } catch (err: any) {
      setErrorMessage(`Failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => setPages([]);

  return (
    <ToolPageLayout toolId="scan-to-pdf" toolName="Scan to PDF" description="Use your camera as a document scanner: capture pages, enhance and export a PDF.">
      <div className="space-y-6">
        {errorMessage && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">{errorMessage}</div>}

        <div className="rounded-xl border border-border bg-black/5 overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-80 object-contain bg-black" />
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={capture} disabled={!stream} className="inline-flex items-center gap-1.5 rounded-lg bg-action-primary px-3 py-1.5 text-xs font-semibold text-action-primary-text hover:opacity-90 disabled:opacity-50">
            <Camera className="h-3.5 w-3.5" /> Capture Page
          </button>
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs">
            <option value="original">Original</option>
            <option value="grayscale">Grayscale</option>
            <option value="bw">Black & White</option>
            <option value="color">Color boost</option>
          </select>
          <select value={pageSize} onChange={(e) => setPageSize(e.target.value as any)} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs">
            <option value="a4">A4</option>
            <option value="letter">Letter</option>
            <option value="fit">Fit to image</option>
          </select>
        </div>

        {pages.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground">{pages.length} page(s) captured</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {pages.map((p, i) => (
                <div key={i} className="relative rounded-lg border border-border overflow-hidden">
                  <img src={p.dataUrl} alt={`page ${i + 1}`} className="w-full h-24 object-cover" />
                  <button onClick={() => removePage(i)} className="absolute top-1 right-1 rounded bg-black/60 p-1 text-white">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {isProcessing ? (
                <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-xs">Exporting…</span></div>
              ) : (
                <button onClick={handleExport} className="inline-flex items-center gap-1.5 rounded-lg bg-action-primary px-3 py-1.5 text-xs font-semibold text-action-primary-text hover:opacity-90">
                  <Download className="h-3.5 w-3.5" /> Export PDF
                </button>
              )}
              <button onClick={handleReset} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                <RefreshCw className="h-3 w-3" /> Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}