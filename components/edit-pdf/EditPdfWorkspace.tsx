"use client";

/**
 * EditPdfWorkspace — full Sejda-style visual PDF editor (client only).
 *
 * Layout: thumbnails sidebar (left) + scrollable pages (center) + properties
 * panel (right), top EditorToolbar. All processing in-browser; files never
 * uploaded ("Your file stays on your device").
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ShieldCheck,
  Lock,
  Loader2,
  AlertTriangle,
  Trash2,
  RotateCw,
  FilePlus2,
  Check,
  FileText,
  Type,
} from "lucide-react";
import { getPdfjs } from "@/lib/pdf/pdf-loader";
import { extractPageBlocks } from "@/lib/pdf/edit-pdf/text-extraction";
import { checkGlyphCoverage } from "@/lib/pdf/edit-pdf/font-matching";
import { exportEditedPdf } from "@/lib/pdf/edit-pdf/save";
import type {
  EditorPage,
  EditorToolId,
  EditorSnapshot,
  ExistingFormField,
  FormFill,
  Overlay,
  TextBlock,
  PdfRect,
  PdfPoint,
  EditTextOverlay,
} from "@/lib/pdf/edit-pdf/types";
import { newOverlayId } from "@/lib/pdf/edit-pdf/types";
import { EditorToolbar } from "./EditorToolbar";
import { PageView, type AnnotSubtype } from "./PageView";
import type { InlineTextValue } from "./TextBlockOverlay";
import { SignatureModal, type SavedSignature } from "./SignatureModal";
import { FindReplaceModal } from "./FindReplaceModal";
import { applyFindReplace } from "@/lib/pdf/edit-pdf/find-replace";
import { ResultCard } from "@/components/tools/ResultCard";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";
import { getActiveDocument, clearActiveDocument, loadPersistedActiveDocument, setActiveDocument } from "@/lib/active-document";

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const HISTORY_LIMIT = 60;

type Stage = "upload" | "password" | "loading" | "editor" | "processing" | "done";

interface Toast {
  id: number;
  kind: "error" | "info" | "success";
  text: string;
}

let toastCounter = 0;
let pageKeyCounter = 0;
function newPageKey(src: number | "blank"): string {
  pageKeyCounter += 1;
  return `pg-${src}-${pageKeyCounter}`;
}

export function EditPdfWorkspace() {
  const [stage, setStage] = useState<Stage>("upload");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [loadProgress, setLoadProgress] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [pages, setPages] = useState<EditorPage[]>([]);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [fills, setFills] = useState<FormFill[]>([]);
  const [blocksBySrc, setBlocksBySrc] = useState<Record<number, TextBlock[]>>({});
  const blocksCacheRef = useRef<Map<number, TextBlock[]>>(new Map());
  const [blocksLoadingSrc, setBlocksLoadingSrc] = useState<Record<number, boolean>>({});
  const [scannedSrcPages, setScannedSrcPages] = useState<Record<number, boolean>>({});
  const [existingFields, setExistingFields] = useState<ExistingFormField[]>([]);

  const [past, setPast] = useState<EditorSnapshot[]>([]);
  const [future, setFuture] = useState<EditorSnapshot[]>([]);

  const [tool, setTool] = useState<EditorToolId>("text");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activePageKey, setActivePageKey] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ pageKey: string; blockId: string } | null>(null);
  const [inlineValue, setInlineValue] = useState<InlineTextValue | null>(null);
  const [inlineBg, setInlineBg] = useState("#ffffff");
  const inlineBgRef = useRef("#ffffff");
  const [fallbackNotice, setFallbackNotice] = useState(false);

  const [zoom, setZoom] = useState<number>(1.0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [processingLabel, setProcessingLabel] = useState("Working…");
  const [doneBytes, setDoneBytes] = useState<Uint8Array | null>(null);
  const [doneName, setDoneName] = useState("");

  const [strokeHex, setStrokeHex] = useState("#1f2937");
  const [fillHex, setFillHex] = useState<string | null>(null);
  const [strokeW, setStrokeW] = useState(2);
  const [annotHex, setAnnotHex] = useState("#ffeb00");
  const [whiteoutHex, setWhiteoutHex] = useState("#ffffff");

  const [signModalOpen, setSignModalOpen] = useState(false);
  const [armedSign, setArmedSign] = useState<SavedSignature | null>(null);
  const [linkDraft, setLinkDraft] = useState<{ pageKey: string; rect: PdfRect } | null>(null);
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkDest, setLinkDest] = useState("");

  const pdfBytesRef = useRef<Uint8Array | null>(null);
  const pdfDocRef = useRef<any>(null);
  const handleDownloadRef = useRef<() => void>(() => {});
  const pdfjsRef = useRef<any>(null);
  const pendingBytesRef = useRef<Uint8Array | null>(null);
  const stateRef = useRef<EditorSnapshot>({ pages: [], overlays: [], fills: [] });
  const transientPreRef = useRef<EditorSnapshot | null>(null);
  const transientDirtyRef = useRef(false);
  const canvasByPageRef = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const imagePickerRef = useRef<HTMLInputElement | null>(null);
  const pendingImagePointRef = useRef<{ pageKey: string; x: number; y: number } | null>(null);

  stateRef.current = { pages, overlays, fills };

  const pushToast = useCallback((kind: Toast["kind"], text: string) => {
    toastCounter += 1;
    const id = toastCounter;
    setToasts((t) => [...t.slice(-3), { id, kind, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  /* ---------------- history ---------------- */

  const commit = useCallback((mut: (s: EditorSnapshot) => EditorSnapshot, push = true) => {
    const cur = stateRef.current;
    if (push) {
      setPast((p) => [...p.slice(-HISTORY_LIMIT + 1), cur]);
      setFuture([]);
    } else if (transientPreRef.current) {
      transientDirtyRef.current = true;
    }
    const next = mut(cur);
    stateRef.current = next;
    setPages(next.pages);
    setOverlays(next.overlays);
    setFills(next.fills);
  }, []);

  const ensureTransient = useCallback(() => {
    if (!transientPreRef.current) {
      transientPreRef.current = stateRef.current;
      transientDirtyRef.current = false;
    }
  }, []);

  const endTransient = useCallback(() => {
    if (transientPreRef.current && transientDirtyRef.current) {
      const pre = transientPreRef.current;
      setPast((p) => [...p.slice(-HISTORY_LIMIT + 1), pre]);
      setFuture([]);
    }
    transientPreRef.current = null;
    transientDirtyRef.current = false;
  }, []);

  const undo = useCallback(() => {
    endTransient();
    setEditing(null);
    setSelectedId(null);
    setPast((p) => {
      if (p.length === 0) return p;
      const prev = p[p.length - 1];
      const cur = stateRef.current;
      setFuture((f) => [cur, ...f].slice(0, HISTORY_LIMIT));
      stateRef.current = prev;
      setPages(prev.pages);
      setOverlays(prev.overlays);
      setFills(prev.fills);
      return p.slice(0, -1);
    });
  }, [endTransient]);

  const redo = useCallback(() => {
    setEditing(null);
    setSelectedId(null);
    setFuture((f) => {
      if (f.length === 0) return f;
      const [next, ...rest] = f;
      const cur = stateRef.current;
      setPast((p) => [...p.slice(-HISTORY_LIMIT + 1), cur]);
      stateRef.current = next;
      setPages(next.pages);
      setOverlays(next.overlays);
      setFills(next.fills);
      return rest;
    });
  }, []);

  /* ---------------- file loading ---------------- */

  const resetAll = useCallback(() => {
    try {
      pdfDocRef.current?.destroy?.();
    } catch {
      /* ignore */
    }
    pdfDocRef.current = null;
    pdfBytesRef.current = null;
    pendingBytesRef.current = null;
    setPages([]);
    setOverlays([]);
    setFills([]);
    setBlocksBySrc({});
    blocksCacheRef.current.clear();
    setBlocksLoadingSrc({});
    setScannedSrcPages({});
    setExistingFields([]);
    setPast([]);
    setFuture([]);
    setSelectedId(null);
    setEditing(null);
    setInlineValue(null);
    setArmedSign(null);
    setLinkDraft(null);
    setDoneBytes(null);
    setPassword("");
    setPasswordError(null);
    transientPreRef.current = null;
  }, []);

  const openPdfBytes = useCallback(
    async (bytes: Uint8Array, name: string, size: number, pwd?: string) => {
      setStage("loading");
      setLoadProgress("Opening document…");
      setPasswordError(null);
      try {
        const pdfjs = await getPdfjs();
        pdfjsRef.current = pdfjs;
        const loadingTask = pdfjs.getDocument({
          data: bytes.slice(),
          password: pwd || undefined,
          fontExtraProperties: true,
        } as any);
        const doc = await loadingTask.promise;
        pdfDocRef.current = doc;
        pdfBytesRef.current = bytes;

        const count: number = doc.numPages;
        setLoadProgress(`Reading ${count} pages…`);
        const nextPages: EditorPage[] = [];
        for (let i = 1; i <= count; i++) {
          const pg = await doc.getPage(i);
          const view: number[] = Array.isArray(pg.view) ? pg.view : [0, 0, 612, 792];
          const w = Math.abs(view[2] - view[0]);
          const h = Math.abs(view[3] - view[1]);
          const rot = ((pg.rotate ?? 0) % 360 + 360) % 360;
          nextPages.push({
            key: newPageKey(i - 1),
            src: { kind: "orig", index: i - 1 },
            rotateDelta: 0,
            width: w,
            height: h,
            srcRotation: rot,
          });
          try {
            await pg.cleanup?.();
          } catch {
            /* ignore */
          }
          if (i % 10 === 0) {
            setLoadProgress(`Reading pages… ${i}/${count}`);
            await new Promise((r) => setTimeout(r, 0));
          }
        }

        // Best-effort AcroForm inventory (names + types for the fill panel).
        try {
          const { PDFDocument } = await import("pdf-lib");
          const probe = await PDFDocument.load(bytes.slice(), { ignoreEncryption: true });
          try {
            const form = probe.getForm();
            const fs: ExistingFormField[] = form.getFields().map((f: any) => ({
              name: String(f.getName?.() ?? "field"),
              type: String(f?.constructor?.name ?? "unknown"),
              pageSrcIndex: -1,
              value: "",
            }));
            setExistingFields(fs.slice(0, 200));
          } catch {
            setExistingFields([]);
          }
        } catch {
          setExistingFields([]);
        }

        setFileName(name);
        setFileSize(size);
        setPages(nextPages);
        setActivePageKey(nextPages[0]?.key ?? null);
        const snap: EditorSnapshot = { pages: nextPages, overlays: [], fills: [] };
        stateRef.current = snap;
        setOverlays([]);
        setFills([]);
        setPast([]);
        setFuture([]);
        setStage("editor");
        setActiveDocument({ name, size, pageCount: count, bytes });
        // Default to fit-width once layout exists.
        requestAnimationFrame(() => fitWidth());
      } catch (err: any) {
        const msg = String(err?.message ?? err);
        if (err?.name === "PasswordException" || /password/i.test(msg)) {
          pendingBytesRef.current = bytes;
          setFileName(name);
          setFileSize(size);
          setPasswordError(pwd ? "Incorrect password. Try again." : null);
          setStage("password");
        } else {
          pushToast("error", `Could not open this PDF: ${msg.slice(0, 160)}`);
          setStage("upload");
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pushToast]
  );

  const handleFiles = useCallback(
    async (files: FileList | File[] | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") {
        pushToast("error", "Please choose a PDF file.");
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        pushToast("error", `File is larger than ~50 MB (${formatFileSize(file.size)}). Split it first, then edit.`);
        return;
      }
      resetAll();
      const buf = await file.arrayBuffer();
      await openPdfBytes(new Uint8Array(buf), file.name, file.size);
    },
    [openPdfBytes, pushToast, resetAll]
  );

  const submitPassword = useCallback(async () => {
    const pending = pendingBytesRef.current;
    if (!pending) return;
    await openPdfBytes(pending, fileName, fileSize, password);
  }, [openPdfBytes, fileName, fileSize, password]);

  /* Auto-load PDF from home page or IndexedDB store */
  useEffect(() => {
    if (stage !== "upload") return;
    let cancelled = false;
    const tryLoad = async () => {
      let doc = getActiveDocument();
      if (!doc || !doc.bytes || doc.bytes.length === 0) {
        doc = await loadPersistedActiveDocument();
      }
      if (cancelled || !doc || !doc.bytes || doc.bytes.length === 0) return;
      void openPdfBytes(doc.bytes, doc.name, doc.size);
    };
    void tryLoad();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- text blocks ---------------- */

  const ensureBlocks = useCallback(
    async (srcIndex: number) => {
      const doc = pdfDocRef.current;
      const pdfjs = pdfjsRef.current;
      if (!doc || !pdfjs) return;
      const cached = blocksCacheRef.current.get(srcIndex);
      if (!cached) {
        if (blocksLoadingSrc[srcIndex]) return;
        setBlocksLoadingSrc((m) => ({ ...m, [srcIndex]: true }));
        try {
          const res = await extractPageBlocks(pdfjs, doc, srcIndex + 1);
          blocksCacheRef.current.set(srcIndex, res.blocks);
          setBlocksBySrc((m) => ({ ...m, [srcIndex]: res.blocks }));
          setScannedSrcPages((m) => ({ ...m, [srcIndex]: res.isScanned }));
          // Preload matched webfonts so overlays measure correctly.
          try {
            const seen = new Set<string>();
            for (const b of res.blocks) {
              if (seen.has(b.matchedFontId)) continue;
              seen.add(b.matchedFontId);
              const fam = b.matchedFontId.startsWith("Noto")
                ? b.matchedFontId.replace(/([a-z])([A-Z])/g, "$1 $2")
                : b.matchedFontId;
              void document.fonts?.load?.(`12px "${fam}"`).catch(() => []);
            }
          } catch {
            /* ignore */
          }
        } catch {
          /* leave empty */
        } finally {
          setBlocksLoadingSrc((m) => {
            const next = { ...m };
            delete next[srcIndex];
            return next;
          });
        }
        return;
      }
      // Harvest retry: fonts resolve into page.commonObjs on render, so a
      // second pass (after PageView painted) can pick up embedded subsets
      // that were unavailable during the first extraction.
      const missing = cached.filter((b) => !b.embeddedBytes);
      if (missing.length === 0) return;
      try {
        const { harvestEmbeddedFont } = await import("@/lib/pdf/edit-pdf/text-extraction");
        const pg = await doc.getPage(srcIndex + 1);
        let changed = false;
        const byKey = new Map<string, TextBlock[]>();
        for (const b of missing) {
          const arr = byKey.get(b.fontKey) ?? [];
          arr.push(b);
          byKey.set(b.fontKey, arr);
        }
        const { matchBundledFontId } = await import("@/lib/pdf/edit-pdf/font-matching");
        for (const [fontKey, list] of byKey) {
          try {
            const h = await harvestEmbeddedFont(pg, srcIndex + 1, fontKey);
            if (h) {
              for (const b of list) {
                b.embeddedBytes = h.bytes;
                b.embeddedFamily = h.family;
                b.hasEmbeddedFont = h.registered;
              }
              changed = true;
            }
            // Inspect resolved font object for better family/serif detection
            try {
              const fobj = pg?.commonObjs?.get?.(fontKey);
              if (fobj) {
                const realName = fobj.name || fobj.fallbackName;
                for (const b of list) {
                  if (realName && (b.fontName.startsWith("g_") || b.fontName === "Helvetica")) {
                    b.fontName = realName;
                    b.matchedFontId = matchBundledFontId(realName, b.text);
                    changed = true;
                  }
                  if (typeof fobj.serif === "boolean" && fobj.serif && b.matchedFontId === "NotoSans") {
                    b.matchedFontId = "Tinos";
                    changed = true;
                  }
                  if (typeof fobj.bold === "boolean" && fobj.bold) {
                    b.bold = true;
                    changed = true;
                  }
                }
              }
            } catch {
              /* ignore */
            }
          } catch {
            /* keep fallback */
          }
        }
        try {
          await (pg as any).cleanup?.();
        } catch {
          /* ignore */
        }
        if (changed) {
          const next = [...cached];
          blocksCacheRef.current.set(srcIndex, next);
          setBlocksBySrc((m) => ({ ...m, [srcIndex]: next }));
        }
      } catch {
        /* ignore */
      }
    },
    [blocksLoadingSrc]
  );

  const findBlock = useCallback(
    (blockId: string): TextBlock | null => {
      for (const key of Object.keys(blocksBySrc)) {
        const hit = blocksBySrc[Number(key)]?.find((b) => b.id === blockId);
        if (hit) return hit;
      }
      return null;
    },
    [blocksBySrc]
  );

  /* ---------------- inline in-place editing ---------------- */

  const startEdit = useCallback((pageKey: string, block: TextBlock, bgHex = "#ffffff", textHex?: string) => {
      const existing = stateRef.current.overlays.find(
        (o) => o.kind === "edit" && o.blockId === block.id
      ) as EditTextOverlay | undefined;
      if (existing) {
        setInlineValue({
          text: existing.text,
          fontId: existing.fontId,
          fontSize: existing.fontSize,
          colorHex: existing.colorHex,
          bold: existing.bold,
          italic: existing.italic,
          underline: existing.underline,
          align: existing.align,
        });
        setInlineBg(existing.bgHex);
        inlineBgRef.current = existing.bgHex;
        setFallbackNotice(existing.fallbackNotice);
      } else {
        const color = textHex || block.colorHex || "#000000";
        setInlineValue({
          text: block.text,
          fontId: block.hasEmbeddedFont && block.embeddedFamily ? `embedded:${block.embeddedFamily}` : block.matchedFontId,
          fontSize: Math.round(block.fontSize * 10) / 10,
          colorHex: color,
          bold: block.bold,
          italic: block.italic,
          underline: false,
          align: "left",
        });
        // Page background sampled by PageView — covers the original invisibly.
        setInlineBg(bgHex);
        inlineBgRef.current = bgHex;
        setFallbackNotice(false);
      }
      setEditing({ pageKey, blockId: block.id });
      setSelectedId(null);
      setTool("text");
    },
    []
  );

  const patchInline = useCallback(
    (patch: Partial<InlineTextValue>) => {
      setInlineValue((prev) => (prev ? { ...prev, ...patch } : prev));
    },
    []
  );

  // Sync the inline editor value into the EditTextOverlay (transient history).
  useEffect(() => {
    if (!editing || !inlineValue) return;
    const block = findBlock(editing.blockId);
    if (!block) return;
    ensureTransient();
    const existing = stateRef.current.overlays.find(
      (o) => o.kind === "edit" && (o as EditTextOverlay).blockId === block.id
    ) as EditTextOverlay | undefined;
    if (!existing) {
      const ov: EditTextOverlay = {
        id: newOverlayId("edit"),
        kind: "edit",
        pageKey: editing.pageKey,
        blockId: block.id,
        text: inlineValue.text,
        fontId: inlineValue.fontId,
        fontSize: inlineValue.fontSize,
        colorHex: inlineValue.colorHex,
        bold: inlineValue.bold,
        italic: inlineValue.italic,
        underline: inlineValue.underline,
        align: inlineValue.align,
        x: block.x,
        y: block.y,
        wrapW: Math.max(20, block.boxW),
        rotation: block.rotation,
        lineHeight: block.lineHeight,
        bgHex: inlineBgRef.current,
        saveFontId: block.matchedFontId,
        fallbackNotice: false,
      };
      commit((s) => ({ ...s, overlays: [...s.overlays, ov] }), false);
    } else {
      const ex = existing;
      if (
        ex.text !== inlineValue.text ||
        ex.fontId !== inlineValue.fontId ||
        ex.fontSize !== inlineValue.fontSize ||
        ex.colorHex !== inlineValue.colorHex ||
        ex.bold !== inlineValue.bold ||
        ex.italic !== inlineValue.italic ||
        ex.underline !== inlineValue.underline ||
        ex.align !== inlineValue.align
      ) {
        commit(
          (s) => ({
            ...s,
            overlays: s.overlays.map((o) =>
              o.id === ex.id
                ? {
                    ...ex,
                    text: inlineValue.text,
                    fontId: inlineValue.fontId,
                    fontSize: inlineValue.fontSize,
                    colorHex: inlineValue.colorHex,
                    bold: inlineValue.bold,
                    italic: inlineValue.italic,
                    underline: inlineValue.underline,
                    align: inlineValue.align,
                  }
                : o
            ),
          }),
          false
        );
      }
    }
    // Glyph-coverage check for embedded subsets (whole-run fallback + notice).
    if (inlineValue.fontId.startsWith("embedded:") && block.embeddedBytes) {
      const bytes = block.embeddedBytes;
      const txt = inlineValue.text;
      void checkGlyphCoverage(bytes, block.id, txt).then((res) => {
        if (!res.covered) {
          const fb = block.matchedFontId;
          setFallbackNotice(true);
          setInlineValue((v) => (v && v.fontId.startsWith("embedded:") ? { ...v, fontId: fb } : v));
          commit(
            (s) => ({
              ...s,
              overlays: s.overlays.map((o) =>
                o.kind === "edit" && (o as EditTextOverlay).blockId === block.id
                  ? { ...(o as EditTextOverlay), fontId: fb, saveFontId: fb, fallbackNotice: true }
                  : o
              ),
            }),
            false
          );
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inlineValue, editing]);

  const moveInline = useCallback(
    (dxPdf: number, dyPdf: number) => {
      if (!editing) return;
      ensureTransient();
      commit(
        (s) => ({
          ...s,
          overlays: s.overlays.map((o) =>
            o.kind === "edit" && (o as EditTextOverlay).blockId === editing.blockId
              ? { ...(o as EditTextOverlay), x: (o as EditTextOverlay).x + dxPdf, y: (o as EditTextOverlay).y + dyPdf }
              : o
          ),
        }),
        false
      );
    },
    [commit, editing, ensureTransient]
  );

  const resizeInlineWidth = useCallback(
    (dWrapPdf: number) => {
      if (!editing) return;
      ensureTransient();
      commit(
        (s) => ({
          ...s,
          overlays: s.overlays.map((o) =>
            o.kind === "edit" && (o as EditTextOverlay).blockId === editing.blockId
              ? { ...(o as EditTextOverlay), wrapW: Math.max(20, (o as EditTextOverlay).wrapW + dWrapPdf) }
              : o
          ),
        }),
        false
      );
    },
    [commit, editing, ensureTransient]
  );

  const deleteInline = useCallback(() => {
    if (!editing) return;
    ensureTransient();
    // Empty text = deletion; the save step skips drawing and only covers.
    setInlineValue((v) => (v ? { ...v, text: "" } : v));
    commit(
      (s) => {
        const block = findBlock(editing.blockId);
        const ex = s.overlays.find((o) => o.kind === "edit" && (o as EditTextOverlay).blockId === editing.blockId);
        if (ex) {
          return {
            ...s,
            overlays: s.overlays.map((o) => (o.id === ex.id ? { ...(o as EditTextOverlay), text: "" } : o)),
          };
        }
        if (!block) return s;
        const ov: EditTextOverlay = {
          id: newOverlayId("edit"),
          kind: "edit",
          pageKey: editing.pageKey,
          blockId: block.id,
          text: "",
          fontId: block.matchedFontId,
          fontSize: block.fontSize,
          colorHex: block.colorHex,
          bold: block.bold,
          italic: block.italic,
          underline: false,
          align: "left",
          x: block.x,
          y: block.y,
          wrapW: Math.max(20, block.boxW),
          rotation: block.rotation,
          lineHeight: block.lineHeight,
          bgHex: "#ffffff",
          saveFontId: block.matchedFontId,
          fallbackNotice: false,
        };
        return { ...s, overlays: [...s.overlays, ov] };
      },
      false
    );
  }, [commit, editing, ensureTransient, findBlock]);

  const closeInline = useCallback(() => {
    endTransient();
    setEditing(null);
    setInlineValue(null);
    setFallbackNotice(false);
  }, [endTransient]);

  /* ---------------- overlay ops ---------------- */

  const patchOverlay = useCallback(
    (id: string, patch: Partial<Overlay>) => {
      commit(
        (s) => ({ ...s, overlays: s.overlays.map((o) => (o.id === id ? ({ ...o, ...patch } as Overlay) : o)) }),
        false
      );
    },
    [commit]
  );

  const deleteOverlay = useCallback(
    (id: string) => {
      commit((s) => ({ ...s, overlays: s.overlays.filter((o) => o.id !== id) }));
      setSelectedId((sel) => (sel === id ? null : sel));
    },
    [commit]
  );

  const selectedOverlay: Overlay | null = useMemo(
    () => overlays.find((o) => o.id === selectedId) ?? null,
    [overlays, selectedId]
  );

  const nudgeSelected = useCallback(
    (dx: number, dy: number) => {
      if (!selectedId) return;
      ensureTransient();
      commit(
        (s) => ({
          ...s,
          overlays: s.overlays.map((o) => {
            if (o.id !== selectedId) return o;
            const anyO = o as any;
            if (anyO.rect) return { ...o, rect: { ...anyO.rect, x: anyO.rect.x + dx, y: anyO.rect.y + dy } } as Overlay;
            if (o.kind === "edit" || o.kind === "text") return { ...o, x: anyO.x + dx, y: anyO.y + dy } as Overlay;
            if (o.kind === "draw") {
              return { ...o, points: anyO.points.map((p: PdfPoint) => ({ x: p.x + dx, y: p.y + dy })) } as Overlay;
            }
            if (o.kind === "annot") {
              const q = [...anyO.quads];
              for (let i = 0; i < q.length; i += 2) {
                q[i] += dx;
                q[i + 1] += dy;
              }
              return { ...o, quads: q } as Overlay;
            }
            return o;
          }),
        }),
        false
      );
    },
    [commit, ensureTransient, selectedId]
  );

  const clipboardRef = useRef<Overlay | null>(null);
  const copySelected = useCallback(() => {
    const sel = stateRef.current.overlays.find((o) => o.id === selectedId);
    if (sel) clipboardRef.current = JSON.parse(JSON.stringify(sel));
  }, [selectedId]);

  const pasteClipboard = useCallback(() => {
    const c = clipboardRef.current;
    if (!c) return;
    const targetKey = activePageKey ?? stateRef.current.pages[0]?.key;
    if (!targetKey) return;
    const copy = { ...JSON.parse(JSON.stringify(c)), id: newOverlayId("paste"), pageKey: targetKey } as Overlay;
    const anyC = copy as any;
    if (anyC.rect) anyC.rect = { ...anyC.rect, x: anyC.rect.x + 12, y: anyC.rect.y - 12 };
    else if (copy.kind === "edit" || copy.kind === "text") {
      anyC.x += 12;
      anyC.y -= 12;
    }
    if (copy.kind === "form") anyC.name = `${anyC.name}-copy`;
    if (copy.kind === "edit") {
      // Pasted edits detach from the source block (become plain copies).
      (copy as any).kind = "text";
      delete (copy as any).blockId;
    }
    commit((s) => ({ ...s, overlays: [...s.overlays, copy] }));
    setSelectedId(copy.id);
    pushToast("success", "Pasted. Drag to position.");
  }, [activePageKey, commit, pushToast]);

  /* ---------------- page ops ---------------- */

  const activePageIndex = useMemo(
    () => Math.max(0, pages.findIndex((p) => p.key === activePageKey)),
    [pages, activePageKey]
  );

  const deletePage = useCallback(() => {
    if (pages.length <= 1) {
      pushToast("error", "A document needs at least one page.");
      return;
    }
    const idx = activePageIndex;
    const [removed] = pages.slice(idx, idx + 1);
    if (!removed) return;
    commit((s) => ({
      ...s,
      pages: s.pages.filter((p) => p.key !== removed.key),
      overlays: s.overlays.filter((o) => o.pageKey !== removed.key),
    }));
    setActivePageKey(pages[Math.min(idx, pages.length - 2)]?.key ?? null);
    pushToast("info", `Deleted page ${idx + 1}. Undo restores it.`);
  }, [activePageIndex, commit, pages, pushToast]);

  const rotateActivePage = useCallback(() => {
    const key = activePageKey;
    if (!key) return;
    commit((s) => ({
      ...s,
      pages: s.pages.map((p) => (p.key === key ? { ...p, rotateDelta: (p.rotateDelta + 90) % 360 } : p)),
    }));
  }, [activePageKey, commit]);

  const insertBlankAfterActive = useCallback(() => {
    const idx = activePageIndex;
    const ref = pages[idx];
    const w = ref?.width ?? 595;
    const h = ref?.height ?? 842;
    const np: EditorPage = { key: newPageKey("blank"), src: { kind: "blank", width: w, height: h }, rotateDelta: 0, width: w, height: h, srcRotation: 0 };
    commit((s) => {
      const arr = [...s.pages];
      arr.splice(idx + 1, 0, np);
      return { ...s, pages: arr };
    });
    setActivePageKey(np.key);
    pushToast("success", "Blank page inserted.");
  }, [activePageIndex, commit, pages, pushToast]);

  const movePage = useCallback(
    (from: number, to: number) => {
      if (from === to || from < 0 || to < 0 || from >= pages.length || to >= pages.length) return;
      commit((s) => {
        const arr = [...s.pages];
        const [m] = arr.splice(from, 1);
        arr.splice(to, 0, m);
        return { ...s, pages: arr };
      });
    },
    [commit, pages.length]
  );

  /* ---------------- creation commits ---------------- */

  const commitRect = useCallback(
    (pageKey: string, usedTool: EditorToolId, rect: PdfRect) => {
      const norm: PdfRect = {
        x: Math.round(rect.x * 10) / 10,
        y: Math.round(rect.y * 10) / 10,
        w: Math.max(4, Math.round(rect.w * 10) / 10),
        h: Math.max(4, Math.round(rect.h * 10) / 10),
      };
      if (usedTool === "whiteout") {
        commit((s) => ({
          ...s,
          overlays: [...s.overlays, { id: newOverlayId("wo"), kind: "whiteout", pageKey, rect: norm, colorHex: whiteoutHex }],
        }));
      } else if (usedTool === "rect" || usedTool === "ellipse" || usedTool === "line" || usedTool === "arrow") {
        commit((s) => ({
          ...s,
          overlays: [
            ...s.overlays,
            {
              id: newOverlayId("sh"),
              kind: "shape",
              pageKey,
              shape: usedTool,
              rect: norm,
              strokeHex,
              fillHex: usedTool === "rect" || usedTool === "ellipse" ? fillHex : null,
              strokeW,
            },
          ],
        }));
      } else if (usedTool === "link") {
        setLinkDraft({ pageKey, rect: norm });
        setLinkUrl("");
        setLinkDest("");
      } else if (usedTool === "formText" || usedTool === "formCheck" || usedTool === "formRadio") {
        const n = stateRef.current.overlays.filter((o) => o.kind === "form").length + 1;
        const fieldType = usedTool === "formText" ? "text" : usedTool === "formCheck" ? "check" : "radio";
        commit((s) => ({
          ...s,
          overlays: [
            ...s.overlays,
            {
              id: newOverlayId("form"),
              kind: "form",
              pageKey,
              fieldType,
              rect: norm.w < 20 || norm.h < 14 ? { ...norm, w: Math.max(norm.w, 120), h: Math.max(norm.h, 22) } : norm,
              name: `Field ${n}`,
              value: fieldType === "text" ? "" : fieldType === "check" ? "false" : `Option ${n}`,
            },
          ],
        }));
        pushToast("info", "Form field placed. Rename it in the properties panel.");
      }
    },
    [commit, fillHex, pushToast, strokeHex, strokeW, whiteoutHex]
  );

  const commitDraw = useCallback(
    (pageKey: string, points: PdfPoint[]) => {
      commit((s) => ({
        ...s,
        overlays: [...s.overlays, { id: newOverlayId("draw"), kind: "draw", pageKey, points, strokeHex, strokeW: Math.max(1, strokeW) }],
      }));
    },
    [commit, strokeHex, strokeW]
  );

  const createAnnot = useCallback(
    (pageKey: string, subtype: AnnotSubtype, quads: number[]) => {
      commit((s) => ({
        ...s,
        overlays: [...s.overlays, { id: newOverlayId("an"), kind: "annot", pageKey, subtype, quads, colorHex: annotHex }],
      }));
      pushToast("success", `${subtype === "highlight" ? "Highlight" : subtype === "underline" ? "Underline" : "Strikethrough"} added.`);
    },
    [annotHex, commit, pushToast]
  );

  const pageClick = useCallback(
    (pageKey: string, pt: PdfPoint) => {
      setActivePageKey(pageKey);
      if (tool === "addText") {
        commit((s) => ({
          ...s,
          overlays: [
            ...s.overlays,
            {
              id: newOverlayId("txt"),
              kind: "text",
              pageKey,
              text: "New text",
              fontId: "std-Helvetica",
              fontSize: 12,
              colorHex: "#000000",
              bold: false,
              italic: false,
              underline: false,
              align: "left",
              x: Math.round(pt.x),
              y: Math.round(pt.y),
              wrapW: 300,
              rotation: 0,
            },
          ],
        }));
      } else if (tool === "image") {
        pendingImagePointRef.current = { pageKey, x: pt.x, y: pt.y };
        imagePickerRef.current?.click();
      } else if (tool === "sign") {
        if (armedSign) {
          placeImageOverlay(pageKey, pt, armedSign.dataUrl, armedSign.mime, "sign");
          setArmedSign(null);
        } else {
          setSignModalOpen(true);
        }
      } else if (tool === "formText" || tool === "formCheck" || tool === "formRadio") {
        commitRect(pageKey, tool, { x: pt.x, y: pt.y - 22, w: 140, h: 22 });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tool, armedSign, commit, commitRect]
  );

  const placeImageOverlay = useCallback(
    (pageKey: string, pt: PdfPoint, dataUrl: string, mime: string, kind: "image" | "sign") => {
      const img = new Image();
      img.onload = () => {
        const aspect = img.naturalWidth > 0 && img.naturalHeight > 0 ? img.naturalWidth / img.naturalHeight : 1.5;
        const w = kind === "sign" ? 160 : 200;
        commit((s) => ({
          ...s,
          overlays: [
            ...s.overlays,
            { id: newOverlayId(kind), kind, pageKey, dataUrl, mime, rect: { x: Math.round(pt.x - w / 2), y: Math.round(pt.y - (w / aspect) / 2), w, h: Math.round((w / aspect) * 10) / 10 } },
          ],
        }));
        pushToast("success", kind === "sign" ? "Signature placed. Drag to position." : "Image placed. Drag corners to resize.");
      };
      img.onerror = () => pushToast("error", "Could not read that image.");
      img.src = dataUrl;
    },
    [commit, pushToast]
  );

  const handleImageFile = useCallback(
    async (file: File | undefined) => {
      const at = pendingImagePointRef.current;
      pendingImagePointRef.current = null;
      if (!file || !at) return;
      if (!/^image\/(png|jpe?g)$/i.test(file.type)) {
        pushToast("error", "Only PNG or JPG images are supported.");
        return;
      }
      const buf = await file.arrayBuffer();
      const blob = new Blob([buf], { type: file.type });
      const dataUrl = await new Promise<string>((resolve) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result));
        fr.readAsDataURL(blob);
      });
      placeImageOverlay(at.pageKey, { x: at.x, y: at.y }, dataUrl, file.type, "image");
    },
    [placeImageOverlay, pushToast]
  );

  const commitLinkDraft = useCallback(() => {
    if (!linkDraft) return;
    if (!linkUrl.trim() && !linkDest) {
      pushToast("error", "Enter a URL or pick a destination page.");
      return;
    }
    commit((s) => ({
      ...s,
      overlays: [
        ...s.overlays,
        { id: newOverlayId("link"), kind: "link", pageKey: linkDraft.pageKey, rect: linkDraft.rect, url: linkUrl.trim(), destPageKey: linkDest || null },
      ],
    }));
    setLinkDraft(null);
    pushToast("success", "Link annotation created.");
  }, [commit, linkDest, linkDraft, linkUrl, pushToast]);

  const setFillValue = useCallback(
    (name: string, value: string) => {
      commit((s) => {
        const rest = s.fills.filter((f) => f.name !== name);
        return { ...s, fills: [...rest, { name, value }] };
      });
    },
    [commit]
  );

  /* ---------------- zoom ---------------- */

  const fitWidth = useCallback(() => {
    const el = scrollRef.current;
    if (!el || pages.length === 0) return;
    const pg = pages[Math.min(activePageIndex, pages.length - 1)];
    if (!pg) return;
    const rot = (pg.srcRotation + pg.rotateDelta) % 360;
    const dispW = rot % 180 === 0 ? pg.width : pg.height;
    const avail = el.clientWidth - 56;
    if (avail <= 0 || dispW <= 0) return;
    setZoom(Math.min(3, Math.max(0.3, avail / dispW)));
  }, [activePageIndex, pages]);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(3.0, +(z + 0.15).toFixed(2))), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(0.4, +(z - 0.15).toFixed(2))), []);

  // Pinch-to-zoom on touch devices (two fingers; single finger still scrolls).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || stage !== "editor") return;
    let lastDist = 0;
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2) {
        lastDist = 0;
        return;
      }
      e.preventDefault();
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (lastDist > 0 && d > 0) {
        const ratio = d / lastDist;
        setZoom((z) => Math.min(4, Math.max(0.3, z * ratio)));
      }
      lastDist = d;
    };
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  }, [stage]);

  /* ---------------- keyboard ---------------- */

  useEffect(() => {
    if (stage !== "editor") return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === "TEXTAREA" ||
          target.tagName === "INPUT" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (typing) return; // let native field undo work
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        if (typing) return;
        e.preventDefault();
        redo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleDownloadRef.current?.();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setFindReplaceOpen(true);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        if (typing) return;
        e.preventDefault();
        copySelected();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        if (typing) return;
        e.preventDefault();
        endTransient();
        pasteClipboard();
        return;
      }
      if (e.key === "Escape") {
        if (signModalOpen) setSignModalOpen(false);
        else if (linkDraft) setLinkDraft(null);
        else if (editing) closeInline();
        else {
          setSelectedId(null);
        }
        return;
      }
      if (typing) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId) {
          e.preventDefault();
          endTransient();
          deleteOverlay(selectedId);
        }
        return;
      }
      if (e.key.startsWith("Arrow") && selectedId) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        if (e.key === "ArrowLeft") nudgeSelected(-step, 0);
        else if (e.key === "ArrowRight") nudgeSelected(step, 0);
        else if (e.key === "ArrowUp") nudgeSelected(0, step);
        else if (e.key === "ArrowDown") nudgeSelected(0, -step);
        return;
      }
      if (e.key === "v" || e.key === "V") setTool("select");
      if (e.key === "t" || e.key === "T") setTool("text");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    stage,
    selectedId,
    editing,
    signModalOpen,
    linkDraft,
    undo,
    redo,
    copySelected,
    pasteClipboard,
    endTransient,
    deleteOverlay,
    nudgeSelected,
    closeInline,
  ]);

  // Commit transient drags when pointer is released anywhere.
  useEffect(() => {
    const up = () => endTransient();
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, [endTransient]);

  /* ---------------- export ---------------- */

  const handleDownload = useCallback(async () => {
    const bytes = pdfBytesRef.current;
    if (!bytes || pages.length === 0) return;
    endTransient();
    setEditing(null);
    setStage("processing");
    setProcessingLabel("Preparing pages…");
    try {
      await new Promise((r) => setTimeout(r, 40));
      const blockBoxById = new Map<string, PdfRect>();
      const embeddedBytesByBlock = new Map<string, Uint8Array>();
      for (const key of Object.keys(blocksBySrc)) {
        for (const b of blocksBySrc[Number(key)]) {
          blockBoxById.set(b.id, { x: b.boxX, y: b.boxY, w: b.boxW, h: b.boxH });
          if (b.embeddedBytes) embeddedBytesByBlock.set(b.id, b.embeddedBytes);
        }
      }
      const out = await exportEditedPdf(
        {
          originalBytes: bytes,
          pages: stateRef.current.pages,
          overlays: stateRef.current.overlays,
          fills: stateRef.current.fills,
          blockBoxById,
          embeddedBytesByBlock,
        },
        (s) => setProcessingLabel(s)
      );
      const base = fileName.replace(/\.pdf$/i, "") || "document";
      setDoneName(`${base}-edited.pdf`);
      setDoneBytes(out);
      setStage("done");
    } catch (err: any) {
      pushToast("error", `Export failed: ${String(err?.message ?? err).slice(0, 180)}`);
      setStage("editor");
    }
  }, [blocksBySrc, endTransient, fileName, pages.length, pushToast]);
  handleDownloadRef.current = handleDownload;

  const editAnother = useCallback(() => {
    clearActiveDocument();
    resetAll();
    setStage("upload");
  }, [resetAll]);

  const handleFindReplace = useCallback(
    (find: string, replace: string, opts: { matchCase: boolean; wholeWord: boolean }) => {
      const cur = stateRef.current;
      const res = applyFindReplace(cur, pages, blocksBySrc, find, replace, opts);
      if (res.count === 0) {
        pushToast("info", `No matches for "${find}".`);
        setFindReplaceOpen(false);
        return;
      }
      commit(() => res.snapshot);
      pushToast("success", `Replaced ${res.count} occurrence${res.count === 1 ? "" : "s"}.`);
      setFindReplaceOpen(false);
    },
    [pages, blocksBySrc, commit, pushToast]
  );

  /* ---------------- render ---------------- */

  if (stage === "upload" || stage === "password" || stage === "loading") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        {stage === "upload" && (
          <div
            onClick={() => document.getElementById("editpdf-file")?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              void handleFiles(e.dataTransfer.files);
            }}
            className="cursor-pointer rounded-2xl border-2 border-dashed border-border bg-surface p-8 text-center shadow-paper transition hover:border-foreground/40 hover:bg-surface-subtle sm:p-14"
            role="button"
            tabIndex={0}
            aria-label="Upload a PDF to edit"
            onKeyDown={(e) => {
              if (e.key === "Enter") document.getElementById("editpdf-file")?.click();
            }}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface-subtle shadow-paper">
              <Type className="h-7 w-7 text-foreground" />
            </div>
            <h2 className="mt-5 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Upload a PDF to edit it
            </h2>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Click text to edit it in place, whiteout, sign, highlight, add images, links and form
              fields — just like a desktop PDF editor.
            </p>
            <p className="mt-3 text-[11px] text-muted-foreground">PDF only · up to ~50 MB · password-protected files supported</p>
            <div className="mt-6">
              <span className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-xs font-semibold text-background shadow-paper sm:text-sm">
                <FileText className="h-4 w-4" />
                <span>Choose PDF</span>
              </span>
            </div>
            <div className="mt-8 flex flex-col items-center gap-1.5 border-t border-border pt-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <ShieldCheck className="h-4 w-4" />
                <span>Your file stays on your device</span>
              </div>
              <p className="text-[11px]">100% in-browser processing. Nothing is ever uploaded.</p>
            </div>
            <input
              id="editpdf-file"
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => {
                void handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
        )}

        {stage === "password" && (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-paper">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface-subtle">
              <Lock className="h-6 w-6 text-foreground" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-foreground">Password-protected PDF</h2>
            <p className="mt-1 truncate text-xs text-muted-foreground">{fileName}</p>
            <p className="mx-auto mt-2 max-w-sm text-xs text-muted-foreground">
              Enter the document password to open it. The password never leaves your device.
            </p>
            {passwordError && <p className="mt-3 text-xs font-medium text-destructive">{passwordError}</p>}
            <form
              className="mx-auto mt-4 flex max-w-sm gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void submitPassword();
              }}
            >
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Document password"
                autoFocus
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label="Document password"
              />
              <button type="submit" className="rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background">
                Open
              </button>
            </form>
            <button type="button" onClick={editAnother} className="mt-4 text-xs text-muted-foreground underline">
              Choose a different file
            </button>
          </div>
        )}

        {stage === "loading" && (
          <div className="rounded-2xl border border-border bg-surface p-10 text-center shadow-paper">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-foreground" />
            <p className="mt-3 text-sm font-semibold text-foreground">{loadProgress || "Loading…"}</p>
            <div className="mx-auto mt-4 h-1.5 max-w-xs overflow-hidden rounded-full bg-surface-subtle">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-foreground/60" />
            </div>
            <div className="mx-auto mt-6 max-w-md space-y-2" aria-hidden="true">
              <div className="h-24 animate-pulse rounded-xl bg-surface-subtle" />
              <div className="h-24 animate-pulse rounded-xl bg-surface-subtle" />
            </div>
          </div>
        )}
        <ToastStack toasts={toasts} />
      </div>
    );
  }

  if (stage === "processing") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-foreground" />
        <h2 className="mt-4 text-lg font-bold text-foreground">Applying your changes…</h2>
        <p className="mt-1 text-xs text-muted-foreground" aria-live="polite">{processingLabel}</p>
        <div className="mx-auto mt-5 h-2 max-w-xs overflow-hidden rounded-full bg-surface-subtle">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-foreground/60" />
        </div>
      </div>
    );
  }

  if (stage === "done" && doneBytes) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <ResultCard
          filename={doneName}
          pdfBytes={doneBytes}
          filesize={doneBytes.byteLength}
          notes="All edits were burned into the PDF on your device. Links, images and annotations preserved."
          downloadButtonLabel="Download Edited PDF"
          onDownload={(customName) => {
            downloadBytes(doneBytes, customName || doneName, "application/pdf");
          }}
          onReset={() => setStage("editor")}
        />
        <div className="mt-4 text-center">
          <button type="button" onClick={editAnother} className="text-xs font-medium text-muted-foreground underline hover:text-foreground">
            Edit another PDF
          </button>
        </div>
        <ToastStack toasts={toasts} />
      </div>
    );
  }

  const zoomPct = Math.round(zoom * 100);

  return (
    <div className="pb-16">
      <EditorToolbar
        tool={tool}
        onTool={(t) => {
          setTool(t);
          if (t === "sign" && !armedSign) {
            // Opening handled on page click; hint instead.
          }
        }}
        canUndo={past.length > 0}
        canRedo={future.length > 0}
        onUndo={undo}
        onRedo={redo}
        zoomPct={zoomPct}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFitWidth={fitWidth}
        editCount={overlays.length + fills.length}
        busy={false}
        onDownload={handleDownload}
        onFindReplace={() => setFindReplaceOpen(true)}
        onDeletePage={deletePage}
        onRotatePage={rotateActivePage}
        onInsertBlank={insertBlankAfterActive}
        currentPageNum={activePageIndex + 1}
        totalPages={pages.length}
      />
      {armedSign && (
        <div className="border-b border-border bg-surface px-4 py-1.5 text-center text-[11px] font-medium text-foreground">
          Signature ready — click anywhere on a page to place it.{" "}
          <button type="button" className="underline" onClick={() => setArmedSign(null)}>Cancel</button>
        </div>
      )}

      <div className="mx-auto grid max-w-content grid-cols-1 gap-4 px-3 py-4 sm:px-4 lg:grid-cols-[210px_minmax(0,1fr)_260px]">
        {/* Thumbnails sidebar */}
        <aside className="lg:sticky lg:top-32 lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto" aria-label="Page thumbnails">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Pages · {pages.length}
            </span>
            <button
              type="button"
              onClick={insertBlankAfterActive}
              title="Insert blank page"
              className="rounded-md border border-border p-1 text-muted-foreground hover:text-foreground"
            >
              <FilePlus2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {pages.map((p, idx) => (
              <Thumb
                key={p.key}
                page={p}
                index={idx}
                active={p.key === activePageKey}
                pdfDocRef={pdfDocRef}
                onActivate={() => {
                  setActivePageKey(p.key);
                  document.getElementById(`editpdf-page-${p.key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                onRotate={() => {
                  setActivePageKey(p.key);
                  commit((s) => ({
                    ...s,
                    pages: s.pages.map((x) => (x.key === p.key ? { ...x, rotateDelta: (x.rotateDelta + 90) % 360 } : x)),
                  }));
                }}
                onDelete={() => {
                  if (pages.length <= 1) {
                    pushToast("error", "A document needs at least one page.");
                    return;
                  }
                  setActivePageKey(p.key);
                  commit((s) => ({
                    ...s,
                    pages: s.pages.filter((x) => x.key !== p.key),
                    overlays: s.overlays.filter((o) => o.pageKey !== p.key),
                  }));
                }}
                onMove={(from, to) => movePage(from, to)}
              />
            ))}
          </div>
          <p className="mt-2 hidden text-[10px] leading-relaxed text-muted-foreground lg:block">
            Drag thumbnails to reorder. Hover for rotate / delete.
          </p>
        </aside>

        {/* Pages scroll area */}
        <div
          ref={scrollRef}
          className="min-w-0 w-full overflow-x-auto overflow-y-auto rounded-2xl border border-border bg-surface-subtle/40 p-2 sm:p-5 max-h-[calc(100vh-160px)]"
          style={{ touchAction: "pan-x pan-y" }}
        >
          {scannedNotice(pages, scannedSrcPages) && (
            <div className="mx-auto mb-4 flex max-w-2xl items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div className="leading-relaxed">
                <span className="mb-0.5 block font-bold">No editable text found on some pages</span>
                Those pages look scanned (image-only) — you can still add text, whiteout and sign.
              </div>
            </div>
          )}
          <div className="space-y-6">
            {pages.map((p, idx) => (
              <div key={p.key}>
                <PageView
                  page={p}
                  pageNumber={idx + 1}
                  zoom={zoom}
                  pdfDocRef={pdfDocRef}
                  blocks={p.src.kind === "orig" ? blocksBySrc[p.src.index] : []}
                  blocksLoading={p.src.kind === "orig" ? !!blocksLoadingSrc[p.src.index] : false}
                  overlays={overlays.filter((o) => o.pageKey === p.key)}
                  tool={tool}
                  selectedId={selectedId}
                  editingBlockId={editing?.pageKey === p.key ? editing.blockId : null}
                  inlineValue={editing?.pageKey === p.key ? inlineValue : null}
                  inlineBg={inlineBg}
                  fallbackNotice={fallbackNotice}
                  onEnsureBlocks={ensureBlocks}
                  onRegisterCanvas={(key, canvas) => {
                    if (canvas) canvasByPageRef.current.set(key, canvas);
                    else canvasByPageRef.current.delete(key);
                  }}
                  onBlockClick={(pageKey, block, bgHex, textHex) => {
                    setActivePageKey(pageKey);
                    setTool("text");
                    startEdit(pageKey, block, bgHex, textHex);
                  }}
                  onPageClick={pageClick}
                  onCommitRect={commitRect}
                  onCommitDraw={commitDraw}
                  onCreateAnnot={createAnnot}
                  onSelectOverlay={setSelectedId}
                  onActivatePage={setActivePageKey}
                  onTransientStart={ensureTransient}
                  onOverlayPatch={patchOverlay}
                  onTransientEnd={endTransient}
                  onPatchInline={patchInline}
                  onMoveInline={moveInline}
                  onResizeInlineWidth={resizeInlineWidth}
                  onDeleteInline={deleteInline}
                  onCloseInline={closeInline}
                  annotColor={tool === "highlight" ? "#ffeb00" : annotHex}
                />
                <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
                  Page {idx + 1}
                  {p.src.kind === "blank" ? " · blank" : ""}
                  {(p.srcRotation + p.rotateDelta) % 360 !== 0 ? ` · ${(p.srcRotation + p.rotateDelta) % 360}°` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Properties panel */}
        <PropsPanel
          selected={selectedOverlay}
          tool={tool}
          strokeHex={strokeHex}
          setStrokeHex={setStrokeHex}
          fillHex={fillHex}
          setFillHex={setFillHex}
          strokeW={strokeW}
          setStrokeW={setStrokeW}
          annotHex={annotHex}
          setAnnotHex={setAnnotHex}
          whiteoutHex={whiteoutHex}
          setWhiteoutHex={setWhiteoutHex}
          existingFields={existingFields}
          fills={fills}
          setFillValue={setFillValue}
          onPatchSelected={(patch) => {
            if (!selectedId) return;
            ensureTransient();
            patchOverlay(selectedId, patch);
          }}
          onCommitSelected={() => endTransient()}
          onDeleteSelected={() => selectedId && deleteOverlay(selectedId)}
          onEditTextOverlay={(ovId) => {
            const ov = overlays.find((o) => o.id === ovId);
            if (ov?.kind !== "edit") return;
            const block = findBlock(ov.blockId);
            if (!block) {
              pushToast("error", "Original text info is no longer available.");
              return;
            }
            startEdit(ov.pageKey, block, ov.bgHex);
          }}
        />
      </div>

      <input
        ref={imagePickerRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => {
          void handleImageFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <FindReplaceModal
        open={findReplaceOpen}
        onClose={() => setFindReplaceOpen(false)}
        onApply={handleFindReplace}
      />
      <SignatureModal
        open={signModalOpen}
        onClose={() => setSignModalOpen(false)}
        onPlace={(sig) => {
          setSignModalOpen(false);
          setArmedSign(sig);
          setTool("sign");
          pushToast("info", "Signature ready — click anywhere on a page to place it.");
        }}
      />

      {linkDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setLinkDraft(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-paper-elevated" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Create link">
            <h3 className="text-sm font-bold text-foreground">Create link</h3>
            <label className="mt-3 block text-[11px] font-medium text-muted-foreground">
              Destination URL
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </label>
            <div className="my-2 text-center text-[11px] text-muted-foreground">— or —</div>
            <label className="block text-[11px] font-medium text-muted-foreground">
              Internal page
              <select
                value={linkDest}
                onChange={(e) => setLinkDest(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-2 py-2 text-xs text-foreground"
              >
                <option value="">None (use URL)</option>
                {pages.map((p, i) => (
                  <option key={p.key} value={p.key}>Page {i + 1}</option>
                ))}
              </select>
            </label>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setLinkDraft(null)} className="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-foreground">
                Cancel
              </button>
              <button type="button" onClick={commitLinkDraft} className="flex-1 rounded-lg bg-foreground py-2 text-xs font-semibold text-background">
                Create link
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastStack toasts={toasts} />
    </div>
  );
}

/* ================= thumbnails ================= */

function Thumb({
  page,
  index,
  active,
  pdfDocRef,
  onActivate,
  onRotate,
  onDelete,
  onMove,
}: {
  page: EditorPage;
  index: number;
  active: boolean;
  pdfDocRef: React.MutableRefObject<any>;
  onActivate: () => void;
  onRotate: () => void;
  onDelete: () => void;
  onMove: (from: number, to: number) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    (async () => {
      try {
        if (page.src.kind === "blank") {
          canvas.width = 120;
          canvas.height = Math.round(120 * (page.height / Math.max(1, page.width)));
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          return;
        }
        const doc = pdfDocRef.current;
        if (!doc) return;
        const pg = await doc.getPage(page.src.index + 1);
        if (cancelled) return;
        const vp = pg.getViewport({ scale: 0.32 });
        canvas.width = Math.max(1, Math.round(vp.width));
        canvas.height = Math.max(1, Math.round(vp.height));
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          await pg.render({ canvasContext: ctx, viewport: vp }).promise;
        }
        try {
          await pg.cleanup?.();
        } catch {
          /* ignore */
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visible, page, pdfDocRef]);

  const rot = (page.srcRotation + page.rotateDelta) % 360;

  return (
    <div
      ref={ref}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", String(index));
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const from = Number(e.dataTransfer.getData("text/plain"));
        if (!Number.isNaN(from)) onMove(from, index);
      }}
      onClick={onActivate}
      className={`group relative w-24 shrink-0 cursor-pointer rounded-xl border p-1.5 transition lg:w-full ${
        active ? "border-foreground bg-surface ring-2 ring-foreground/30" : "border-border bg-surface hover:border-foreground/40"
      }`}
      title={`Go to page ${index + 1} (drag to reorder)`}
    >
      <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-surface-subtle">
        <canvas ref={canvasRef} className="max-h-full max-w-full bg-white" />
      </div>
      <div className="mt-1 flex items-center justify-between px-0.5 text-[10px] text-muted-foreground">
        <span className="font-medium">p.{index + 1}</span>
        {rot !== 0 && <span className="font-mono">{rot}°</span>}
      </div>
      <div className="absolute right-2 top-2 hidden gap-1 group-hover:flex">
        <button
          type="button"
          title={`Rotate page ${index + 1}`}
          aria-label={`Rotate page ${index + 1}`}
          onClick={(e) => {
            e.stopPropagation();
            onRotate();
          }}
          className="rounded-md border border-border bg-surface p-1 text-muted-foreground shadow hover:text-foreground"
        >
          <RotateCw className="h-3 w-3" />
        </button>
        <button
          type="button"
          title={`Delete page ${index + 1}`}
          aria-label={`Delete page ${index + 1}`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded-md border border-border bg-surface p-1 text-muted-foreground shadow hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

/* ================= properties panel ================= */

const TOOL_HINTS: Record<string, string> = {
  select: "Click any text to edit it in place, or click an overlay object to select it. Drag to move, use the corner handle to resize. Delete key removes it.",
  text: "Click any text on the page to edit it in place — same position, font, size and color. Hover to preview editable blocks.",
  addText: "Click anywhere on a page to drop a new text box.",
  whiteout: "Drag a rectangle over anything you want covered. It is burned into the page on download.",
  image: "Click a page, pick a PNG/JPG, then drag and resize (aspect locked).",
  sign: "Click a page to create or pick a signature, then click again to place it.",
  link: "Drag a rectangle, then set a URL or an internal page.",
  highlight: "Select text on the page to highlight it.",
  underline: "Select text on the page to underline it.",
  strike: "Select text on the page to strike through.",
  draw: "Drag on a page to draw freehand.",
  rect: "Drag on a page to draw a rectangle.",
  ellipse: "Drag on a page to draw an ellipse.",
  line: "Drag on a page to draw a line.",
  arrow: "Drag on a page to draw an arrow.",
  formText: "Drag on a page to place a fillable text field.",
  formCheck: "Click or drag on a page to place a checkbox.",
  formRadio: "Click or drag on a page to place a radio button.",
};

function PropsPanel(props: {
  selected: Overlay | null;
  tool: EditorToolId;
  strokeHex: string;
  setStrokeHex: (v: string) => void;
  fillHex: string | null;
  setFillHex: (v: string | null) => void;
  strokeW: number;
  setStrokeW: (v: number) => void;
  annotHex: string;
  setAnnotHex: (v: string) => void;
  whiteoutHex: string;
  setWhiteoutHex: (v: string) => void;
  existingFields: ExistingFormField[];
  fills: FormFill[];
  setFillValue: (name: string, value: string) => void;
  onPatchSelected: (patch: Partial<Overlay>) => void;
  onCommitSelected: () => void;
  onDeleteSelected: () => void;
  onEditTextOverlay: (ovId: string) => void;
}) {
  const sel = props.selected;
  return (
    <aside className="space-y-4 lg:sticky lg:top-32 lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto" aria-label="Properties">
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-paper">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {sel ? "Selected Object" : "Text & Tool Controls"}
        </h3>
        {!sel && (
          <div className="mt-2 space-y-2.5">
            <div className="rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 p-3 text-xs text-blue-900 dark:text-blue-200">
              <span className="font-semibold block mb-1">Click Any Text to Edit</span>
              <p className="text-[11px] leading-relaxed text-blue-800/80 dark:text-blue-300/80">
                Move your cursor over any word or paragraph on the page. A blue highlight will appear — click it to edit the text with the same font, size, and color.
              </p>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {TOOL_HINTS[props.tool] ?? ""}
            </p>
          </div>
        )}
        {sel?.kind === "text" || sel?.kind === "edit" ? (
          <SelectedTextControls
            overlay={sel}
            onPatch={props.onPatchSelected}
            onCommit={props.onCommitSelected}
            onDelete={props.onDeleteSelected}
            onEdit={sel.kind === "edit" ? () => props.onEditTextOverlay(sel.id) : undefined}
          />
        ) : sel ? (
          <SelectedGenericControls
            overlay={sel}
            onPatch={props.onPatchSelected}
            onCommit={props.onCommitSelected}
            onDelete={props.onDeleteSelected}
          />
        ) : (
          <ToolSettingsControls
            tool={props.tool}
            strokeHex={props.strokeHex}
            setStrokeHex={props.setStrokeHex}
            fillHex={props.fillHex}
            setFillHex={props.setFillHex}
            strokeW={props.strokeW}
            setStrokeW={props.setStrokeW}
            annotHex={props.annotHex}
            setAnnotHex={props.setAnnotHex}
            whiteoutHex={props.whiteoutHex}
            setWhiteoutHex={props.setWhiteoutHex}
          />
        )}
      </div>

      {props.existingFields.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-paper">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Fill Form Fields ({props.existingFields.length})
          </h3>
          <div className="mt-2 max-h-56 space-y-2 overflow-y-auto">
            {props.existingFields.map((f: ExistingFormField) => (
              <ExistingFieldRow key={f.name} field={f} fills={props.fills} setFillValue={props.setFillValue} />
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface p-4 shadow-paper">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Your file stays on your device</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Rendering with pdf.js, writing with pdf-lib — all in this tab. Shortcuts: Del delete,
          arrows nudge, Ctrl+Z/Y undo/redo, Ctrl+C/V copy/paste.
        </p>
      </div>
    </aside>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-medium text-muted-foreground">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function SelectedTextControls({
  overlay,
  onPatch,
  onCommit,
  onDelete,
  onEdit,
}: {
  overlay: { kind: string } & Record<string, any>;
  onPatch: (p: Partial<Overlay>) => void;
  onCommit: () => void;
  onDelete: () => void;
  onEdit?: () => void;
}) {
  return (
    <div className="mt-2 space-y-2.5" onBlur={onCommit}>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="w-full rounded-lg bg-foreground py-1.5 text-xs font-semibold text-background"
        >
          Edit text in place
        </button>
      )}
      <Row label="Text">
        <textarea
          rows={3}
          value={overlay.text ?? ""}
          onChange={(e) => onPatch({ text: e.target.value } as any)}
          className={inputCls}
        />
      </Row>
      <div className="grid grid-cols-2 gap-2">
        <Row label="Size (pt)">
          <input
            type="number"
            min={6}
            max={144}
            value={overlay.fontSize ?? 12}
            onChange={(e) => onPatch({ fontSize: Math.max(6, Number(e.target.value) || 12) } as any)}
            className={inputCls}
          />
        </Row>
        <Row label="Color">
          <input
            type="color"
            value={overlay.colorHex ?? "#000000"}
            onChange={(e) => onPatch({ colorHex: e.target.value } as any)}
            className="h-8 w-full cursor-pointer rounded-lg border border-border bg-transparent"
          />
        </Row>
      </div>
      <div className="flex gap-1">
        {(
          [
            ["bold", "B", overlay.bold],
            ["italic", "I", overlay.italic],
            ["underline", "U", overlay.underline],
          ] as const
        ).map(([key, label, active]) => (
          <button
            key={key}
            type="button"
            aria-pressed={!!active}
            onClick={() => onPatch({ [key]: !active } as any)}
            className={`flex-1 rounded-lg border py-1 text-xs font-bold ${active ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex gap-1">
        {(
          [
            ["left", "Left"],
            ["center", "Center"],
            ["right", "Right"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={overlay.align === key}
            onClick={() => onPatch({ align: key } as any)}
            className={`flex-1 rounded-lg border py-1 text-[11px] ${overlay.align === key ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          onCommit();
          onDelete();
        }}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span>Delete</span>
      </button>
    </div>
  );
}

function SelectedGenericControls({
  overlay,
  onPatch,
  onCommit,
  onDelete,
}: {
  overlay: Overlay;
  onPatch: (p: Partial<Overlay>) => void;
  onCommit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="mt-2 space-y-2.5" onBlur={onCommit}>
      {(overlay.kind === "shape" || overlay.kind === "draw" || overlay.kind === "annot") && (
        <Row label="Color">
          <input
            type="color"
            value={(overlay as any).strokeHex ?? (overlay as any).colorHex ?? "#000000"}
            onChange={(e) =>
              onPatch(
                (overlay.kind === "annot" ? { colorHex: e.target.value } : { strokeHex: e.target.value }) as any
              )
            }
            className="h-8 w-full cursor-pointer rounded-lg border border-border bg-transparent"
          />
        </Row>
      )}
      {overlay.kind === "whiteout" && (
        <Row label="Cover color">
          <input
            type="color"
            value={overlay.colorHex}
            onChange={(e) => onPatch({ colorHex: e.target.value } as any)}
            className="h-8 w-full cursor-pointer rounded-lg border border-border bg-transparent"
          />
        </Row>
      )}
      {(overlay.kind === "shape" || overlay.kind === "draw") && (
        <Row label={`Stroke width (${(overlay as any).strokeW ?? 2} pt)`}>
          <input
            type="range"
            min={1}
            max={12}
            value={(overlay as any).strokeW ?? 2}
            onChange={(e) => onPatch({ strokeW: Number(e.target.value) } as any)}
            className="w-full"
          />
        </Row>
      )}
      {overlay.kind === "link" && (
        <Row label="URL">
          <input
            value={overlay.url}
            onChange={(e) => onPatch({ url: e.target.value } as any)}
            placeholder="https://…"
            className={inputCls}
          />
        </Row>
      )}
      {overlay.kind === "form" && (
        <>
          <Row label="Field name">
            <input
              value={overlay.name}
              onChange={(e) => onPatch({ name: e.target.value } as any)}
              className={inputCls}
            />
          </Row>
          {overlay.fieldType === "text" && (
            <Row label="Default value">
              <input
                value={overlay.value}
                onChange={(e) => onPatch({ value: e.target.value } as any)}
                className={inputCls}
              />
            </Row>
          )}
          {overlay.fieldType === "check" && (
            <button
              type="button"
              onClick={() => onPatch({ value: overlay.value === "true" ? "false" : "true" } as any)}
              className="flex w-full items-center gap-2 rounded-lg border border-border px-2 py-1.5 text-xs text-foreground"
            >
              <span className={`flex h-4 w-4 items-center justify-center rounded border ${overlay.value === "true" ? "bg-foreground text-background" : "border-border"}`}>
                {overlay.value === "true" && <Check className="h-3 w-3" />}
              </span>
              <span>{overlay.value === "true" ? "Checked" : "Unchecked"}</span>
            </button>
          )}
        </>
      )}
      {(overlay.kind === "image" || overlay.kind === "sign") && (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Drag to move. Use the corner handle to resize (aspect ratio locked).
        </p>
      )}
      <button
        type="button"
        onClick={() => {
          onCommit();
          onDelete();
        }}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span>Delete</span>
      </button>
    </div>
  );
}

function ToolSettingsControls(props: {
  tool: EditorToolId;
  strokeHex: string;
  setStrokeHex: (v: string) => void;
  fillHex: string | null;
  setFillHex: (v: string | null) => void;
  strokeW: number;
  setStrokeW: (v: number) => void;
  annotHex: string;
  setAnnotHex: (v: string) => void;
  whiteoutHex: string;
  setWhiteoutHex: (v: string) => void;
}) {
  const t = props.tool;
  if (t === "whiteout") {
    return (
      <div className="mt-2">
        <Row label="Cover color">
          <input type="color" value={props.whiteoutHex} onChange={(e) => props.setWhiteoutHex(e.target.value)} className="h-8 w-full cursor-pointer rounded-lg border border-border bg-transparent" />
        </Row>
      </div>
    );
  }
  if (t === "highlight" || t === "underline" || t === "strike") {
    return (
      <div className="mt-2">
        <Row label={t === "highlight" ? "Highlight color" : "Line color"}>
          <input type="color" value={t === "highlight" ? "#ffeb00" : props.annotHex} onChange={(e) => props.setAnnotHex(e.target.value)} className="h-8 w-full cursor-pointer rounded-lg border border-border bg-transparent" />
        </Row>
        {t === "highlight" && <p className="mt-1 text-[10px] text-muted-foreground">Highlight uses classic marker yellow.</p>}
      </div>
    );
  }
  if (t === "rect" || t === "ellipse" || t === "line" || t === "arrow" || t === "draw") {
    return (
      <div className="mt-2 space-y-2.5">
        <Row label="Stroke color">
          <input type="color" value={props.strokeHex} onChange={(e) => props.setStrokeHex(e.target.value)} className="h-8 w-full cursor-pointer rounded-lg border border-border bg-transparent" />
        </Row>
        {(t === "rect" || t === "ellipse") && (
          <Row label="Fill (optional)">
            <div className="flex items-center gap-2">
              <input type="color" value={props.fillHex ?? "#ffffff"} onChange={(e) => props.setFillHex(e.target.value)} className="h-8 w-full cursor-pointer rounded-lg border border-border bg-transparent disabled:opacity-30" disabled={!props.fillHex} />
              <button
                type="button"
                onClick={() => props.setFillHex(props.fillHex ? null : "#ffffff")}
                className="shrink-0 rounded-lg border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                {props.fillHex ? "None" : "Fill"}
              </button>
            </div>
          </Row>
        )}
        <Row label={`Stroke width (${props.strokeW} pt)`}>
          <input type="range" min={1} max={12} value={props.strokeW} onChange={(e) => props.setStrokeW(Number(e.target.value))} className="w-full" />
        </Row>
      </div>
    );
  }
  return null;
}

function ExistingFieldRow({
  field,
  fills,
  setFillValue,
}: {
  field: ExistingFormField;
  fills: FormFill[];
  setFillValue: (name: string, value: string) => void;
}) {
  const current = fills.find((f) => f.name === field.name)?.value ?? "";
  const shortType =
    field.type === "PDFTextField" ? "text" : field.type === "PDFCheckBox" ? "checkbox" : field.type === "PDFRadioGroup" ? "radio" : "other";
  if (shortType === "checkbox") {
    const on = current === "true";
    return (
      <button
        type="button"
        onClick={() => setFillValue(field.name, on ? "false" : "true")}
        className="flex w-full items-center gap-2 rounded-lg border border-border px-2 py-1.5 text-left text-xs text-foreground hover:bg-surface-subtle"
        title={field.name}
      >
        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${on ? "bg-foreground text-background" : "border-border"}`}>
          {on && <Check className="h-3 w-3" />}
        </span>
        <span className="truncate">{field.name}</span>
      </button>
    );
  }
  return (
    <label className="block text-[11px] text-muted-foreground" title={`${field.name} (${field.type})`}>
      <span className="mb-0.5 block truncate font-medium">{field.name}</span>
      <input
        defaultValue={current}
        key={`${field.name}:${current === "" ? "e" : "f"}-init`}
        onBlur={(e) => {
          if (e.target.value !== current) setFillValue(field.name, e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        placeholder={shortType === "radio" ? "Option name…" : "Type value…"}
        className={inputCls}
      />
    </label>
  );
}

/* ================= misc ================= */

function scannedNotice(pages: EditorPage[], scanned: Record<number, boolean>): boolean {
  return pages.some((p) => p.src.kind === "orig" && scanned[p.src.index]);
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-72 flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-2 rounded-xl border p-3 text-xs shadow-paper-elevated ${
            t.kind === "error"
              ? "border-destructive/30 bg-surface text-destructive"
              : t.kind === "success"
                ? "border-border bg-surface text-foreground"
                : "border-border bg-surface text-foreground"
          }`}
        >
          {t.kind === "error" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> : <Check className="mt-0.5 h-4 w-4 shrink-0" />}
          <span className="leading-relaxed">{t.text}</span>
        </div>
      ))}
    </div>
  );
}
