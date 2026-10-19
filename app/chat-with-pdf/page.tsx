"use client";

import { useState } from "react";
import { MessageSquare, Loader2, Send, Upload, RefreshCw } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";
import { streamGemini, extractPdfTextForContext, ChatMessage } from "@/lib/ai/gemini";

export default function ChatWithPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [context, setContext] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);

  const handleFilesSelected = async (fs: File[]) => {
    setFiles(fs);
    setContext("");
    setMessages([]);
  };

  const buildContext = async () => {
    if (files.length === 0) return;
    setIsBuilding(true);
    setErrorMessage(null);
    try {
      const parts: string[] = [];
      for (const f of files) {
        const buf = await f.arrayBuffer();
        const text = await extractPdfTextForContext(new Uint8Array(buf));
        parts.push(`===== DOCUMENT: ${f.name} =====\n${text}`);
      }
      setContext(parts.join("\n\n"));
    } catch (err: any) {
      setErrorMessage(`Failed to extract text: ${err?.message || "Unknown error"}`);
    } finally {
      setIsBuilding(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !apiKey || !context) return;
    const userMsg: ChatMessage = { role: "user", text: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsStreaming(true);
    setErrorMessage(null);

    let reply = "";
    setMessages((m) => [...m, { role: "model", text: "" }]);

    const system = `You are a helpful assistant answering questions about the provided documents. Answer only from the document content. Cite page numbers like [Page 3]. If the answer is not in the documents, say so.\n\nDOCUMENTS:\n${context.slice(0, 200000)}`;

    const controller = new AbortController();
    try {
      await streamGemini(apiKey, system, messages, userMsg.text, (token) => {
        reply += token;
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "model", text: reply };
          return copy;
        });
      }, controller.signal);
    } catch (err: any) {
      setErrorMessage(`Gemini error: ${err?.message || "Unknown error"}`);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleReset = () => { setFiles([]); setContext(""); setMessages([]); setInput(""); setErrorMessage(null); };

  return (
    <ToolPageLayout toolId="chat-with-pdf" toolName="Chat with PDF" description="Ask questions about your PDFs; answers stream back with page citations. Requires a Gemini API key.">
      <div className="space-y-4">
        {errorMessage && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">{errorMessage}</div>}

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold">Gemini API key (kept in memory)</label>
          <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="AIza..." className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs" />
        </div>

        {!context ? (
          <>
            <DropZone accept=".pdf" multiple={true} title="Drop PDFs here" subtitle="or browse (up to 10)" onFilesSelected={handleFilesSelected} />
            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">{files.length} file(s) selected</p>
                {isBuilding ? (
                  <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-xs">Extracting text…</span></div>
                ) : (
                  <button onClick={buildContext} className="rounded-lg bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-text hover:opacity-90">Build Context</button>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="rounded-lg border border-border bg-surface-raised p-2 text-xs text-muted-foreground">Context ready ({context.length} chars). <button onClick={() => setContext("")} className="underline">Reset</button></div>
            <div className="h-64 overflow-auto rounded-xl border border-border bg-muted/20 p-3 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`text-xs ${m.role === "user" ? "text-right" : ""}`}>
                  <span className={`inline-block rounded-lg px-3 py-2 max-w-[80%] ${m.role === "user" ? "bg-action-primary text-action-primary-text" : "bg-surface border border-border"}`}>
                    {m.text || (isStreaming && i === messages.length - 1 ? "…" : "")}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Ask a question…" className="flex-1 rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs" disabled={isStreaming} />
              <button onClick={handleSend} disabled={isStreaming || !input.trim()} className="rounded-lg bg-action-primary px-3 py-1.5 text-xs font-semibold text-action-primary-text hover:opacity-90 disabled:opacity-50">
                {isStreaming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </button>
            </div>
          </>
        )}

        <button onClick={handleReset} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
          <RefreshCw className="h-3 w-3" /> Reset
        </button>
      </div>
    </ToolPageLayout>
  );
}