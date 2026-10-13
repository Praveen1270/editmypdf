"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, AlertCircle } from "lucide-react";
import { addRecentFile } from "@/lib/storage";
import { PDF_TOOLS } from "@/lib/tools-data";

interface DropZoneProps {
  accept?: string; // e.g. ".pdf", "image/*"
  multiple?: boolean;
  maxSizeBytes?: number; // default 150MB
  onFilesSelected: (files: File[]) => void;
  title?: string;
  subtitle?: string;
  disabled?: boolean;
}

export function DropZone({
  accept = ".pdf",
  multiple = false,
  maxSizeBytes = 150 * 1024 * 1024, // 150MB safe browser limit
  onFilesSelected,
  title = "Drop your files here",
  subtitle = "or browse files",
  disabled = false,
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

      // Format validation based on accept property
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
          const toolName = matchedTool ? matchedTool.name : "PDFKit Tool";

          for (const f of validFiles) {
            addRecentFile({
              name: f.name,
              size: f.size,
              toolId,
              toolName,
            });
          }
        } catch {
          // ignore tracking error
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
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors duration-150 ${
          isDragOver
            ? "border-border-strong bg-surface-raised ring-2 ring-border-strong"
            : "border-border bg-surface-muted/50 hover:border-border-strong hover:bg-surface-raised"
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

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-base border border-border group-hover:border-border-strong transition-transform group-hover:scale-105">
          <UploadCloud className="h-6 w-6 text-text-secondary group-hover:text-text-primary" />
        </div>

        <div className="mt-4 text-center">
          <p className="text-base font-semibold text-text-primary">{title}</p>
          <p className="mt-1 text-sm text-text-secondary font-medium">{subtitle}</p>
        </div>

        <p className="mt-3 text-xs text-text-tertiary">
          {multiple ? "Select single or multiple files" : "Select one file"} · Processed 100% locally
        </p>
      </div>

      {errorMessage && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-border-strong bg-surface-raised p-3 text-xs text-text-primary font-medium">
          <AlertCircle className="h-4 w-4 shrink-0 text-text-primary" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
