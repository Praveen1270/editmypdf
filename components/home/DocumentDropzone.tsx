"use client";

import React, { useState, useRef, useEffect, DragEvent, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Upload,
  ShieldCheck,
  X,
  ArrowRight,
  Loader2,
  AlertCircle,
  Minimize2,
  LayoutGrid,
  Scissors,
  RotateCw,
  Hash,
  Stamp,
  Type,
  Crop,
  Lock,
  FileImage,
  FileCode,
  PenLine,
} from "lucide-react";
import { formatFileSize } from "@/lib/utils";
import { getPdfInfo } from "@/lib/pdf/pdf-loader";
import {
  setActiveDocument,
  getActiveDocument,
  clearActiveDocument,
  subscribeActiveDocument,
  ActiveDocumentState,
} from "@/lib/active-document";
import { addRecentFile } from "@/lib/storage";

const QUICK_ACTIONS = [
  { id: "edit-pdf", name: "Edit PDF", href: "/edit-pdf", icon: PenLine, desc: "Edit text & sign" },
  { id: "compress", name: "Compress", href: "/compress-pdf", icon: Minimize2, desc: "Reduce file size" },
  { id: "organize", name: "Organize Pages", href: "/organize-pdf", icon: LayoutGrid, desc: "Reorder & delete" },
  { id: "split", name: "Split", href: "/split-pdf", icon: Scissors, desc: "Extract pages" },
  { id: "rotate", name: "Rotate", href: "/rotate-pdf", icon: RotateCw, desc: "Fix orientation" },
  { id: "page-numbers", name: "Page Numbers", href: "/add-page-numbers", icon: Hash, desc: "Number pages" },
  { id: "watermark", name: "Watermark", href: "/watermark-pdf", icon: Stamp, desc: "Add stamp" },
  { id: "add-text", name: "Add Text", href: "/add-text-to-pdf", icon: Type, desc: "Insert notes" },
  { id: "crop", name: "Crop", href: "/crop-pdf", icon: Crop, desc: "Trim margins" },
  { id: "pdf-to-images", name: "To Images", href: "/pdf-to-images", icon: FileImage, desc: "Export PNG/JPG" },
  { id: "pdf-to-text", name: "To Text", href: "/pdf-to-text", icon: FileCode, desc: "Extract text" },
  { id: "protect", name: "Protect", href: "/protect-pdf", icon: Lock, desc: "AES-256 encrypt" },
];

export function DocumentDropzone() {
  const [activeDoc, setActiveDocState] = useState<ActiveDocumentState | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Sync with active document singleton
  useEffect(() => {
    setActiveDocState(getActiveDocument());
    const unsub = subscribeActiveDocument(() => {
      setActiveDocState(getActiveDocument());
    });
    return unsub;
  }, []);

  const handleProcessFile = async (file: File) => {
    if (!file) return;
    setErrorMessage(null);

    // Validate type
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setErrorMessage("Please select a valid PDF document.");
      return;
    }

    // Limit check (150MB safe memory limit)
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

      // Track in recent files history
      addRecentFile({
        name: file.name,
        size: file.size,
        pageCount: info.pageCount,
        toolId: "workspace",
        toolName: "Document Workspace",
      });
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

  const handleClear = () => {
    clearActiveDocument();
    setErrorMessage(null);
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        id="home-dropzone-file"
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* State 1: Active Loaded Document Workspace */}
      {activeDoc ? (
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-paper animate-in fade-in-50 duration-200">
          {/* Header of Active Document */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 border border-accent/20 text-accent">
                <FileText className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-foreground truncate max-w-md">
                    {activeDoc.name}
                  </h3>
                  <span className="inline-flex items-center rounded-md border border-border bg-surface-subtle px-2 py-0.5 text-xs font-semibold text-muted-foreground shrink-0">
                    {activeDoc.pageCount} {activeDoc.pageCount === 1 ? "page" : "pages"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
                  <span>{formatFileSize(activeDoc.size)}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-success">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Loaded in browser memory
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <Link
                href="/edit-pdf"
                className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background hover:opacity-90 shadow-sm transition"
              >
                <PenLine className="h-3.5 w-3.5" />
                <span>Open in PDF Editor</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-subtle transition"
              >
                Change PDF
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition"
                aria-label="Remove document"
                title="Clear loaded file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Actions Grid for Loaded Document */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Choose an action for this document
              </h4>
              <span className="text-xs text-muted-foreground">
                Document preloaded for instant editing
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                const isEditor = action.id === "edit-pdf";
                return (
                  <Link
                    key={action.id}
                    href={action.href}
                    className={`group flex flex-col justify-between rounded-xl border p-3.5 transition shadow-sm hover:shadow-paper ${
                      isEditor
                        ? "border-blue-500/50 bg-blue-50/40 dark:bg-blue-950/20 ring-1 ring-blue-500/30"
                        : "border-border bg-surface-subtle/50 hover:border-border-strong hover:bg-surface"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                        isEditor
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-border bg-surface text-foreground group-hover:bg-foreground group-hover:text-background group-hover:border-foreground"
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex items-center gap-1">
                        {isEditor && (
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Editor</span>
                        )}
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-xs font-semibold text-foreground block">
                        {action.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground block truncate">
                        {action.desc}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* State 2: Document-First Upload Surface (Empty State) */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-150 ${
            isDragOver
              ? "border-accent bg-accent/5 ring-4 ring-accent/10"
              : "border-border bg-surface hover:border-border-strong hover:bg-surface-subtle/50"
          }`}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="mt-3 text-sm font-medium text-foreground">Reading document in memory...</p>
            </div>
          ) : (
            <>
              {/* Minimal Document Icon */}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface-subtle text-foreground transition-transform group-hover:scale-105 shadow-paper">
                <FileText className="h-7 w-7 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>

              {/* Upload Prompts */}
              <div className="mt-5">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  Drop a PDF here
                </h2>
                <p className="mt-1 text-sm text-muted-foreground font-normal">
                  or choose a file from your device
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-paper transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Upload className="h-4 w-4" />
                  <span>Choose PDF</span>
                </button>
              </div>

              {/* File details & privacy note */}
              <div className="mt-6 flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
                <p>Accepts standard PDF documents up to 150MB</p>
                <div className="flex items-center gap-1.5 font-medium text-foreground/80">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                  <span>Processed 100% locally in your browser. Files never leave your device.</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error Message if any */}
      {errorMessage && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive font-medium">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="ml-auto text-destructive/80 hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
