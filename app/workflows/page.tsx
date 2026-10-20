"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Workflow,
  Loader2,
  FileText,
  Lock,
  RotateCw,
  Hash,
  Shield,
  Layers,
  ArrowRight,
  CheckCircle2,
  X,
  Play,
  Settings2,
} from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { ResultCard } from "@/components/tools/ResultCard";
import { mergePDFs } from "@/lib/pdf/merge";
import { compressPDF, CompressionPreset } from "@/lib/pdf/compress";
import { protectPDF } from "@/lib/pdf/security";
import { addPageNumbers } from "@/lib/pdf/page-numbers";
import { rotatePdf } from "@/lib/pdf/rotate";
import { flattenPdf } from "@/lib/pdf/flatten";
import { updatePdfMetadata } from "@/lib/pdf/metadata";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

type WorkflowPresetId =
  | "merge-compress"
  | "compress-protect"
  | "rotate-numbers"
  | "flatten-sanitize";

interface WorkflowPreset {
  id: WorkflowPresetId;
  title: string;
  shortDesc: string;
  step1: string;
  step2: string;
  requiresMultipleFiles: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

const PRESETS: WorkflowPreset[] = [
  {
    id: "merge-compress",
    title: "Merge & Compress",
    shortDesc: "Combine multiple PDFs in sequence, then optimize file size in RAM.",
    step1: "1. Merge documents into single file",
    step2: "2. Compress stream structures losslessly",
    requiresMultipleFiles: true,
    icon: Layers,
  },
  {
    id: "compress-protect",
    title: "Compress & Protect",
    shortDesc: "Optimize file size and apply AES-256 client-side encryption.",
    step1: "1. Compress PDF streams",
    step2: "2. Encrypt with AES-256 password",
    requiresMultipleFiles: false,
    icon: Lock,
  },
  {
    id: "rotate-numbers",
    title: "Rotate & Add Numbers",
    shortDesc: "Fix page orientation across pages and stamp clean sequential page numbers.",
    step1: "1. Rotate all pages to orientation",
    step2: "2. Stamp sequential page numbers",
    requiresMultipleFiles: false,
    icon: RotateCw,
  },
  {
    id: "flatten-sanitize",
    title: "Flatten & Sanitize",
    shortDesc: "Flatten interactive forms and wipe personal metadata for safe sharing.",
    step1: "1. Flatten form fields & annotations",
    step2: "2. Strip personal metadata and creator tags",
    requiresMultipleFiles: false,
    icon: Shield,
  },
];

function WorkflowsContent() {
  const searchParams = useSearchParams();
  const initialPreset = (searchParams.get("preset") as WorkflowPresetId) || "merge-compress";

  const [activePreset, setActivePreset] = useState<WorkflowPresetId>(
    PRESETS.some((p) => p.id === initialPreset) ? initialPreset : "merge-compress"
  );

  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [resultNotes, setResultNotes] = useState<string>("");

  // Options
  const [compressionPreset, setCompressionPreset] = useState<CompressionPreset>("low");
  const [password, setPassword] = useState("");
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [pageNumberPosition, setPageNumberPosition] = useState<"bottom-center" | "bottom-right">("bottom-center");

  useEffect(() => {
    const q = searchParams.get("preset") as WorkflowPresetId;
    if (q && PRESETS.some((p) => p.id === q)) {
      setActivePreset(q);
    }
  }, [searchParams]);

  const currentPresetDef = PRESETS.find((p) => p.id === activePreset)!;

  const handleFilesSelected = (selected: File[]) => {
    setFiles(selected);
    setResultBytes(null);
    setErrorMessage(null);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRunWorkflow = async () => {
    if (files.length === 0) {
      setErrorMessage("Please select at least one PDF document.");
      return;
    }

    if (currentPresetDef.requiresMultipleFiles && files.length < 2) {
      setErrorMessage("This workflow requires at least 2 PDF documents to merge.");
      return;
    }

    if (activePreset === "compress-protect" && !password.trim()) {
      setErrorMessage("Please enter a password to protect the document.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setResultBytes(null);

    try {
      if (activePreset === "merge-compress") {
        setCurrentStep("Step 1/2: Merging selected PDF files in sequence...");
        const inputs = await Promise.all(
          files.map(async (f) => ({
            name: f.name,
            bytes: new Uint8Array(await f.arrayBuffer()),
          }))
        );
        const mergedBytes = await mergePDFs(inputs);

        setCurrentStep("Step 2/2: Compressing combined document streams...");
        const compressed = await compressPDF(mergedBytes, compressionPreset);

        setResultBytes(compressed.bytes);
        setResultNotes(
          `Merged ${files.length} documents (${formatFileSize(
            compressed.originalSize
          )}) into a single optimized file (${formatFileSize(compressed.compressedSize)}).`
        );
      } else if (activePreset === "compress-protect") {
        setCurrentStep("Step 1/2: Compressing document streams...");
        const firstFileBytes = new Uint8Array(await files[0].arrayBuffer());
        const compressed = await compressPDF(firstFileBytes, compressionPreset);

        setCurrentStep("Step 2/2: Encrypting with AES-256 password...");
        const protectedBytes = await protectPDF(compressed.bytes, password.trim());

        setResultBytes(protectedBytes);
        setResultNotes(
          `Document compressed and encrypted with AES-256 standard security.`
        );
      } else if (activePreset === "rotate-numbers") {
        setCurrentStep(`Step 1/2: Rotating pages by ${rotationAngle}°...`);
        const firstFileBytes = new Uint8Array(await files[0].arrayBuffer());
        const { PDFDocument } = await import("pdf-lib");
        const doc = await PDFDocument.load(firstFileBytes, { ignoreEncryption: true });
        const pageCount = doc.getPageCount();
        const rotMap: Record<number, number> = {};
        for (let i = 0; i < pageCount; i++) {
          rotMap[i] = rotationAngle;
        }
        const rotatedBytes = await rotatePdf(firstFileBytes, rotMap);

        setCurrentStep("Step 2/2: Stamping sequential page numbers...");
        const numberedBytes = await addPageNumbers(rotatedBytes, {
          format: "Page {n} of {total}",
          position: "bottom",
          alignment: pageNumberPosition === "bottom-center" ? "center" : "right",
          startNumber: 1,
          fontSize: 10,
          margin: 30,
          skipFirstPage: false,
        });

        setResultBytes(numberedBytes);
        setResultNotes(`Rotated all pages by ${rotationAngle}° and added sequential numbering.`);
      } else if (activePreset === "flatten-sanitize") {
        setCurrentStep("Step 1/2: Flattening form fields and annotations...");
        const firstFileBytes = new Uint8Array(await files[0].arrayBuffer());
        const { bytes: flattenedBytes } = await flattenPdf(firstFileBytes, {
          flattenForms: true,
          removeAnnotations: true,
        });

        setCurrentStep("Step 2/2: Stripping author and personal metadata...");
        const sanitizedBytes = await updatePdfMetadata(flattenedBytes, {}, true);

        setResultBytes(sanitizedBytes);
        setResultNotes("Interactive form fields flattened and personal metadata completely sanitized.");
      }
    } catch (err: any) {
      console.error("Workflow failed:", err);
      setErrorMessage(err?.message || "Workflow execution failed. Please check your documents.");
    } finally {
      setIsProcessing(false);
      setCurrentStep(null);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResultBytes(null);
    setErrorMessage(null);
    setCurrentStep(null);
  };

  const handleDownload = (customFilename?: string) => {
    if (!resultBytes) return;
    const baseName = files[0]?.name ? files[0].name.replace(/\.pdf$/i, "") : "workflow";
    const outName = customFilename || `${baseName}-${activePreset}.pdf`;
    downloadBytes(resultBytes, outName, "application/pdf");
  };

  return (
    <ToolPageLayout
      toolId="workflows"
      toolName="Automated Workflows"
      description="Chain multiple PDF operations together in local memory. Merge, compress, protect, rotate, and flatten documents in one continuous pipeline."
    >
      {resultBytes ? (
        <ResultCard
          filename={`${files[0]?.name ? files[0].name.replace(/\.pdf$/i, "") : "workflow"}-${activePreset}.pdf`}
          filesize={resultBytes.byteLength}
          pdfBytes={resultBytes}
          notes={resultNotes}
          onDownload={handleDownload}
          onReset={handleReset}
        />
      ) : (
        <div className="space-y-6">
          {/* Preset Selector Tabs */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-3">
              Select an Automated Pipeline Preset:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setActivePreset(preset.id);
                      setErrorMessage(null);
                    }}
                    className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-150 ${
                      isSelected
                        ? "border-black dark:border-white bg-zinc-50 dark:bg-zinc-900 shadow-xs ring-1 ring-black dark:ring-white"
                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-black/40 dark:hover:border-white/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white">
                        <Icon className="h-4 w-4 stroke-[2]" />
                      </div>
                      {isSelected && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-sm text-black dark:text-white">
                      {preset.title}
                    </div>
                    <p className="mt-1 text-xs text-[#52504e] dark:text-[#d6d3d1] line-clamp-2 leading-relaxed">
                      {preset.shortDesc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Workflow Pipeline Sequence Overview */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-2">
              Pipeline Steps for {currentPresetDef.title}:
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs font-medium text-black dark:text-white">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5">
                {currentPresetDef.step1}
              </span>
              <ArrowRight className="hidden sm:block h-3.5 w-3.5 text-zinc-400" />
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5">
                {currentPresetDef.step2}
              </span>
            </div>
          </div>

          {/* Pipeline Options based on preset */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black dark:text-white">
              <Settings2 className="h-4 w-4" />
              <span>Pipeline Configuration</span>
            </div>

            {activePreset === "merge-compress" && (
              <div>
                <label className="block text-xs font-semibold text-black dark:text-white mb-1">
                  Compression Mode:
                </label>
                <select
                  value={compressionPreset}
                  onChange={(e) => setCompressionPreset(e.target.value as CompressionPreset)}
                  className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-black dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                >
                  <option value="low">Lossless Structural & Object Streams (Fastest)</option>
                  <option value="recommended">Balanced 150 DPI Compression</option>
                  <option value="high">Maximum 100 DPI Compression</option>
                </select>
              </div>
            )}

            {activePreset === "compress-protect" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-black dark:text-white mb-1">
                    AES-256 Encryption Password:
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter document password"
                    className="w-full sm:w-80 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                  />
                </div>
              </div>
            )}

            {activePreset === "rotate-numbers" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-black dark:text-white mb-1">
                    Rotation Angle:
                  </label>
                  <select
                    value={rotationAngle}
                    onChange={(e) => setRotationAngle(Number(e.target.value))}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-black dark:text-white focus:outline-none"
                  >
                    <option value={90}>Rotate 90° Clockwise</option>
                    <option value={180}>Rotate 180° (Upside Down)</option>
                    <option value={270}>Rotate 270° (Counter-Clockwise)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black dark:text-white mb-1">
                    Page Number Placement:
                  </label>
                  <select
                    value={pageNumberPosition}
                    onChange={(e) => setPageNumberPosition(e.target.value as any)}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-black dark:text-white focus:outline-none"
                  >
                    <option value="bottom-center">Bottom Center</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                </div>
              </div>
            )}

            {activePreset === "flatten-sanitize" && (
              <p className="text-xs text-[#52504e] dark:text-[#d6d3d1]">
                This pipeline flattens all AcroForms, text annotations, and comments into permanent vector content, then scrubs all author, creator, and producer metadata tags.
              </p>
            )}
          </div>

          {/* File Upload Surface */}
          <div>
            <DropZone
              accept=".pdf"
              multiple={currentPresetDef.requiresMultipleFiles || activePreset === "merge-compress"}
              title={
                currentPresetDef.requiresMultipleFiles
                  ? "Drop PDFs to Merge & Process"
                  : "Drop your PDF document here"
              }
              subtitle={
                currentPresetDef.requiresMultipleFiles
                  ? "Select two or more PDF documents"
                  : "Select PDF document to process through pipeline"
              }
              onFilesSelected={handleFilesSelected}
            />

            {/* Selected Files List */}
            {files.length > 0 && (
              <div className="mt-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-3">
                  Selected Documents ({files.length}):
                </div>
                <div className="space-y-2">
                  {files.map((f, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="h-4 w-4 text-black dark:text-white shrink-0" />
                        <span className="font-semibold text-black dark:text-white truncate">
                          {f.name}
                        </span>
                        <span className="text-[11px] text-zinc-500 shrink-0">
                          ({formatFileSize(f.size)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="rounded p-1 text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-3.5 text-xs text-red-600 dark:text-red-400 font-medium">
              {errorMessage}
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center gap-3 py-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium text-black dark:text-white">
              <Loader2 className="h-5 w-5 animate-spin stroke-[2]" />
              <span>{currentStep || "Running multi-step pipeline in browser RAM..."}</span>
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            {files.length > 0 && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isProcessing}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-xs font-bold text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Clear Files
              </button>
            )}
            <button
              type="button"
              onClick={handleRunWorkflow}
              disabled={
                isProcessing ||
                files.length === 0 ||
                (currentPresetDef.requiresMultipleFiles && files.length < 2)
              }
              className="inline-flex items-center gap-2 rounded-xl bg-black text-white dark:bg-white dark:text-black px-6 py-2.5 text-xs font-bold shadow-xs transition hover:opacity-90 disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Run {currentPresetDef.title} Workflow</span>
            </button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}

export default function WorkflowsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-zinc-500">
          Loading workflow pipeline...
        </div>
      }
    >
      <WorkflowsContent />
    </Suspense>
  );
}
