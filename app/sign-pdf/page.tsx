"use client";

import { useState } from "react";
import { PenLine, Loader2, FileText, Image as ImageIcon, Download, RefreshCw } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { ResultCard } from "@/components/tools/ResultCard";
import { signPdf } from "@/lib/pdf/sign-pdf";
import { getPdfInfo } from "@/lib/pdf/pdf-loader";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function SignPdfPage() {
  const [file, setFile] = useState<{ name: string; size: number; bytes: Uint8Array; pageCount: number } | null>(null);
  const [sigFile, setSigFile] = useState<File | null>(null);
  const [sigBytes, setSigBytes] = useState<Uint8Array | null>(null);
  const [sigType, setSigType] = useState<"png" | "jpg">("png");
  const [pageIndex, setPageIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);

  const handlePdf = async (files: File[]) => {
    if (files.length === 0) return;
    setErrorMessage(null); setResultBytes(null);
    const f = files[0];
    try {
      const buffer = await f.arrayBuffer();
      const uint8 = new Uint8Array(buffer);
      const info = await getPdfInfo(uint8);
      setFile({ name: f.name, size: f.size, bytes: uint8, pageCount: info.pageCount });
      setPageIndex(0);
    } catch (err: any) {
      setErrorMessage(`Failed to read PDF: ${err?.message || "File error"}`);
    }
  };

  const handleSig = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const isPng = f.type === "image/png" || f.name.toLowerCase().endsWith(".png");
    const isJpg = f.type === "image/jpeg" || f.name.toLowerCase().endsWith(".jpg") || f.name.toLowerCase().endsWith(".jpeg");
    if (!isPng && !isJpg) { setErrorMessage("Signature must be PNG or JPG."); return; }
    const buffer = await f.arrayBuffer();
    setSigFile(f);
    setSigBytes(new Uint8Array(buffer));
    setSigType(isPng ? "png" : "jpg");
    setErrorMessage(null);
  };

  const handleRun = async () => {
    if (!file || !sigBytes) return;
    setIsProcessing(true); setErrorMessage(null);
    try {
      const out = await signPdf(file.bytes, sigBytes, sigType, { pageIndex });
      setResultBytes(out);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to sign PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => { setFile(null); setSigFile(null); setSigBytes(null); setResultBytes(null); setErrorMessage(null); };
  const handleDownload = () => {
    if (!resultBytes || !file) return;
    downloadBytes(resultBytes, file.name.replace(/\.pdf$/i, "") + "-signed.pdf", "application/pdf");
  };

  return (
    <ToolPageLayout toolId="sign-pdf" toolName="Sign PDF" description="Add a visual signature image to a page of your PDF.">
      {resultBytes ? (
        <ResultCard filename="signed.pdf" filesize={resultBytes.byteLength} pdfBytes={resultBytes} fileExtension=".pdf" notes="Signature image placed on selected page." onDownload={handleDownload} onReset={handleReset} />
      ) : (
        <div className="space-y-6">
          {!file ? (
            <DropZone accept=".pdf" multiple={false} title="Drop your PDF here" subtitle="or browse to select" onFilesSelected={handlePdf} />
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-semibold text-foreground text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)} · {file.pageCount} pages</p>
                </div>
                <button onClick={handleReset} className="ml-auto text-xs text-muted-foreground hover:text-destructive">Change PDF</button>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">Signature image (PNG/JPG)</label>
                <input type="file" accept="image/png,image/jpeg" onChange={handleSig} className="text-xs" />
                {sigFile && <p className="mt-1 text-xs text-muted-foreground">{sigFile.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Page (0-based index)</label>
                <input type="number" min={0} max={Math.max(0, (file.pageCount - 1))} value={pageIndex} onChange={(e) => setPageIndex(Number(e.target.value))} className="rounded-lg border border-border px-3 py-1.5 text-xs w-24" />
              </div>
              {errorMessage && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">{errorMessage}</div>}
              {isProcessing ? <div className="flex items-center gap-3 py-4 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" /><span>Signing…</span></div> : (
                <button onClick={handleRun} disabled={!sigBytes} className="inline-flex items-center gap-2 rounded-lg bg-action-primary px-6 py-2 text-sm font-semibold text-action-primary-text shadow-sm transition hover:opacity-90 disabled:opacity-50">
                  <PenLine className="h-4 w-4" /><span>Apply Signature</span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </ToolPageLayout>
  );
}
