"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Type,
  ArrowLeft,
  Undo2,
  Redo2,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Check,
  X,
  Trash2,
  Sparkles,
  Loader2,
  FileText,
  RotateCcw,
} from "lucide-react";
import { getPdfInfo, getPdfjs } from "@/lib/pdf/pdf-loader";
import {
  extractPageText,
  applyTextEditsToPdf,
  PageTextExtraction,
  DetectedTextItem,
  AppliedTextEdit,
} from "@/lib/pdf/text-editor";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";
import { ResultCard } from "@/components/tools/ResultCard";

const COLOR_PRESETS = [
  "#000000",
  "#222222",
  "#4B5563",
  "#1E3A8A",
  "#B91C1C",
  "#047857",
  "#D97706",
];

const BG_COLOR_PRESETS = [
  "#FFFFFF",
  "#F9FAFB",
  "#F3F4F6",
  "#FFFBEB",
  "#FEF2F2",
  "#000000",
];

export default function EditPdfTextPage() {
  // Document state
  const [file, setFile] = useState<{
    name: string;
    size: number;
    bytes: Uint8Array;
    pageCount: number;
  } | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1.25);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extracted text data for current page
  const [pageData, setPageData] = useState<PageTextExtraction | null>(null);

  // Applied text edits across document
  const [appliedEdits, setAppliedEdits] = useState<AppliedTextEdit[]>([]);

  // Undo / Redo history stacks
  const [history, setHistory] = useState<AppliedTextEdit[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Currently selected text item for contextual editing
  const [selectedItem, setSelectedItem] = useState<DetectedTextItem | null>(null);

  // Form fields for active edit
  const [editReplacementText, setEditReplacementText] = useState<string>("");
  const [editFontFamily, setEditFontFamily] = useState<"Helvetica" | "TimesRoman" | "Courier">("Helvetica");
  const [editFontSize, setEditFontSize] = useState<number>(12);
  const [editColorHex, setEditColorHex] = useState<string>("#000000");
  const [editBgColorHex, setEditBgColorHex] = useState<string>("#FFFFFF");
  const [editIsBold, setEditIsBold] = useState<boolean>(false);
  const [editIsItalic, setEditIsItalic] = useState<boolean>(false);
  const [editAutoFit, setEditAutoFit] = useState<boolean>(true);

  // Export state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportedPdfBytes, setExportedPdfBytes] = useState<Uint8Array | null>(null);
  const [exportedFilename, setExportedFilename] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load and process PDF file
  const handleFileChange = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);
    const selected = files[0];

    if (!selected.name.toLowerCase().endsWith(".pdf") && selected.type !== "application/pdf") {
      setErrorMessage("Please select a valid PDF file.");
      return;
    }

    try {
      const buffer = await selected.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const info = await getPdfInfo(bytes);

      setFile({
        name: selected.name,
        size: selected.size,
        bytes,
        pageCount: info.pageCount,
      });

      setCurrentPage(1);
      setAppliedEdits([]);
      setHistory([[]]);
      setHistoryIndex(0);
      setSelectedItem(null);
      setExportedPdfBytes(null);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load PDF document.");
    }
  };

  // Extract page text and render canvas whenever file or currentPage or zoom changes
  const renderCurrentPage = useCallback(async () => {
    if (!file) return;
    setIsLoadingPage(true);
    setErrorMessage(null);

    try {
      // 1. Extract text and geometric metrics
      const extracted = await extractPageText(file.bytes, currentPage);
      setPageData(extracted);

      // 2. Render PDF page to canvas via PDF.js
      const pdfjs = await getPdfjs();
      const loadingTask = pdfjs.getDocument({ data: file.bytes.slice() });
      const doc = await loadingTask.promise;

      try {
        const page = await doc.getPage(currentPage);
        const viewport = page.getViewport({ scale: zoom });

        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            await page.render({
              canvasContext: ctx,
              viewport,
            }).promise;
          }
        }
      } finally {
        await doc.destroy();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Error rendering document page.");
    } finally {
      setIsLoadingPage(false);
    }
  }, [file, currentPage, zoom]);

  useEffect(() => {
    if (file) {
      renderCurrentPage();
    }
  }, [file, currentPage, zoom, renderCurrentPage]);

  // Select a text item to edit
  const handleSelectTextItem = (item: DetectedTextItem) => {
    setSelectedItem(item);

    // Check if item already has an applied edit
    const existingEdit = appliedEdits.find(
      (e) => e.pageIndex === item.pageIndex && e.id === item.id
    );

    if (existingEdit) {
      setEditReplacementText(existingEdit.replacementText);
      setEditFontFamily(existingEdit.fontFamily);
      setEditFontSize(existingEdit.fontSize);
      setEditColorHex(existingEdit.colorHex);
      setEditBgColorHex(existingEdit.backgroundColorHex);
      setEditIsBold(existingEdit.isBold);
      setEditIsItalic(existingEdit.isItalic);
      setEditAutoFit(existingEdit.autoFitWidth ?? true);
    } else {
      setEditReplacementText(item.text);
      setEditFontFamily(item.matchedFontFamily);
      setEditFontSize(item.fontSize);
      setEditColorHex(item.colorHex || "#000000");
      setEditBgColorHex("#FFFFFF");
      setEditIsBold(item.isBold);
      setEditIsItalic(item.isItalic);
      setEditAutoFit(true);
    }
  };

  // Apply changes to the active edit
  const handleApplyEdit = () => {
    if (!selectedItem) return;

    const newEdit: AppliedTextEdit = {
      id: selectedItem.id,
      pageIndex: selectedItem.pageIndex,
      originalText: selectedItem.text,
      replacementText: editReplacementText,
      boxX: selectedItem.boxX,
      boxY: selectedItem.boxY,
      boxWidth: selectedItem.boxWidth,
      boxHeight: selectedItem.boxHeight,
      baselineX: selectedItem.baselineX,
      baselineY: selectedItem.baselineY,
      fontFamily: editFontFamily,
      fontSize: editFontSize,
      colorHex: editColorHex,
      backgroundColorHex: editBgColorHex,
      isBold: editIsBold,
      isItalic: editIsItalic,
      autoFitWidth: editAutoFit,
    };

    // Filter out previous edit for the same item if any, and append new
    const updated = appliedEdits.filter(
      (e) => !(e.pageIndex === newEdit.pageIndex && e.id === newEdit.id)
    );
    updated.push(newEdit);

    // Push to history for undo/redo
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updated);

    setAppliedEdits(updated);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setSelectedItem(null);
  };

  // Delete/Redact selected text
  const handleDeleteText = () => {
    if (!selectedItem) return;
    setEditReplacementText("");
    const newEdit: AppliedTextEdit = {
      id: selectedItem.id,
      pageIndex: selectedItem.pageIndex,
      originalText: selectedItem.text,
      replacementText: "", // Blank replacement covers original text
      boxX: selectedItem.boxX,
      boxY: selectedItem.boxY,
      boxWidth: selectedItem.boxWidth,
      boxHeight: selectedItem.boxHeight,
      baselineX: selectedItem.baselineX,
      baselineY: selectedItem.baselineY,
      fontFamily: editFontFamily,
      fontSize: editFontSize,
      colorHex: editColorHex,
      backgroundColorHex: editBgColorHex,
      isBold: false,
      isItalic: false,
    };

    const updated = appliedEdits.filter(
      (e) => !(e.pageIndex === newEdit.pageIndex && e.id === newEdit.id)
    );
    updated.push(newEdit);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updated);

    setAppliedEdits(updated);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setSelectedItem(null);
  };

  // Remove a specific applied edit
  const handleRemoveEdit = (editId: string, pageIdx: number) => {
    const updated = appliedEdits.filter(
      (e) => !(e.pageIndex === pageIdx && e.id === editId)
    );
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updated);

    setAppliedEdits(updated);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo action
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setAppliedEdits(history[prevIndex]);
      setSelectedItem(null);
    }
  };

  // Redo action
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setAppliedEdits(history[nextIndex]);
      setSelectedItem(null);
    }
  };

  // Keyboard shortcut listener for Ctrl+Z and Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        handleRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historyIndex, history]);

  // Export modified PDF
  const handleExport = async () => {
    if (!file) return;
    setIsExporting(true);
    setErrorMessage(null);

    try {
      const modifiedBytes = await applyTextEditsToPdf(file.bytes, appliedEdits);
      setExportedPdfBytes(modifiedBytes);
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      setExportedFilename(`${baseName}-edited.pdf`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to generate modified PDF document.");
    } finally {
      setIsExporting(false);
    }
  };

  const currentEdits = appliedEdits.filter((e) => e.pageIndex === currentPage - 1);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors pb-16">
      {/* 1. WORKSPACE HEADER */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="mx-auto flex max-w-content items-center justify-between gap-4">
          {/* Left: Back Link & Tool Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/#tools"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition shrink-0"
              title="Back to all tools"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-foreground truncate">
                  Edit PDF Text
                </span>
                <span className="inline-flex items-center gap-1 rounded border border-foreground/20 bg-foreground/5 px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                  <Sparkles className="h-2.5 w-2.5" />
                  <span>Flagship</span>
                </span>
              </div>
              {file && (
                <p className="text-[11px] text-muted-foreground truncate max-w-xs sm:max-w-md">
                  {file.name} · {formatFileSize(file.size)}
                </p>
              )}
            </div>
          </div>

          {/* Center / Right: Navigation & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {file && !exportedPdfBytes && (
              <>
                {/* Undo / Redo controls */}
                <div className="flex items-center rounded-lg border border-border bg-surface p-0.5">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={historyIndex === 0}
                    aria-label="Undo edit"
                    title="Undo (Ctrl+Z)"
                    className="p-1.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground transition"
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    aria-label="Redo edit"
                    title="Redo (Ctrl+Y)"
                    className="p-1.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground transition"
                  >
                    <Redo2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Edit Count Badge */}
                <span className="hidden sm:inline-block rounded-md border border-border bg-surface-subtle px-2 py-1 text-xs font-medium text-foreground">
                  {appliedEdits.length} {appliedEdits.length === 1 ? "edit" : "edits"}
                </span>

                {/* Primary Export Action */}
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={isExporting}
                  className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-xs sm:text-sm font-semibold text-background shadow-paper transition hover:opacity-90 disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Export PDF</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <main className="mx-auto max-w-content px-4 py-6 sm:px-6 lg:px-8">
        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-medium text-destructive">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="p-1 rounded hover:bg-destructive/20"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* STATE A: EXPORT COMPLETED RESULT CARD */}
        {exportedPdfBytes ? (
          <div className="max-w-3xl mx-auto">
            <ResultCard
              filename={exportedFilename}
              pdfBytes={exportedPdfBytes}
              filesize={exportedPdfBytes.byteLength}
              notes="All applied text replacements were compiled directly into the PDF content stream."
              downloadButtonLabel="Download Edited PDF"
              onDownload={(customName) => {
                downloadBytes(exportedPdfBytes, customName || exportedFilename, "application/pdf");
              }}
              onReset={() => {
                setExportedPdfBytes(null);
              }}
            />
          </div>
        ) : !file ? (
          /* STATE B: EMPTY UPLOAD STATE */
          <div className="max-w-2xl mx-auto mt-8 sm:mt-12">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files) handleFileChange(e.dataTransfer.files);
              }}
              className="group cursor-pointer rounded-2xl border-2 border-dashed border-border bg-surface p-8 sm:p-14 text-center shadow-paper transition hover:border-foreground/40 hover:bg-surface-subtle"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface-subtle text-foreground shadow-paper group-hover:scale-105 transition-transform">
                <Type className="h-7 w-7 text-foreground" />
              </div>

              <h2 className="mt-5 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Upload a PDF to edit its text
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Click any existing text inside your document to change wording, correct numbers, or fix typos while preserving original styling.
              </p>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-xs sm:text-sm font-semibold text-background shadow-paper hover:opacity-90 transition"
                >
                  <FileText className="h-4 w-4" />
                  <span>Choose PDF</span>
                </button>
              </div>

              <div className="mt-8 flex flex-col items-center gap-1.5 text-xs text-muted-foreground border-t border-border pt-6">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <ShieldCheck className="h-4 w-4 text-foreground" />
                  <span>100% In-Browser Volatile RAM Guarantee</span>
                </div>
                <p className="text-[11px]">
                  Works best with documents containing selectable vector text. Files never leave your browser.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFileChange(e.target.files);
                }}
              />
            </div>
          </div>
        ) : (
          /* STATE C: ACTIVE EDITING WORKSPACE */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Document View & Interactive Canvas (8 Cols on lg) */}
            <div className="lg:col-span-8 flex flex-col items-center">
              {/* Document Toolbar: Page Navigation + Zoom */}
              <div className="w-full flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 shadow-paper mb-4 text-xs font-medium">
                {/* Page Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition"
                    title="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="font-semibold text-foreground">
                    Page {currentPage} of {file.pageCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(file.pageCount, p + 1))}
                    disabled={currentPage >= file.pageCount}
                    className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition"
                    title="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Text count indicator */}
                <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <span>{pageData?.items.length || 0} selectable items</span>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.75, Math.round((z - 0.25) * 100) / 100))}
                    className="p-1 rounded hover:bg-surface-subtle text-muted-foreground hover:text-foreground transition"
                    title="Zoom out"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                  <span className="font-mono text-muted-foreground w-12 text-center text-[11px]">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(2.5, Math.round((z + 0.25) * 100) / 100))}
                    className="p-1 rounded hover:bg-surface-subtle text-muted-foreground hover:text-foreground transition"
                    title="Zoom in"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom(1.0)}
                    className="ml-1 rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground transition"
                    title="Reset Zoom"
                  >
                    100%
                  </button>
                </div>
              </div>

              {/* Scanned Document Warning if detected */}
              {pageData?.isScanned && (
                <div className="w-full mb-4 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/50 p-4 text-xs text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold block mb-0.5">Scanned Page Detected</span>
                    This page appears to be a scanned image or photo without selectable vector text streams. Text editing works on vector text elements.
                  </div>
                </div>
              )}

              {/* PDF Document Canvas & Interactive Text Overlay */}
              <div className="relative overflow-auto max-w-full rounded-2xl border border-border bg-surface-subtle/30 p-2 sm:p-4 shadow-paper">
                {isLoadingPage && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl">
                    <Loader2 className="h-8 w-8 animate-spin text-foreground" />
                    <p className="mt-2 text-xs font-semibold text-foreground">Rendering page {currentPage}...</p>
                  </div>
                )}

                <div
                  className="relative inline-block border border-border bg-white shadow-paper rounded-lg overflow-hidden"
                  style={{
                    width: pageData?.pageWidth ? `${pageData.pageWidth * zoom}px` : "auto",
                    height: pageData?.pageHeight ? `${pageData.pageHeight * zoom}px` : "auto",
                  }}
                >
                  {/* Canvas rendering native PDF */}
                  <canvas ref={canvasRef} className="block pointer-events-none" />

                  {/* Interactive Text Selection Layer */}
                  {pageData && (
                    <div className="absolute inset-0 select-none">
                      {pageData.items.map((item) => {
                        // Viewport conversion:
                        // PDF points coordinate: (boxX, boxY) from bottom-left
                        // Canvas coordinate: top = (pageHeight - (boxY + boxHeight)) * zoom, left = boxX * zoom
                        const left = item.boxX * zoom;
                        const top = (pageData.pageHeight - (item.boxY + item.boxHeight)) * zoom;
                        const width = item.boxWidth * zoom;
                        const height = item.boxHeight * zoom;

                        const isSelected = selectedItem?.id === item.id;
                        const edit = appliedEdits.find(
                          (e) => e.pageIndex === item.pageIndex && e.id === item.id
                        );

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleSelectTextItem(item)}
                            title={`Click to edit: "${item.text}"`}
                            style={{
                              position: "absolute",
                              left: `${left}px`,
                              top: `${top}px`,
                              width: `${width}px`,
                              height: `${height}px`,
                            }}
                            className={`cursor-pointer transition-all ${
                              isSelected
                                ? "ring-2 ring-foreground bg-foreground/10 z-20"
                                : edit
                                ? "ring-1 ring-foreground/60 z-10"
                                : "hover:ring-1 hover:ring-foreground/40 hover:bg-foreground/5"
                            }`}
                          >
                            {/* If an edit is applied to this item, render the live visual patch & replacement text */}
                            {edit && (
                              <div
                                style={{
                                  backgroundColor: edit.backgroundColorHex || "#FFFFFF",
                                  color: edit.colorHex || "#000000",
                                  fontFamily:
                                    edit.fontFamily === "Courier"
                                      ? "monospace"
                                      : edit.fontFamily === "TimesRoman"
                                      ? "serif"
                                      : "sans-serif",
                                  fontSize: `${edit.fontSize * zoom}px`,
                                  fontWeight: edit.isBold ? "bold" : "normal",
                                  fontStyle: edit.isItalic ? "italic" : "normal",
                                  lineHeight: 1.15,
                                }}
                                className="w-full h-full flex items-center overflow-hidden px-0.5 truncate"
                              >
                                {edit.replacementText}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Contextual Text Editor Panel (4 Cols on lg) */}
            <div className="lg:col-span-4 space-y-5">
              {selectedItem ? (
                /* Active Text Item Editor Card */
                <div className="rounded-2xl border border-border bg-surface p-5 shadow-paper space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4 text-foreground" />
                      <h3 className="text-sm font-bold text-foreground">
                        Edit Text Element
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedItem(null)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground transition"
                      title="Close editor"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Original Text Reference */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Original Text
                    </label>
                    <div className="rounded-lg border border-border bg-surface-subtle p-2 text-xs font-mono text-muted-foreground break-all">
                      {selectedItem.text}
                    </div>
                  </div>

                  {/* Editable Replacement Text */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-foreground mb-1">
                      Replacement Text
                    </label>
                    <textarea
                      rows={3}
                      value={editReplacementText}
                      onChange={(e) => setEditReplacementText(e.target.value)}
                      placeholder="Enter new text..."
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground shadow-paper transition focus:border-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring font-sans"
                    />
                  </div>

                  {/* Typographic Matching Controls */}
                  <div className="space-y-3 border-t border-border pt-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground">
                        Font Family
                      </label>
                      <span className="text-[10px] text-muted-foreground">
                        Detected: {selectedItem.fontFamilyName}
                      </span>
                    </div>
                    <select
                      value={editFontFamily}
                      onChange={(e) => setEditFontFamily(e.target.value as any)}
                      className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground shadow-paper focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="Helvetica">Helvetica (Standard Sans-Serif)</option>
                      <option value="TimesRoman">Times Roman (Standard Serif)</option>
                      <option value="Courier">Courier (Standard Monospace)</option>
                    </select>

                    {/* Font Size & Weight */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                          Font Size (pt)
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={6}
                            max={120}
                            value={editFontSize}
                            onChange={(e) => setEditFontSize(Math.max(6, Number(e.target.value)))}
                            className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground font-mono focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                          Styling
                        </label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditIsBold(!editIsBold)}
                            className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-bold transition ${
                              editIsBold
                                ? "bg-foreground text-background border-foreground"
                                : "border-border bg-surface text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            B
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditIsItalic(!editIsItalic)}
                            className={`flex-1 rounded-lg border px-2 py-1.5 text-xs italic font-serif transition ${
                              editIsItalic
                                ? "bg-foreground text-background border-foreground"
                                : "border-border bg-surface text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            I
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Text Color Picker */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-medium text-muted-foreground">
                          Text Color
                        </label>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {editColorHex}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={editColorHex}
                          onChange={(e) => setEditColorHex(e.target.value)}
                          className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent p-0"
                        />
                        <div className="flex items-center gap-1 flex-1">
                          {COLOR_PRESETS.map((hex) => (
                            <button
                              key={hex}
                              type="button"
                              onClick={() => setEditColorHex(hex)}
                              style={{ backgroundColor: hex }}
                              className={`h-5 w-5 rounded-full border border-border transition hover:scale-110 ${
                                editColorHex.toLowerCase() === hex.toLowerCase()
                                  ? "ring-2 ring-foreground ring-offset-1"
                                  : ""
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Background Patch Color Picker */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-medium text-muted-foreground">
                          Background Patch Color
                        </label>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {editBgColorHex}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={editBgColorHex}
                          onChange={(e) => setEditBgColorHex(e.target.value)}
                          className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent p-0"
                        />
                        <div className="flex items-center gap-1 flex-1">
                          {BG_COLOR_PRESETS.map((hex) => (
                            <button
                              key={hex}
                              type="button"
                              onClick={() => setEditBgColorHex(hex)}
                              style={{ backgroundColor: hex }}
                              className={`h-5 w-5 rounded-full border border-border transition hover:scale-110 ${
                                editBgColorHex.toLowerCase() === hex.toLowerCase()
                                  ? "ring-2 ring-foreground ring-offset-1"
                                  : ""
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Auto-fit width toggle */}
                    <div className="pt-1">
                      <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editAutoFit}
                          onChange={(e) => setEditAutoFit(e.target.checked)}
                          className="rounded border-border text-foreground focus:ring-1 focus:ring-ring"
                        />
                        <span>Auto-scale text size to fit original boundary</span>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleApplyEdit}
                      className="inline-flex items-center justify-center gap-2 w-full rounded-lg bg-foreground py-2 px-4 text-xs font-semibold text-background shadow-paper hover:opacity-90 transition"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Apply Changes</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDeleteText}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface py-1.5 px-3 text-xs font-medium text-destructive hover:bg-destructive/10 transition"
                        title="Erase this text from page"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete Text</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedItem(null)}
                        className="flex-1 inline-flex items-center justify-center rounded-lg border border-border bg-surface py-1.5 px-3 text-xs font-medium text-foreground hover:bg-surface-subtle transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Default Info & Applied Edits Sidebar */
                <div className="rounded-2xl border border-border bg-surface p-5 shadow-paper space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Sparkles className="h-4 w-4 text-foreground" />
                    <h3 className="text-sm font-bold text-foreground">
                      Document Edits
                    </h3>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Click any text element highlighted on the page to modify its words, change font styles, or delete it cleanly.
                  </p>

                  {/* Applied Edits on Current Page */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <span>Edits on Page {currentPage}</span>
                      <span>{currentEdits.length}</span>
                    </div>

                    {currentEdits.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {currentEdits.map((edit) => (
                          <div
                            key={edit.id}
                            className="flex items-start justify-between gap-2 rounded-lg border border-border bg-surface-subtle p-2 text-xs"
                          >
                            <div className="min-w-0">
                              <span className="font-semibold text-foreground truncate block">
                                &ldquo;{edit.replacementText || "[Deleted text]"}&rdquo;
                              </span>
                              <span className="text-[10px] text-muted-foreground truncate block">
                                Was: &ldquo;{edit.originalText}&rdquo;
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveEdit(edit.id, edit.pageIndex)}
                              className="text-muted-foreground hover:text-destructive p-1 rounded"
                              title="Discard this edit"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                        No text edits applied on page {currentPage} yet.
                      </div>
                    )}
                  </div>

                  {/* Privacy reminder */}
                  <div className="border-t border-border pt-4 text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-foreground shrink-0" />
                    <span>Processed 100% locally in browser memory.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
