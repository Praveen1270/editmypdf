"use client";

export interface ActiveDocumentState {
  name: string;
  size: number;
  pageCount: number;
  bytes: Uint8Array;
  file?: File;
  timestamp: number;
}

let activeDoc: ActiveDocumentState | null = null;
const LISTENERS = new Set<() => void>();

export function setActiveDocument(doc: Omit<ActiveDocumentState, "timestamp"> | null) {
  if (doc) {
    activeDoc = {
      ...doc,
      timestamp: Date.now(),
    };
  } else {
    activeDoc = null;
  }
  LISTENERS.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore listener error
    }
  });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("editmypdf_active_doc_changed"));
  }
}

export function getActiveDocument(): ActiveDocumentState | null {
  return activeDoc;
}

export function clearActiveDocument() {
  setActiveDocument(null);
}

export function subscribeActiveDocument(listener: () => void): () => void {
  LISTENERS.add(listener);
  return () => {
    LISTENERS.delete(listener);
  };
}
