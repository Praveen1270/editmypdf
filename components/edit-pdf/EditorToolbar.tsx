"use client";

import React, { useState, useRef, useEffect } from "react";
import {
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
  Search,
  ChevronDown,
  Plus,
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
  onFindReplace?: () => void;
  onDeletePage: () => void;
  onRotatePage: () => void;
  onInsertBlank: () => void;
  onNewImage?: () => void;
  onNewSignature?: () => void;
  currentPageNum: number;
  totalPages: number;
}

export function EditorToolbar(props: EditorToolbarProps) {
  const t = props.tool;

  const [textOpen, setTextOpen] = useState(false);
  const [formsOpen, setFormsOpen] = useState(false);
  const [imagesOpen, setImagesOpen] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [annotOpen, setAnnotOpen] = useState(false);
  const [shapesOpen, setShapesOpen] = useState(false);

  const toolbarRef = useRef<HTMLDivElement | null>(null);

  // Close open dropdowns when clicking outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setTextOpen(false);
        setFormsOpen(false);
        setImagesOpen(false);
        setSignOpen(false);
        setAnnotOpen(false);
        setShapesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const closeAll = () => {
    setTextOpen(false);
    setFormsOpen(false);
    setImagesOpen(false);
    setSignOpen(false);
    setAnnotOpen(false);
    setShapesOpen(false);
  };

  const isTextActive = t === "text" || t === "addText";
  const isFormsActive = t === "formText" || t === "formCheck" || t === "formRadio";
  const isImagesActive = t === "image";
  const isSignActive = t === "sign";
  const isWhiteoutActive = t === "whiteout";
  const isAnnotActive = t === "highlight" || t === "underline" || t === "strike" || t === "draw";
  const isShapesActive = t === "rect" || t === "ellipse" || t === "line" || t === "arrow";

  const btnStyle = (active: boolean) =>
    `flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs sm:text-sm font-medium transition shadow-xs shrink-0 select-none ${
      active
        ? "border-primary bg-primary text-primary-foreground font-semibold"
        : "border-border bg-surface text-foreground hover:bg-surface-subtle"
    }`;

  return (
    <div
      ref={toolbarRef}
      className="sticky top-[57px] z-30 border-b border-border bg-surface py-2 px-3 sm:px-6 shadow-xs overflow-visible"
      role="toolbar"
      aria-label="PDF editor toolbar"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 overflow-visible">
        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground shrink-0">
          <span>Page {props.currentPageNum} of {props.totalPages}</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mx-auto flex-wrap sm:flex-nowrap">
          {/* 1. Text [IA Text ▼] */}
          <div className="relative">
            <button
              type="button"
              className={btnStyle(isTextActive)}
              onClick={() => {
                const next = !textOpen;
                closeAll();
                setTextOpen(next);
                if (!isTextActive) props.onTool("text");
              }}
              title="Text tool"
            >
              <Type className="h-4 w-4" />
              <span>Text</span>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </button>
            {textOpen && (
              <div className="absolute left-0 top-11 z-50 flex min-w-56 flex-col rounded-xl border border-border bg-surface p-1.5 shadow-xl text-foreground">
                <button
                  type="button"
                  onClick={() => {
                    props.onTool("text");
                    closeAll();
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs ${
                    t === "text" ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-surface-subtle"
                  }`}
                >
                  <Type className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Edit text</div>
                    <div className="text-[10px] opacity-80">Select and edit line by line</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    props.onTool("addText");
                    closeAll();
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs ${
                    t === "addText" ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-surface-subtle"
                  }`}
                >
                  <TextCursorInput className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Add new text</div>
                    <div className="text-[10px] opacity-80">Click anywhere to place text</div>
                  </div>
                </button>
                {props.onFindReplace && (
                  <button
                    type="button"
                    onClick={() => {
                      props.onFindReplace?.();
                      closeAll();
                    }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-foreground hover:bg-surface-subtle"
                  >
                    <Search className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Find & Replace</div>
                      <div className="text-[10px] opacity-80">Search and replace text in PDF</div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 2. Links [🔗 Links] */}
          <button
            type="button"
            className={btnStyle(t === "link")}
            onClick={() => {
              closeAll();
              props.onTool("link");
            }}
            title="Links tool — drag a rectangle to add URL or internal page link"
          >
            <LinkIcon className="h-4 w-4" />
            <span>Links</span>
          </button>

          {/* 3. Forms [📋 Forms ▼] */}
          <div className="relative">
            <button
              type="button"
              className={btnStyle(isFormsActive)}
              onClick={() => {
                const next = !formsOpen;
                closeAll();
                setFormsOpen(next);
              }}
              title="Form fields"
            >
              <CheckSquare className="h-4 w-4" />
              <span>Forms</span>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </button>
            {formsOpen && (
              <div className="absolute left-0 top-11 z-50 flex min-w-44 flex-col rounded-xl border border-border bg-surface p-1.5 shadow-xl text-foreground">
                <button
                  type="button"
                  onClick={() => {
                    props.onTool("formText");
                    closeAll();
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs ${
                    t === "formText" ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-surface-subtle"
                  }`}
                >
                  <TextCursorInput className="h-4 w-4" />
                  <span>Text field</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    props.onTool("formCheck");
                    closeAll();
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs ${
                    t === "formCheck" ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-surface-subtle"
                  }`}
                >
                  <CheckSquare className="h-4 w-4" />
                  <span>Checkbox</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    props.onTool("formRadio");
                    closeAll();
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs ${
                    t === "formRadio" ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-surface-subtle"
                  }`}
                >
                  <CircleDot className="h-4 w-4" />
                  <span>Radio button</span>
                </button>
              </div>
            )}
          </div>

          {/* 4. Images [🖼 Images ▼] */}
          <div className="relative">
            <button
              type="button"
              className={btnStyle(isImagesActive)}
              onClick={() => {
                const next = !imagesOpen;
                closeAll();
                setImagesOpen(next);
                props.onTool("image");
              }}
              title="Images tool — upload, add, position or remove images"
            >
              <ImageIcon className="h-4 w-4" />
              <span>Images</span>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </button>
            {imagesOpen && (
              <div className="absolute left-0 top-11 z-50 flex min-w-48 flex-col rounded-xl border border-border bg-surface p-1.5 shadow-xl text-foreground">
                <button
                  type="button"
                  onClick={() => {
                    closeAll();
                    props.onTool("image");
                    props.onNewImage?.();
                  }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-foreground hover:bg-surface-subtle"
                >
                  <Plus className="h-4 w-4 text-foreground" />
                  <span>+ New Image</span>
                </button>
                <div className="border-t border-border my-1 px-3 py-1 text-[11px] text-muted-foreground">
                  Supports PNG, JPG, SVG, WebP
                </div>
              </div>
            )}
          </div>

          {/* 5. Sign [✍ Sign ▼] */}
          <div className="relative">
            <button
              type="button"
              className={btnStyle(isSignActive)}
              onClick={() => {
                const next = !signOpen;
                closeAll();
                setSignOpen(next);
                props.onTool("sign");
              }}
              title="Sign PDF"
            >
              <PenLine className="h-4 w-4" />
              <span>Sign</span>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </button>
            {signOpen && (
              <div className="absolute left-0 top-11 z-50 flex min-w-44 flex-col rounded-xl border border-border bg-surface p-1.5 shadow-xl text-foreground">
                <button
                  type="button"
                  onClick={() => {
                    closeAll();
                    props.onTool("sign");
                    props.onNewSignature?.();
                  }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-foreground hover:bg-surface-subtle"
                >
                  <Plus className="h-4 w-4 text-foreground" />
                  <span>+ New Signature</span>
                </button>
              </div>
            )}
          </div>

          {/* 6. Whiteout [⬚ Whiteout] */}
          <button
            type="button"
            className={btnStyle(isWhiteoutActive)}
            onClick={() => {
              closeAll();
              props.onTool("whiteout");
            }}
            title="Whiteout — drag a rectangle to cover or remove any text, image or object"
          >
            <Eraser className="h-4 w-4" />
            <span>Whiteout</span>
          </button>

          {/* 7. Annotate [✏ Annotate ▼] */}
          <div className="relative">
            <button
              type="button"
              className={btnStyle(isAnnotActive)}
              onClick={() => {
                const next = !annotOpen;
                closeAll();
                setAnnotOpen(next);
              }}
              title="Annotate: Highlight, Underline, Strike, Draw"
            >
              <Pencil className="h-4 w-4" />
              <span>Annotate</span>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </button>
            {annotOpen && (
              <div className="absolute left-0 top-11 z-50 flex min-w-44 flex-col rounded-xl border border-border bg-surface p-1.5 shadow-xl text-foreground">
                <button
                  type="button"
                  onClick={() => {
                    props.onTool("highlight");
                    closeAll();
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs ${
                    t === "highlight" ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-surface-subtle"
                  }`}
                >
                  <Highlighter className="h-4 w-4" />
                  <span>Highlight</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    props.onTool("underline");
                    closeAll();
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs ${
                    t === "underline" ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-surface-subtle"
                  }`}
                >
                  <Underline className="h-4 w-4" />
                  <span>Underline</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    props.onTool("strike");
                    closeAll();
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs ${
                    t === "strike" ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-surface-subtle"
                  }`}
                >
                  <Strikethrough className="h-4 w-4" />
                  <span>Strikethrough</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    props.onTool("draw");
                    closeAll();
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs ${
                    t === "draw" ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-surface-subtle"
                  }`}
                >
                  <Pencil className="h-4 w-4" />
                  <span>Freehand Draw</span>
                </button>
              </div>
            )}
          </div>

          {/* 8. Shapes [☖ Shapes ▼] */}
          <div className="relative">
            <button
              type="button"
              className={btnStyle(isShapesActive)}
              onClick={() => {
                const next = !shapesOpen;
                closeAll();
                setShapesOpen(next);
              }}
              title="Shapes: Rectangle, Ellipse, Line, Arrow"
            >
              <Square className="h-4 w-4" />
              <span>Shapes</span>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </button>
            {shapesOpen && (
              <div className="absolute left-0 top-11 z-50 flex min-w-44 flex-col rounded-xl border border-border bg-surface p-1.5 shadow-xl text-foreground">
                <button
                  type="button"
                  onClick={() => {
                    props.onTool("rect");
                    closeAll();
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs ${
                    t === "rect" ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-surface-subtle"
                  }`}
                >
                  <Square className="h-4 w-4" />
                  <span>Rectangle</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    props.onTool("ellipse");
                    closeAll();
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs ${
                    t === "ellipse" ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-surface-subtle"
                  }`}
                >
                  <Circle className="h-4 w-4" />
                  <span>Ellipse</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    props.onTool("line");
                    closeAll();
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs ${
                    t === "line" ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-surface-subtle"
                  }`}
                >
                  <Minus className="h-4 w-4" />
                  <span>Line</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    props.onTool("arrow");
                    closeAll();
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs ${
                    t === "arrow" ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-surface-subtle"
                  }`}
                >
                  <MoveUpRight className="h-4 w-4" />
                  <span>Arrow</span>
                </button>
              </div>
            )}
          </div>

          {/* 9. Undo [↩ Undo] */}
          <button
            type="button"
            className={`${btnStyle(false)} ${!props.canUndo ? "opacity-40 cursor-not-allowed" : ""}`}
            onClick={props.onUndo}
            disabled={!props.canUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
            <span>Undo</span>
          </button>

          {/* 10. Redo [↪ Redo] */}
          <button
            type="button"
            className={`${btnStyle(false)} ${!props.canRedo ? "opacity-40 cursor-not-allowed" : ""}`}
            onClick={props.onRedo}
            disabled={!props.canRedo}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4" />
            <span>Redo</span>
          </button>
        </div>

        {/* Right side: Apply changes button */}
        <div className="flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={props.onDownload}
            disabled={props.busy}
            className="inline-flex items-center gap-2 rounded-lg bg-foreground text-background hover:bg-foreground/90 px-4 py-2 text-xs font-semibold shadow-sm transition active:scale-95 disabled:opacity-50 sm:text-sm"
          >
            {props.busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="max-w-36 truncate">{props.busyLabel ?? "Processing…"}</span>
              </>
            ) : (
              <>
                <span>Apply changes</span>
                <span className="font-bold text-sm">›</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
