"use client";

import { useState } from "react";
import { FileSliders, Loader2, FileText, ShieldAlert, Save } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { ResultCard } from "@/components/tools/ResultCard";
import { readPdfMetadata, updatePdfMetadata, PdfMetadata } from "@/lib/pdf/metadata";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function PdfMetadataEditorPage() {
  const [file, setFile] = useState<{ name: string; size: number; bytes: Uint8Array } | null>(null);
  const [metadata, setMetadata] = useState<PdfMetadata>({
    title: "",
    author: "",
    subject: "",
    keywords: "",
    producer: "",
    creator: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setErrorMessage(null);
    const f = files[0];

    try {
      const buffer = await f.arrayBuffer();
      const uint8 = new Uint8Array(buffer);
      const meta = await readPdfMetadata(uint8);

      setFile({ name: f.name, size: f.size, bytes: uint8 });
      setMetadata(meta);
    } catch (err: any) {
      setErrorMessage(`Failed to read PDF metadata: ${err?.message || "File error"}`);
    }
  };

  const handleSave = async (stripAll: boolean = false) => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const bytes = await updatePdfMetadata(file.bytes, metadata, stripAll);
      setResultBytes(bytes);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to update PDF metadata.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResultBytes(null);
    setErrorMessage(null);
  };

  const handleDownload = (customFilename?: string) => {
    if (resultBytes) {
      downloadBytes(resultBytes, customFilename || (file ? `metadata-${file.name}` : "metadata-updated.pdf"));
    }
  };

  return (
    <ToolPageLayout
      toolId="metadata-editor"
      toolName="PDF Metadata Editor"
      description="Inspect and update document properties (Title, Author, Subject, Keywords). Strip embedded metadata with one click to protect your privacy."
    >
      {resultBytes ? (
        <ResultCard
          filename={file ? `metadata-${file.name}` : "metadata-updated.pdf"}
          filesize={resultBytes.byteLength}
          pdfBytes={resultBytes}
          notes={`Successfully updated document metadata fields for ${file?.name}.`}
          onDownload={handleDownload}
          onReset={handleReset}
        />
      ) : !file ? (
        <DropZone
          accept=".pdf"
          multiple={false}
          title="Drop your PDF here"
          subtitle="or browse to inspect and edit metadata"
          onFilesSelected={handleFileSelected}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <p className="font-semibold text-foreground text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="text-xs font-medium text-muted-foreground hover:text-destructive"
            >
              Choose different file
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground">
                Document Title
              </label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => setMetadata((m) => ({ ...m, title: e.target.value }))}
                placeholder="e.g. Annual Financial Report"
                className="mt-1.5 w-full rounded-lg border border-border bg-surface-base px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-focus"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                Author
              </label>
              <input
                type="text"
                value={metadata.author}
                onChange={(e) => setMetadata((m) => ({ ...m, author: e.target.value }))}
                placeholder="e.g. Jane Doe"
                className="mt-1.5 w-full rounded-lg border border-border bg-surface-base px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-focus"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                Subject
              </label>
              <input
                type="text"
                value={metadata.subject}
                onChange={(e) => setMetadata((m) => ({ ...m, subject: e.target.value }))}
                placeholder="e.g. Q4 Performance Analysis"
                className="mt-1.5 w-full rounded-lg border border-border bg-surface-base px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-focus"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                Keywords (Comma-separated)
              </label>
              <input
                type="text"
                value={metadata.keywords}
                onChange={(e) => setMetadata((m) => ({ ...m, keywords: e.target.value }))}
                placeholder="e.g. finance, quarterly, audit"
                className="mt-1.5 w-full rounded-lg border border-border bg-surface-base px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-focus"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                Creator / Software
              </label>
              <input
                type="text"
                value={metadata.creator}
                onChange={(e) => setMetadata((m) => ({ ...m, creator: e.target.value }))}
                placeholder="e.g. Microsoft Word / InDesign"
                className="mt-1.5 w-full rounded-lg border border-border bg-surface-base px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-focus"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">
                PDF Producer
              </label>
              <input
                type="text"
                value={metadata.producer}
                onChange={(e) => setMetadata((m) => ({ ...m, producer: e.target.value }))}
                placeholder="e.g. Adobe PDF Library"
                className="mt-1.5 w-full rounded-lg border border-border bg-surface-base px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-focus"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-border bg-surface-raised p-3 text-xs text-text-primary">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-base px-4 py-2 text-xs font-semibold text-text-primary hover:bg-surface-raised disabled:opacity-50"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Strip All Metadata (Sanitize)</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                disabled={isProcessing}
                className="rounded-lg border border-border bg-surface-base px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-raised"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 rounded-lg bg-action-primary px-6 py-2 text-sm font-semibold text-action-primary-text shadow-sm transition hover:opacity-90 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Metadata</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
