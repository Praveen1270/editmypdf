"use client";

import { useState } from "react";
import { Sparkles, Loader2, Download, RefreshCw, Copy, Check } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { streamGemini, extractPdfTextForContext } from "@/lib/ai/gemini";
import { downloadBytes } from "@/lib/files/download";

export default function AiSummarizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [mode, setMode] = useState<"quick" | "bullets" | "detailed">("quick");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setErrorMessage(null); setSummary("");
    setFile(files[0]);
  };

  const handleRun = async () => {
    if (!file || !apiKey) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setSummary("");
    try {
      const buf = await file.arrayBuffer();
      const text = await extractPdfTextForContext(new Uint8Array(buf));
      const prompts = {
        quick: "Write a 3-5 sentence overview of the document.",
        bullets: "Write 8-12 bullet points summarizing the key information.",
        detailed: "Write a detailed section-by-section summary of the document.",
      };
      const system = `You are a summarizer. ${prompts[mode]} Use only the document content.`;
      const user = `DOCUMENT:\n${text.slice(0, 150000)}`;
      await streamGemini(apiKey, system, [], user, (token) => setSummary((s) => s + token));
    } catch (err: any) {
      setErrorMessage(`Failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(summary); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { setErrorMessage("Copy failed."); }
  };

  const handleDownload = () => {
    if (!summary) return;
    const enc = new TextEncoder();
    downloadBytes(enc.encode(summary), "summary.txt", "text/plain;charset=utf-8");
  };

  const handleReset = () => { setFile(null); setSummary(""); setErrorMessage(null); };

  return (
    <ToolPageLayout toolId="ai-summarizer" toolName="AI PDF Summarizer" description="Summarize a PDF with quick, bullet or detailed modes using Gemini.">
      <div className="space-y-6">
        {errorMessage && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">{errorMessage}</div>}

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold">Gemini API key (kept in memory)</label>
          <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="AIza..." className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs" />
        </div>

        {!file ? (
          <DropZone accept=".pdf" multiple={false} title="Drop your PDF here" subtitle="or browse" onFilesSelected={handleFileSelected} />
        ) : (
          <>
            <p className="text-xs text-muted-foreground">{file.name}</p>
            <div className="flex gap-3">
              <select value={mode} onChange={(e) => setMode(e.target.value as any)} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs">
                <option value="quick">Quick (3-5 sentences)</option>
                <option value="bullets">Bullets (8-12 points)</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
            {isProcessing ? (
              <div className="flex flex-col items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="mt-3 text-sm">Summarizing…</p></div>
            ) : (
              <button onClick={handleRun} className="rounded-lg bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-text hover:opacity-90">Summarize</button>
            )}
            {summary && (
              <div className="space-y-3">
                <textarea readOnly value={summary} rows={12} className="w-full rounded-xl border border-border bg-muted/20 p-4 text-xs text-foreground resize-y" />
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-subtle">
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} Copy
                  </button>
                  <button onClick={handleDownload} className="inline-flex items-center gap-1.5 rounded-lg bg-action-primary px-3 py-1.5 text-xs font-semibold text-action-primary-text hover:opacity-90">
                    <Download className="h-3.5 w-3.5" /> Download .txt
                  </button>
                </div>
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