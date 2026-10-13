"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Grid,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getPdfjs } from "@/lib/pdf/pdf-loader";

interface PdfOutputViewerProps {
  pdfBytes: Uint8Array;
  password?: string;
  className?: string;
}

export function PdfOutputViewer({ pdfBytes, password, className = "" }: PdfOutputViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [docProxy, setDocProxy] = useState<any | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [fitMode, setFitMode] = useState<"custom" | "width" | "page">("width");
  const [loading, setLoading] = useState<boolean>(true);
  const [rendering, setRendering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const renderTaskRef = useRef<any | null>(null);

  // 1. Load PDF Document Proxy from bytes
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    async function loadDocument() {
      try {
        const pdfjs = await getPdfjs();
        const loadingTask = pdfjs.getDocument({
          data: pdfBytes.slice(),
          password: password || undefined,
        });

        const doc = await loadingTask.promise;
        if (isCancelled) {
          await doc.destroy();
          return;
        }

        setDocProxy(doc);
        setPageCount(doc.numPages);
        setCurrentPage(1);
        setLoading(false);
      } catch (err: any) {
        if (!isCancelled) {
          console.error("PdfOutputViewer error loading document:", err);
          setError(err?.message || "Failed to render PDF output preview.");
          setLoading(false);
        }
      }
    }

    loadDocument();

    return () => {
      isCancelled = true;
    };
  }, [pdfBytes, password]);

  // Clean up doc proxy on unmount or replacement
  useEffect(() => {
    return () => {
      if (docProxy) {
        docProxy.destroy().catch(() => {});
      }
    };
  }, [docProxy]);

  // 2. Render Current Page
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!docProxy || !canvasRef.current || !containerRef.current) return;

      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore cancel error
        }
      }

      setRendering(true);

      try {
        const page = await docProxy.getPage(pageNum);
        const containerWidth = containerRef.current.clientWidth - 48; // padding

        // Compute effective scale
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        let effectiveScale = scale;

        if (fitMode === "width" && containerWidth > 100) {
          effectiveScale = Math.min(2.0, Math.max(0.4, containerWidth / unscaledViewport.width));
        }

        const viewport = page.getViewport({ scale: effectiveScale });
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, viewport.width, viewport.height);

        const renderContext = {
          canvasContext: ctx,
          viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error("Page render error:", err);
        }
      } finally {
        setRendering(false);
      }
    },
    [docProxy, scale, fitMode]
  );

  useEffect(() => {
    if (docProxy && pageCount > 0) {
      renderPage(currentPage);
    }
  }, [docProxy, pageCount, currentPage, scale, fitMode, renderPage]);

  // Handle page navigation
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const nextPage = () => {
    if (currentPage < pageCount) setCurrentPage((p) => p + 1);
  };

  const handleZoomIn = () => {
    setFitMode("custom");
    setScale((s) => Math.min(2.5, Math.round((s + 0.15) * 100) / 100));
  };

  const handleZoomOut = () => {
    setFitMode("custom");
    setScale((s) => Math.max(0.4, Math.round((s - 0.15) * 100) / 100));
  };

  const handleFitWidth = () => {
    setFitMode("width");
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`relative flex flex-col rounded-xl border border-border bg-surface-muted/50 overflow-hidden ${
        isFullscreen
          ? "fixed inset-0 z-50 rounded-none bg-surface-base p-4 sm:p-6"
          : "w-full max-w-full"
      } ${className}`}
    >
      {/* Viewer Header / Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-base px-3 py-2 text-xs">
        {/* Left: Page navigation */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={prevPage}
            disabled={currentPage <= 1 || loading}
            aria-label="Previous page"
            className="rounded p-1 text-text-secondary hover:bg-surface-raised hover:text-text-primary disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="font-medium text-text-primary">
            Page {currentPage} of {pageCount || 1}
          </span>

          <button
            type="button"
            onClick={nextPage}
            disabled={currentPage >= pageCount || loading}
            aria-label="Next page"
            className="rounded p-1 text-text-secondary hover:bg-surface-raised hover:text-text-primary disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Center: Zoom and Fit Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 0.4 || loading}
            aria-label="Zoom out"
            className="rounded p-1 text-text-secondary hover:bg-surface-raised hover:text-text-primary disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <span className="min-w-[48px] text-center font-mono text-[11px] text-text-secondary">
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= 2.5 || loading}
            aria-label="Zoom in"
            className="rounded p-1 text-text-secondary hover:bg-surface-raised hover:text-text-primary disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleFitWidth}
            className={`ml-1 rounded px-2 py-0.5 text-[11px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
              fitMode === "width"
                ? "bg-action-primary text-action-primary-text"
                : "border border-border bg-surface-base text-text-secondary hover:bg-surface-raised hover:text-text-primary"
            }`}
          >
            Fit Width
          </button>
        </div>

        {/* Right: Thumbnails drawer & Fullscreen */}
        <div className="flex items-center gap-1">
          {pageCount > 1 && (
            <button
              type="button"
              onClick={() => setShowThumbnails(!showThumbnails)}
              className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                showThumbnails
                  ? "bg-surface-raised text-text-primary border border-border"
                  : "text-text-secondary hover:bg-surface-raised hover:text-text-primary"
              }`}
              title="Toggle Thumbnails"
            >
              <Grid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Pages</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleFullscreen}
            aria-label={isFullscreen ? "Exit full screen" : "Full screen preview"}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Preview"}
            className="rounded p-1 text-text-secondary hover:bg-surface-raised hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="relative flex flex-1 flex-col overflow-hidden sm:flex-row">
        {/* Thumbnails Sidebar (if toggled and > 1 page) */}
        {showThumbnails && pageCount > 1 && docProxy && (
          <div className="w-full sm:w-44 shrink-0 border-b sm:border-b-0 sm:border-r border-border bg-surface-base p-2 overflow-y-auto max-h-48 sm:max-h-[500px]">
            <div className="grid grid-cols-4 sm:grid-cols-1 gap-2">
              {Array.from({ length: pageCount }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`flex flex-col items-center rounded-lg border p-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                    currentPage === idx + 1
                      ? "border-border-strong bg-surface-raised ring-2 ring-border-strong"
                      : "border-border hover:border-border-strong"
                  }`}
                >
                  <div className="flex h-16 w-12 items-center justify-center rounded bg-surface-raised text-[10px] text-text-secondary font-mono">
                    #{idx + 1}
                  </div>
                  <span className="mt-1 text-[10px] text-text-secondary">
                    Page {idx + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Canvas Display Viewport */}
        <div
          ref={containerRef}
          className="relative flex min-h-[360px] max-h-[640px] flex-1 items-center justify-center overflow-auto p-4 sm:p-6"
        >
          {loading && (
            <div className="flex flex-col items-center justify-center text-center">
              <Loader2 className="h-8 w-8 animate-spin text-text-primary" />
              <p className="mt-3 text-xs font-semibold text-text-primary">
                Rendering Generated Output...
              </p>
              <p className="text-[11px] text-text-secondary">
                Generating preview directly from client-side WebAssembly
              </p>
            </div>
          )}

          {error && (
            <div className="flex max-w-sm flex-col items-center justify-center text-center p-4">
              <AlertCircle className="h-8 w-8 text-text-primary" />
              <p className="mt-2 text-xs font-semibold text-text-primary">
                Output preview unavailable
              </p>
              <p className="mt-1 text-[11px] text-text-secondary leading-relaxed">
                {error}
              </p>
              <p className="mt-2 text-[10px] text-text-tertiary">
                The generated document remains ready for download below.
              </p>
            </div>
          )}

          {rendering && !loading && (
            <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-surface-base/90 px-2.5 py-1 text-[10px] font-medium text-text-secondary shadow-sm backdrop-blur border border-border">
              <Loader2 className="h-3 w-3 animate-spin text-text-primary" />
              <span>Rendering...</span>
            </div>
          )}

          <div
            className={`transition-opacity duration-150 ${
              loading || error ? "hidden" : "block"
            }`}
          >
            {/* Document canvas retains pure white background so actual document colors remain unaffected */}
            <canvas
              ref={canvasRef}
              className="mx-auto rounded-md shadow-md ring-1 ring-border/80 bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
