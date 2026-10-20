"use client";

import React, { useRef, useState, DragEvent, ChangeEvent } from "react";
import {
  ShieldCheck,
  UploadCloud,
  ArrowDown,
  Loader2,
} from "lucide-react";
import { PDF_TOOLS } from "@/lib/tools-data";
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
    <div className="w-full text-center max-w-3xl mx-auto mb-8 pt-6 sm:pt-10">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Pill Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-1 text-xs font-medium text-zinc-900 dark:text-zinc-100 shadow-xs mb-4">
        <span className="flex h-2 w-2 rounded-full bg-black dark:bg-white" />
        <span className="font-bold text-black dark:text-white">100% Free & Private</span>
        <span className="text-zinc-400 dark:text-zinc-600">·</span>
        <span className="text-[#52504e] dark:text-[#d6d3d1]">Zero Server Uploads</span>
      </div>

      {/* Primary Headline — Balanced Proportions */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-extrabold tracking-tight text-black dark:text-white leading-[1.2]">
        Every tool you need to work with PDFs in one place
      </h1>

      {/* Subtitle — Exact Requested Styles */}
      <p className="mt-3 text-[16px] leading-[25px] font-normal text-[#52504e] dark:text-[#d6d3d1] max-w-2xl mx-auto">
        Edit, convert, compress, merge, split, and sign PDF documents directly in your web browser. Completely free, no registration, no watermarks, and files stay strictly on your device.
      </p>

      {/* Interactive Quick File Dropzone */}
      <div className="mt-6">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer max-w-xl mx-auto rounded-2xl border-2 border-dashed p-6 sm:p-7 transition-all duration-150 ${
            isDragOver
              ? "border-black dark:border-white bg-zinc-100 dark:bg-zinc-800 scale-[1.01]"
              : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/60 hover:border-black dark:hover:border-white shadow-xs"
          }`}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-2">
              <Loader2 className="h-7 w-7 animate-spin text-black dark:text-white" />
              <p className="mt-2 text-xs font-semibold text-black dark:text-white">Reading document in memory...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white mb-3">
                <UploadCloud className="h-5 w-5 text-black dark:text-white stroke-[2]" />
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-1">
                <span className="rounded-lg bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-xs font-semibold shadow-xs hover:opacity-90 transition">
                  Select PDF file
                </span>
                <span className="text-[14px] leading-[22px] text-[#52504e] dark:text-[#d6d3d1]">or drop file here</span>
              </div>
              <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-1">
                Supports documents up to 150MB in client-side RAM
              </p>
            </div>
          )}
        </div>

        {errorMessage && (
          <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{errorMessage}</p>
        )}
      </div>

      {/* High-Contrast Privacy Statement & Fast Anchor Link */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 text-xs text-[#52504e] dark:text-[#d6d3d1]">
        <span className="inline-flex items-center gap-1.5 font-semibold text-black dark:text-white">
          <ShieldCheck className="h-4 w-4 stroke-[2]" />
          <span>Files stay strictly on your device</span>
        </span>
        <span className="text-zinc-400 dark:text-zinc-600">·</span>
        <a
          href="#tools"
          className="inline-flex items-center gap-1 text-black dark:text-white font-bold hover:underline"
        >
          <span>Discover all {PDF_TOOLS.length} tools</span>
          <ArrowDown className="h-3.5 w-3.5 stroke-[2.5]" />
        </a>
      </div>
    </div>
  );
}
