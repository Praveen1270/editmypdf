"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { PenTool, Loader2, Download, RefreshCw } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { ToolContent } from "@/components/tools/ToolContent";
import { TOOL_CONTENT } from "@/lib/tool-content";
import { htmlToPdf } from "@/lib/pdf/html-to-pdf";
import { downloadBytes } from "@/lib/files/download";

export default function CreatePdfPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [pageSize, setPageSize] = useState<"a4" | "letter">("a4");

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<h1>Untitled Document</h1><p>Start writing here…</p>",
  });

  const handleExport = async () => {
    if (!editor) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const html = editor.getHTML();
      const bytes = await htmlToPdf(html, { pageSize });
      setResultBytes(bytes);
    } catch (err: any) {
      setErrorMessage(`Failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBytes) return;
    downloadBytes(resultBytes, "document.pdf", "application/pdf");
  };

  const handleReset = () => { editor?.commands.setContent("<p></p>"); setResultBytes(null); setErrorMessage(null); };

  return (
    <ToolPageLayout toolId="create-pdf" toolName="Create PDF" description="A writing surface with formatting that exports straight to PDF." content={<ToolContent data={TOOL_CONTENT["create-pdf"]} />}>
      <div className="space-y-4">
        {errorMessage && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">{errorMessage}</div>}

        <div className="flex flex-wrap gap-2 border-b border-border pb-2">
          <button onClick={() => editor?.chain().focus().toggleBold().run()} className="rounded px-2 py-1 text-xs border border-border hover:bg-surface-subtle">Bold</button>
          <button onClick={() => editor?.chain().focus().toggleItalic().run()} className="rounded px-2 py-1 text-xs border border-border hover:bg-surface-subtle">Italic</button>
          <button onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className="rounded px-2 py-1 text-xs border border-border hover:bg-surface-subtle">H1</button>
          <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className="rounded px-2 py-1 text-xs border border-border hover:bg-surface-subtle">H2</button>
          <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className="rounded px-2 py-1 text-xs border border-border hover:bg-surface-subtle">• List</button>
          <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} className="rounded px-2 py-1 text-xs border border-border hover:bg-surface-subtle">1. List</button>
          <button onClick={() => editor?.chain().focus().toggleCodeBlock().run()} className="rounded px-2 py-1 text-xs border border-border hover:bg-surface-subtle">Code</button>
          <select value={pageSize} onChange={(e) => setPageSize(e.target.value as any)} className="rounded-lg border border-border bg-surface-base px-2 py-1 text-xs ml-auto">
            <option value="a4">A4</option>
            <option value="letter">Letter</option>
          </select>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 min-h-[400px]">
          <EditorContent editor={editor} className="prose prose-sm max-w-none" />
        </div>

        {isProcessing ? (
          <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-xs">Exporting…</span></div>
        ) : (
          <button onClick={handleExport} className="rounded-lg bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-text hover:opacity-90">Export to PDF</button>
        )}

        {resultBytes && (
          <div className="rounded-xl border border-border bg-surface-raised p-4 text-xs">
            <p className="font-semibold">Done</p>
            <button onClick={handleDownload} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-action-primary px-3 py-1.5 text-xs font-semibold text-action-primary-text hover:opacity-90">
              <Download className="h-3.5 w-3.5" /> Download
            </button>
          </div>
        )}

        <button onClick={handleReset} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
          <RefreshCw className="h-3 w-3" /> Reset
        </button>
      </div>
    </ToolPageLayout>
  );
}