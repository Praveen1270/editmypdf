"use client";

import React, { useRef, useState, DragEvent, ChangeEvent } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FileText,
  UploadCloud,
  ArrowDown,
  Loader2,
  Lock,
  Sparkles,
} from "lucide-react";
import { setActiveDocument } from "@/lib/active-document";
import { getPdfInfo } from "@/lib/pdf/pdf-loader";
import { addRecentFile } from "@/lib/storage";

interface HomeHeroProps {
  onDocumentLoaded?: () => void;
}

export function HomeHero({ onDocumentLoaded }: HomeHeroProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleProcessFile = async (file: File) => {
    if (!file) return;
    setErrorMessage(null);

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setErrorMessage("Please select a valid PDF document.");
      return;
    }

    if (file.size > 150 * 1024 * 1024) {
      setErrorMessage(`"${file.name}" exceeds the recommended 150MB browser RAM limit.`);
      return;
    }

    setIsLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const info = await getPdfInfo(bytes);

      const docData = {
        name: file.name,
        size: file.size,
        pageCount: info.pageCount,
        bytes,
        file,
      };

      setActiveDocument(docData);

      addRecentFile({
        name: file.name,
        size: file.size,
        pageCount: info.pageCount,
        toolId: "workspace",
        toolName: "Document Workspace",
      });

      if (onDocumentLoaded) onDocumentLoaded();
    } catch (err: any) {
      console.error("Error reading PDF:", err);
      setErrorMessage(
        err?.message || "Failed to inspect PDF. The file may be password protected or corrupted."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full text-center max-w-3xl mx-auto mb-10 pt-4 sm:pt-8">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Subtle Privacy & Free Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-foreground shadow-sm mb-5">
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-semibold text-accent">100% Free & Private</span>
        <span className="text-muted-foreground/60">·</span>
        <span className="text-muted-foreground">Zero Server Uploads</span>
      </div>

      {/* Primary Headline (Section 3.B) */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.12]">
        Every tool you need to work with PDFs in one place
      </h1>

      {/* Short Subtitle (Section 3.B) */}
      <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
        Edit, convert, compress, merge, split, and sign PDF documents directly in your web browser. Completely free, no registration, no watermarks, and files stay strictly on your device.
      </p>

      {/* Interactive Quick File Dropzone & Actions */}
      <div className="mt-7">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer max-w-xl mx-auto rounded-2xl border-2 border-dashed p-6 sm:p-8 transition-all duration-150 ${
            isDragOver
              ? "border-accent bg-accent/5 ring-4 ring-accent/10 scale-[1.01]"
              : "border-border bg-surface hover:border-border-strong hover:bg-surface-subtle/50 shadow-paper"
          }`}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-2">
              <Loader2 className="h-7 w-7 animate-spin text-accent" />
              <p className="mt-2 text-xs font-semibold text-foreground">Reading document in memory...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20 text-accent mb-3">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 mb-1">
                <span className="rounded-lg bg-foreground text-background px-3.5 py-1.5 text-xs font-semibold shadow-sm hover:opacity-90 transition">
                  Select PDF file
                </span>
                <span className="text-xs text-muted-foreground">or drop file here</span>
              </div>
              <p className="text-[11px] text-muted-foreground/75 mt-1">
                Supports documents up to 150MB in client-side RAM
              </p>
            </div>
          )}
        </div>

        {errorMessage && (
          <p className="mt-2 text-xs font-medium text-red-500">{errorMessage}</p>
        )}
      </div>

      {/* Subtle Privacy Statement & Fast Anchor Link */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Files stay strictly on your device</span>
        </span>
        <span>·</span>
        <a
          href="#tools"
          className="inline-flex items-center gap-1 text-accent hover:underline font-semibold"
        >
          <span>Discover all 33 tools</span>
          <ArrowDown className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
