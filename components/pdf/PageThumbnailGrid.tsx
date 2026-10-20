"use client";

import React, { useEffect, useState } from "react";
import { RotateCw, Check, Loader2 } from "lucide-react";
import { renderAllThumbnails } from "@/lib/pdf/pdf-loader";

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
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!pdfBytes) {
      setThumbnails({});
      return;
    }

    let isCancelled = false;

    renderAllThumbnails(
      pdfBytes,
      0.4,
      (pageIdx, dataUrl) => {
        if (!isCancelled) {
          setThumbnails((prev) => ({ ...prev, [pageIdx]: dataUrl }));
        }
      },
      () => isCancelled
    ).catch((err) => {
      console.error("Error generating thumbnails in grid:", err);
    });

    return () => {
      isCancelled = true;
    };
  }, [pdfBytes]);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: pageCount }).map((_, pageIdx) => (
        <ThumbnailItem
          key={pageIdx}
          pageIndex={pageIdx}
          thumbnailUrl={thumbnails[pageIdx]}
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
  thumbnailUrl,
  rotation,
  isSelected,
  onToggleSelect,
  onRotate,
  selectable,
  rotatable,
}: {
  pageIndex: number;
  thumbnailUrl?: string;
  rotation: number;
  isSelected: boolean;
  onToggleSelect?: () => void;
  onRotate?: () => void;
  selectable: boolean;
  rotatable: boolean;
}) {
  return (
    <div
      onClick={selectable && onToggleSelect ? onToggleSelect : undefined}
      className={`group relative flex flex-col items-center rounded-xl border p-2 transition-all duration-150 ${
        selectable ? "cursor-pointer" : ""
      } ${
        isSelected
          ? "border-black dark:border-white bg-zinc-100 dark:bg-zinc-800 ring-2 ring-black dark:ring-white"
          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-black dark:hover:border-white"
      }`}
    >
      <div className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-lg bg-zinc-50 dark:bg-zinc-950 shadow-inner">
        {thumbnailUrl ? (
          <div
            style={{ transform: `rotate(${rotation}deg)` }}
            className="flex h-full w-full items-center justify-center transition-transform duration-200 p-1"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailUrl}
              alt={`Page ${pageIndex + 1}`}
              className="max-h-full max-w-full object-contain pointer-events-none select-none rounded shadow-xs"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 p-4 text-zinc-400">
            <Loader2 className="h-5 w-5 animate-spin text-black dark:text-white stroke-[2]" />
            <span className="text-[10px] font-mono font-medium text-zinc-500 dark:text-zinc-400">
              #{pageIndex + 1}
            </span>
          </div>
        )}

        {selectable && (
          <div
            className={`absolute top-2 left-2 flex h-5 w-5 items-center justify-center rounded-full border text-white transition-colors ${
              isSelected
                ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                : "border-zinc-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 text-transparent"
            }`}
          >
            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
          </div>
        )}

        {rotatable && onRotate && (
          <button
            type="button"
            title="Rotate this page 90°"
            aria-label={`Rotate page ${pageIndex + 1} 90 degrees`}
            onClick={(e) => {
              e.stopPropagation();
              onRotate();
            }}
            className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
          >
            <RotateCw className="h-3.5 w-3.5 stroke-[2]" />
          </button>
        )}
      </div>

      <div className="mt-2 flex w-full items-center justify-between px-1 text-xs text-zinc-600 dark:text-zinc-400">
        <span className="font-semibold text-black dark:text-white">Page {pageIndex + 1}</span>
        {rotation > 0 && <span className="font-mono text-[10px] text-zinc-500 font-bold">{rotation}°</span>}
      </div>
    </div>
  );
}
