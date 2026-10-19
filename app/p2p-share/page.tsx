"use client";

import { useState, useRef } from "react";
import { Share2, Loader2, Download, RefreshCw, Copy, Check } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { DropZone } from "@/components/tools/DropZone";

export default function P2PSharePage() {
  const [mode, setMode] = useState<"sender" | "receiver">("sender");
  const [peerId, setPeerId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [status, setStatus] = useState("Idle");
  const [progress, setProgress] = useState(0);
  const [receivedFiles, setReceivedFiles] = useState<{ name: string; url: string }[]>([]);
  const [copied, setCopied] = useState(false);
  const peerRef = useRef<any>(null);
  const connRef = useRef<any>(null);
  const filesRef = useRef<File[]>([]);

  const startSender = async () => {
    setStatus("Creating peer…");
    const { Peer } = await import("peerjs");
    const peer = new Peer();
    peerRef.current = peer;
    peer.on("open", (id: string) => {
      setPeerId(id);
      setStatus("Waiting for receiver. Share the code above.");
    });
    peer.on("connection", (conn: any) => {
      connRef.current = conn;
      conn.on("open", () => {
        setStatus("Connected. Sending files…");
        sendFiles(conn);
      });
    });
    peer.on("error", (e: any) => setStatus("Error: " + (e?.message || e)));
  };

  const sendFiles = async (conn: any) => {
    const files = filesRef.current;
    // send metadata
    const meta = files.map((f) => ({ name: f.name, size: f.size, type: f.type }));
    conn.send({ type: "meta", files: meta });
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const buf = await f.arrayBuffer();
      const chunkSize = 16 * 1024;
      const total = Math.ceil(buf.byteLength / chunkSize);
      conn.send({ type: "file-start", index: i, name: f.name, size: f.size, fileType: f.type, total });
      for (let c = 0; c < total; c++) {
        while (conn.dataChannel && conn.dataChannel.bufferedAmount > 1024 * 1024) {
          await new Promise((res) => setTimeout(res, 50));
        }
        const slice = buf.slice(c * chunkSize, (c + 1) * chunkSize);
        conn.send({ type: "chunk", index: i, data: slice });
        setProgress(Math.round(((i + (c + 1) / total) / files.length) * 100));
      }
      conn.send({ type: "file-end", index: i });
    }
    conn.send({ type: "done" });
    setStatus("All files sent.");
  };

  const handleFilesSelected = (files: File[]) => {
    filesRef.current = files;
  };

  const startReceiver = async () => {
    if (!targetId) { setStatus("Enter sender code."); return; }
    setStatus("Connecting…");
    const { Peer } = await import("peerjs");
    const peer = new Peer();
    peerRef.current = peer;
    peer.on("open", () => {
      const conn = peer.connect(targetId);
      connRef.current = conn;
      conn.on("open", () => setStatus("Connected. Waiting for files…"));
      let currentFile: { name: string; size: number; type: string; chunks: ArrayBuffer[]; total: number; received: number } | null = null;
      const fileMap = new Map<number, any>();
      conn.on("data", (data: any) => {
        if (data.type === "meta") {
          setStatus(`Receiving ${data.files.length} file(s)…`);
        } else if (data.type === "file-start") {
          currentFile = { name: data.name, size: data.size, type: data.fileType, chunks: [], total: data.total, received: 0 };
          fileMap.set(data.index, currentFile);
        } else if (data.type === "chunk") {
          const f = fileMap.get(data.index);
          if (f) { f.chunks.push(data.data); f.received++; setProgress(Math.round((f.received / f.total) * 100)); }
        } else if (data.type === "file-end") {
          const f = fileMap.get(data.index);
          if (f) {
            const blob = new Blob(f.chunks, { type: f.type || "application/octet-stream" });
            const url = URL.createObjectURL(blob);
            setReceivedFiles((prev) => [...prev, { name: f.name, url }]);
          }
        } else if (data.type === "done") {
          setStatus("Transfer complete.");
        }
      });
      conn.on("error", (e: any) => setStatus("Error: " + (e?.message || e)));
    });
    peer.on("error", (e: any) => setStatus("Error: " + (e?.message || e)));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(peerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    peerRef.current?.destroy();
    peerRef.current = null;
    connRef.current = null;
    setPeerId(""); setTargetId(""); setStatus("Idle"); setProgress(0); setReceivedFiles([]);
  };

  return (
    <ToolPageLayout toolId="p2p-share" toolName="P2P Share" description="Send files directly from one browser to another with no server upload.">
      <div className="space-y-6">
        <div className="flex gap-2">
          <button onClick={() => setMode("sender")} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${mode === "sender" ? "bg-foreground text-background" : "border border-border text-muted-foreground"}`}>Sender</button>
          <button onClick={() => setMode("receiver")} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${mode === "receiver" ? "bg-foreground text-background" : "border border-border text-muted-foreground"}`}>Receiver</button>
        </div>

        {mode === "sender" && (
          <div className="space-y-4">
            <DropZone accept="*/*" multiple={true} title="Drop files to send" subtitle="or browse" onFilesSelected={handleFilesSelected} />
            <button onClick={startSender} className="rounded-lg bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-text hover:opacity-90">Start Sending</button>
            {peerId && (
              <div className="rounded-xl border border-border bg-surface-raised p-4 text-xs space-y-2">
                <p className="font-semibold">Your code:</p>
                <div className="flex items-center gap-2">
                  <code className="rounded bg-muted/20 px-2 py-1 font-mono">{peerId}</code>
                  <button onClick={handleCopy} className="rounded border border-border p-1.5">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}</button>
                </div>
                <p className="text-muted-foreground">Share this code with the receiver.</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Status: {status} {progress > 0 ? `(${progress}%)` : ""}</p>
          </div>
        )}

        {mode === "receiver" && (
          <div className="space-y-4">
            <input value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="Enter sender code" className="w-full rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs font-mono" />
            <button onClick={startReceiver} className="rounded-lg bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-text hover:opacity-90">Connect & Receive</button>
            <p className="text-xs text-muted-foreground">Status: {status} {progress > 0 ? `(${progress}%)` : ""}</p>
            {receivedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold">Received files:</p>
                {receivedFiles.map((f, i) => (
                  <a key={i} href={f.url} download={f.name} className="flex items-center gap-2 rounded-lg border border-border p-2 text-xs hover:bg-surface-subtle">
                    <Download className="h-3.5 w-3.5" /> {f.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        <button onClick={handleReset} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
          <RefreshCw className="h-3 w-3" /> Reset
        </button>
      </div>
    </ToolPageLayout>
  );
}