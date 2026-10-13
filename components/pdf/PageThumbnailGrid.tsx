"use client";

import React, { useEffect, useRef, useState } from "react";
import { RotateCw, Check, Loader2 } from "lucide-react";
import { renderPageToCanvas } from "@/lib/pdf/pdf-loader";

interface PageThumbnailGridProps {
  pdfBytes: Uint8Array;
  pageCount: number;
  rotations?: Record<number, number>; // pageIndex -> rotation angle
  selectedPages?: number[]; // list of selected 0-indexed page indices
  onToggleSelect?: (pageIndex: number) => void;
  onRotatePage?: (pageIndex: number) => void;
  selectable?: boolean;
  rotatable?: boolean;
}

export function PageThumbnailGrid({
  pdfBytes,
  pageCount,
  rotations = {},
  selectedPages = [],
  onToggleSelect,
  onRotatePage,
  selectable = false,
  rotatable = false,
}: PageThumbnailGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: pageCount }).map((_, pageIdx) => (
        <ThumbnailItem
          key={pageIdx}
          pageIndex={pageIdx}
          pdfBytes={pdfBytes}
          rotation={rotations[pageIdx] || 0}
          isSelected={selectedPages.includes(pageIdx)}
          onToggleSelect={onToggleSelect ? () => onToggleSelect(pageIdx) : undefined}
          onRotate={onRotatePage ? () => onRotatePage(pageIdx) : undefined}
          selectable={selectable}
          rotatable={rotatable}
        />
      ))}
    </div>
  );
}

function ThumbnailItem({
  pageIndex,
  pdfBytes,
  rotation,
  isSelected,
  onToggleSelect,
  onRotate,
  selectable,
  rotatable,
}: {
  pageIndex: number;
  pdfBytes: Uint8Array;
  rotation: number;
  isSelected: boolean;
  onToggleSelect?: () => void;
  onRotate?: () => void;
  selectable: boolean;
  rotatable: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    if (canvasRef.current && pdfBytes) {
      renderPageToCanvas(pdfBytes, pageIndex + 1, canvasRef.current, 0.4)
        .then(() => {
          if (!isCancelled) setLoading(false);
        })
        .catch((err) => {
          console.error("Error rendering thumbnail:", err);
          if (!isCancelled) {
            setError(true);
            setLoading(false);
          }
        });
    }

    return () => {
      isCancelled = true;
    };
  }, [pdfBytes, pageIndex]);

  return (
    <div
      onClick={selectable && onToggleSelect ? onToggleSelect : undefined}
      className={`group relative flex flex-col items-center rounded-xl border p-2 transition-all duration-150 ${
        selectable ? "cursor-pointer" : ""
      } ${
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-border bg-white hover:border-muted-foreground/30"
      }`}
    >
      <div className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-lg bg-muted/40">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="max-h-full max-w-full object-contain transition-transform duration-200"
          style={{ transform: `rotate(${rotation}deg)` }}
        />

        {selectable && (
          <div
            className={`absolute top-2 left-2 flex h-5 w-5 items-center justify-center rounded-full border text-white transition-colors ${
              isSelected ? "border-primary bg-primary" : "border-border bg-white"
            }`}
          >
            {isSelected && <Check className="h-3 w-3" />}
          </div>
        )}

        {rotatable && onRotate && (
          <button
            type="button"
            title="Rotate this page 90°"
            onClick={(e) => {
              e.stopPropagation();
              onRotate();
            }}
            className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-foreground shadow-sm hover:bg-white border border-border transition-colors"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="mt-2 flex w-full items-center justify-between px-1 text-xs text-muted-foreground">
        <span>Page {pageIndex + 1}</span>
        {rotation > 0 && <span className="font-mono text-[10px]">{rotation}°</span>}
      </div>
    </div>
  );
}
