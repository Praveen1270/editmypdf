"use client";

import { useState } from "react";
import { Languages, Loader2, FileText, Download, RefreshCw, Copy } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { getPdfInfo } from "@/lib/pdf/pdf-loader";
import { formatFileSize } from "@/lib/utils";

export default function TranslatePdfPage() {
  const [file, setFile] = useState<{ name: string; size: number; bytes: Uint8Array; pageCount: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);

  const handleFile = async (files: File[]) => {
    if (files.length === 0) return;
    setErrorMessage(null); setText(null);
    const f = files[0];
    try {
      const buffer = await f.arrayBuffer();
      const uint8 = new Uint8Array(buffer);
      const info = await getPdfInfo(uint8);
      setFile({ name: f.name, size: f.size, bytes: uint8, pageCount: info.pageCount });
    } catch (err: any) {
      setErrorMessage(`Failed to read PDF: ${err?.message || "File error"}`);
    }
  };

  const handleRun = async () => {
    if (!file) return;
    setIsProcessing(true); setErrorMessage(null);
    try {
      const pdfjs = await (await import("@/lib/pdf/pdf-loader")).getPdfJs();
      const task = pdfjs.getDocument({ data: file.bytes.slice() });
      const doc = await task.promise;
      const parts: string[] = [];
      for (let p = 1; p <= doc.numPages; p++) {
        const page = await doc.getPage(p);
        const content = await page.getTextContent();
        const pageText = (content.items as any[]).map((i) => i.str).join(" ");
        parts.push(`--- Page ${p} ---\n${pageText}`);
      }
      await doc.destroy();
      setText(parts.join("\n\n"));
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to extract text.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (text) await navigator.clipboard.writeText(text);
  };

  const handleReset = () => { setFile(null); setText(null); setErrorMessage(null); };

  return (
    <ToolPageLayout toolId="translate-pdf" toolName="Translate PDF" description="Extract document text for translation. A fully local translation engine is not bundled in this build; extracted text can be translated with your preferred offline tool.">
      {text ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
            Translation is not performed here. This tool extracts the source text so you can translate it without uploading the document. No text is sent to any service.
          </div>
          <textarea readOnly value={text} className="w-full h-96 rounded-lg border border-border bg-surface-base p-3 text-xs" />
          <div className="flex gap-2">
            <button onClick={handleCopy} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-raised"><Copy className="h-3.5 w-3.5" /> Copy</button>
            <button onClick={handleReset} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"><RefreshCw className="h-3 w-3" /> Start Again</button>
          </div>
        </div>
      ) : !file ? (
        <DropZone accept=".pdf" multiple={false} title="Drop your PDF here" subtitle="or browse to extract text" onFilesSelected={handleFile} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)} · {file.pageCount} pages</p>
            </div>
            <button onClick={handleReset} className="ml-auto text-xs text-muted-foreground hover:text-destructive">Change File</button>
          </div>
          {errorMessage && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">{errorMessage}</div>}
          {isProcessing ? <div className="flex items-center gap-3 py-4 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" /><span>Extracting…</span></div> : (
            <button onClick={handleRun} className="rounded-lg bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-text hover:opacity-90">Extract Text</button>
          )}
        </div>
      )}
    </ToolPageLayout>
  );
}
