"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2, FileText, ShieldCheck, Info } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { ResultCard } from "@/components/tools/ResultCard";
import { protectPDF, checkPdfEncryption } from "@/lib/pdf/security";
import { getPdfInfo } from "@/lib/pdf/pdf-loader";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";

export default function ProtectPdfPage() {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    bytes: Uint8Array;
    pageCount: number;
  } | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(false);

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

      // Check if already encrypted
      const encInfo = await checkPdfEncryption(uint8);
      if (encInfo.encrypted) {
        setErrorMessage(
          "This PDF is already encrypted with a password. Please unlock it using the Unlock PDF tool first."
        );
        return;
      }

      const info = await getPdfInfo(uint8);
      setFile({
        name: f.name,
        size: f.size,
        bytes: uint8,
        pageCount: info.pageCount,
      });
    } catch (err: any) {
      setErrorMessage(`Failed to read PDF: ${err?.message || "File error"}`);
    }
  };

  const handleProtect = async () => {
    if (!file) return;
    setErrorMessage(null);

    if (!password) {
      setErrorMessage("Please enter a password.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    setIsProcessing(true);

    try {
      const encrypted = await protectPDF(file.bytes, password, {
        algorithm: "AES-256",
        allowPrinting,
        allowCopying,
        allowModifying: false,
        allowAnnotating: true,
      });
      setResultBytes(encrypted);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to encrypt PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPassword("");
    setConfirmPassword("");
    setResultBytes(null);
    setErrorMessage(null);
  };

  const handleDownload = () => {
    if (resultBytes && file) {
      downloadBytes(resultBytes, `protected-${file.name}`);
    }
  };

  return (
    <ToolPageLayout
      toolId="protect"
      toolName="Protect PDF"
      description="Encrypt your PDF document locally with a password using industry-standard AES-256 (PDF 2.0 / ISO 32000-2) encryption."
    >
      {resultBytes ? (
        <ResultCard
          filename={`protected-${file?.name}`}
          filesize={resultBytes.byteLength}
          notes="Protected with AES-256 encryption. Openable in Adobe Acrobat, Apple Preview, Google Chrome, and all standard PDF readers."
          onDownload={handleDownload}
          onReset={handleReset}
        />
      ) : !file ? (
        <DropZone
          accept=".pdf"
          multiple={false}
          title="Drop your PDF file here"
          subtitle="or browse to select a document to encrypt"
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
                  {formatFileSize(file.size)} · {file.pageCount} pages
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 rounded-xl border border-border bg-white p-5">
              <h3 className="text-sm font-semibold text-foreground">
                Set Document Password
              </h3>

              <div>
                <label className="block text-xs font-semibold text-foreground">
                  Enter Password
                </label>
                <div className="relative mt-1.5">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter document password"
                    className="w-full rounded-lg border border-border px-3 py-2 pr-10 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat document password"
                  className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <span className="block text-xs font-semibold text-foreground">
                  Permission Settings
                </span>
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowPrinting}
                    onChange={(e) => setAllowPrinting(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span>Allow high-resolution printing</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowCopying}
                    onChange={(e) => setAllowCopying(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span>Allow copying text and graphics</span>
                </label>
              </div>
            </div>

            {/* Technical explanation & guarantee */}
            <div className="flex flex-col justify-between rounded-xl border border-border bg-muted/20 p-5">
              <div>
                <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  <span>AES-256 Browser Encryption</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  We use the <strong>Web Crypto API</strong> and ISO 32000-2 standard AES-256 cipher.
                  Your password is processed strictly in your local device RAM and is never sent or logged.
                </p>

                <div className="mt-4 space-y-2 text-xs text-muted-foreground border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span>Algorithm:</span>
                    <strong className="text-foreground">AES-256 (Revision 6)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Standard:</span>
                    <strong className="text-foreground">PDF 2.0 / ISO 32000-2</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Compatibility:</span>
                    <strong className="text-foreground">Acrobat, Preview, Chrome, Edge</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-white p-3 text-[11px] text-muted-foreground">
                <Info className="h-3.5 w-3.5 shrink-0 text-foreground mt-0.5" />
                <span>
                  Keep your password safe. Because processing is entirely local with zero cloud backdoors, lost passwords cannot be retrieved.
                </span>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              {errorMessage}
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center gap-3 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Encrypting PDF with AES-256 locally...</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              onClick={handleReset}
              disabled={isProcessing}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleProtect}
              disabled={isProcessing || !password}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:opacity-50"
            >
              <Lock className="h-4 w-4" />
              <span>Encrypt & Protect PDF</span>
            </button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
