"use client";

import { useState } from "react";
import { ShieldAlert, Loader2, Download, RefreshCw, CheckCircle2 } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { scanPdfPrivacy, PrivacyFinding } from "@/lib/pdf/privacy-scan";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

const LEVEL_COLOR: Record<string, string> = {
  high: "text-red-600 bg-red-50 border-red-200",
  medium: "text-amber-600 bg-amber-50 border-amber-200",
  low: "text-blue-600 bg-blue-50 border-blue-200",
};

export default function PrivacyScanPage() {
  const [file, setFile] = useState<{ name: string; size: number; bytes: Uint8Array } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [findings, setFindings] = useState<PrivacyFinding[]>([]);
  const [cleanBytes, setCleanBytes] = useState<Uint8Array | null>(null);
  const [scanned, setScanned] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setErrorMessage(null); setFindings([]); setCleanBytes(null); setScanned(false);
    const f = files[0];
    try {
      const buffer = await f.arrayBuffer();
      setFile({ name: f.name, size: f.size, bytes: new Uint8Array(buffer) });
    } catch (err: any) {
      setErrorMessage(`Failed to read PDF: ${err?.message || "File error"}`);
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const res = await scanPdfPrivacy(file.bytes, { clean: true });
      setFindings(res.findings);
      setCleanBytes(res.cleanedBytes || null);
      setScanned(true);
    } catch (err: any) {
      setErrorMessage(`Failed to scan: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadClean = () => {
    if (!cleanBytes || !file) return;
    downloadBytes(cleanBytes, file.name.replace(/\.pdf$/i, "") + "-clean.pdf", "application/pdf");
  };

  const handleReset = () => {
    setFile(null); setFindings([]); setCleanBytes(null); setScanned(false); setErrorMessage(null);
  };

  return (
    <ToolPageLayout toolId="privacy-scan" toolName="Privacy Risk Scanner" description="Find hidden metadata, scripts, attachments and image EXIF, then export a cleaned copy.">
      {!file ? (
        <DropZone accept=".pdf" multiple={false} title="Drop your PDF here" subtitle="or browse to scan" onFilesSelected={handleFileSelected} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <ShieldAlert className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
          </div>

          {isProcessing ? (
            <div className="flex flex-col items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="mt-3 text-sm">Scanning…</p></div>
          ) : (
            <button onClick={handleScan} className="rounded-lg bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-text hover:opacity-90">Scan PDF</button>
          )}

          {scanned && (
            <div className="space-y-3">
              {findings.length === 0 ? (
                <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  <CheckCircle2 className="h-5 w-5" /> No privacy risks found.
                </div>
              ) : (
                <>
                  <p className="text-xs font-semibold text-foreground">{findings.length} finding(s)</p>
                  <div className="space-y-2">
                    {findings.map((f) => (
                      <div key={f.id} className={`rounded-lg border p-3 text-xs ${LEVEL_COLOR[f.level]}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{f.title}</span>
                          <span className="uppercase text-[10px] font-bold">{f.level}</span>
                        </div>
                        <p className="mt-1 opacity-80">{f.detail}</p>
                        <p className="mt-1 text-[10px] opacity-60">{f.category}</p>
                      </div>
                    ))}
                  </div>
                  {cleanBytes && (
                    <button onClick={handleDownloadClean} className="inline-flex items-center gap-1.5 rounded-lg bg-action-primary px-3 py-1.5 text-xs font-semibold text-action-primary-text hover:opacity-90">
                      <Download className="h-3.5 w-3.5" /> Download Cleaned Copy
                    </button>
                  )}
                </>
              )}
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