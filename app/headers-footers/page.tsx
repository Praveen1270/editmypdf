"use client";

import { useState } from "react";
import { AlignJustify, Loader2, Download, RefreshCw } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { addHeadersFooters, HeaderFooterSlots } from "@/lib/pdf/headers-footers";
import { downloadBytes } from "@/lib/files/download";

export default function HeadersFootersPage() {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [slots, setSlots] = useState<HeaderFooterSlots>({});
  const [fontSize, setFontSize] = useState(9);
  const [skipFirst, setSkipFirst] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    const buf = await f.arrayBuffer();
    setFile({ name: f.name, bytes: new Uint8Array(buf) });
    setErrorMessage(null); setResultBytes(null);
  };

  const handleRun = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const bytes = await addHeadersFooters(file.bytes, { slots, fontSize, skipFirstPage: skipFirst, filename: file.name });
      setResultBytes(bytes);
    } catch (err: any) {
      setErrorMessage(`Failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBytes || !file) return;
    downloadBytes(resultBytes, file.name.replace(/\.pdf$/i, "") + "-hf.pdf", "application/pdf");
  };

  const handleReset = () => { setFile(null); setResultBytes(null); setErrorMessage(null); setSlots({}); };

  const slotInput = (key: keyof HeaderFooterSlots, label: string) => (
    <div className="flex flex-col">
      <span className="text-[10px] text-muted-foreground mb-1">{label}</span>
      <input value={slots[key] || ""} onChange={(e) => setSlots({ ...slots, [key]: e.target.value })} placeholder="{page} of {pages}" className="rounded-lg border border-border bg-surface-base px-2 py-1 text-xs" />
    </div>
  );

  return (
    <ToolPageLayout toolId="headers-footers" toolName="Headers & Footers" description="Add custom text, dates and page numbers at the top and bottom of every page.">
      <div className="space-y-6">
        {errorMessage && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">{errorMessage}</div>}

        {!file ? (
          <DropZone accept=".pdf" multiple={false} title="Drop your PDF here" subtitle="or browse" onFilesSelected={handleFileSelected} />
        ) : (
          <>
            <p className="text-xs text-muted-foreground">{file.name}</p>

            <div className="space-y-2">
              <p className="text-xs font-semibold">Header</p>
              <div className="grid grid-cols-3 gap-2">
                {slotInput("headerLeft", "Left")}
                {slotInput("headerCenter", "Center")}
                {slotInput("headerRight", "Right")}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold">Footer</p>
              <div className="grid grid-cols-3 gap-2">
                {slotInput("footerLeft", "Left")}
                {slotInput("footerCenter", "Center")}
                {slotInput("footerRight", "Right")}
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-16 rounded-lg border border-border bg-surface-base px-2 py-1.5 text-xs" />
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={skipFirst} onChange={(e) => setSkipFirst(e.target.checked)} /> Skip first page</label>
            </div>
            <p className="text-[10px] text-muted-foreground">Tokens: {"{page}"} {"{pages}"} {"{date}"} {"{filename}"} {"{title}"}</p>

            {isProcessing ? (
              <div className="flex flex-col items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="mt-3 text-sm">Applying…</p></div>
            ) : (
              <button onClick={handleRun} className="rounded-lg bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-text hover:opacity-90">Apply Headers & Footers</button>
            )}

            {resultBytes && (
              <div className="rounded-xl border border-border bg-surface-raised p-4 text-xs">
                <p className="font-semibold">Done</p>
                <button onClick={handleDownload} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-action-primary px-3 py-1.5 text-xs font-semibold text-action-primary-text hover:opacity-90">
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              </div>
            )}
          </>
        )}

        <button onClick={handleReset} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
          <RefreshCw className="h-3 w-3" /> Start Again
        </button>
      </div>
    </ToolPageLayout>
  );
}