"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Trash2,
  Copy,
  Move,
  Link as LinkIcon,
  ChevronDown,
  X,
  Check,
  TriangleAlert,
} from "lucide-react";
import type { TextBlock } from "@/lib/pdf/edit-pdf/types";
import { BUNDLED_FONTS, STANDARD_FONT_OPTIONS, stripSubsetPrefix } from "@/lib/pdf/edit-pdf/font-matching";

export interface InlineTextValue {
  text: string;
  fontId: string;
  fontSize: number;
  colorHex: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: "left" | "center" | "right";
}

interface InlineEditorProps {
  block: TextBlock;
  value: InlineTextValue;
  onPatch: (patch: Partial<InlineTextValue>) => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  onLink?: () => void;
  onClose: () => void;
  /** CSS px geometry inside the page container. */
  geometry: { left: number; top: number; width: number; minHeight: number };
  /** CSS px per PDF point. */
  scale: number;
  /** Background sampled from the page (covers original text while editing). */
  bgHex: string;
  fallbackNotice: boolean;
  toPdfDelta: (dxPx: number, dyPx: number) => { dx: number; dy: number };
  onMove: (dxPdf: number, dyPdf: number) => void;
  onResizeWidth: (dWrapPdf: number) => void;
}

export function InlineTextEditor(props: InlineEditorProps) {
  const { block, value, geometry, scale } = props;
  const areaRef = useRef<HTMLTextAreaElement | null>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const resizeRef = useRef<{ x: number; startW: number } | null>(null);
  const [colorOpen, setColorOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);

  useEffect(() => {
    const el = areaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.max(geometry.minHeight, el.scrollHeight)}px`;
      el.focus({ preventScroll: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.text, value.fontSize, value.fontId, value.bold, value.italic, geometry.width]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        props.onClose();
      } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        props.onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [props.onClose]);

  const fontFamily = fontFamilyForValue(block, value);

  return (
    <div
      className="absolute z-30"
      style={{ left: geometry.left, top: geometry.top, width: Math.max(40, geometry.width) }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {/* Floating contextual toolbar matching EditMyPDF style */}
      <div
        className={`absolute ${
          geometry.top < 65 ? "top-[calc(100%+14px)]" : "-top-12"
        } left-0 z-40 flex items-center divide-x divide-border rounded-lg border border-border bg-surface shadow-lg text-foreground`}
        role="toolbar"
        aria-label="Text formatting"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Bold */}
        <button
          type="button"
          title="Bold"
          aria-label="Bold"
          aria-pressed={value.bold}
          onClick={() => props.onPatch({ bold: !value.bold })}
          className={`flex h-8 w-8 items-center justify-center font-bold font-serif text-sm transition ${
            value.bold ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-surface-subtle"
          }`}
        >
          B
        </button>

        {/* Italic */}
        <button
          type="button"
          title="Italic"
          aria-label="Italic"
          aria-pressed={value.italic}
          onClick={() => props.onPatch({ italic: !value.italic })}
          className={`flex h-8 w-8 items-center justify-center italic font-serif text-sm transition ${
            value.italic ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-surface-subtle"
          }`}
        >
          I
        </button>

        {/* Font size stepper / dropdown [T↕ ▼] */}
        <div className="relative flex items-center px-1">
          <button
            type="button"
            onClick={() => setSizeOpen((v) => !v)}
            className="flex h-8 items-center gap-0.5 px-1.5 text-xs font-medium text-foreground hover:bg-surface-subtle transition"
            title="Font size"
          >
            <span className="font-semibold text-xs flex items-center">T<span className="text-[10px]">↕</span></span>
            <span className="text-[11px] font-mono ml-0.5">{Math.round(value.fontSize)}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
          {sizeOpen && (
            <div className="absolute left-0 top-9 z-50 flex flex-col gap-1 rounded-xl border border-border bg-surface p-2 shadow-xl min-w-28 text-foreground">
              <div className="flex items-center justify-between gap-1 mb-1">
                <button
                  type="button"
                  onClick={() => props.onPatch({ fontSize: Math.max(6, value.fontSize - 1) })}
                  className="flex h-6 w-6 items-center justify-center rounded border border-border bg-surface-subtle text-xs font-bold text-foreground hover:bg-surface"
                >
                  -
                </button>
                <input
                  type="number"
                  min={6}
                  max={144}
                  value={value.fontSize}
                  onChange={(e) => props.onPatch({ fontSize: Math.max(6, Math.min(144, Number(e.target.value) || 12)) })}
                  className="h-6 w-12 rounded border border-border bg-surface text-center text-xs font-mono font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => props.onPatch({ fontSize: Math.min(144, value.fontSize + 1) })}
                  className="flex h-6 w-6 items-center justify-center rounded border border-border bg-surface-subtle text-xs font-bold text-foreground hover:bg-surface"
                >
                  +
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1 border-t border-border pt-1">
                {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => { props.onPatch({ fontSize: sz }); setSizeOpen(false); }}
                    className={`rounded px-1 py-0.5 text-center text-[11px] font-mono ${
                      Math.round(value.fontSize) === sz ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-surface-subtle text-foreground"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Font family dropdown [Aa ▼] */}
        <div className="relative flex items-center px-1">
          <select
            value={value.fontId}
            onChange={(e) => props.onPatch({ fontId: e.target.value })}
            className="h-7 max-w-28 appearance-none bg-transparent pr-4 pl-1 text-xs font-medium text-foreground hover:bg-surface-subtle focus:outline-none cursor-pointer"
            title="Font family"
            aria-label="Font family"
          >
            {block.hasEmbeddedFont && block.embeddedFamily && (
              <option value={`embedded:${block.embeddedFamily}`}>
                {block.embeddedFamily.slice(0, 14)} (PDF)
              </option>
            )}
            <optgroup label="Matched fonts">
              {BUNDLED_FONTS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.id === block.matchedFontId ? `★ ${f.label.split(" ")[0]}` : f.label.split(" ")[0]}
                </option>
              ))}
            </optgroup>
            <optgroup label="Standard fonts">
              {STANDARD_FONT_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </optgroup>
          </select>
          <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px]">
            ▼
          </span>
        </div>

        {/* Color picker [🎨 ▼] */}
        <div className="relative flex items-center px-1">
          <button
            type="button"
            onClick={() => setColorOpen((v) => !v)}
            className="flex h-8 items-center gap-1 px-1.5 text-foreground hover:bg-surface-subtle transition"
            title="Text color"
          >
            <span
              className="h-4 w-4 rounded-full border border-border shadow-xs"
              style={{ backgroundColor: value.colorHex }}
            />
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
          {colorOpen && (
            <div className="absolute left-0 top-9 z-50 flex flex-col gap-1.5 rounded-xl border border-border bg-surface p-2 shadow-xl min-w-36 text-foreground">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Colors</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { hex: "#000000", title: "Black" },
                  { hex: "#1e3a8a", title: "Navy" },
                  { hex: "#0369a1", title: "Sky" },
                  { hex: "#16a34a", title: "Green" },
                  { hex: "#dc2626", title: "Red" },
                  { hex: "#d97706", title: "Amber" },
                  { hex: "#4b5563", title: "Gray" },
                  { hex: "#ffffff", title: "White" },
                ].map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.title}
                    onClick={() => { props.onPatch({ colorHex: c.hex }); setColorOpen(false); }}
                    className={`h-5 w-5 rounded-full border border-border transition ${
                      value.colorHex.toLowerCase() === c.hex.toLowerCase()
                        ? "ring-2 ring-primary ring-offset-1 scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
              <label className="mt-1 flex items-center justify-between text-[11px] text-foreground cursor-pointer pt-1 border-t border-border">
                <span>Custom:</span>
                <input
                  type="color"
                  value={value.colorHex}
                  onChange={(e) => props.onPatch({ colorHex: e.target.value })}
                  className="h-6 w-8 cursor-pointer rounded border border-border bg-surface"
                />
              </label>
            </div>
          )}
        </div>

        {/* Link icon [🔗] */}
        {props.onLink && (
          <button
            type="button"
            title="Add link"
            aria-label="Add link"
            onClick={props.onLink}
            className="flex h-8 w-8 items-center justify-center text-foreground hover:bg-surface-subtle transition"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Move handle [✢] */}
        <span
          className="flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center text-foreground hover:bg-surface-subtle active:cursor-grabbing"
          title="Drag to move text"
          onPointerDown={(e) => {
            e.stopPropagation();
            try {
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            } catch {
              /* ignore */
            }
            dragRef.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerMove={(e) => {
            const s = dragRef.current;
            if (!s) return;
            e.stopPropagation();
            const d = props.toPdfDelta(e.clientX - s.x, e.clientY - s.y);
            dragRef.current = { x: e.clientX, y: e.clientY };
            props.onMove(d.dx, d.dy);
          }}
          onPointerUp={(e) => {
            dragRef.current = null;
            try {
              if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
                (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
              }
            } catch {
              /* ignore */
            }
          }}
          onPointerCancel={() => { dragRef.current = null; }}
        >
          <Move className="h-3.5 w-3.5 pointer-events-none" />
        </span>

        {/* Duplicate icon [❐] */}
        {props.onDuplicate && (
          <button
            type="button"
            title="Duplicate line"
            aria-label="Duplicate line"
            onClick={props.onDuplicate}
            className="flex h-8 w-8 items-center justify-center text-foreground hover:bg-surface-subtle transition"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Delete icon [🗑] */}
        <button
          type="button"
          title="Delete line"
          aria-label="Delete line"
          onClick={props.onDelete}
          className="flex h-8 w-8 items-center justify-center text-foreground hover:bg-destructive/10 hover:text-destructive transition"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {props.fallbackNotice && (
        <div className="pointer-events-none absolute -bottom-7 left-0 z-40 flex items-center gap-1 rounded bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-medium text-white shadow">
          <TriangleAlert className="h-3 w-3" />
          <span>Missing glyphs rendered with matched fallback font</span>
        </div>
      )}

      {/* Inline editable textarea preserving exact font style */}
      <textarea
        ref={areaRef}
        value={value.text}
        onChange={(e) => props.onPatch({ text: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            props.onClose();
          }
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        rows={1}
        spellCheck={false}
        aria-label={`Edit text: ${block.text.slice(0, 60)}`}
        style={{
          fontFamily,
          fontSize: `${value.fontSize * scale}px`,
          lineHeight: `${Math.max(geometry.minHeight, value.fontSize * scale * 1.15)}px`,
          color: value.colorHex,
          fontWeight: value.bold ? 700 : 400,
          fontStyle: value.italic ? "italic" : "normal",
          textDecoration: value.underline ? "underline" : "none",
          textAlign: value.align,
          background: props.bgHex || "#ffffff",
          width: "100%",
          minHeight: geometry.minHeight,
          resize: "none",
          overflow: "hidden",
          padding: "0 2px",
          margin: 0,
          border: "1.5px solid var(--foreground, #000000)",
          borderRadius: 2,
          outline: "none",
          whiteSpace: "pre",
          wordBreak: "keep-all",
        }}
      />
      {/* Width resize handle */}
      <span
        className="absolute -right-2 top-1/2 z-40 h-8 w-2.5 -translate-y-1/2 cursor-ew-resize touch-none rounded-full border border-border bg-surface shadow-xs"
        title="Drag to change width"
        onPointerDown={(e) => {
          e.stopPropagation();
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          resizeRef.current = { x: e.clientX, startW: geometry.width };
        }}
        onPointerMove={(e) => {
          const s = resizeRef.current;
          if (!s) return;
          const d = props.toPdfDelta(e.clientX - s.x, 0);
          props.onResizeWidth(d.dx);
        }}
        onPointerUp={() => { resizeRef.current = null; }}
      />
    </div>
  );
}

export function fontFamilyForValue(
  block: TextBlock,
  value: { fontId: string; bold?: boolean; italic?: boolean }
): string {
  const cleanName = stripSubsetPrefix(block.fontName || "");
  const cleanFamily = stripSubsetPrefix(block.fontFamily || block.embeddedFamily || "");
  const combined = `${value.fontId} ${block.fontName} ${block.fontFamily || ""} ${block.embeddedFamily || ""}`.toLowerCase();

  const isSerif =
    combined.includes("times") ||
    combined.includes("serif") ||
    combined.includes("roman") ||
    combined.includes("georgia") ||
    combined.includes("garamond") ||
    combined.includes("palatino") ||
    combined.includes("baskerville") ||
    combined.includes("cambria") ||
    combined.includes("caladea") ||
    combined.includes("tinos") ||
    combined.includes("minion") ||
    combined.includes("century") ||
    combined.includes("schoolbook");

  const isMono =
    combined.includes("courier") ||
    combined.includes("cousine") ||
    combined.includes("mono") ||
    combined.includes("consolas");

  const isCalibri = combined.includes("calibri") || combined.includes("carlito");

  const familyParts: string[] = [];
  if (value.fontId.startsWith("embedded:") && block.embeddedFamily) {
    familyParts.push(`"${block.embeddedFamily}"`);
  }
  if (cleanName && !cleanName.startsWith("g_d")) {
    familyParts.push(`"${cleanName}"`);
  }
  if (cleanFamily && !cleanFamily.startsWith("g_d") && cleanFamily !== cleanName) {
    familyParts.push(`"${cleanFamily}"`);
  }

  if (isSerif) {
    familyParts.push('"Tinos"', '"Times New Roman"', 'Times', 'Georgia', '"DejaVu Serif"', 'serif');
  } else if (isMono) {
    familyParts.push('"Cousine"', '"Courier New"', 'Courier', 'monospace');
  } else if (isCalibri) {
    familyParts.push('"Carlito"', 'Calibri', 'Candara', '"Segoe UI"', 'Arial', 'sans-serif');
  } else {
    familyParts.push('"Arimo"', 'Arial', 'Helvetica', '"Segoe UI"', '"DejaVu Sans"', 'sans-serif');
  }

  return familyParts.join(", ");
}
