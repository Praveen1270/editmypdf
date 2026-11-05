"use client";

/**
 * Edit-pdf workspace store: one state object + one reducer + React context.
 *
 * Replaces the ~35 useState calls (and the mirrored ref pairs
 * editing/editingRef, inlineValue/inlineValueRef, inlineBg/inlineBgRef,
 * stateRef/transientPreRef/transientDirtyRef) that used to live in
 * EditPdfWorkspace. History (undo/redo) and drag-transaction snapshots are
 * handled atomically inside the reducer, so a commit can never leave
 * past/future and pages/overlays/fills out of sync the way the old
 * setState-updater side effects could.
 *
 * The pdf.js document itself is NOT state (it is a mutable, non-serializable
 * handle): the provider holds it in a ref and exposes get/set accessors, so
 * PageView can render pages without receiving a MutableRefObject<any> prop.
 * Toast/page-key counters live at module level here, not in component state.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
} from "react";
import type {
  EditorPage,
  EditorSnapshot,
  EditorToolId,
  ExistingFormField,
  FormFill,
  Overlay,
  PdfExistingImage,
  PdfPoint,
  PdfRect,
  TextBlock,
} from "@/lib/pdf/edit-pdf/types";
import type { InlineTextValue } from "./TextBlockOverlay";
import type { SavedSignature } from "./SignatureModal";
import type { SaveWarning } from "@/lib/pdf/edit-pdf/save";
import type { PageViewport } from "pdfjs-dist";

export type Stage = "upload" | "password" | "loading" | "editor" | "processing" | "done";

export interface Toast {
  id: number;
  kind: "error" | "info" | "success";
  text: string;
}

/** Minimal structural shape of the pdf.js document PageView renders from. */
export interface PdfJsPage {
  getViewport: (options: { scale: number }) => PageViewport;
  render: (options: {
    canvasContext: CanvasRenderingContext2D;
    viewport: PageViewport;
  }) => { promise: Promise<void> };
  cleanup?: () => unknown;
  view?: unknown;
  rotate?: number;
  commonObjs?: {
    get?: (key: string) => {
      name?: string;
      fallbackName?: string;
      serif?: boolean;
      bold?: boolean;
      italic?: boolean;
      black?: boolean;
      data?: unknown;
    } | null | undefined;
  };
}

export interface PdfJsDocument {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfJsPage>;
  destroy?: () => Promise<void> | void;
}

export interface EditPdfState {
  stage: Stage;
  fileName: string;
  fileSize: number;
  loadProgress: string;
  password: string;
  passwordError: string | null;
  pages: EditorPage[];
  overlays: Overlay[];
  fills: FormFill[];
  blocksBySrc: Record<number, TextBlock[]>;
  blocksLoadingSrc: Record<number, boolean>;
  scannedSrcPages: Record<number, boolean>;
  existingFields: ExistingFormField[];
  existingImagesBySrc: Record<number, PdfExistingImage[]>;
  past: EditorSnapshot[];
  future: EditorSnapshot[];
  transientPre: EditorSnapshot | null;
  transientDirty: boolean;
  tool: EditorToolId;
  selectedId: string | null;
  activePageKey: string | null;
  editing: { pageKey: string; blockId: string } | null;
  inlineValue: InlineTextValue | null;
  inlineBg: string;
  fallbackNotice: boolean;
  zoom: number;
  toasts: Toast[];
  warnings: SaveWarning[];
  processingLabel: string;
  doneBytes: Uint8Array | null;
  doneName: string;
  strokeHex: string;
  fillHex: string | null;
  strokeW: number;
  annotHex: string;
  whiteoutHex: string;
  signModalOpen: boolean;
  armedSign: SavedSignature | null;
  linkDraft: { pageKey: string; rect: PdfRect } | null;
  findReplaceOpen: boolean;
  linkUrl: string;
  linkDest: string;
}

export const initialEditPdfState: EditPdfState = {
  stage: "upload",
  fileName: "",
  fileSize: 0,
  loadProgress: "",
  password: "",
  passwordError: null,
  pages: [],
  overlays: [],
  fills: [],
  blocksBySrc: {},
  blocksLoadingSrc: {},
  scannedSrcPages: {},
  existingFields: [],
  existingImagesBySrc: {},
  past: [],
  future: [],
  transientPre: null,
  transientDirty: false,
  tool: "text",
  selectedId: null,
  activePageKey: null,
  editing: null,
  inlineValue: null,
  inlineBg: "#ffffff",
  fallbackNotice: false,
  zoom: 1.0,
  toasts: [],
  warnings: [],
  processingLabel: "Working…",
  doneBytes: null,
  doneName: "",
  strokeHex: "#1f2937",
  fillHex: null,
  strokeW: 2,
  annotHex: "#ffeb00",
  whiteoutHex: "#ffffff",
  signModalOpen: false,
  armedSign: null,
  linkDraft: null,
  findReplaceOpen: false,
  linkUrl: "",
  linkDest: "",
};

export type EditPdfPatch = {
  [K in keyof EditPdfState]?: EditPdfState[K] | ((prev: EditPdfState[K]) => EditPdfState[K]);
};

export type EditPdfAction =
  | { type: "set"; patch: EditPdfPatch }
  | { type: "commit"; mut: (s: EditorSnapshot) => EditorSnapshot; push?: boolean }
  | { type: "transientStart" }
  | { type: "transientEnd" }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "loadDocument"; snapshot: EditorSnapshot }
  | { type: "resetHistory" }
  | { type: "pushToast"; toast: Toast }
  | { type: "dismissToast"; id: number }
  | { type: "addWarnings"; warnings: SaveWarning[] }
  | { type: "clearWarnings" };

const HISTORY_LIMIT = 60;

function snapshotOf(s: EditPdfState): EditorSnapshot {
  return { pages: s.pages, overlays: s.overlays, fills: s.fills };
}

function applySnapshot(s: EditPdfState, snap: EditorSnapshot): EditPdfState {
  return { ...s, pages: snap.pages, overlays: snap.overlays, fills: snap.fills };
}

export function editPdfReducer(state: EditPdfState, action: EditPdfAction): EditPdfState {
  switch (action.type) {
    case "set": {
      const patch = action.patch as Record<string, unknown>;
      const out: Record<string, unknown> = { ...state };
      let changed = false;
      for (const key of Object.keys(patch)) {
        const value = patch[key];
        if (value === undefined) continue;
        const resolved =
          typeof value === "function" ? (value as (prev: unknown) => unknown)(out[key]) : value;
        if (resolved !== out[key]) {
          out[key] = resolved;
          changed = true;
        }
      }
      return changed ? (out as unknown as EditPdfState) : state;
    }
    case "commit": {
      const cur = snapshotOf(state);
      const next = action.mut(cur);
      if (action.push !== false) {
        return {
          ...applySnapshot(state, next),
          past: [...state.past.slice(-HISTORY_LIMIT + 1), cur],
          future: [],
        };
      }
      return {
        ...applySnapshot(state, next),
        transientDirty: state.transientPre ? true : state.transientDirty,
      };
    }
    case "transientStart": {
      if (state.transientPre) return state;
      return { ...state, transientPre: snapshotOf(state), transientDirty: false };
    }
    case "transientEnd": {
      if (!state.transientPre) return state;
      if (!state.transientDirty) return { ...state, transientPre: null, transientDirty: false };
      return {
        ...state,
        past: [...state.past.slice(-HISTORY_LIMIT + 1), state.transientPre],
        future: [],
        transientPre: null,
        transientDirty: false,
      };
    }
    case "undo": {
      if (state.past.length === 0) return state;
      const prev = state.past[state.past.length - 1];
      return {
        ...applySnapshot(state, prev),
        past: state.past.slice(0, -1),
        future: [snapshotOf(state), ...state.future].slice(0, HISTORY_LIMIT),
        editing: null,
        selectedId: null,
      };
    }
    case "redo": {
      if (state.future.length === 0) return state;
      const [next, ...rest] = state.future;
      return {
        ...applySnapshot(state, next),
        past: [...state.past.slice(-HISTORY_LIMIT + 1), snapshotOf(state)],
        future: rest,
        editing: null,
        selectedId: null,
      };
    }
    case "loadDocument": {
      return {
        ...applySnapshot(state, action.snapshot),
        past: [],
        future: [],
        transientPre: null,
        transientDirty: false,
      };
    }
    case "resetHistory":
      return { ...state, past: [], future: [] };
    case "pushToast":
      return { ...state, toasts: [...state.toasts.slice(-3), action.toast] };
    case "dismissToast":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case "addWarnings":
      return { ...state, warnings: [...state.warnings, ...action.warnings] };
    case "clearWarnings":
      return state.warnings.length === 0 ? state : { ...state, warnings: [] };
    default:
      return state;
  }
}

let toastCounter = 0;
let pageKeyCounter = 0;

export function newPageKey(src: number | "blank"): string {
  pageKeyCounter += 1;
  return `pg-${src}-${pageKeyCounter}`;
}

export interface EditPdfStore {
  state: EditPdfState;
  dispatch: React.Dispatch<EditPdfAction>;
  /** Latest state, synchronously fresh even right after a dispatch. */
  getState: () => EditPdfState;
  getSnapshot: () => EditorSnapshot;
  pushToast: (kind: Toast["kind"], text: string) => void;
  getPdfDoc: () => PdfJsDocument | null;
  setPdfDoc: (doc: PdfJsDocument | null) => void;
}

const EditPdfContext = createContext<EditPdfStore | null>(null);

export function EditPdfProvider({ children }: { children: React.ReactNode }) {
  const [state, baseDispatch] = useReducer(editPdfReducer, initialEditPdfState);
  const latestRef = useRef(state);
  const pdfDocRef = useRef<PdfJsDocument | null>(null);

  const dispatch = useCallback((action: EditPdfAction) => {
    latestRef.current = editPdfReducer(latestRef.current, action);
    baseDispatch(action);
  }, []);

  const getState = useCallback(() => latestRef.current, []);
  const getSnapshot = useCallback(() => snapshotOf(latestRef.current), []);
  const getPdfDoc = useCallback(() => pdfDocRef.current, []);
  const setPdfDoc = useCallback((doc: PdfJsDocument | null) => {
    pdfDocRef.current = doc;
  }, []);

  const pushToast = useCallback(
    (kind: Toast["kind"], text: string) => {
      toastCounter += 1;
      const id = toastCounter;
      dispatch({ type: "pushToast", toast: { id, kind, text } });
      window.setTimeout(() => dispatch({ type: "dismissToast", id }), 4500);
    },
    [dispatch]
  );

  const value = useMemo<EditPdfStore>(
    () => ({ state, dispatch, getState, getSnapshot, pushToast, getPdfDoc, setPdfDoc }),
    [state, dispatch, getState, getSnapshot, pushToast, getPdfDoc, setPdfDoc]
  );

  return <EditPdfContext.Provider value={value}>{children}</EditPdfContext.Provider>;
}

export function useEditPdf(): EditPdfStore {
  const store = useContext(EditPdfContext);
  if (!store) throw new Error("useEditPdf must be used inside <EditPdfProvider>");
  return store;
}

/** Callbacks the workspace owns, consumed by PageView / EditorToolbar via context. */
export interface EditPdfActions {
  ensureBlocks: (srcIndex: number) => void;
  blockClick: (pageKey: string, block: TextBlock, bgHex: string, textHex?: string) => void;
  pageClick: (pageKey: string, pt: PdfPoint) => void;
  commitRect: (pageKey: string, tool: EditorToolId, rect: PdfRect) => void;
  commitDraw: (pageKey: string, points: PdfPoint[]) => void;
  createAnnot: (pageKey: string, subtype: "highlight" | "underline" | "strike", quads: number[]) => void;
  selectOverlay: (id: string | null) => void;
  activatePage: (pageKey: string) => void;
  transientStart: () => void;
  patchOverlay: (id: string, patch: Partial<Overlay>) => void;
  transientEnd: () => void;
  patchInline: (patch: Partial<InlineTextValue>) => void;
  moveInline: (dxPdf: number, dyPdf: number) => void;
  resizeInlineWidth: (dWrapPdf: number) => void;
  deleteInline: () => void;
  duplicateInline: () => void;
  linkInline: (pageKey: string) => void;
  closeInline: () => void;
  removeExistingImage: (pageKey: string, img: PdfExistingImage) => void;
  replaceExistingImage: (pageKey: string, img: PdfExistingImage) => void;
  duplicateOverlay: (id: string) => void;
  deleteOverlay: (id: string) => void;
  deletePage: (pageKey: string) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  rotatePage: (pageKey: string) => void;
  insertBlank: (pageKey: string) => void;
  setTool: (t: EditorToolId) => void;
  undo: () => void;
  redo: () => void;
  fitWidth: () => void;
  download: () => void;
  openFindReplace: () => void;
  deleteActivePage: () => void;
  rotateActivePage: () => void;
  insertBlankAfterActive: () => void;
  newImage: () => void;
  newSignature: () => void;
}

const EditPdfActionsContext = createContext<EditPdfActions | null>(null);

export function EditPdfActionsProvider({
  value,
  children,
}: {
  value: EditPdfActions;
  children: React.ReactNode;
}) {
  return <EditPdfActionsContext.Provider value={value}>{children}</EditPdfActionsContext.Provider>;
}

export function useEditPdfActions(): EditPdfActions {
  const actions = useContext(EditPdfActionsContext);
  if (!actions) throw new Error("useEditPdfActions must be used inside <EditPdfActionsProvider>");
  return actions;
}
