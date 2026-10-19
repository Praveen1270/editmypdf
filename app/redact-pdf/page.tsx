"use client";

import { useState } from "react";
import { Eraser, Loader2, Download, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { redactPdf, RedactRect } from "@/lib/pdf/redact";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function RedactPdfPage() {
  const [file, setFile] = useState<{ name: string; size: number; bytes: Uint8Array } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [redactedCount, setRedactedCount] = useState(0);
  const [verified, setVerified] = useState(true);
  const [remaining, setRemaining] = useState<string[]>([]);
  const [mode, setMode] = useState<"safe" | "precise">("safe");
  const [searchTerms, setSearchTerms] = useState("");
  const [useRegex, setUseRegex] = useState(false);
  const [rects, setRects] = useState<RedactRect[]>([]);
  const [rectInput, setRectInput] = useState({ page: 1, x: 0, y: 0, width: 100, height: 20 });

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setErrorMessage(null); setResultBytes(null);
    const f = files[0];
    try {
      const buffer = await f.arrayBuffer();
      setFile({ name: f.name, size: f.size, bytes: new Uint8Array(buffer) });
    } catch (err: any) {
      setErrorMessage(`Failed to read PDF: ${err?.message || "File error"}`);
    }
  };

  const addRect = () => {
    if (!file) return;
    setRects((r) => [...r, { page: rectInput.page - 1, x: rectInput.x, y: rectInput.y, width: rectInput.width, height: rectInput.height }]);
  };

  const handleRedact = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const terms = searchTerms.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await redactPdf(file.bytes, { rects, searchTerms: terms, useRegex, mode });
      setResultBytes(res.bytes);
      setRedactedCount(res.redactedCount);
      setVerified(res.verified);
      setRemaining(res.remainingMatches);
    } catch (err: any) {
      setErrorMessage(`Failed to redact: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBytes || !file) return;
    downloadBytes(resultBytes, file.name.replace(/\.pdf$/i, "") + "-redacted.pdf", "application/pdf");
  };

  const handleReset = () => {
    setFile(null); setResultBytes(null); setRects([]); setErrorMessage(null); setRemaining([]);
  };

  return (
    <ToolPageLayout toolId="redact" toolName="Redact PDF" description="Permanently remove sensitive text and areas. Safe mode rasterizes pages so content cannot be recovered.">
      {!file ? (
        <DropZone accept=".pdf" multiple={false} title="Drop your PDF here" subtitle="or browse to redact" onFilesSelected={handleFileSelected} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Eraser className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Redact mode</label>
            <select value={mode} onChange={(e) => setMode(e.target.value as any)} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs">
              <option value="safe">Safe (rasterize pages)</option>
              <option value="precise">Precise (uses safe rasterization)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Search terms (comma separated)</label>
            <input value={searchTerms} onChange={(e) => setSearchTerms(e.target.value)} placeholder="email, phone, SSN" className="w-full rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs" />
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={useRegex} onChange={(e) => setUseRegex(e.target.checked)} /> Use regex
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Manual redaction box (points)</label>
            <div className="flex flex-wrap gap-2 items-end">
              {[
                { key: "page", label: "Page" }, { key: "x", label: "X" }, { key: "y", label: "Y" },
                { key: "width", label: "W" }, { key: "height", label: "H" },
              ].map((f) => (
                <div key={f.key} className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground">{f.label}</span>
                  <input type="number" value={(rectInput as any)[f.key]} onChange={(e) => setRectInput((r) => ({ ...r, [f.key]: Number(e.target.value) }))} className="w-16 rounded-lg border border-border bg-surface-base px-2 py-1 text-xs" />
                </div>
              ))}
              <button onClick={addRect} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-subtle">Add Box</button>
            </div>
            {rects.length > 0 && (
              <div className="text-xs text-muted-foreground">{rects.length} box(es) added</div>
            )}
          </div>

          {isProcessing ? (
            <div className="flex flex-col items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="mt-3 text-sm">Redacting…</p></div>
          ) : (
            <button onClick={handleRedact} className="rounded-lg bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-text hover:opacity-90">Redact PDF</button>
          )}

          {resultBytes && (
            <div className="rounded-xl border border-border bg-surface-raised p-4 text-xs space-y-1">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                {verified ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                Redacted {redactedCount} area(s)
              </div>
              {!verified && remaining.length > 0 && (
                <p className="text-amber-600">Some terms may remain: {remaining.join(", ")}</p>
              )}
              <button onClick={handleDownload} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-action-primary px-3 py-1.5 text-xs font-semibold text-action-primary-text hover:opacity-90">
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            </div>
          )}

          {errorMessage && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">{errorMessage}</div>}

          <button onClick={handleReset} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
            <RefreshCw className="h-3 w-3" /> Start Again
          </button>
        </div>
      )}
    </ToolPageLayout>
  );
}
