"use client";

import { useState, useRef, useEffect } from "react";
import { PenTool, Eraser, Trash2, Download, RefreshCw, Loader2, Copy, Check } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";

interface Stroke { points: { x: number; y: number }[]; color: string; size: number; eraser: boolean; }

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(4);
  const [eraser, setEraser] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [peerId, setPeerId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [status, setStatus] = useState("Idle");
  const [copied, setCopied] = useState(false);
  const peerRef = useRef<any>(null);
  const connRef = useRef<any>(null);
  const drawingRef = useRef<Stroke | null>(null);
  const strokesRef = useRef<Stroke[]>([]);

  useEffect(() => { strokesRef.current = strokes; redraw(); }, [strokes]);

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const s of strokesRef.current) {
      ctx.strokeStyle = s.eraser ? "#ffffff" : s.color;
      ctx.lineWidth = s.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      s.points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let cx: number, cy: number;
    if ("touches" in e) {
      cx = e.touches[0].clientX; cy = e.touches[0].clientY;
    } else {
      cx = (e as React.MouseEvent).clientX; cy = (e as React.MouseEvent).clientY;
    }
    return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const p = getPos(e);
    const stroke: Stroke = { points: [p], color, size, eraser };
    drawingRef.current = stroke;
  };

  const moveDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawingRef.current) return;
    const p = getPos(e);
    drawingRef.current.points.push(p);
    // live draw
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const s = drawingRef.current;
    ctx.strokeStyle = s.eraser ? "#ffffff" : s.color;
    ctx.lineWidth = s.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const pts = s.points;
    ctx.beginPath();
    ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const endDraw = () => {
    if (!drawingRef.current) return;
    const stroke = drawingRef.current;
    drawingRef.current = null;
    setStrokes((s) => [...s, stroke]);
    // broadcast
    connRef.current?.send({ type: "stroke", stroke });
  };

  const clearCanvas = () => {
    setStrokes([]);
    connRef.current?.send({ type: "clear" });
  };

  const hostRoom = async () => {
    setStatus("Creating room…");
    const { Peer } = await import("peerjs");
    const peer = new Peer();
    peerRef.current = peer;
    peer.on("open", (id: string) => { setPeerId(id); setStatus("Waiting for peers. Share code."); });
    peer.on("connection", (conn: any) => {
      connRef.current = conn;
      conn.on("open", () => {
        setStatus("Peer connected.");
        // send current state
        conn.send({ type: "state", strokes: strokesRef.current });
      });
      conn.on("data", (data: any) => handleIncoming(data));
    });
    peer.on("error", (e: any) => setStatus("Error: " + (e?.message || e)));
  };

  const joinRoom = async () => {
    if (!targetId) { setStatus("Enter host code."); return; }
    setStatus("Connecting…");
    const { Peer } = await import("peerjs");
    const peer = new Peer();
    peerRef.current = peer;
    peer.on("open", () => {
      const conn = peer.connect(targetId);
      connRef.current = conn;
      conn.on("open", () => setStatus("Connected."));
      conn.on("data", (data: any) => handleIncoming(data));
    });
    peer.on("error", (e: any) => setStatus("Error: " + (e?.message || e)));
  };

  const handleIncoming = (data: any) => {
    if (data.type === "stroke") {
      setStrokes((s) => [...s, data.stroke]);
    } else if (data.type === "clear") {
      setStrokes([]);
    } else if (data.type === "state") {
      setStrokes(data.strokes || []);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(peerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "whiteboard.png"; a.click();
      URL.revokeObjectURL(url);
    });
  };

  const handleReset = () => {
    peerRef.current?.destroy();
    peerRef.current = null;
    connRef.current = null;
    setPeerId(""); setTargetId(""); setStatus("Idle"); setStrokes([]);
  };

  return (
    <ToolPageLayout toolId="whiteboard" toolName="Collaborative Whiteboard" description="A shared drawing canvas: open a link, draw together, no sign-up.">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={() => { setEraser(false); }} className={`rounded px-2 py-1 text-xs border border-border ${!eraser ? "bg-foreground text-background" : "hover:bg-surface-subtle"}`}><PenTool className="h-3.5 w-3.5 inline" /> Pen</button>
          <button onClick={() => setEraser(true)} className={`rounded px-2 py-1 text-xs border border-border ${eraser ? "bg-foreground text-background" : "hover:bg-surface-subtle"}`}><Eraser className="h-3.5 w-3.5 inline" /> Eraser</button>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-10 rounded border border-border" />
          <input type="range" min={1} max={20} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-24" />
          <button onClick={clearCanvas} className="rounded px-2 py-1 text-xs border border-border hover:bg-surface-subtle"><Trash2 className="h-3.5 w-3.5 inline" /> Clear</button>
          <button onClick={exportPng} className="rounded px-2 py-1 text-xs border border-border hover:bg-surface-subtle"><Download className="h-3.5 w-3.5 inline" /> Export PNG</button>
        </div>

        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="w-full border border-border rounded-xl bg-white touch-none"
          onMouseDown={startDraw}
          onMouseMove={moveDraw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={moveDraw}
          onTouchEnd={endDraw}
        />

        <div className="flex gap-2">
          <button onClick={hostRoom} className="rounded-lg bg-action-primary px-3 py-1.5 text-xs font-semibold text-action-primary-text hover:opacity-90">Host Room</button>
          <input value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="Host code" className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs font-mono flex-1" />
          <button onClick={joinRoom} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-subtle">Join</button>
        </div>
        {peerId && (
          <div className="flex items-center gap-2 text-xs">
            <span>Room code:</span>
            <code className="rounded bg-muted/20 px-2 py-1 font-mono">{peerId}</code>
            <button onClick={handleCopy} className="rounded border border-border p-1">{copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}</button>
          </div>
        )}
        <p className="text-xs text-muted-foreground">Status: {status}</p>

        <button onClick={handleReset} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
          <RefreshCw className="h-3 w-3" /> Reset
        </button>
      </div>
    </ToolPageLayout>
  );
}