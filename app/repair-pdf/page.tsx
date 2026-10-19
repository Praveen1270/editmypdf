"use client";

import { useState } from "react";
import { Wrench, Loader2, Download, RefreshCw, CheckCircle2 } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { repairPdf } from "@/lib/pdf/repair";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function RepairPdfPage() {
  const [file, setFile] = useState<{ name: string; size: number; bytes: Uint8Array } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [strategy, setStrategy] = useState("");
  const [pagesRecovered, setPagesRecovered] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");

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

  const handleRepair = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMsg("Starting…");
    try {
      const res = await repairPdf(file.bytes, (m) => setStatusMsg(m));
      setResultBytes(res.bytes);
      setStrategy(res.strategy);
      setPagesRecovered(res.pagesRecovered);
    } catch (err: any) {
      setErrorMessage(`Failed to repair: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBytes || !file) return;
    downloadBytes(resultBytes, file.name.replace(/\.pdf$/i, "") + "-repaired.pdf", "application/pdf");
  };

  const handleReset = () => { setFile(null); setResultBytes(null); setErrorMessage(null); setStatusMsg(""); };

  return (
    <ToolPageLayout toolId="repair" toolName="Repair PDF" description="Recover content from corrupted, truncated or broken PDFs using multiple strategies.">
      {!file ? (
        <DropZone accept=".pdf" multiple={false} title="Drop your PDF here" subtitle="or browse to repair" onFilesSelected={handleFileSelected} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Wrench className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
          </div>

          {isProcessing ? (
            <div className="flex flex-col items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="mt-3 text-sm">{statusMsg}</p></div>
          ) : (
            <button onClick={handleRepair} className="rounded-lg bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-text hover:opacity-90">Repair PDF</button>
          )}

          {resultBytes && (
            <div className="rounded-xl border border-border bg-surface-raised p-4 text-xs space-y-1">
              <div className="flex items-center gap-2 font-semibold text-foreground"><CheckCircle2 className="h-4 w-4 text-green-500" />Recovered</div>
              <p>Strategy: {strategy}</p>
              <p>Pages recovered: {pagesRecovered}</p>
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