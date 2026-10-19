"use client";

export interface ActiveDocumentState {
  name: string;
  size: number;
  pageCount: number;
  bytes: Uint8Array;
  file?: File;
  timestamp: number;
}

const DB_NAME = "editmypdf_active_store";
const DB_VERSION = 1;
const STORE_NAME = "active_document";
const KEY_NAME = "current_doc";

function openDb(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function persistToIdb(doc: ActiveDocumentState | null): Promise<void> {
  const db = await openDb();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      if (doc) {
        // Store serializable payload
        const record = {
          name: doc.name,
          size: doc.size,
          pageCount: doc.pageCount,
          bytes: doc.bytes,
          timestamp: doc.timestamp,
        };
        store.put(record, KEY_NAME);
      } else {
        store.delete(KEY_NAME);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
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
  void persistToIdb(activeDoc);
  LISTENERS.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore
    }
  });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("editmypdf_active_doc_changed"));
  }
}

export function getActiveDocument(): ActiveDocumentState | null {
  return activeDoc;
}

export async function loadPersistedActiveDocument(): Promise<ActiveDocumentState | null> {
  if (activeDoc) return activeDoc;
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(KEY_NAME);
      req.onsuccess = () => {
        const val = req.result;
        if (val && val.bytes && val.bytes.length > 0) {
          activeDoc = {
            name: val.name,
            size: val.size,
            pageCount: val.pageCount,
            bytes: val.bytes instanceof Uint8Array ? val.bytes : new Uint8Array(val.bytes),
            timestamp: val.timestamp || Date.now(),
          };
          LISTENERS.forEach((l) => {
            try { l(); } catch {}
          });
          resolve(activeDoc);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
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
