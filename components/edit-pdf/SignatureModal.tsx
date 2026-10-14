"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, PenLine, Type, Upload, Trash2 } from "lucide-react";

export interface SavedSignature {
  dataUrl: string;
  mime: string;
  ts: number;
}

const STORAGE_KEY = "editmypdf:signatures:v1";

export function loadSavedSignatures(): SavedSignature[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((s) => s && typeof s.dataUrl === "string").slice(0, 8) : [];
  } catch {
    return [];
  }
}

export function persistSignatures(list: SavedSignature[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 8)));
  } catch {
    /* quota — ignore */
  }
}

interface SignatureModalProps {
  open: boolean;
  onClose: () => void;
  onPlace: (sig: SavedSignature) => void;
}

export function SignatureModal({ open, onClose, onPlace }: SignatureModalProps) {
  const [tab, setTab] = useState<"draw" | "type" | "upload">("draw");
  const [saved, setSaved] = useState<SavedSignature[]>([]);
  const [typed, setTyped] = useState("");
  const [drawEmpty, setDrawEmpty] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    if (open) {
      setSaved(loadSavedSignatures());
      setDrawEmpty(true);
      requestAnimationFrame(() => {
        const c = canvasRef.current;
        if (c) {
          const ctx = c.getContext("2d");
          ctx?.clearRect(0, 0, c.width, c.height);
        }
      });
    }
  }, [open]);

  if (!open) return null;

  const addSignature = (sig: SavedSignature) => {
    const next = [sig, ...saved].slice(0, 8);
    setSaved(next);
    persistSignatures(next);
    onPlace(sig);
  };

  const handleDrawPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (e.type === "pointerdown") {
      drawingRef.current = true;
      setDrawEmpty(false);
      canvas.setPointerCapture(e.pointerId);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#111827";
    } else if (e.type === "pointermove" && drawingRef.current) {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (e.type === "pointerup" || e.type === "pointercancel") {
      drawingRef.current = false;
    }
  };

  const saveDrawn = () => {
    const canvas = canvasRef.current;
    if (!canvas || drawEmpty) return;
    addSignature({ dataUrl: canvas.toDataURL("image/png"), mime: "image/png", ts: Date.now() });
  };

  const saveTyped = () => {
    if (!typed.trim()) return;
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#111827";
    ctx.font = "italic 92px Georgia, 'Times New Roman', serif";
    ctx.textBaseline = "middle";
    ctx.fillText(typed.trim(), 24, 110);
    addSignature({ dataUrl: canvas.toDataURL("image/png"), mime: "image/png", ts: Date.now() });
  };

  const handleUpload = async (file: File | undefined) => {
    if (!file || !/^image\/(png|jpe?g)$/.test(file.type)) return;
    const buf = await file.arrayBuffer();
    const blob = new Blob([buf], { type: file.type });
    const dataUrl = await new Promise<string>((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.readAsDataURL(blob);
    });
    addSignature({ dataUrl, mime: file.type, ts: Date.now() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Create signature" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-paper-elevated" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-bold text-foreground">Create signature</h3>
          <button type="button" onClick={onClose} aria-label="Close signature dialog" className="rounded p-1 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex gap-1 rounded-lg border border-border bg-surface-subtle p-1 text-xs font-medium">
          {(
            [
              ["draw", PenLine, "Draw"],
              ["type", Type, "Type"],
              ["upload", Upload, "Upload"],
            ] as const
          ).map(([id, Icon, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 transition ${tab === id ? "bg-surface text-foreground shadow-paper" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {tab === "draw" && (
          <div className="mt-3">
            <canvas
              ref={canvasRef}
              width={600}
              height={220}
              onPointerDown={handleDrawPointer}
              onPointerMove={handleDrawPointer}
              onPointerUp={handleDrawPointer}
              onPointerCancel={handleDrawPointer}
              className="h-36 w-full cursor-crosshair touch-none rounded-xl border border-border bg-white"
              aria-label="Draw your signature here"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const c = canvasRef.current;
                  c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
                  setDrawEmpty(true);
                }}
                className="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-foreground hover:bg-surface-subtle"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={saveDrawn}
                disabled={drawEmpty}
                className="flex-1 rounded-lg bg-foreground py-2 text-xs font-semibold text-background disabled:opacity-40"
              >
                Save & place
              </button>
            </div>
          </div>
        )}
        {tab === "type" && (
          <div className="mt-3">
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Type your full name"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="Signature text"
            />
            {typed.trim() && (
              <p className="mt-2 truncate rounded-lg border border-border bg-white px-3 py-3 text-center text-2xl italic text-gray-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                {typed.trim()}
              </p>
            )}
            <button
              type="button"
              onClick={saveTyped}
              disabled={!typed.trim()}
              className="mt-3 w-full rounded-lg bg-foreground py-2 text-xs font-semibold text-background disabled:opacity-40"
            >
              Save & place
            </button>
          </div>
        )}
        {tab === "upload" && (
          <div className="mt-3">
            <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-border p-6 text-center hover:border-foreground/40">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="mt-2 text-xs font-medium text-foreground">Choose PNG or JPG</span>
              <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => { void handleUpload(e.target.files?.[0]); e.target.value = ""; }} />
            </label>
          </div>
        )}

        {saved.length > 0 && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Saved on this device</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {saved.map((s, i) => (
                <div key={`${s.ts}-${i}`} className="group relative rounded-lg border border-border bg-white p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.dataUrl} alt={`Saved signature ${i + 1}`} className="h-12 w-full cursor-pointer object-contain" onClick={() => onPlace(s)} />
                  <button
                    type="button"
                    aria-label={`Delete saved signature ${i + 1}`}
                    onClick={() => {
                      const next = saved.filter((_, j) => j !== i);
                      setSaved(next);
                      persistSignatures(next);
                    }}
                    className="absolute -right-1.5 -top-1.5 hidden rounded-full border border-border bg-surface p-0.5 text-muted-foreground hover:text-destructive group-hover:block"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
