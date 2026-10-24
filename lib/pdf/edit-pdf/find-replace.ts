/**
 * Find & Replace helpers for the /edit-pdf visual editor.
 *
 * Operates on the editor snapshot:
 *  - existing `edit` / `text` overlays: replace substring in their `.text`
 *  - source text blocks that still match: create an in-place edit overlay
 *    carrying the replaced text (mirrors clicking a block to edit it).
 *
 * Pure function; caller commits the returned snapshot.
 */
import type { EditorSnapshot, EditorPage, TextBlock, Overlay, EditTextOverlay } from "./types";
import { newOverlayId } from "./types";

export interface FindReplaceOptions {
  matchCase: boolean;
  wholeWord: boolean;
}

export interface FindReplaceResult {
  snapshot: EditorSnapshot;
  count: number;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildRegex(find: string, opts: FindReplaceOptions, global = true): RegExp {
  const flags = (opts.matchCase ? "" : "i") + (global ? "g" : "");
  const escaped = escapeRegex(find);
  const pattern = opts.wholeWord ? `\\b${escaped}\\b` : escaped;
  return new RegExp(pattern, flags);
}

function replaceAllInString(text: string, find: string, replace: string, opts: FindReplaceOptions): { text: string; count: number } {
  if (!find) return { text, count: 0 };
  const re = buildRegex(find, opts, true);
  let count = 0;
  const next = text.replace(re, () => {
    count += 1;
    return replace;
  });
  return { text: next, count };
}

export function applyFindReplace(
  snapshot: EditorSnapshot,
  pages: EditorPage[],
  blocksBySrc: Record<number, TextBlock[]>,
  find: string,
  replace: string,
  opts: FindReplaceOptions
): FindReplaceResult {
  if (!find.trim()) return { snapshot, count: 0 };

  let count = 0;
  const overlays: Overlay[] = snapshot.overlays.map((o) => {
    if (o.kind === "edit" || o.kind === "text") {
      const r = replaceAllInString(o.text, find, replace, opts);
      if (r.count > 0) {
        count += r.count;
        return { ...o, text: r.text } as Overlay;
      }
    }
    return o;
  });

  const newOverlays: Overlay[] = [...overlays];

  for (const pg of pages) {
    if (pg.src.kind !== "orig") continue;
    const srcIndex = pg.src.index;
    const blocks = blocksBySrc[srcIndex] || [];
    for (const b of blocks) {
      // Skip blocks already converted to an edit overlay (handled above).
      const hasEdit = newOverlays.some((o) => o.kind === "edit" && (o as any).blockId === b.id);
      if (hasEdit) continue;
      const r = replaceAllInString(b.text, find, replace, opts);
      if (r.count === 0) continue;

      const ov: EditTextOverlay = {
        id: newOverlayId("edit"),
        kind: "edit",
        pageKey: pg.key,
        blockId: b.id,
        text: r.text,
        fontId: b.hasEmbeddedFont && b.embeddedFamily ? `embedded:${b.embeddedFamily}` : b.matchedFontId,
        fontSize: Math.round(b.fontSize * 10) / 10,
        colorHex: b.colorHex || "#000000",
        bold: b.bold,
        italic: b.italic,
        underline: false,
        align: "left",
        x: b.x,
        y: b.y,
        wrapW: Math.max(20, b.boxW),
        rotation: b.rotation,
        lineHeight: b.lineHeight,
        bgHex: "#ffffff",
        saveFontId: b.matchedFontId,
        fallbackNotice: false,
      };
      newOverlays.push(ov);
      count += r.count;
    }
  }

  return { snapshot: { ...snapshot, overlays: newOverlays }, count };
}
