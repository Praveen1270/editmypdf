/**
 * Shared types for the /edit-pdf visual editor.
 *
 * Coordinate convention (critical — read before touching geometry):
 * - All geometry is stored in PDF user-space POINTS with origin at the
 *   BOTTOM-LEFT of the *unrotated* page, exactly as pdf.js `getTextContent()`
 *   reports `transform[4], transform[5]` and as pdf-lib `drawText({x, y})`
 *   expects. Page-level /Rotate is applied by the viewer to old and new
 *   content alike, so no manual rotation compensation is needed at save.
 * - Screen mapping uses the pdf.js viewport transform for the current zoom:
 *   see `viewport.ts` (pdfPointToScreen / screenToPdfPoint). This handles
 *   rotated pages and non-zero CropBox/MediaBox origins automatically.
 */

/** Toolbar tool identifiers. `select` is the default pan/select tool. */
export type EditorToolId =
  | "select"
  | "text" // edit existing text in place
  | "addText"
  | "whiteout"
  | "image"
  | "sign"
  | "link"
  | "highlight"
  | "underline"
  | "strike"
  | "draw" // freehand
  | "rect"
  | "ellipse"
  | "line"
  | "arrow"
  | "formText"
  | "formCheck"
  | "formRadio";

/** One editable text block grouped from pdf.js text items (usually 1+ lines). */
export interface TextBlock {
  id: string;
  /** Original 0-indexed page index in the SOURCE document. */
  srcPageIndex: number;
  /** Full block text; lines separated by "\n". */
  text: string;
  /** Baseline origin of the FIRST line (PDF points, bottom-left origin). */
  x: number;
  y: number;
  /** Axis-aligned bbox of the whole block (PDF points). */
  boxX: number;
  boxY: number;
  boxW: number;
  boxH: number;
  /** Raw pdf.js fontName (may carry a subset prefix like "ABCDEF+"). */
  fontName: string;
  fontFamily?: string;
  /** pdf.js loadedName key (e.g. "g_d0_f2") for page.commonObjs lookup. */
  fontKey: string;
  fontSize: number;
  colorHex: string;
  /** Baseline angle in degrees (0 = horizontal). */
  rotation: number;
  bold: boolean;
  italic: boolean;
  /** Per-line strings (for faithful multi-line redraw). */
  lines: string[];
  /** Per-line baselines (x, y) in PDF points. */
  lineBaselines: { x: number; y: number }[];
  /** Line height in points (median inter-baseline distance or 1.2*size). */
  lineHeight: number;
  /** Approximate total advance width in points. */
  width: number;
  /** Approximate per-character advances (even split fallback). */
  charWidths: number[];
  /** True when we harvested usable embedded font bytes for overlay display. */
  hasEmbeddedFont: boolean;
  /** FontFace family registered for this block (embedded subset). */
  embeddedFamily?: string;
  /** Raw embedded font bytes (TTF/OTF only) for save-time embedding. */
  embeddedBytes?: Uint8Array;
  /** Matched bundled font id (see font-matching.ts). */
  matchedFontId: string;
}

/** One rendered page in the EDITOR (after reorder/delete/insert). */
export interface EditorPage {
  /** Stable key; overlays reference this. */
  key: string;
  src: { kind: "orig"; index: number } | { kind: "blank"; width: number; height: number };
  /** User-applied extra rotation (0 | 90 | 180 | 270). */
  rotateDelta: number;
  /** Unrotated page size in PDF points (from pdf.js or blank spec). */
  width: number;
  height: number;
  /** Original /Rotate of the source page (0 for blanks). */
  srcRotation: number;
}

export interface PdfPoint {
  x: number;
  y: number;
}

export interface PdfRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Existing image detected on a page from the PDF content stream. */
export interface PdfExistingImage {
  id: string;
  pageIndex: number;
  rect: PdfRect;
  name?: string;
}


interface OverlayBase {
  id: string;
  /** EditorPage.key this overlay belongs to. */
  pageKey: string;
}

/** In-place edit of an existing TextBlock. */
export interface EditTextOverlay extends OverlayBase {
  kind: "edit";
  blockId: string;
  text: string;
  fontId: string;
  fontSize: number;
  colorHex: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: "left" | "center" | "right";
  /** Baseline origin (PDF points). */
  x: number;
  y: number;
  /** Wrap width (PDF points). Resizable (width only). */
  wrapW: number;
  rotation: number;
  lineHeight: number;
  /** Sampled page background used to cover the original text. */
  bgHex: string;
  /** Bundled/standard font id to use at save if the embedded subset fails. */
  saveFontId: string;
  /** True when the edited text contains glyphs missing from the embedded subset. */
  fallbackNotice: boolean;
}

/** Brand-new text placed by click. */
export interface AddTextOverlay extends OverlayBase {
  kind: "text";
  text: string;
  fontId: string;
  fontSize: number;
  colorHex: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: "left" | "center" | "right";
  x: number;
  y: number;
  wrapW: number;
  rotation: number;
}

export interface WhiteoutOverlay extends OverlayBase {
  kind: "whiteout";
  rect: PdfRect;
  colorHex: string;
}

export interface ImageOverlay extends OverlayBase {
  kind: "image" | "sign";
  /** Data URL (PNG/JPEG) — rotation is baked in before save. */
  dataUrl: string;
  mime: string;
  rect: PdfRect;
}

export interface ShapeOverlay extends OverlayBase {
  kind: "shape";
  shape: "rect" | "ellipse" | "line" | "arrow";
  rect: PdfRect;
  strokeHex: string;
  fillHex: string | null;
  strokeW: number;
}

export interface DrawOverlay extends OverlayBase {
  kind: "draw";
  points: PdfPoint[];
  strokeHex: string;
  strokeW: number;
}

export interface LinkOverlay extends OverlayBase {
  kind: "link";
  rect: PdfRect;
  url: string;
  /** Target editor page key for internal links (else URL). */
  destPageKey: string | null;
}

export interface TextAnnotOverlay extends OverlayBase {
  kind: "annot";
  subtype: "highlight" | "underline" | "strike";
  /** Flat quad points: 8 numbers per quad (x1,y1,...x4,y4) in PDF points. */
  quads: number[];
  colorHex: string;
}

export interface FormOverlay extends OverlayBase {
  kind: "form";
  fieldType: "text" | "check" | "radio";
  rect: PdfRect;
  name: string;
  value: string;
}

export type Overlay =
  | EditTextOverlay
  | AddTextOverlay
  | WhiteoutOverlay
  | ImageOverlay
  | ShapeOverlay
  | DrawOverlay
  | LinkOverlay
  | TextAnnotOverlay
  | FormOverlay;

/** Detected existing AcroForm field (for filling). */
export interface ExistingFormField {
  name: string;
  type: string;
  pageSrcIndex: number;
  value: string;
}

/** Fill applied to an existing AcroForm field. */
export interface FormFill {
  name: string;
  value: string;
}

export interface EditorSnapshot {
  pages: EditorPage[];
  overlays: Overlay[];
  fills: FormFill[];
}

export function isTextOverlay(o: Overlay): o is EditTextOverlay | AddTextOverlay {
  return o.kind === "edit" || o.kind === "text";
}

let overlayCounter = 0;
export function newOverlayId(prefix = "ov"): string {
  overlayCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${overlayCounter}`;
}
