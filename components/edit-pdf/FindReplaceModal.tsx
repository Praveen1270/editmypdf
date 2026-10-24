"use client";

import React, { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

export interface FindReplaceOptions {
  matchCase: boolean;
  wholeWord: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (find: string, replace: string, opts: FindReplaceOptions) => void;
}

export function FindReplaceModal({ open, onClose, onApply }: Props) {
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);

  useEffect(() => {
    if (!open) {
      setFind("");
      setReplace("");
      setMatchCase(false);
      setWholeWord(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Find and replace"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-paper-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Find &amp; Replace</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="mt-3 block text-[11px] font-medium text-muted-foreground">
          Find
          <input
            autoFocus
            value={find}
            onChange={(e) => setFind(e.target.value)}
            placeholder="Text to find"
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </label>

        <label className="mt-3 block text-[11px] font-medium text-muted-foreground">
          Replace with
          <input
            value={replace}
            onChange={(e) => setReplace(e.target.value)}
            placeholder="Replacement text"
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </label>

        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} />
            Match case
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={wholeWord} onChange={(e) => setWholeWord(e.target.checked)} />
            Whole word
          </label>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!find.trim()}
            onClick={() => onApply(find, replace, { matchCase, wholeWord })}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-foreground py-2 text-xs font-semibold text-background disabled:opacity-40"
          >
            <Search className="h-3.5 w-3.5" />
            Replace all
          </button>
        </div>
      </div>
    </div>
  );
}
