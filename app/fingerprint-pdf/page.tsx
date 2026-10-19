"use client";

import { useState } from "react";
import { Fingerprint, Loader2, Download, RefreshCw, ShieldCheck } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { fingerprintPdf, verifyFingerprint } from "@/lib/pdf/fingerprint";
import { downloadBytes } from "@/lib/files/download";

export default function FingerprintPdfPage() {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(null);
  const [recipientsText, setRecipientsText] = useState("Alice\nBob");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [zipBytes, setZipBytes] = useState<Uint8Array | null>(null);
  const [table, setTable] = useState<{ name: string; id: string }[]>([]);

  // verify mode
  const [suspectFile, setSuspectFile] = useState<{ bytes: Uint8Array } | null>(null);
  const [tableText, setTableText] = useState("");
  const [verifyResult, setVerifyResult] = useState<{ foundIds: string[]; matched: { name: string; id: string }[] } | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    const buf = await f.arrayBuffer();
    setFile({ name: f.name, bytes: new Uint8Array(buf) });
  };

  const handleGenerate = async () => {
    if (!file) return;
    const recipients = recipientsText.split("\n").map((s) => s.trim()).filter(Boolean).map((name) => ({ name }));
    if (recipients.length === 0) { setErrorMessage("Enter at least one recipient."); return; }
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const res = await fingerprintPdf(file.bytes, { recipients });
      setZipBytes(res.zip);
      setTable(res.table);
    } catch (err: any) {
      setErrorMessage(`Failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadZip = () => {
    if (!zipBytes) return;
    downloadBytes(zipBytes, "fingerprinted.zip", "application/zip");
  };

  const handleExportTable = () => {
    const csv = ["name,id", ...table.map((t) => `${t.name},${t.id}`)].join("\n");
    const enc = new TextEncoder();
    downloadBytes(enc.encode(csv), "recipient-table.csv", "text/csv");
  };

  const handleSuspectSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    const buf = await f.arrayBuffer();
    setSuspectFile({ bytes: new Uint8Array(buf) });
  };

  const handleVerify = async () => {
    if (!suspectFile) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const parsed = tableText.trim().split("\n").slice(1).map((line) => {
        const [name, id] = line.split(",");
        return { name: (name || "").trim(), id: (id || "").trim() };
      }).filter((t) => t.id);
      const res = await verifyFingerprint(suspectFile.bytes, parsed.length ? parsed : table);
      setVerifyResult(res);
    } catch (err: any) {
      setErrorMessage(`Verify failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => { setFile(null); setZipBytes(null); setTable([]); setSuspectFile(null); setVerifyResult(null); setErrorMessage(null); };

  return (
    <ToolPageLayout toolId="fingerprint" toolName="Fingerprint PDF" description="Add invisible per-recipient marks so a leaked copy can be traced to its source.">
      <div className="space-y-8">
        {errorMessage && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">{errorMessage}</div>}

        {/* Generate */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-foreground">Generate fingerprinted copies</h3>
          {!file ? (
            <DropZone accept=".pdf" multiple={false} title="Drop your PDF here" subtitle="or browse" onFilesSelected={handleFileSelected} />
          ) : (
            <>
              <p className="text-xs text-muted-foreground">{file.name}</p>
              <textarea value={recipientsText} onChange={(e) => setRecipientsText(e.target.value)} rows={4} placeholder="One recipient per line" className="w-full rounded-xl border border-border bg-muted/20 p-3 text-xs" />
              {isProcessing ? (
                <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-xs">Generating…</span></div>
              ) : (
                <button onClick={handleGenerate} className="rounded-lg bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-text hover:opacity-90">Generate</button>
              )}
              {zipBytes && (
                <div className="space-y-2">
                  <button onClick={handleDownloadZip} className="inline-flex items-center gap-1.5 rounded-lg bg-action-primary px-3 py-1.5 text-xs font-semibold text-action-primary-text hover:opacity-90">
                    <Download className="h-3.5 w-3.5" /> Download ZIP
                  </button>
                  <button onClick={handleExportTable} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-subtle">
                    <Download className="h-3.5 w-3.5" /> Export Recipient Table (CSV)
                  </button>
                  <div className="text-xs text-muted-foreground">{table.length} recipients fingerprinted.</div>
                </div>
              )}
            </>
          )}
        </section>

        {/* Verify */}
        <section className="space-y-3 border-t border-border pt-6">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Verify a leaked copy</h3>
          <DropZone accept=".pdf" multiple={false} title="Drop suspect PDF" subtitle="or browse" onFilesSelected={handleSuspectSelected} />
          <textarea value={tableText} onChange={(e) => setTableText(e.target.value)} rows={4} placeholder="Paste recipient table CSV (name,id) or leave empty to use last generated" className="w-full rounded-xl border border-border bg-muted/20 p-3 text-xs font-mono" />
          {isProcessing ? (
            <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-xs">Verifying…</span></div>
          ) : (
            <button onClick={handleVerify} className="rounded-lg bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-text hover:opacity-90">Verify</button>
          )}
          {verifyResult && (
            <div className="rounded-xl border border-border bg-surface-raised p-4 text-xs space-y-1">
              <p className="font-semibold">Found IDs: {verifyResult.foundIds.join(", ") || "none"}</p>
              {verifyResult.matched.length > 0 ? (
                <p className="text-green-600">Matched recipient(s): {verifyResult.matched.map((m) => m.name).join(", ")}</p>
              ) : (
                <p className="text-amber-600">No recipient matched.</p>
              )}
            </div>
          )}
        </section>

        <button onClick={handleReset} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
          <RefreshCw className="h-3 w-3" /> Start Again
        </button>
      </div>
    </ToolPageLayout>
  );
}