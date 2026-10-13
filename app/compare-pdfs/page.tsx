"use client";

import { useState } from "react";
import {
  GitCompare,
  Loader2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { comparePdfDocuments, CompareSummary } from "@/lib/pdf/compare";

export default function ComparePdfsPage() {
  const [docA, setDocA] = useState<{ name: string; bytes: Uint8Array } | null>(null);
  const [docB, setDocB] = useState<{ name: string; bytes: Uint8Array } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState<CompareSummary | null>(null);

  const handleSelectA = async (files: File[]) => {
    if (files.length === 0) return;
    try {
      const buffer = await files[0].arrayBuffer();
      setDocA({ name: files[0].name, bytes: new Uint8Array(buffer) });
    } catch (err: any) {
      setErrorMessage(`Failed to read Document A: ${err.message}`);
    }
  };

  const handleSelectB = async (files: File[]) => {
    if (files.length === 0) return;
    try {
      const buffer = await files[0].arrayBuffer();
      setDocB({ name: files[0].name, bytes: new Uint8Array(buffer) });
    } catch (err: any) {
      setErrorMessage(`Failed to read Document B: ${err.message}`);
    }
  };

  const handleCompare = async () => {
    if (!docA || !docB) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await comparePdfDocuments(docA, docB, (step) => {
        setProgressStep(step);
      });
      setSummary(res);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to compare documents.");
    } finally {
      setIsProcessing(false);
      setProgressStep(null);
    }
  };

  const handleReset = () => {
    setDocA(null);
    setDocB(null);
    setSummary(null);
    setErrorMessage(null);
  };

  return (
    <ToolPageLayout
      toolId="compare"
      toolName="Compare PDFs"
      description="Compare two PDF documents side by side in your browser. Highlights added and removed text lines, page counts, and file-size differences."
    >
      {summary ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">Comparison Summary</h2>
              <p className="text-xs text-muted-foreground">
                {summary.nameA} vs {summary.nameB}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Compare Different Files</span>
            </button>
          </div>

          {/* Quick Metrics Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-white p-4">
              <span className="text-xs text-muted-foreground">Page Count</span>
              <div className="mt-2 flex items-center justify-between text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">Doc A:</span>
                  <span className="font-bold text-foreground">{summary.pageCountA} pages</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Doc B:</span>
                  <span className="font-bold text-foreground">{summary.pageCountB} pages</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white p-4">
              <span className="text-xs text-muted-foreground">File Size</span>
              <div className="mt-2 flex items-center justify-between text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">Doc A:</span>
                  <span className="font-bold text-foreground">{summary.sizeFormattedA}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Doc B:</span>
                  <span className="font-bold text-foreground">{summary.sizeFormattedB}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white p-4">
              <span className="text-xs text-muted-foreground">Text Changes</span>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <span className="text-success font-semibold">+{summary.addedCount} added</span>
                <span className="text-destructive font-semibold">-{summary.removedCount} removed</span>
              </div>
            </div>
          </div>

          {/* Scanned Warning if no text */}
          {(!summary.hasTextA || !summary.hasTextB) && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>Notice:</strong> One or both documents contain little or no selectable digital text. If these are scanned documents or bitmap images, text comparison will not detect graphical differences.
              </p>
            </div>
          )}

          {summary.isIdentical && (
            <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 p-4 text-xs font-medium text-success">
              <CheckCircle2 className="h-4 w-4" />
              <span>Documents are identical in text content and page structure!</span>
            </div>
          )}

          {/* Line Diff View */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-2">
              Text Differences
            </h3>
            <div className="max-h-96 overflow-y-auto rounded-xl border border-border bg-muted/10 p-3 font-mono text-xs">
              {summary.diffLines.map((line, idx) => (
                <div
                  key={idx}
                  className={`px-2 py-0.5 rounded leading-relaxed whitespace-pre-wrap ${
                    line.type === "added"
                      ? "bg-green-100/80 text-green-800 font-medium"
                      : line.type === "removed"
                      ? "bg-red-100/80 text-red-800 font-medium line-through"
                      : "text-muted-foreground"
                  }`}
                >
                  <span className="inline-block w-4 opacity-50 select-none">
                    {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                  </span>
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Document A */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-foreground">
                Document A (Original)
              </label>
              {docA ? (
                <div className="flex items-center justify-between rounded-xl border border-border bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-xs text-foreground">{docA.name}</p>
                      <p className="text-[10px] text-muted-foreground">Ready for comparison</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDocA(null)}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <DropZone
                  accept=".pdf"
                  multiple={false}
                  title="Drop Document A"
                  subtitle="Original document"
                  onFilesSelected={handleSelectA}
                />
              )}
            </div>

            {/* Document B */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-foreground">
                Document B (Modified)
              </label>
              {docB ? (
                <div className="flex items-center justify-between rounded-xl border border-border bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-xs text-foreground">{docB.name}</p>
                      <p className="text-[10px] text-muted-foreground">Ready for comparison</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDocB(null)}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <DropZone
                  accept=".pdf"
                  multiple={false}
                  title="Drop Document B"
                  subtitle="Modified document"
                  onFilesSelected={handleSelectB}
                />
              )}
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              {errorMessage}
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center gap-3 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>{progressStep || "Analyzing documents..."}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              onClick={handleCompare}
              disabled={!docA || !docB || isProcessing}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:opacity-50"
            >
              <GitCompare className="h-4 w-4" />
              <span>Compare PDFs</span>
            </button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
