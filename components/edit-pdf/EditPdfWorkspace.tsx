"use client";

/**
 * EditPdfWorkspace — full Sejda-style visual PDF editor (client only).
 *
 * Layout: thumbnails sidebar (left) + scrollable pages (center) + properties
 * panel (right), top EditorToolbar. All processing in-browser; files never
 * uploaded ("Your file stays on your device").
 */
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ShieldCheck,
  Lock,
  Loader2,
  AlertTriangle,
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
  AnnotSubtype,
  EditorToolId,
  EditorSnapshot,
  ExistingFormField,
  FormFill,
  Overlay,
  TextBlock,
  PdfRect,
  PdfPoint,
  EditTextOverlay,
  AddTextOverlay,
  WhiteoutOverlay,
  PdfExistingImage,
} from "@/lib/pdf/edit-pdf/types";
import { newOverlayId } from "@/lib/pdf/edit-pdf/types";
import { EditorToolbar } from "./EditorToolbar";
import { PageView } from "./PageView";
import type { InlineTextValue } from "./TextBlockOverlay";
import { SignatureModal, type SavedSignature } from "./SignatureModal";
import { FindReplaceModal } from "./FindReplaceModal";
import {
  useEditPdf,
  EditPdfActionsProvider,
  type EditPdfActions,
  type EditPdfState,
  type EditPdfPatch,
  type Stage,
  type Toast,
  newPageKey,
} from "./store";
import { applyFindReplace } from "@/lib/pdf/edit-pdf/find-replace";
import { ResultCard } from "@/components/tools/ResultCard";
import { downloadBytes } from "@/lib/files/download";
import { formatFileSize } from "@/lib/utils";
import { MAX_PDF_FILE_BYTES } from "@/lib/files/intake";
import { getActiveDocument, clearActiveDocument, loadPersistedActiveDocument, setActiveDocument } from "@/lib/active-document";

export function EditPdfWorkspace() {
  const { state, dispatch, getState, getSnapshot, pushToast, getPdfDoc, setPdfDoc } = useEditPdf();
  const {
    stage,
    fileName,
    fileSize,
    loadProgress,
    password,
    passwordError,
    pages,
    overlays,
    blocksBySrc,
    blocksLoadingSrc,
    scannedSrcPages,
    tool,
    selectedId,
    activePageKey,
    editing,
    inlineValue,
    inlineBg,
    fallbackNotice,
    toasts,
    warnings,
    processingLabel,
    doneBytes,
    doneName,
    strokeHex,
    fillHex,
    strokeW,
    annotHex,
    whiteoutHex,
    signModalOpen,
    armedSign,
    linkDraft,
    findReplaceOpen,
    linkUrl,
    linkDest,
  } = state;

  const setField = useCallback(
    <K extends keyof EditPdfState>(
      key: K,
      value: EditPdfState[K] | ((prev: EditPdfState[K]) => EditPdfState[K])
    ) => {
      dispatch({ type: "set", patch: { [key]: value } as unknown as EditPdfPatch });
    },
    [dispatch]
  );
  const setStage = (v: Stage | ((p: Stage) => Stage)) => setField("stage", v);
  const setFileName = (v: string | ((p: string) => string)) => setField("fileName", v);
  const setFileSize = (v: number | ((p: number) => number)) => setField("fileSize", v);
  const setLoadProgress = (v: string | ((p: string) => string)) => setField("loadProgress", v);
  const setPassword = (v: string | ((p: string) => string)) => setField("password", v);
  const setPasswordError = (v: string | null | ((p: string | null) => string | null)) =>
    setField("passwordError", v);
  const setPages = (v: EditorPage[] | ((p: EditorPage[]) => EditorPage[])) => setField("pages", v);
  const setOverlays = (v: Overlay[] | ((p: Overlay[]) => Overlay[])) => setField("overlays", v);
  const setFills = (v: FormFill[] | ((p: FormFill[]) => FormFill[])) => setField("fills", v);
  const setBlocksBySrc = (v: Record<number, TextBlock[]> | ((p: Record<number, TextBlock[]>) => Record<number, TextBlock[]>)) =>
    setField("blocksBySrc", v);
  const setBlocksLoadingSrc = (v: Record<number, boolean> | ((p: Record<number, boolean>) => Record<number, boolean>)) =>
    setField("blocksLoadingSrc", v);
  const setScannedSrcPages = (v: Record<number, boolean> | ((p: Record<number, boolean>) => Record<number, boolean>)) =>
    setField("scannedSrcPages", v);
  const setExistingFields = (v: ExistingFormField[] | ((p: ExistingFormField[]) => ExistingFormField[])) =>
    setField("existingFields", v);
  const setExistingImagesBySrc = (v: Record<number, PdfExistingImage[]> | ((p: Record<number, PdfExistingImage[]>) => Record<number, PdfExistingImage[]>)) =>
    setField("existingImagesBySrc", v);
  const setTool = (v: EditorToolId | ((p: EditorToolId) => EditorToolId)) => setField("tool", v);
  const setSelectedId = (v: string | null | ((p: string | null) => string | null)) =>
    setField("selectedId", v);
  const setActivePageKey = (v: string | null | ((p: string | null) => string | null)) =>
    setField("activePageKey", v);
  const setEditing = (v: { pageKey: string; blockId: string } | null | ((p: { pageKey: string; blockId: string } | null) => { pageKey: string; blockId: string } | null)) =>
    setField("editing", v);
  const setInlineValue = (v: InlineTextValue | null | ((p: InlineTextValue | null) => InlineTextValue | null)) =>
    setField("inlineValue", v);
  const setInlineBg = (v: string | ((p: string) => string)) => setField("inlineBg", v);
  const setFallbackNotice = (v: boolean | ((p: boolean) => boolean)) => setField("fallbackNotice", v);
  const setZoom = (v: number | ((p: number) => number)) => setField("zoom", v);
  const setToasts = (v: Toast[] | ((p: Toast[]) => Toast[])) => setField("toasts", v);
  const setProcessingLabel = (v: string | ((p: string) => string)) => setField("processingLabel", v);
  const setDoneBytes = (v: Uint8Array | null | ((p: Uint8Array | null) => Uint8Array | null)) =>
    setField("doneBytes", v);
  const setDoneName = (v: string | ((p: string) => string)) => setField("doneName", v);
  const setStrokeHex = (v: string | ((p: string) => string)) => setField("strokeHex", v);
  const setFillHex = (v: string | null | ((p: string | null) => string | null)) => setField("fillHex", v);
  const setStrokeW = (v: number | ((p: number) => number)) => setField("strokeW", v);
  const setAnnotHex = (v: string | ((p: string) => string)) => setField("annotHex", v);
  const setWhiteoutHex = (v: string | ((p: string) => string)) => setField("whiteoutHex", v);
  const setSignModalOpen = (v: boolean | ((p: boolean) => boolean)) => setField("signModalOpen", v);
  const setArmedSign = (v: SavedSignature | null | ((p: SavedSignature | null) => SavedSignature | null)) =>
    setField("armedSign", v);
  const setLinkDraft = (v: { pageKey: string; rect: PdfRect } | null | ((p: { pageKey: string; rect: PdfRect } | null) => { pageKey: string; rect: PdfRect } | null)) =>
    setField("linkDraft", v);
  const setFindReplaceOpen = (v: boolean | ((p: boolean) => boolean)) => setField("findReplaceOpen", v);
  const setLinkUrl = (v: string | ((p: string) => string)) => setField("linkUrl", v);
  const setLinkDest = (v: string | ((p: string) => string)) => setField("linkDest", v);

  const blocksCacheRef = useRef<Map<number, TextBlock[]>>(new Map());
  const pdfBytesRef = useRef<Uint8Array | null>(null);
  const handleDownloadRef = useRef<() => void>(() => {});
  const pdfjsRef = useRef<any>(null);
  const pendingBytesRef = useRef<Uint8Array | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const imagePickerRef = useRef<HTMLInputElement | null>(null);
  const pendingImagePointRef = useRef<{ pageKey: string; x: number; y: number } | null>(null);
  const pendingReplaceImageRef = useRef<{ pageKey: string; img: PdfExistingImage } | null>(null);

/* ---------------- history ---------------- */

  const commit = useCallback(
    (mut: (s: EditorSnapshot) => EditorSnapshot, push = true) => {
      dispatch({ type: "commit", mut, push });
    },
    [dispatch]
  );

  const ensureTransient = useCallback(() => {
    dispatch({ type: "transientStart" });
  }, [dispatch]);

  const endTransient = useCallback(() => {
    dispatch({ type: "transientEnd" });
  }, [dispatch]);

  const undo = useCallback(() => {
    dispatch({ type: "transientEnd" });
    dispatch({ type: "undo" });
  }, [dispatch]);

  const redo = useCallback(() => {
    dispatch({ type: "redo" });
  }, [dispatch]);

/* ---------------- file loading ---------------- */

  const resetAll = useCallback(() => {
    try {
      getPdfDoc()?.destroy?.();
    } catch {
      /* ignore */
    }
    setPdfDoc(null);
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
    dispatch({ type: "resetHistory" });
    setSelectedId(null);
    setEditing(null);
    setInlineValue(null);
    setArmedSign(null);
    setLinkDraft(null);
    setDoneBytes(null);
    setPassword("");
    setPasswordError(null);
    dispatch({ type: "set", patch: { transientPre: null, transientDirty: false } });
  }, [dispatch, getPdfDoc, setPdfDoc]);

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
        setPdfDoc(doc);
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
        setActivePageKey(nextPages[0]?.key ?? null);
        dispatch({
          type: "loadDocument",
          snapshot: { pages: nextPages, overlays: [], fills: [] },
        });
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
      if (file.size > MAX_PDF_FILE_BYTES) {
        pushToast("error", `File is larger than ${formatFileSize(MAX_PDF_FILE_BYTES)} (${formatFileSize(file.size)}). Split it first, then edit.`);
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
      const doc = getPdfDoc();
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
          setExistingImagesBySrc((m) => ({ ...m, [srcIndex]: res.existingImages || [] }));
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
          await pg.cleanup?.();
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

  const closeInline = useCallback(() => {
    const curEditing = getState().editing;
    const curVal = getState().inlineValue;
    if (curEditing && curVal) {
      commit((s) => {
        const exIdx = s.overlays.findIndex(
          (o) => o.kind === "edit" && (o as EditTextOverlay).blockId === curEditing.blockId
        );
        if (exIdx >= 0) {
          const ex = s.overlays[exIdx] as EditTextOverlay;
          const updated: EditTextOverlay = {
            ...ex,
            text: curVal.text,
            fontId: curVal.fontId,
            fontSize: curVal.fontSize,
            colorHex: curVal.colorHex,
            bold: curVal.bold,
            italic: curVal.italic,
            underline: curVal.underline,
            align: curVal.align,
          };
          const nextOverlays = [...s.overlays];
          nextOverlays[exIdx] = updated;
          return { ...s, overlays: nextOverlays };
        }
        return s;
      }, false);
    }
    endTransient();
    setEditing(null);
    setInlineValue(null);
    setFallbackNotice(false);
  }, [commit, endTransient, getState]);

  const startEdit = useCallback(
    (pageKey: string, block: TextBlock, bgHex = "#ffffff", textHex?: string) => {
      // 1. Commit and finalize any existing transient editing state immediately
      const curEditing = getState().editing;
      if (curEditing && curEditing.blockId !== block.id) {
        closeInline();
      } else {
        endTransient();
      }

      // 2. Load existing or initialize new text value
      const existing = getSnapshot().overlays.find(
        (o) => o.kind === "edit" && (o as EditTextOverlay).blockId === block.id
      ) as EditTextOverlay | undefined;

      const textColor =
        textHex && textHex.toLowerCase() !== "#ffffff"
          ? textHex
          : block.colorHex && block.colorHex.toLowerCase() !== "#ffffff"
            ? block.colorHex
            : "#000000";

      const initialVal: InlineTextValue = existing
        ? {
            text: existing.text,
            fontId: existing.fontId,
            fontSize: existing.fontSize,
            colorHex: existing.colorHex,
            bold: existing.bold,
            italic: existing.italic,
            underline: existing.underline,
            align: existing.align,
          }
        : {
            text: block.text,
            fontId:
              block.hasEmbeddedFont && block.embeddedFamily
                ? `embedded:${block.embeddedFamily}`
                : block.matchedFontId,
            fontSize: Math.round(block.fontSize * 10) / 10,
            colorHex: textColor,
            bold: block.bold,
            italic: block.italic,
            underline: false,
            align: "left",
          };

      const bg = existing ? existing.bgHex : bgHex;
      setInlineValue(initialVal);
      setInlineBg(bg);
      setFallbackNotice(existing ? existing.fallbackNotice : false);

      setEditing({ pageKey, blockId: block.id });

      // Immediately register the edit overlay so it is never missing from the document or preview
      commit((s) => {
        const exIdx = s.overlays.findIndex(
          (o) => o.kind === "edit" && (o as EditTextOverlay).blockId === block.id
        );
        if (exIdx >= 0) return s;
        const newOv: EditTextOverlay = {
          id: newOverlayId("edit"),
          kind: "edit",
          pageKey,
          blockId: block.id,
          text: initialVal.text,
          fontId: initialVal.fontId,
          fontSize: initialVal.fontSize,
          colorHex: initialVal.colorHex,
          bold: initialVal.bold,
          italic: initialVal.italic,
          underline: initialVal.underline,
          align: initialVal.align,
          x: block.x,
          y: block.y,
          wrapW: Math.max(20, block.boxW),
          rotation: block.rotation,
          lineHeight: block.lineHeight,
          bgHex: bg,
          saveFontId: block.matchedFontId,
          fallbackNotice: false,
        };
        return { ...s, overlays: [...s.overlays, newOv] };
      }, false);

      setSelectedId(null);
      setTool("text");
    },
    [closeInline, commit, endTransient, getState, getSnapshot]
  );

  const patchInline = useCallback(
    (patch: Partial<InlineTextValue>) => {
      const curEditing = getState().editing;
      if (!curEditing) return;

      const prev = getState().inlineValue;
      const nextVal: InlineTextValue = prev
        ? { ...prev, ...patch }
        : {
            text: patch.text ?? "",
            fontId: patch.fontId ?? "Arimo",
            fontSize: patch.fontSize ?? 12,
            colorHex: patch.colorHex ?? "#000000",
            bold: patch.bold ?? false,
            italic: patch.italic ?? false,
            underline: patch.underline ?? false,
            align: patch.align ?? "left",
          };

      setInlineValue(nextVal);

      ensureTransient();
      const block = findBlock(curEditing.blockId);

      commit((s) => {
        const exIdx = s.overlays.findIndex(
          (o) => o.kind === "edit" && (o as EditTextOverlay).blockId === curEditing.blockId
        );
        if (exIdx >= 0) {
          const ex = s.overlays[exIdx] as EditTextOverlay;
          const updated: EditTextOverlay = {
            ...ex,
            text: nextVal.text,
            fontId: nextVal.fontId,
            fontSize: nextVal.fontSize,
            colorHex: nextVal.colorHex,
            bold: nextVal.bold,
            italic: nextVal.italic,
            underline: nextVal.underline,
            align: nextVal.align,
          };
          const nextOverlays = [...s.overlays];
          nextOverlays[exIdx] = updated;
          return { ...s, overlays: nextOverlays };
        } else if (block) {
          const newOv: EditTextOverlay = {
            id: newOverlayId("edit"),
            kind: "edit",
            pageKey: curEditing.pageKey,
            blockId: block.id,
            text: nextVal.text,
            fontId: nextVal.fontId,
            fontSize: nextVal.fontSize,
            colorHex: nextVal.colorHex,
            bold: nextVal.bold,
            italic: nextVal.italic,
            underline: nextVal.underline,
            align: nextVal.align,
            x: block.x,
            y: block.y,
            wrapW: Math.max(20, block.boxW),
            rotation: block.rotation,
            lineHeight: block.lineHeight,
            bgHex: getState().inlineBg,
            saveFontId: block.matchedFontId,
            fallbackNotice: false,
          };
          return { ...s, overlays: [...s.overlays, newOv] };
        }
        return s;
      }, false);
    },
    [commit, ensureTransient, findBlock, getState]
  );

  // Glyphs coverage check for embedded fonts
  useEffect(() => {
    if (!editing || !inlineValue) return;
    const block = findBlock(editing.blockId);
    if (!block) return;
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
  }, [editing, inlineValue, commit, findBlock]);

  const moveInline = useCallback(
    (dxPdf: number, dyPdf: number) => {
      if (!editing) return;
      ensureTransient();
      commit(
        (s) => {
          const exIdx = s.overlays.findIndex(
            (o) => o.kind === "edit" && (o as EditTextOverlay).blockId === editing.blockId
          );
          if (exIdx >= 0) {
            const ex = s.overlays[exIdx] as EditTextOverlay;
            const updated: EditTextOverlay = {
              ...ex,
              x: ex.x + dxPdf,
              y: ex.y + dyPdf,
            };
            const nextOverlays = [...s.overlays];
            nextOverlays[exIdx] = updated;
            return { ...s, overlays: nextOverlays };
          }
          const block = findBlock(editing.blockId);
          if (!block) return s;
          const initial = inlineValue || {
            text: block.text,
            fontId: block.matchedFontId,
            fontSize: block.fontSize,
            colorHex: block.colorHex,
            bold: block.bold,
            italic: block.italic,
            underline: false,
            align: "left" as const,
          };
          const newOv: EditTextOverlay = {
            id: newOverlayId("edit"),
            kind: "edit",
            pageKey: editing.pageKey,
            blockId: block.id,
            text: initial.text,
            fontId: initial.fontId,
            fontSize: initial.fontSize,
            colorHex: initial.colorHex,
            bold: initial.bold,
            italic: initial.italic,
            underline: initial.underline,
            align: initial.align,
            x: block.x + dxPdf,
            y: block.y + dyPdf,
            wrapW: Math.max(20, block.boxW),
            rotation: block.rotation,
            lineHeight: block.lineHeight,
            bgHex: getState().inlineBg,
            saveFontId: block.matchedFontId,
            fallbackNotice: false,
          };
          return { ...s, overlays: [...s.overlays, newOv] };
        },
        false
      );
    },
    [commit, editing, ensureTransient, findBlock, inlineValue, getState]
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

  const duplicateOverlay = useCallback(
    (id: string) => {
      const ov = getSnapshot().overlays.find((o) => o.id === id);
      if (!ov) return;
      const newId = newOverlayId(ov.kind);
      const offset = 15;
      let copy: Overlay;
      const anyO = ov as any;
      if (anyO.rect) {
        copy = {
          ...ov,
          id: newId,
          rect: { ...anyO.rect, x: anyO.rect.x + offset, y: anyO.rect.y - offset },
        } as any;
      } else if (anyO.x !== undefined && anyO.y !== undefined) {
        copy = {
          ...ov,
          id: newId,
          x: anyO.x + offset,
          y: anyO.y - offset,
        } as any;
      } else {
        copy = { ...ov, id: newId };
      }
      commit((s) => ({ ...s, overlays: [...s.overlays, copy] }));
      setSelectedId(newId);
      pushToast("info", "Object duplicated.");
    },
    [commit, pushToast, getSnapshot]
  );

  const removeExistingImage = useCallback(
    (pageKey: string, img: PdfExistingImage) => {
      const wo: WhiteoutOverlay = {
        id: newOverlayId("wo"),
        kind: "whiteout",
        pageKey,
        rect: {
          x: img.rect.x - 1,
          y: img.rect.y - 1,
          w: img.rect.w + 2,
          h: img.rect.h + 2,
        },
        colorHex: "#ffffff",
      };
      commit((s) => ({ ...s, overlays: [...s.overlays, wo] }));
      setSelectedId(null);
      pushToast("success", "Image removed from PDF.");
    },
    [commit, pushToast]
  );

  const replaceExistingImage = useCallback(
    (pageKey: string, img: PdfExistingImage) => {
      pendingReplaceImageRef.current = { pageKey, img };
      imagePickerRef.current?.click();
    },
    []
  );

  const duplicateEditingLine = useCallback(() => {
    if (!editing || !inlineValue) return;
    const block = findBlock(editing.blockId);
    if (!block) return;
    const ov: AddTextOverlay = {
      id: newOverlayId("txt"),
      kind: "text",
      pageKey: editing.pageKey,
      text: inlineValue.text,
      fontId: inlineValue.fontId,
      fontSize: inlineValue.fontSize,
      colorHex: inlineValue.colorHex,
      bold: inlineValue.bold,
      italic: inlineValue.italic,
      underline: inlineValue.underline,
      align: inlineValue.align,
      x: block.x,
      y: block.y - Math.max(14, block.lineHeight || block.fontSize * 1.2),
      wrapW: Math.max(20, block.boxW),
      rotation: block.rotation,
    };
    commit((s) => ({ ...s, overlays: [...s.overlays, ov] }));
    setSelectedId(ov.id);
    pushToast("info", "Line duplicated.");
  }, [editing, inlineValue, commit, findBlock, pushToast]);

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
    const sel = getSnapshot().overlays.find((o) => o.id === selectedId);
    if (sel) clipboardRef.current = JSON.parse(JSON.stringify(sel));
  }, [selectedId, getSnapshot]);

  const pasteClipboard = useCallback(() => {
    const c = clipboardRef.current;
    if (!c) return;
    const targetKey = activePageKey ?? getSnapshot().pages[0]?.key;
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
  }, [activePageKey, commit, getSnapshot, pushToast]);

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
        const n = getSnapshot().overlays.filter((o) => o.kind === "form").length + 1;
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
    [commit, fillHex, getSnapshot, pushToast, strokeHex, strokeW, whiteoutHex]
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
      if (getState().editing) {
        closeInline();
        return;
      }
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
    [tool, armedSign, commit, commitRect, getState]
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
      const replace = pendingReplaceImageRef.current;
      pendingReplaceImageRef.current = null;

      if (!file) return;
      if (!/^image\/(png|jpe?g|webp|svg\+xml)$/i.test(file.type)) {
        pushToast("error", "Supported formats: PNG, JPG, WebP, SVG.");
        return;
      }
      const buf = await file.arrayBuffer();
      const blob = new Blob([buf], { type: file.type });
      const dataUrl = await new Promise<string>((resolve) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result));
        fr.readAsDataURL(blob);
      });

      if (replace) {
        const { pageKey, img } = replace;
        const wo: WhiteoutOverlay = {
          id: newOverlayId("wo"),
          kind: "whiteout",
          pageKey,
          rect: { x: img.rect.x - 1, y: img.rect.y - 1, w: img.rect.w + 2, h: img.rect.h + 2 },
          colorHex: "#ffffff",
        };
        const newOv = {
          id: newOverlayId("image"),
          kind: "image" as const,
          pageKey,
          dataUrl,
          mime: file.type,
          rect: { x: img.rect.x, y: img.rect.y, w: img.rect.w, h: img.rect.h },
        };
        commit((s) => ({ ...s, overlays: [...s.overlays, wo, newOv] }));
        setSelectedId(newOv.id);
        pushToast("success", "Image replaced.");
        return;
      }

      const targetKey = at?.pageKey || activePageKey || getSnapshot().pages[0]?.key;
      const targetPage = getSnapshot().pages.find((p) => p.key === targetKey);
      const targetPt = at
        ? { x: at.x, y: at.y }
        : { x: (targetPage?.width || 612) / 2, y: (targetPage?.height || 792) / 2 };

      if (targetKey) {
        placeImageOverlay(targetKey, targetPt, dataUrl, file.type, "image");
      }
    },
    [activePageKey, commit, getSnapshot, placeImageOverlay, pushToast]
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
    closeInline();
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
      dispatch({ type: "clearWarnings" });
      const out = await exportEditedPdf(
        {
          originalBytes: bytes,
          pages: getSnapshot().pages,
          overlays: getSnapshot().overlays,
          fills: getSnapshot().fills,
          blockBoxById,
          embeddedBytesByBlock,
          onWarnings: (ws) => dispatch({ type: "addWarnings", warnings: ws }),
        },
        (s) => setProcessingLabel(s)
      );
      const base = fileName.replace(/\.pdf$/i, "") || "document";
      const finalName = `${base}-edited.pdf`;
      downloadBytes(out, finalName, "application/pdf");
      pushToast("success", "PDF changes applied and downloaded successfully.");
      setDoneName(finalName);
      setDoneBytes(out);
      try {
        window.history.pushState({ stage: "done" }, "", window.location.href);
      } catch {
        /* ignore */
      }
      setStage("done");
    } catch (err: any) {
      pushToast("error", `Export failed: ${String(err?.message ?? err).slice(0, 180)}`);
      setStage("editor");
    }
  }, [blocksBySrc, closeInline, dispatch, fileName, getSnapshot, pages.length, pushToast]);
  useEffect(() => {
    handleDownloadRef.current = handleDownload;
  });

  const editAnother = useCallback(() => {
    clearActiveDocument();
    resetAll();
    setStage("upload");
  }, [resetAll]);

  const handleFindReplace = useCallback(
    (find: string, replace: string, opts: { matchCase: boolean; wholeWord: boolean }) => {
      const cur = getSnapshot();
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
    [pages, blocksBySrc, commit, getSnapshot, pushToast]
  );

  const returnToEditor = useCallback(() => {
    if (typeof window !== "undefined" && window.history.state?.stage === "done") {
      window.history.back();
    } else {
      setStage("editor");
    }
  }, []);

  useEffect(() => {
    const onPop = () => {
      if (stage === "done") {
        setStage("editor");
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [stage]);

  const actions: EditPdfActions = {
    ensureBlocks,
    blockClick: (pageKey, block, bgHex, textHex) => {
      setActivePageKey(pageKey);
      setTool("text");
      startEdit(pageKey, block, bgHex, textHex);
    },
    pageClick,
    commitRect,
    commitDraw,
    createAnnot,
    selectOverlay: setSelectedId,
    activatePage: setActivePageKey,
    transientStart: ensureTransient,
    patchOverlay,
    transientEnd: endTransient,
    patchInline,
    moveInline,
    resizeInlineWidth,
    deleteInline,
    duplicateInline: duplicateEditingLine,
    linkInline: (pageKey) => {
      setLinkDraft({ pageKey, rect: { x: 50, y: 50, w: 120, h: 25 } });
    },
    closeInline,
    removeExistingImage,
    replaceExistingImage,
    duplicateOverlay,
    deleteOverlay,
    deletePage: (pageKey) => {
      if (pages.length <= 1) {
        pushToast("error", "A document needs at least one page.");
        return;
      }
      setActivePageKey(pageKey);
      commit((snap) => ({
        ...snap,
        pages: snap.pages.filter((x) => x.key !== pageKey),
        overlays: snap.overlays.filter((o) => o.pageKey !== pageKey),
      }));
    },
    zoomIn,
    zoomOut,
    rotatePage: (pageKey) => {
      setActivePageKey(pageKey);
      commit((snap) => ({
        ...snap,
        pages: snap.pages.map((x) =>
          x.key === pageKey ? { ...x, rotateDelta: (x.rotateDelta + 90) % 360 } : x
        ),
      }));
    },
    insertBlank: (pageKey) => {
      setActivePageKey(pageKey);
      insertBlankAfterActive();
    },
    setTool,
    undo,
    redo,
    fitWidth,
    download: handleDownload,
    openFindReplace: () => setFindReplaceOpen(true),
    deleteActivePage: deletePage,
    rotateActivePage,
    insertBlankAfterActive,
    newImage: () => {
      pendingImagePointRef.current = null;
      pendingReplaceImageRef.current = null;
      imagePickerRef.current?.click();
    },
    newSignature: () => setSignModalOpen(true),
  };

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
            <p className="mt-3 text-[11px] text-muted-foreground">PDF only · up to {formatFileSize(MAX_PDF_FILE_BYTES)} · password-protected files supported</p>
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
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={returnToEditor}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-subtle shadow-xs transition"
          >
            <span>← Back to Editor</span>
          </button>
          <span className="text-xs text-muted-foreground font-medium">All edits and PDF document preserved</span>
        </div>
        <ResultCard
          filename={doneName}
          pdfBytes={doneBytes}
          filesize={doneBytes.byteLength}
          notes="All edits were burned into the PDF on your device. Links, images and annotations preserved."
          downloadButtonLabel="Download Edited PDF"
          onDownload={(customName) => {
            downloadBytes(doneBytes, customName || doneName, "application/pdf");
          }}
          onReset={returnToEditor}
        />
        {warnings.length > 0 && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200" role="status">
            <p className="font-bold">Some edits could not be applied ({warnings.length})</p>
            <ul className="mt-2 space-y-1">
              {warnings.map((w, i) => (
                <li key={i}>• {w.message}</li>
              ))}
            </ul>
            <p className="mt-2 text-[11px]">The PDF was still exported with the remaining edits.</p>
          </div>
        )}
        <div className="mt-4 text-center">
          <button type="button" onClick={editAnother} className="text-xs font-medium text-muted-foreground underline hover:text-foreground">
            Edit another PDF
          </button>
        </div>
        <ToastStack toasts={toasts} />
      </div>
    );
  }

  return (
    <EditPdfActionsProvider value={actions}>
      <div className="pb-16">
        <EditorToolbar />
      {armedSign && (
        <div className="border-b border-border bg-surface px-4 py-1.5 text-center text-[11px] font-medium text-foreground">
          Signature ready — click anywhere on a page to place it.{" "}
          <button type="button" className="underline" onClick={() => setArmedSign(null)}>Cancel</button>
        </div>
      )}

      <div className="mx-auto flex flex-col items-center justify-center w-full px-2 sm:px-4 py-4">
        {/* Pages scroll area centered in the middle */}
        <div
          ref={scrollRef}
          className="min-w-0 w-full max-w-5xl overflow-x-auto overflow-y-auto rounded-2xl border border-border bg-surface-subtle p-3 sm:p-8 max-h-[calc(100vh-140px)] shadow-inner flex flex-col items-center"
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
          <div className="space-y-10 w-full flex flex-col items-center">
            {pages.map((p, idx) => (
              <div key={p.key} className="flex flex-col items-center">
                <PageView page={p} pageNumber={idx + 1} />
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Page {idx + 1}
                  {p.src.kind === "blank" ? " · blank" : ""}
                  {(p.srcRotation + p.rotateDelta) % 360 !== 0 ? ` · ${(p.srcRotation + p.rotateDelta) % 360}°` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Centered black "Apply changes >" button matching EditMyPDF style */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-2 rounded-lg bg-foreground text-background hover:bg-foreground/90 px-6 py-2.5 text-sm font-semibold shadow-xl transition-all transform hover:scale-105 active:scale-95"
        >
          <span>Apply changes</span>
          <span className="font-bold text-base">›</span>
        </button>
      </div>

      <input
        ref={imagePickerRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
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
    </EditPdfActionsProvider>
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
