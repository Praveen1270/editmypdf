"use client";

/**
 * PageView — renders one editor page (DPR-aware canvas + overlay layers).
 *
 * Owns: canvas rendering, viewport math, hover highlights, creation-tool
 * drag drafts, text-selection for annotations, overlay item display with
 * drag/resize handles, and hosts the inline text editor.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type {
  EditorPage,
  EditorToolId,
  Overlay,
  TextBlock,
  PdfRect,
  PdfPoint,
} from "@/lib/pdf/edit-pdf/types";
import {
  pdfPointToScreen,
  screenToPdfPoint,
  type ViewportLike,
} from "@/lib/pdf/edit-pdf/viewport";
import { cssFamilyForFontId } from "@/lib/pdf/edit-pdf/font-matching";
import { sampleBackgroundHex } from "@/lib/pdf/edit-pdf/text-extraction";
import { InlineTextEditor, type InlineTextValue } from "./TextBlockOverlay";

export type AnnotSubtype = "highlight" | "underline" | "strike";

interface PageViewProps {
  page: EditorPage;
  pageNumber: number;
  zoom: number;
  pdfDocRef: React.MutableRefObject<any>;
  blocks: TextBlock[] | undefined;
  blocksLoading: boolean;
  overlays: Overlay[];
  tool: EditorToolId;
  selectedId: string | null;
  editingBlockId: string | null;
  inlineValue: InlineTextValue | null;
  inlineBg: string;
  fallbackNotice: boolean;
  onEnsureBlocks: (srcIndex: number) => void;
  onRegisterCanvas: (pageKey: string, canvas: HTMLCanvasElement | null) => void;
  onBlockClick: (pageKey: string, block: TextBlock, bgHex: string) => void;
  onPageClick: (pageKey: string, pt: PdfPoint) => void;
  onCommitRect: (pageKey: string, tool: EditorToolId, rect: PdfRect) => void;
  onCommitDraw: (pageKey: string, points: PdfPoint[]) => void;
  onCreateAnnot: (pageKey: string, subtype: AnnotSubtype, quads: number[]) => void;
  onSelectOverlay: (id: string | null) => void;
  onActivatePage: (pageKey: string) => void;
  onTransientStart: () => void;
  onOverlayPatch: (id: string, patch: Partial<Overlay>) => void;
  onTransientEnd: () => void;
  onPatchInline: (patch: Partial<InlineTextValue>) => void;
  onMoveInline: (dxPdf: number, dyPdf: number) => void;
  onResizeInlineWidth: (dWrapPdf: number) => void;
  onDeleteInline: () => void;
  onCloseInline: () => void;
  annotColor: string;
}

const CREATION_TOOLS: EditorToolId[] = [
  "whiteout",
  "rect",
  "ellipse",
  "line",
  "arrow",
  "link",
  "formText",
  "formCheck",
  "formRadio",
  "draw",
];

export function PageView(props: PageViewProps) {
  const { page, zoom } = props;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [viewport, setViewport] = useState<ViewportLike | null>(null);
  const [rendering, setRendering] = useState(false);
  const [hoverBlockId, setHoverBlockId] = useState<string | null>(null);
  const [draftCss, setDraftCss] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const [draftPts, setDraftPts] = useState<{ x: number; y: number }[] | null>(null);
  const dragRef = useRef<{ x0: number; y0: number; moved: boolean } | null>(null);
  const renderToken = useRef(0);

  const rotationTotal = (page.srcRotation + page.rotateDelta) % 360;
  const isBlank = page.src.kind === "blank";

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
          }
        }
      },
      { rootMargin: "600px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (visible && !isBlank && page.src.kind === "orig") {
      props.onEnsureBlocks(page.src.index);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, isBlank]);

  // Canvas rendering (DPR-aware).
  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const token = ++renderToken.current;
    setRendering(true);
    props.onRegisterCanvas(page.key, canvas);

    const render = async () => {
      try {
        if (isBlank) {
          const cssW = Math.max(1, Math.round(page.width * zoom));
          const cssH = Math.max(1, Math.round(page.height * zoom));
          const dpr = Math.min(2.5, window.devicePixelRatio || 1);
          canvas.width = Math.round(cssW * dpr);
          canvas.height = Math.round(cssH * dpr);
          canvas.style.width = `${cssW}px`;
          canvas.style.height = `${cssH}px`;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, cssW, cssH);
          }
          if (token !== renderToken.current) return;
          setViewport({
            width: cssW,
            height: cssH,
            transform: [zoom, 0, 0, -zoom, 0, page.height * zoom],
          });
        } else if (page.src.kind === "orig") {
          const doc = props.pdfDocRef.current;
          if (!doc) return;
          const pg = await doc.getPage(page.src.index + 1);
          if (token !== renderToken.current) return;
          const vp = pg.getViewport({ scale: zoom });
          const cssW = Math.max(1, Math.round(vp.width));
          const cssH = Math.max(1, Math.round(vp.height));
          const dpr = Math.min(2.5, window.devicePixelRatio || 1);
          const vpHi = pg.getViewport({ scale: zoom * dpr });
          canvas.width = Math.max(1, Math.round(vpHi.width));
          canvas.height = Math.max(1, Math.round(vpHi.height));
          canvas.style.width = `${cssW}px`;
          canvas.style.height = `${cssH}px`;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            await pg.render({ canvasContext: ctx, viewport: vpHi }).promise;
          }
          if (token !== renderToken.current) return;
          setViewport({ width: vp.width, height: vp.height, transform: [...vp.transform] });
          try {
            await pg.cleanup?.();
          } catch {
            /* ignore */
          }
          // Fonts resolve into page.commonObjs on render — retry harvest.
          if (page.src.kind === "orig") props.onEnsureBlocks(page.src.index);
        }
      } catch {
        /* keep previous frame */
      } finally {
        if (token === renderToken.current) setRendering(false);
      }
    };
    void render();
    return () => {
      renderToken.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, zoom, rotationTotal, page.key, isBlank]);

  useEffect(() => {
    return () => {
      props.onRegisterCanvas(page.key, null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.key]);

  const cssW = viewport?.width ?? Math.round(page.width * zoom);
  const cssH = viewport?.height ?? Math.round(page.height * zoom);

  const toPdfDelta = (dxPx: number, dyPx: number) => {
    if (!viewport) return { dx: dxPx / zoom, dy: -dyPx / zoom };
    const a = screenToPdfPoint(viewport, 0, 0);
    const b = screenToPdfPoint(viewport, dxPx, dyPx);
    if (!a || !b) return { dx: dxPx / zoom, dy: -dyPx / zoom };
    return { dx: b.x - a.x, dy: b.y - a.y };
  };
  const inlineScale = viewport ? cssScaleOf(viewport) : zoom;

  const editingBlock = useMemo(() => {
    if (!props.editingBlockId || !props.blocks) return null;
    return props.blocks.find((b) => b.id === props.editingBlockId) ?? null;
  }, [props.editingBlockId, props.blocks]);

  /* ----- text selection → annotation quads ----- */
  const handleMouseUp = () => {
    if (props.tool !== "highlight" && props.tool !== "underline" && props.tool !== "strike") return;
    if (!viewport || !rootRef.current) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
    const layer = rootRef.current.querySelector("[data-textlayer]");
    if (!layer) return;
    const layerRect = (layer as HTMLElement).getBoundingClientRect();
    const quads: number[] = [];
    for (let ri = 0; ri < sel.rangeCount; ri++) {
      const range = sel.getRangeAt(ri);
      if (!layer.contains(range.commonAncestorContainer)) continue;
      const rects = range.getClientRects();
      for (const r of rects) {
        if (r.width < 2 || r.height < 2) continue;
        const x0 = r.left - layerRect.left;
        const y0 = r.top - layerRect.top;
        const x1 = r.right - layerRect.left;
        const y1 = r.bottom - layerRect.top;
        const p1 = screenToPdfPoint(viewport, x0, y0);
        const p2 = screenToPdfPoint(viewport, x1, y1);
        if (!p1 || !p2) continue;
        const minX = Math.min(p1.x, p2.x);
        const maxX = Math.max(p1.x, p2.x);
        const minY = Math.min(p1.y, p2.y);
        const maxY = Math.max(p1.y, p2.y);
        quads.push(minX, minY, maxX, minY, maxX, maxY, minX, maxY);
      }
    }
    sel.removeAllRanges();
    if (quads.length >= 8) {
      props.onCreateAnnot(page.key, props.tool as AnnotSubtype, quads);
    }
  };

  /* ----- creation-tool drag drafts ----- */
  const layerPos = (e: React.PointerEvent) => {
    const layer = (e.currentTarget as HTMLElement).getBoundingClientRect();
    return { x: e.clientX - layer.left, y: e.clientY - layer.top };
  };

  const onLayerPointerDown = (e: React.PointerEvent) => {
    props.onActivatePage(page.key);
    if (e.button !== 0) return;
    if (CREATION_TOOLS.includes(props.tool)) {
      const p = layerPos(e);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = { x0: p.x, y0: p.y, moved: false };
      if (props.tool === "draw") setDraftPts([{ x: p.x, y: p.y }]);
      else setDraftCss({ x0: p.x, y0: p.y, x1: p.x, y1: p.y });
    } else if (props.tool === "select") {
      props.onSelectOverlay(null);
    }
  };

  const onLayerPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || !CREATION_TOOLS.includes(props.tool)) return;
    const p = layerPos(e);
    if (Math.hypot(p.x - d.x0, p.y - d.y0) > 4) d.moved = true;
    if (props.tool === "draw") {
      setDraftPts((pts) => (pts ? [...pts, p] : [p]));
    } else {
      setDraftCss((prev) => (prev ? { ...prev, x1: p.x, y1: p.y } : prev));
    }
  };

  const onLayerPointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d || !CREATION_TOOLS.includes(props.tool) || !viewport) {
      setDraftCss(null);
      setDraftPts(null);
      return;
    }
    const p = layerPos(e);
    if (props.tool === "draw") {
      const pts = draftPts ?? [];
      setDraftPts(null);
      setDraftCss(null);
      if (pts.length >= 2) {
        const pdfPts = pts
          .map((q) => screenToPdfPoint(viewport, q.x, q.y))
          .filter((q): q is PdfPoint => !!q);
        if (pdfPts.length >= 2) props.onCommitDraw(page.key, pdfPts);
      }
      return;
    }
    const dc = draftCss;
    setDraftCss(null);
    if (!d.moved) {
      // Click (no drag): placement tools.
      const pt = screenToPdfPoint(viewport, p.x, p.y);
      if (pt) props.onPageClick(page.key, pt);
      return;
    }
    if (!dc) return;
    const a = screenToPdfPoint(viewport, Math.min(dc.x0, dc.x1), Math.min(dc.y0, dc.y1));
    const b = screenToPdfPoint(viewport, Math.max(dc.x0, dc.x1), Math.max(dc.y0, dc.y1));
    if (!a || !b) return;
    const rect: PdfRect = {
      x: Math.min(a.x, b.x),
      y: Math.min(a.y, b.y),
      w: Math.abs(b.x - a.x),
      h: Math.abs(b.y - a.y),
    };
    if (rect.w < 2 || rect.h < 2) {
      const pt = screenToPdfPoint(viewport, p.x, p.y);
      if (pt) props.onPageClick(page.key, pt);
      return;
    }
    props.onCommitRect(page.key, props.tool, rect);
  };

  const sampleBg = (b: TextBlock): string => {
    try {
      const c = canvasRef.current;
      if (!c || !viewport) return "#ffffff";
      return sampleBackgroundHex(c, blockGeometry(b, viewport));
    } catch {
      return "#ffffff";
    }
  };

  const showTextLayer =
    props.tool === "highlight" || props.tool === "underline" || props.tool === "strike";
  const showBlockHover = props.tool === "text" && !props.editingBlockId;

  return (
    <div
      ref={rootRef}
      id={`editpdf-page-${page.key}`}
      data-page-key={page.key}
      className="relative mx-auto bg-white shadow-paper-elevated ring-1 ring-border"
      style={{ width: cssW, height: cssH }}
      onClick={() => props.onActivatePage(page.key)}
      onDoubleClick={() => {
        if (hoverBlockId && props.blocks) {
          const b = props.blocks.find((x) => x.id === hoverBlockId);
          if (b) props.onBlockClick(page.key, b, sampleBg(b));
        }
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block" />
      {rendering && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-subtle/50">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Hover highlights for existing text */}
      {showBlockHover && viewport && props.blocks && (
        <div className="absolute inset-0 z-10">
          {props.blocks.map((b) => (
            <BlockHitBox
              key={b.id}
              block={b}
              viewport={viewport}
              hovered={hoverBlockId === b.id}
              edited={props.overlays.some((o) => o.kind === "edit" && o.blockId === b.id)}
              onEnter={() => setHoverBlockId(b.id)}
              onLeave={() => setHoverBlockId((h) => (h === b.id ? null : h))}
              onClick={() => props.onBlockClick(page.key, b, sampleBg(b))}
            />
          ))}
        </div>
      )}

      {/* Selectable text layer for annotations */}
      {showTextLayer && viewport && props.blocks && (
        <div
          data-textlayer
          className="absolute inset-0 z-[25] select-text"
          style={{ cursor: "text" }}
          onMouseUp={handleMouseUp}
        >
          {props.blocks.map((b) => (
            <BlockTextLayer key={b.id} block={b} viewport={viewport} />
          ))}
        </div>
      )}

      {/* Overlay items */}
      {viewport && (
        <div className="absolute inset-0 z-20">
          {props.overlays.map((ov) => (
            <OverlayItem
              key={ov.id}
              overlay={ov}
              viewport={viewport}
              selected={props.selectedId === ov.id}
              selecting={props.tool === "select"}
              onSelect={() => {
                props.onActivatePage(page.key);
                props.onSelectOverlay(ov.id);
              }}
              onTransientStart={props.onTransientStart}
              onPatch={(patch) => props.onOverlayPatch(ov.id, patch)}
              onTransientEnd={props.onTransientEnd}
              toPdfDelta={toPdfDelta}
            />
          ))}
        </div>
      )}

      {/* Inline editor for in-place text editing */}
      {viewport && editingBlock && props.inlineValue && (
        <InlineTextEditor
          block={editingBlock}
          value={props.inlineValue}
          onPatch={props.onPatchInline}
          onDelete={props.onDeleteInline}
          onClose={props.onCloseInline}
          geometry={(() => {
            const g = blockGeometry(editingBlock, viewport);
            return { left: g.x, top: g.y, width: g.w, minHeight: g.h };
          })()}
          scale={inlineScale}
          bgHex={props.inlineBg}
          fallbackNotice={props.fallbackNotice}
          toPdfDelta={toPdfDelta}
          onMove={props.onMoveInline}
          onResizeWidth={props.onResizeInlineWidth}
        />
      )}

      {/* Creation draft preview */}
      {viewport && draftCss && props.tool !== "draw" && (
        <div
          className="pointer-events-none absolute z-40 rounded-[2px] border-2 border-dashed border-foreground bg-foreground/10"
          style={{
            left: Math.min(draftCss.x0, draftCss.x1),
            top: Math.min(draftCss.y0, draftCss.y1),
            width: Math.abs(draftCss.x1 - draftCss.x0),
            height: Math.abs(draftCss.y1 - draftCss.y0),
          }}
        />
      )}
      {viewport && draftPts && draftPts.length > 1 && (
        <svg className="pointer-events-none absolute inset-0 z-40 h-full w-full">
          <polyline
            points={draftPts.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="text-foreground"
          />
        </svg>
      )}

      {/* Invisible interaction layer (captures creation drags) */}
      {viewport && (
        <div
          className="absolute inset-0 z-[5] touch-none"
          style={{
            cursor:
              props.tool === "text"
                ? "text"
                : CREATION_TOOLS.includes(props.tool)
                  ? "crosshair"
                  : "default",
          }}
          onPointerDown={onLayerPointerDown}
          onPointerMove={onLayerPointerMove}
          onPointerUp={onLayerPointerUp}
        />
      )}

      {!visible && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-subtle">
          <span className="text-xs text-muted-foreground">Page {props.pageNumber}</span>
        </div>
      )}
      {visible && props.blocksLoading && (
        <div className="pointer-events-none absolute bottom-2 right-2 z-10 rounded bg-surface/80 px-1.5 py-0.5 text-[10px] text-muted-foreground">
          Reading text…
        </div>
      )}
    </div>
  );
}

/* ================= block helpers ================= */

function blockGeometry(block: TextBlock, viewport: ViewportLike) {
  const corners = [
    pdfPointToScreen(viewport, block.boxX, block.boxY),
    pdfPointToScreen(viewport, block.boxX + block.boxW, block.boxY),
    pdfPointToScreen(viewport, block.boxX + block.boxW, block.boxY + block.boxH),
    pdfPointToScreen(viewport, block.boxX, block.boxY + block.boxH),
  ];
  const xs = corners.map((c) => c.sx);
  const ys = corners.map((c) => c.sy);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return {
    x,
    y,
    w: Math.max(20, Math.max(...xs) - x),
    h: Math.max(12, Math.max(...ys) - y),
  };
}

function BlockHitBox({
  block,
  viewport,
  hovered,
  edited,
  onEnter,
  onLeave,
  onClick,
}: {
  block: TextBlock;
  viewport: ViewportLike;
  hovered: boolean;
  edited: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const g = blockGeometry(block, viewport);
  return (
    <div
      className={`absolute cursor-text transition-colors ${
        hovered
          ? "bg-foreground/[0.14] outline outline-1 outline-foreground"
          : edited
            ? "bg-foreground/[0.07] outline outline-1 outline-dashed outline-foreground/50"
            : "hover:bg-foreground/[0.08]"
      }`}
      style={{ left: g.x, top: g.y, width: g.w, height: g.h }}
      title={block.text.slice(0, 120)}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    />
  );
}

function BlockTextLayer({ block, viewport }: { block: TextBlock; viewport: ViewportLike }) {
  const g = blockGeometry(block, viewport);
  return (
    <div
      data-block-id={block.id}
      className="absolute overflow-hidden whitespace-pre-wrap break-words text-transparent"
      style={{
        left: g.x,
        top: g.y,
        width: Math.max(20, g.w + 2),
        minHeight: g.h,
        fontSize: `${block.fontSize * cssScaleOf(viewport)}px`,
        lineHeight: 1.2,
      }}
    >
      {block.text}
    </div>
  );
}

function cssScaleOf(viewport: ViewportLike): number {
  const t = viewport.transform;
  return Math.hypot(t[0], t[1]);
}

/* ================= overlay items ================= */

function rectToCss(rect: PdfRect, viewport: ViewportLike) {
  const a = pdfPointToScreen(viewport, rect.x, rect.y);
  const b = pdfPointToScreen(viewport, rect.x + rect.w, rect.y + rect.h);
  return {
    left: Math.min(a.sx, b.sx),
    top: Math.min(a.sy, b.sy),
    width: Math.abs(b.sx - a.sx),
    height: Math.abs(b.sy - a.sy),
  };
}

const aspectCache = new Map<string, number>();
function aspectForImage(id: string, dataUrl: string): number | null {
  const hit = aspectCache.get(id);
  if (hit) return hit;
  const img = new Image();
  img.onload = () => {
    if (img.naturalHeight > 0) aspectCache.set(id, img.naturalWidth / img.naturalHeight);
  };
  img.src = dataUrl;
  return null;
}

function OverlayItem({
  overlay,
  viewport,
  selected,
  selecting,
  onSelect,
  onTransientStart,
  onPatch,
  onTransientEnd,
  toPdfDelta,
}: {
  overlay: Overlay;
  viewport: ViewportLike;
  selected: boolean;
  selecting: boolean;
  onSelect: () => void;
  onTransientStart: () => void;
  onPatch: (patch: Partial<Overlay>) => void;
  onTransientEnd: () => void;
  toPdfDelta: (dxPx: number, dyPx: number) => { dx: number; dy: number };
}) {
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const beginMove = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelect();
    onTransientStart();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY };
  };
  const moveBy = (e: React.PointerEvent, apply: (dxPdf: number, dyPdf: number) => void) => {
    const s = dragRef.current;
    if (!s) return;
    const d = toPdfDelta(e.clientX - s.x, e.clientY - s.y);
    dragRef.current = { x: e.clientX, y: e.clientY };
    apply(d.dx, d.dy);
  };
  const endMove = () => {
    dragRef.current = null;
    onTransientEnd();
  };

  const movePatch = (dx: number, dy: number): Partial<Overlay> => {
    const o = overlay as any;
    if (o.rect) return { rect: { ...o.rect, x: o.rect.x + dx, y: o.rect.y + dy } } as any;
    if (overlay.kind === "edit" || overlay.kind === "text") {
      return { x: (o.x ?? 0) + dx, y: (o.y ?? 0) + dy } as any;
    }
    if (overlay.kind === "draw") {
      return { points: o.points.map((p: PdfPoint) => ({ x: p.x + dx, y: p.y + dy })) } as any;
    }
    if (overlay.kind === "annot") {
      const q = [...o.quads];
      for (let i = 0; i < q.length; i += 2) {
        q[i] += dx;
        q[i + 1] += dy;
      }
      return { quads: q } as any;
    }
    return {};
  };

  const commonHandlers = {
    onPointerDown: beginMove,
    onPointerMove: (e: React.PointerEvent) => moveBy(e, (dx, dy) => onPatch(movePatch(dx, dy))),
    onPointerUp: endMove,
    onPointerCancel: endMove,
  };

  const ring = selected ? "outline outline-2 outline-foreground" : "";

  if (overlay.kind === "whiteout") {
    const g = rectToCss(overlay.rect, viewport);
    return (
      <div
        className={`absolute ${ring}`}
        style={{ left: g.left, top: g.top, width: Math.max(2, g.width), height: Math.max(2, g.height), background: overlay.colorHex }}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        {...commonHandlers}
      >
        {selected && <ResizeHandle onResize={(dx, dy) => onPatch(resizeRectPatch(overlay.rect, dx, dy, false) as any)} onTransientStart={onTransientStart} onTransientEnd={onTransientEnd} toPdfDelta={toPdfDelta} />}
      </div>
    );
  }

  if (overlay.kind === "image" || overlay.kind === "sign") {
    const g = rectToCss(overlay.rect, viewport);
    aspectForImage(overlay.id, overlay.dataUrl);
    return (
      <div
        className={`absolute ${ring}`}
        style={{ left: g.left, top: g.top, width: Math.max(4, g.width), height: Math.max(4, g.height) }}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        {...commonHandlers}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={overlay.dataUrl} alt={overlay.kind === "sign" ? "Signature" : "Placed image"} className="h-full w-full select-none" draggable={false} />
        {selected && (
          <ResizeHandle
            lockAspect={aspectCache.get(overlay.id) ?? null}
            onResize={(dx, dy) => onPatch(resizeRectPatch(overlay.rect, dx, dy, true, aspectCache.get(overlay.id)) as any)}
            onTransientStart={onTransientStart}
            onTransientEnd={onTransientEnd}
            toPdfDelta={toPdfDelta}
          />
        )}
      </div>
    );
  }

  if (overlay.kind === "shape") {
    const g = rectToCss(overlay.rect, viewport);
    const w = Math.max(2, g.width);
    const h = Math.max(2, g.height);
    return (
      <div
        className={`absolute ${ring}`}
        style={{ left: g.left, top: g.top, width: w, height: h }}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        {...commonHandlers}
      >
        <svg width={w} height={h} className="block overflow-visible">
          {overlay.shape === "rect" && (
            <rect x={1} y={1} width={Math.max(1, w - 2)} height={Math.max(1, h - 2)} fill={overlay.fillHex ?? "none"} stroke={overlay.strokeHex} strokeWidth={overlay.strokeW} />
          )}
          {overlay.shape === "ellipse" && (
            <ellipse cx={w / 2} cy={h / 2} rx={Math.max(1, w / 2 - 1)} ry={Math.max(1, h / 2 - 1)} fill={overlay.fillHex ?? "none"} stroke={overlay.strokeHex} strokeWidth={overlay.strokeW} />
          )}
          {(overlay.shape === "line" || overlay.shape === "arrow") && (
            <g>
              <line x1={2} y1={h - 2} x2={w - 2} y2={2} stroke={overlay.strokeHex} strokeWidth={overlay.strokeW} strokeLinecap="round" />
              {overlay.shape === "arrow" && (
                <polygon
                  points={`${w - 2},2 ${w - 12},4 ${w - 5},11`}
                  fill={overlay.strokeHex}
                />
              )}
            </g>
          )}
        </svg>
        {selected && <ResizeHandle onResize={(dx, dy) => onPatch(resizeRectPatch(overlay.rect, dx, dy, false) as any)} onTransientStart={onTransientStart} onTransientEnd={onTransientEnd} toPdfDelta={toPdfDelta} />}
      </div>
    );
  }

  if (overlay.kind === "draw") {
    if (overlay.points.length === 0) return null;
    const xs = overlay.points.map((p) => pdfPointToScreen(viewport, p.x, p.y));
    const minX = Math.min(...xs.map((p) => p.sx));
    const minY = Math.min(...xs.map((p) => p.sy));
    const pts = xs.map((p) => `${(p.sx - minX).toFixed(1)},${(p.sy - minY).toFixed(1)}`).join(" ");
    const maxX = Math.max(...xs.map((p) => p.sx));
    const maxY = Math.max(...xs.map((p) => p.sy));
    return (
      <div
        className={`absolute ${ring}`}
        style={{ left: minX - 4, top: minY - 4, width: Math.max(8, maxX - minX + 8), height: Math.max(8, maxY - minY + 8) }}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        {...commonHandlers}
      >
        <svg width="100%" height="100%" className="block overflow-visible">
          <polyline points={pts} transform="translate(4,4)" fill="none" stroke={overlay.strokeHex} strokeWidth={overlay.strokeW} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  if (overlay.kind === "annot" || overlay.kind === "link" || overlay.kind === "form") {
    const css =
      overlay.kind === "annot"
        ? quadsToCss(overlay.quads, viewport)
        : rectToCss(overlay.kind === "link" ? overlay.rect : overlay.rect, viewport);
    const bg =
      overlay.kind === "annot"
        ? overlay.subtype === "highlight"
          ? `${overlay.colorHex}59`
          : "transparent"
        : overlay.kind === "link"
          ? "rgba(59,130,246,0.12)"
          : "rgba(59,130,246,0.15)";
    const border =
      overlay.kind === "annot" && overlay.subtype !== "highlight"
        ? `2px ${overlay.subtype === "underline" ? "none none solid none" : "line-through"}`
        : undefined;
    return (
      <div
        className={`absolute ${ring}`}
        style={{
          left: css.left,
          top: css.top,
          width: Math.max(4, css.width),
          height: Math.max(4, css.height),
          background: bg,
          borderBottom: overlay.kind === "annot" && overlay.subtype === "underline" ? `2px solid ${overlay.colorHex}` : undefined,
        }}
        title={
          overlay.kind === "link"
            ? overlay.url || `Page link`
            : overlay.kind === "form"
              ? `${overlay.fieldType} field: ${overlay.name}`
              : overlay.subtype
        }
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        {...commonHandlers}
      >
        {overlay.kind === "form" && (
          <span className="pointer-events-none absolute inset-0 flex items-center overflow-hidden px-1 text-[10px] text-blue-900">
            {overlay.fieldType === "text" ? overlay.value || overlay.name : `${overlay.fieldType}: ${overlay.name}`}
          </span>
        )}
        {overlay.kind === "link" && (
          <span className="pointer-events-none absolute inset-0 truncate px-1 text-[10px] text-blue-700 underline">
            {overlay.url || "🔗 page link"}
          </span>
        )}
        {selected && (overlay.kind === "link" || overlay.kind === "form") && (
          <ResizeHandle
            onResize={(dx, dy) => onPatch(resizeRectPatch((overlay as any).rect, dx, dy, false) as any)}
            onTransientStart={onTransientStart}
            onTransientEnd={onTransientEnd}
            toPdfDelta={toPdfDelta}
          />
        )}
        {border ? <span style={{ border } as React.CSSProperties} /> : null}
      </div>
    );
  }

  if (overlay.kind === "text" || overlay.kind === "edit") {
    const s = pdfPointToScreen(viewport, overlay.x, overlay.y);
    const scale = cssScaleOf(viewport);
    const fontFamily = cssFamilyForFontId(overlay.fontId, overlay.bold);
    const estH = overlay.fontSize * scale * 1.25;
    return (
      <div
        className={`absolute whitespace-pre-wrap break-words ${ring}`}
        style={{
          left: s.sx,
          top: s.sy - estH,
          width: Math.max(30, overlay.wrapW * scale),
          minHeight: estH,
          fontFamily,
          fontSize: `${overlay.fontSize * scale}px`,
          lineHeight: 1.25,
          color: overlay.colorHex,
          fontWeight: overlay.bold ? 700 : 400,
          fontStyle: overlay.italic ? "italic" : "normal",
          textDecoration: overlay.underline ? "underline" : "none",
          textAlign: overlay.align,
        }}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        {...commonHandlers}
      >
        {overlay.text}
      </div>
    );
  }

  return null;
}

function quadsToCss(quads: number[], viewport: ViewportLike) {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i + 1 < quads.length; i += 2) {
    const p = pdfPointToScreen(viewport, quads[i], quads[i + 1]);
    xs.push(p.sx);
    ys.push(p.sy);
  }
  if (xs.length === 0) return { left: 0, top: 0, width: 0, height: 0 };
  return {
    left: Math.min(...xs),
    top: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

function resizeRectPatch(
  rect: PdfRect,
  dxPdf: number,
  dyPdf: number,
  _lockUnused: boolean,
  aspect?: number | null
) {
  let { x, y, w, h } = rect;
  w = Math.max(4, w + dxPdf);
  if (aspect && aspect > 0) {
    h = Math.max(4, w / aspect);
  } else {
    h = Math.max(4, h - dyPdf);
    y = y + dyPdf > rect.y + rect.h - 4 ? rect.y + rect.h - 4 : y + 0;
    // Keep top edge anchored: growing downward in pdf space means y unchanged
    // (dyPdf>0 applied to height only would move bottom). Our rects are
    // bottom-left origin: SE-screen drag maps to +w and -y-ish; simplest: only
    // grow width/height, keep x/y.
  }
  void _lockUnused;
  return { rect: { x, y, w, h } };
}

function ResizeHandle({
  onResize,
  onTransientStart,
  onTransientEnd,
  toPdfDelta,
  lockAspect,
}: {
  onResize: (dxPdf: number, dyPdf: number) => void;
  onTransientStart: () => void;
  onTransientEnd: () => void;
  toPdfDelta: (dxPx: number, dyPx: number) => { dx: number; dy: number };
  lockAspect?: number | null;
}) {
  const ref = useRef<{ x: number; y: number } | null>(null);
  void lockAspect;
  return (
    <span
      className="absolute -bottom-1.5 -right-1.5 z-40 h-4 w-4 cursor-nwse-resize touch-none rounded-full border-2 border-background bg-foreground shadow"
      onPointerDown={(e) => {
        e.stopPropagation();
        onTransientStart();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        ref.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerMove={(e) => {
        const s = ref.current;
        if (!s) return;
        const d = toPdfDelta(e.clientX - s.x, e.clientY - s.y);
        ref.current = { x: e.clientX, y: e.clientY };
        onResize(d.dx, d.dy);
      }}
      onPointerUp={() => {
        ref.current = null;
        onTransientEnd();
      }}
      onPointerCancel={() => {
        ref.current = null;
        onTransientEnd();
      }}
    />
  );
}
