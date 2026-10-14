"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface PdfWorkspaceHeaderProps {
  toolName: string;
  filename?: string | null;
  pageCount?: number | null;
  fileSize?: number | null;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  isProcessing?: boolean;
  canExecute?: boolean;
  onClearFile?: () => void;
}

export function PdfWorkspaceHeader({
  toolName,
  filename,
  pageCount,
  fileSize,
  primaryActionLabel,
  onPrimaryAction,
  isProcessing = false,
  canExecute = true,
  onClearFile,
}: PdfWorkspaceHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border bg-surface px-4 sm:px-6 py-3.5 rounded-2xl shadow-paper mb-6">
      {/* Left: Back Link & Tool Name */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/#tools"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition shrink-0"
          title="Back to all tools"
          aria-label="Back to all tools"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-foreground truncate">
              {toolName}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-md border border-border bg-surface-subtle px-1.5 py-0.5 text-[11px] font-medium text-success">
              <ShieldCheck className="h-3 w-3" />
              <span>Private</span>
            </span>
          </div>

          {/* Document metadata pill if file is loaded */}
          {filename && (
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 truncate max-w-[200px] sm:max-w-xs font-medium text-foreground">
                <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="truncate">{filename}</span>
              </span>
              {pageCount !== undefined && pageCount !== null && (
                <>
                  <span>·</span>
                  <span>{pageCount} {pageCount === 1 ? "page" : "pages"}</span>
                </>
              )}
              {fileSize !== undefined && fileSize !== null && (
                <>
                  <span>·</span>
                  <span>{formatFileSize(fileSize)}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Primary action if defined */}
      {primaryActionLabel && onPrimaryAction && (
        <div className="flex items-center gap-2 self-end sm:self-center">
          {onClearFile && (
            <button
              type="button"
              onClick={onClearFile}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={onPrimaryAction}
            disabled={isProcessing || !canExecute}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-paper transition hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{primaryActionLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
}
