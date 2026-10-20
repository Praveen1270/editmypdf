"use client";

import { useState } from "react";
import { FormInput, Loader2, FileText, Download, RefreshCw } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { listFormFields, fillForm, FormFieldInfo } from "@/lib/pdf/forms";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function PdfFormsPage() {
  const [file, setFile] = useState<{ name: string; size: number; bytes: Uint8Array } | null>(null);
  const [fields, setFields] = useState<FormFieldInfo[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);

  const handleFile = async (files: File[]) => {
    if (files.length === 0) return;
    setErrorMessage(null); setResultBytes(null);
    const f = files[0];
    try {
      const buffer = await f.arrayBuffer();
      const uint8 = new Uint8Array(buffer);
      const flds = await listFormFields(uint8);
      setFile({ name: f.name, size: f.size, bytes: uint8 });
      setFields(flds);
      const init: Record<string, string> = {};
      flds.forEach((fld) => { init[fld.name] = fld.value || ""; });
      setValues(init);
    } catch (err: any) {
      setErrorMessage(`Failed to read PDF: ${err?.message || "File error"}`);
    }
  };

  const handleRun = async () => {
    if (!file) return;
    setIsProcessing(true); setErrorMessage(null);
    try {
      const out = await fillForm(file.bytes, values);
      setResultBytes(out);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to fill form.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBytes || !file) return;
    downloadBytes(resultBytes, file.name.replace(/\.pdf$/i, "") + "-filled.pdf", "application/pdf");
  };

  const handleReset = () => { setFile(null); setFields([]); setValues({}); setResultBytes(null); setErrorMessage(null); };

  return (
    <ToolPageLayout toolId="pdf-forms" toolName="PDF Forms" description="Detect and fill interactive form fields, then save the completed document.">
      {resultBytes ? (
        <div className="space-y-4">
          <p className="text-sm text-foreground">Form saved.</p>
          <div className="flex gap-2">
            <button onClick={handleDownload} className="inline-flex items-center gap-1.5 rounded-lg bg-action-primary px-3 py-1.5 text-xs font-semibold text-action-primary-text hover:opacity-90"><Download className="h-3.5 w-3.5" /> Download</button>
            <button onClick={handleReset} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"><RefreshCw className="h-3 w-3" /> Start Again</button>
          </div>
        </div>
      ) : !file ? (
        <DropZone accept=".pdf" multiple={false} title="Drop your PDF form here" subtitle="or browse to detect fields" onFilesSelected={handleFile} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <FileText className="h-6 w-6 text-primary" />
            <p className="font-semibold text-foreground text-sm">{file.name}</p>
            <button onClick={handleReset} className="ml-auto text-xs text-muted-foreground hover:text-destructive">Change File</button>
          </div>
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">No interactive form fields detected in this PDF.</p>
          ) : (
            <div className="space-y-3">
              {fields.map((f) => (
                <div key={f.name} className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-foreground">{f.name} <span className="text-muted-foreground">({f.type})</span></label>
                  <input
                    type="text"
                    value={values[f.name] || ""}
                    onChange={(e) => setValues((prev) => ({ ...prev, [f.name]: e.target.value }))}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs"
                  />
                </div>
              ))}
            </div>
          )}
          {errorMessage && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">{errorMessage}</div>}
          {isProcessing ? <div className="flex items-center gap-3 py-4 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" /><span>Saving…</span></div> : (
            <button onClick={handleRun} disabled={fields.length === 0} className="rounded-lg bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-text hover:opacity-90 disabled:opacity-50">Save Filled Form</button>
          )}
        </div>
      )}
    </ToolPageLayout>
  );
}
