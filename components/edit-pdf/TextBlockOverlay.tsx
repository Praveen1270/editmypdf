"use client";

import React, { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  GripVertical,
  X,
  TriangleAlert,
} from "lucide-react";
import type { TextBlock } from "@/lib/pdf/edit-pdf/types";
import { BUNDLED_FONTS, STANDARD_FONT_OPTIONS } from "@/lib/pdf/edit-pdf/font-matching";

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

  useEffect(() => {
    const el = areaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.max(geometry.minHeight, el.scrollHeight)}px`;
      el.focus({ preventScroll: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.text, value.fontSize, value.fontId, value.bold, value.italic, geometry.width]);

  const fontFamily = fontFamilyForValue(block, value);

  return (
    <div
      className="absolute z-30"
      style={{ left: geometry.left, top: geometry.top, width: Math.max(40, geometry.width) }}
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {/* Floating format bar */}
      <div
        className="absolute -top-11 left-0 z-40 flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1.5 shadow-paper-elevated"
        role="toolbar"
        aria-label="Text formatting"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <span
          className="flex h-7 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground hover:bg-surface-subtle hover:text-foreground active:cursor-grabbing"
          title="Drag to move"
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            dragRef.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerMove={(e) => {
            const s = dragRef.current;
            if (!s) return;
            const d = props.toPdfDelta(e.clientX - s.x, e.clientY - s.y);
            dragRef.current = { x: e.clientX, y: e.clientY };
            props.onMove(d.dx, d.dy);
          }}
          onPointerUp={() => { dragRef.current = null; }}
        >
          <GripVertical className="h-4 w-4" />
        </span>
        <select
          value={value.fontId}
          onChange={(e) => props.onPatch({ fontId: e.target.value })}
          className="h-7 max-w-36 rounded-md border border-border bg-surface px-1 text-[11px] text-foreground focus:outline-none"
          title="Font family"
          aria-label="Font family"
        >
          {block.hasEmbeddedFont && block.embeddedFamily && (
            <option value={`embedded:${block.embeddedFamily}`}>
              Original font ({block.embeddedFamily.slice(0, 18)})
            </option>
          )}
          <optgroup label="Matched & bundled">
            {BUNDLED_FONTS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.id === block.matchedFontId ? `★ ${f.label}` : f.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="Standard PDF fonts">
            {STANDARD_FONT_OPTIONS.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </optgroup>
        </select>
        <input
          type="number"
          min={6}
          max={144}
          value={value.fontSize}
          onChange={(e) => props.onPatch({ fontSize: Math.max(6, Math.min(144, Number(e.target.value) || 12)) })}
          className="h-7 w-12 rounded-md border border-border bg-surface px-1 text-[11px] font-mono text-foreground focus:outline-none"
          title="Font size (pt)"
          aria-label="Font size in points"
        />
        <FormatToggle active={value.bold} title="Bold" label="Bold" onClick={() => props.onPatch({ bold: !value.bold })}>
          <Bold className="h-3.5 w-3.5" />
        </FormatToggle>
        <FormatToggle active={value.italic} title="Italic" label="Italic" onClick={() => props.onPatch({ italic: !value.italic })}>
          <Italic className="h-3.5 w-3.5" />
        </FormatToggle>
        <FormatToggle active={value.underline} title="Underline" label="Underline" onClick={() => props.onPatch({ underline: !value.underline })}>
          <UnderlineIcon className="h-3.5 w-3.5" />
        </FormatToggle>
        <FormatToggle active={value.align === "left"} title="Align left" label="Align left" onClick={() => props.onPatch({ align: "left" })}>
          <AlignLeft className="h-3.5 w-3.5" />
        </FormatToggle>
        <FormatToggle active={value.align === "center"} title="Align center" label="Align center" onClick={() => props.onPatch({ align: "center" })}>
          <AlignCenter className="h-3.5 w-3.5" />
        </FormatToggle>
        <FormatToggle active={value.align === "right"} title="Align right" label="Align right" onClick={() => props.onPatch({ align: "right" })}>
          <AlignRight className="h-3.5 w-3.5" />
        </FormatToggle>
        <input
          type="color"
          value={value.colorHex}
          onChange={(e) => props.onPatch({ colorHex: e.target.value })}
          className="h-7 w-7 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
          title="Text color"
          aria-label="Text color"
        />
        <button
          type="button"
          title="Delete text"
          aria-label="Delete text"
          onClick={props.onDelete}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="Done editing (Esc)"
          aria-label="Done editing"
          onClick={props.onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-subtle hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {props.fallbackNotice && (
        <div className="absolute -top-11 left-0 z-30 hidden -translate-y-full items-center gap-1 whitespace-nowrap rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-900 group-hover:flex dark:bg-amber-950 dark:text-amber-200">
          <TriangleAlert className="h-3 w-3" />
          <span>Original font lacks some characters — similar font used.</span>
        </div>
      )}
      {props.fallbackNotice && (
        <div className="absolute -bottom-7 left-0 z-40 flex items-center gap-1 whitespace-nowrap rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          <TriangleAlert className="h-3 w-3" />
          <span>Original font doesn&apos;t contain some characters, similar font used</span>
        </div>
      )}

      <textarea
        ref={areaRef}
        value={value.text}
        onChange={(e) => props.onPatch({ text: e.target.value })}
        rows={Math.max(1, value.text.split("\n").length)}
        spellCheck={false}
        aria-label={`Edit text: ${block.text.slice(0, 60)}`}
        style={{
          fontFamily,
          fontSize: `${value.fontSize * scale}px`,
          lineHeight: `${(block.lineHeight / Math.max(1, block.fontSize)) * value.fontSize * scale}px`,
          color: value.colorHex,
          fontWeight: value.bold ? 700 : 400,
          fontStyle: value.italic ? "italic" : "normal",
          textDecoration: value.underline ? "underline" : "none",
          textAlign: value.align,
          background: props.bgHex,
          width: "100%",
          minHeight: geometry.minHeight,
          resize: "none",
          overflow: "hidden",
          padding: "0 1px",
          margin: 0,
          border: "1.5px solid var(--color-focus)",
          borderRadius: 2,
          outline: "none",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      />
      {/* Width resize handle (width only → re-wraps) */}
      <span
        className="absolute -right-2 top-1/2 z-40 h-10 w-3 -translate-y-1/2 cursor-ew-resize touch-none rounded-full border border-border bg-surface shadow-paper"
        title="Drag to change wrap width"
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

function FormatToggle({
  active,
  title,
  label,
  onClick,
  children,
}: {
  active: boolean;
  title: string;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition ${active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-surface-subtle hover:text-foreground"}`}
    >
      {children}
    </button>
  );
}

function fontFamilyForValue(block: TextBlock, value: InlineTextValue): string {
  if (value.fontId.startsWith("embedded:") && block.embeddedFamily) {
    return `"${block.embeddedFamily}", sans-serif`;
  }
  const bundled = BUNDLED_FONTS.find((f) => f.id === value.fontId);
  if (bundled) return `"${bundled.cssFamily}", sans-serif`;
  const std = STANDARD_FONT_OPTIONS.find((f) => f.id === value.fontId);
  if (std) return std.cssFamily;
  return "sans-serif";
}
