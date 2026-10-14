"use client";

import { useState, useRef, useEffect, DragEvent, ChangeEvent } from "react";
import { UploadCloud, AlertCircle, FileText, ArrowRight } from "lucide-react";
import { addRecentFile } from "@/lib/storage";
import { PDF_TOOLS } from "@/lib/tools-data";
import { getActiveDocument } from "@/lib/active-document";
import { formatFileSize } from "@/lib/utils";

interface DropZoneProps {
  accept?: string;
  multiple?: boolean;
  maxSizeBytes?: number;
  onFilesSelected: (files: File[]) => void;
  title?: string;
  subtitle?: string;
  disabled?: boolean;
}

export function DropZone({
  accept = ".pdf",
  multiple = false,
  maxSizeBytes = 150 * 1024 * 1024,
  onFilesSelected,
  title = "Drop your files here",
  subtitle = "or browse files",
  disabled = false,
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeDocFile, setActiveDocFile] = useState<{ name: string; size: number; pageCount: number; file?: File } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check for preloaded active document from homepage
  useEffect(() => {
    const doc = getActiveDocument();
    if (doc && accept.includes(".pdf")) {
      setActiveDocFile({
        name: doc.name,
        size: doc.size,
        pageCount: doc.pageCount,
        file: doc.file,
      });
    }
  }, [accept]);

  const handleUseActiveDoc = () => {
    const doc = getActiveDocument();
    if (doc) {
      if (doc.file) {
        onFilesSelected([doc.file]);
      } else {
        // Construct File from in-memory Uint8Array bytes
        const blob = new Blob([doc.bytes.buffer as ArrayBuffer], { type: "application/pdf" });
        const fileObj = new File([blob], doc.name, { type: "application/pdf" });
        onFilesSelected([fileObj]);
      }
    }
  };

  const validateAndHandleFiles = (fileList: FileList | null) => {
    setErrorMessage(null);
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    const validFiles: File[] = [];

    for (const file of files) {
      if (file.size > maxSizeBytes) {
        setErrorMessage(
          `"${file.name}" exceeds the recommended local memory limit (${Math.round(
            maxSizeBytes / (1024 * 1024)
          )}MB).`
        );
        return;
      }

      if (accept) {
        const acceptedTokens = accept.split(",").map((s) => s.trim().toLowerCase());
        const lowerName = file.name.toLowerCase();
        const mimeType = (file.type || "").toLowerCase();

        const matches = acceptedTokens.some((token) => {
          if (token.startsWith(".")) {
            return lowerName.endsWith(token);
          }
          if (token.endsWith("/*")) {
            const prefix = token.replace("/*", "");
            return mimeType.startsWith(prefix);
          }
          return mimeType === token;
        });

        if (!matches) {
          if (accept === ".pdf") {
            setErrorMessage(`"${file.name}" is not a valid PDF file.`);
          } else {
            setErrorMessage(`"${file.name}" does not match accepted format (${accept}).`);
          }
          return;
        }
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      if (typeof window !== "undefined") {
        try {
          const path = window.location.pathname;
          const matchedTool = PDF_TOOLS.find((t) => t.href === path);
          const toolId = matchedTool ? matchedTool.id : "custom";
          const toolName = matchedTool ? matchedTool.name : "EditMyPDF Tool";

          for (const f of validFiles) {
            addRecentFile({
              name: f.name,
              size: f.size,
              toolId,
              toolName,
            });
          }
        } catch {
          // ignore
        }
      }
      onFilesSelected(validFiles);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    validateAndHandleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    validateAndHandleFiles(e.target.files);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full space-y-4">
      {/* 1-Click Shortcut to use active preloaded document if available */}
      {activeDocFile && !multiple && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/5 p-4 transition">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                  Loaded Document
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {activeDocFile.pageCount} pages · {formatFileSize(activeDocFile.size)}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-foreground truncate max-w-sm">
                {activeDocFile.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleUseActiveDoc}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white shadow-paper hover:bg-accent-hover transition self-start sm:self-center shrink-0"
          >
            <span>Use this document</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Drag-and-Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-150 ${
          isDragOver
            ? "border-accent bg-accent/5 ring-4 ring-accent/10"
            : "border-border bg-surface-subtle/30 hover:border-border-strong hover:bg-surface-subtle"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface border border-border group-hover:border-border-strong transition-transform group-hover:scale-105 shadow-paper">
          <UploadCloud className="h-6 w-6 text-muted-foreground group-hover:text-accent transition-colors" />
        </div>

        <div className="mt-4 text-center">
          <p className="text-base font-bold text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground font-medium">{subtitle}</p>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          {multiple ? "Select single or multiple files" : "Select one file"} · 100% in-browser RAM
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive font-medium">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
