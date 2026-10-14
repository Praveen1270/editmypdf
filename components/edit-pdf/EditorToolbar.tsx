"use client";

import React from "react";
import {
  MousePointer2,
  Type,
  TextCursorInput,
  Eraser,
  Image as ImageIcon,
  PenLine,
  Link as LinkIcon,
  Highlighter,
  Underline,
  Strikethrough,
  Pencil,
  Square,
  Circle,
  Minus,
  MoveUpRight,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Loader2,
  CheckSquare,
  CircleDot,
  Trash2,
  RotateCw,
  FilePlus2,
} from "lucide-react";
import type { EditorToolId } from "@/lib/pdf/edit-pdf/types";

interface EditorToolbarProps {
  tool: EditorToolId;
  onTool: (t: EditorToolId) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoomPct: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitWidth: () => void;
  editCount: number;
  busy: boolean;
  busyLabel?: string;
  onDownload: () => void;
  onDeletePage: () => void;
  onRotatePage: () => void;
  onInsertBlank: () => void;
  currentPageNum: number;
  totalPages: number;
}

function ToolButton({
  active,
  title,
  label,
  onClick,
  disabled,
  children,
}: {
  active?: boolean;
  title: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-medium transition shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        active
          ? "bg-foreground text-background shadow-paper"
          : "text-muted-foreground hover:bg-surface-subtle hover:text-foreground"
      } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-6 w-px shrink-0 bg-border" aria-hidden="true" />;
}

export function EditorToolbar(props: EditorToolbarProps) {
  const t = props.tool;
  const shapeActive = t === "rect" || t === "ellipse" || t === "line" || t === "arrow";
  const formActive = t === "formText" || t === "formCheck" || t === "formRadio";
  const [shapeOpen, setShapeOpen] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);

  return (
    <div
      className="sticky top-[57px] z-30 border-b border-border bg-surface/95 backdrop-blur-md"
      role="toolbar"
      aria-label="PDF editor tools"
    >
      <div className="mx-auto flex max-w-content items-center gap-1 overflow-x-auto px-3 py-2 sm:px-4">
        <ToolButton active={t === "select"} title="Select / move objects (V)" label="Select tool" onClick={() => props.onTool("select")}>
          <MousePointer2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton active={t === "text"} title="Edit existing text in place — hover text, click to edit (T)" label="Edit text tool" onClick={() => props.onTool("text")}>
          <Type className="h-4 w-4" />
        </ToolButton>
        <ToolButton active={t === "addText"} title="Add new text — click anywhere on a page" label="Add text tool" onClick={() => props.onTool("addText")}>
          <TextCursorInput className="h-4 w-4" />
        </ToolButton>
        <ToolButton active={t === "whiteout"} title="Whiteout — drag a rectangle to cover content" label="Whiteout tool" onClick={() => props.onTool("whiteout")}>
          <Eraser className="h-4 w-4" />
        </ToolButton>

        <Divider />

        {/* Shapes dropdown */}
        <div className="relative shrink-0">
          <ToolButton active={shapeActive} title="Shapes: rectangle, ellipse, line, arrow" label="Shapes menu" onClick={() => { setShapeOpen((v) => !v); setFormOpen(false); }}>
            {t === "ellipse" ? <Circle className="h-4 w-4" /> : t === "line" ? <Minus className="h-4 w-4" /> : t === "arrow" ? <MoveUpRight className="h-4 w-4" /> : <Square className="h-4 w-4" />}
          </ToolButton>
          {shapeOpen && (
            <div className="absolute left-0 top-10 z-40 flex gap-1 rounded-xl border border-border bg-surface p-1.5 shadow-paper-elevated">
              {(
                [
                  ["rect", Square, "Rectangle"],
                  ["ellipse", Circle, "Ellipse"],
                  ["line", Minus, "Line"],
                  ["arrow", MoveUpRight, "Arrow"],
                ] as const
              ).map(([id, Icon, label]) => (
                <button
                  key={id}
                  type="button"
                  title={label}
                  aria-label={label}
                  onClick={() => { props.onTool(id); setShapeOpen(false); }}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${t === id ? "bg-foreground text-background" : "text-muted-foreground hover:bg-surface-subtle hover:text-foreground"}`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          )}
        </div>
        <ToolButton active={t === "draw"} title="Freehand draw (D)" label="Freehand draw tool" onClick={() => props.onTool("draw")}>
          <Pencil className="h-4 w-4" />
        </ToolButton>
        <ToolButton active={t === "highlight"} title="Highlight — select text to highlight" label="Highlight tool" onClick={() => props.onTool("highlight")}>
          <Highlighter className="h-4 w-4" />
        </ToolButton>
        <ToolButton active={t === "underline"} title="Underline — select text to underline" label="Underline tool" onClick={() => props.onTool("underline")}>
          <Underline className="h-4 w-4" />
        </ToolButton>
        <ToolButton active={t === "strike"} title="Strikethrough — select text" label="Strikethrough tool" onClick={() => props.onTool("strike")}>
          <Strikethrough className="h-4 w-4" />
        </ToolButton>

        <Divider />

        <ToolButton active={t === "image"} title="Insert image (PNG/JPG)" label="Insert image tool" onClick={() => props.onTool("image")}>
          <ImageIcon className="h-4 w-4" />
        </ToolButton>
        <ToolButton active={t === "sign"} title="Sign — place your signature" label="Signature tool" onClick={() => props.onTool("sign")}>
          <PenLine className="h-4 w-4" />
        </ToolButton>
        <ToolButton active={t === "link"} title="Add link — draw a rectangle, set URL or page" label="Link tool" onClick={() => props.onTool("link")}>
          <LinkIcon className="h-4 w-4" />
        </ToolButton>

        {/* Forms dropdown */}
        <div className="relative shrink-0">
          <ToolButton active={formActive} title="Form fields: text field, checkbox, radio" label="Form fields menu" onClick={() => { setFormOpen((v) => !v); setShapeOpen(false); }}>
            <CheckSquare className="h-4 w-4" />
          </ToolButton>
          {formOpen && (
            <div className="absolute left-0 top-10 z-40 flex gap-1 rounded-xl border border-border bg-surface p-1.5 shadow-paper-elevated">
              <button type="button" title="Text field" aria-label="Text field" onClick={() => { props.onTool("formText"); setFormOpen(false); }} className={`flex h-9 w-9 items-center justify-center rounded-lg ${t === "formText" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-surface-subtle hover:text-foreground"}`}>
                <TextCursorInput className="h-4 w-4" />
              </button>
              <button type="button" title="Checkbox" aria-label="Checkbox" onClick={() => { props.onTool("formCheck"); setFormOpen(false); }} className={`flex h-9 w-9 items-center justify-center rounded-lg ${t === "formCheck" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-surface-subtle hover:text-foreground"}`}>
                <CheckSquare className="h-4 w-4" />
              </button>
              <button type="button" title="Radio button" aria-label="Radio button" onClick={() => { props.onTool("formRadio"); setFormOpen(false); }} className={`flex h-9 w-9 items-center justify-center rounded-lg ${t === "formRadio" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-surface-subtle hover:text-foreground"}`}>
                <CircleDot className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <Divider />

        <ToolButton title="Undo (Ctrl+Z)" label="Undo" onClick={props.onUndo} disabled={!props.canUndo}>
          <Undo2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton title="Redo (Ctrl+Y)" label="Redo" onClick={props.onRedo} disabled={!props.canRedo}>
          <Redo2 className="h-4 w-4" />
        </ToolButton>

        <Divider />

        <ToolButton title="Zoom out" label="Zoom out" onClick={props.onZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </ToolButton>
        <span className="w-12 shrink-0 text-center font-mono text-[11px] text-muted-foreground" aria-live="polite">
          {props.zoomPct}%
        </span>
        <ToolButton title="Zoom in" label="Zoom in" onClick={props.onZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </ToolButton>
        <ToolButton title="Fit width" label="Fit width" onClick={props.onFitWidth}>
          <Maximize2 className="h-4 w-4" />
        </ToolButton>

        <Divider />

        <ToolButton title={`Delete page ${props.currentPageNum}`} label="Delete current page" onClick={props.onDeletePage}>
          <Trash2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton title={`Rotate page ${props.currentPageNum} 90°`} label="Rotate current page" onClick={props.onRotatePage}>
          <RotateCw className="h-4 w-4" />
        </ToolButton>
        <ToolButton title="Insert blank page after current" label="Insert blank page" onClick={props.onInsertBlank}>
          <FilePlus2 className="h-4 w-4" />
        </ToolButton>

        <div className="ml-auto flex shrink-0 items-center gap-2 pl-2">
          <span className="hidden rounded-md border border-border bg-surface-subtle px-2 py-1 text-xs font-medium text-foreground md:inline-block">
            {props.editCount} {props.editCount === 1 ? "change" : "changes"}
          </span>
          <button
            type="button"
            onClick={props.onDownload}
            disabled={props.busy}
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background shadow-paper transition hover:opacity-90 disabled:opacity-50 sm:text-sm"
          >
            {props.busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="max-w-40 truncate">{props.busyLabel ?? "Working…"}</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Apply & Download</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
