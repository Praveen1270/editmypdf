"use client";

import { useState } from "react";
import { Unlock, Eye, EyeOff, Loader2, FileText, AlertCircle, ShieldCheck } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { ResultCard } from "@/components/tools/ResultCard";
import { unlockPDF, checkPdfEncryption } from "@/lib/pdf/security";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function UnlockPdfPage() {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    bytes: Uint8Array;
    algorithm?: string;
  } | null>(null);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

      const encInfo = await checkPdfEncryption(uint8);
      if (!encInfo.encrypted) {
        setErrorMessage(
          `"${f.name}" is not encrypted with a password. It is already open and unlocked.`
        );
        return;
      }

      setFile({
        name: f.name,
        size: f.size,
        bytes: uint8,
        algorithm: encInfo.algorithm || "AES / RC4",
      });
    } catch (err: any) {
      setErrorMessage(`Failed to verify PDF security: ${err?.message || "File error"}`);
    }
  };

  const handleUnlock = async () => {
    if (!file) return;
    setErrorMessage(null);

    if (!password) {
      setErrorMessage("Please enter the document password.");
      return;
    }

    setIsProcessing(true);

    try {
      const decrypted = await unlockPDF(file.bytes, password);
      setResultBytes(decrypted);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to decrypt PDF. Please check your password.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPassword("");
    setResultBytes(null);
    setErrorMessage(null);
  };

  const handleDownload = (customFilename?: string) => {
    if (resultBytes) {
      const cleanName = file ? file.name.replace(/^protected-/i, "") : "document.pdf";
      downloadBytes(resultBytes, customFilename || `unlocked-${cleanName}`);
    }
  };

  return (
    <ToolPageLayout
      toolId="unlock"
      toolName="Unlock PDF"
      description="Remove password protection and encryption from your PDF document using your password. Processed 100% locally in your browser."
    >
      {resultBytes ? (
        <ResultCard
          filename={file ? `unlocked-${file.name.replace(/^protected-/i, "")}` : "unlocked.pdf"}
          filesize={resultBytes.byteLength}
          pdfBytes={resultBytes}
          notes="Password protection successfully removed. You can now view and print the document freely without a password."
          onDownload={handleDownload}
          onReset={handleReset}
        />
      ) : !file ? (
        <DropZone
          accept=".pdf"
          multiple={false}
          title="Drop your password-protected PDF here"
          subtitle="or browse to select an encrypted document"
          onFilesSelected={handleFileSelected}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <p className="font-semibold text-foreground text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)} · Encrypted with {file.algorithm}
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="text-xs font-medium text-muted-foreground hover:text-destructive"
            >
              Choose different file
            </button>
          </div>

          <div className="max-w-md mx-auto space-y-4 rounded-xl border border-border bg-surface-raised p-6 shadow-sm">
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-base text-text-primary">
                <Unlock className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-base font-bold text-foreground">
                Enter Document Password
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Provide the password to remove encryption and decrypt this document locally.
              </p>
            </div>

            <div>
              <div className="relative mt-3">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                  placeholder="Enter PDF password"
                  autoFocus
                  className="w-full rounded-lg border border-border bg-surface-base px-3 py-2 pr-10 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-focus"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface-base p-3 text-[11px] text-muted-foreground">
              <strong>Notice:</strong> PDFKit strictly supports legitimate password decryption. We do not attempt brute-forcing, exploiting, or bypassing passwords.
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2 rounded-lg border border-border bg-surface-base p-3 text-xs text-text-primary">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-text-primary" />
                <span>{errorMessage}</span>
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center justify-center gap-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-text-primary" />
                <span>Decrypting PDF in browser memory...</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={handleReset}
                disabled={isProcessing}
                className="rounded-lg border border-border bg-surface-base px-4 py-2 text-xs font-medium text-foreground hover:bg-surface-raised"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlock}
                disabled={isProcessing || !password}
                className="inline-flex items-center gap-1.5 rounded-lg bg-action-primary px-5 py-2 text-xs font-semibold text-action-primary-text shadow-sm transition hover:opacity-90 disabled:opacity-50"
              >
                <Unlock className="h-3.5 w-3.5" />
                <span>Unlock & Decrypt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
