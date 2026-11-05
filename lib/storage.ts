export interface RecentFileRecord {
  id: string;
  name: string;
  toolId: string;
  toolName: string;
  timestamp: number;
  size?: number;
  pageCount?: number;
}

const RECENT_FILES_KEY = "editmypdf_recent_files";

// Legacy key from before the brand rename: still read as a migration shim,
// but all writes go to RECENT_FILES_KEY only.
const LEGACY_RECENT_FILES_KEY = "pdfkit_recent_files";

export function isRealFileRecord(record: RecentFileRecord): boolean {
  if (!record || !record.name) return false;
  if (typeof record.size === "number" && record.size > 0) return true;
  if (/\.[a-zA-Z0-9]{2,5}$/.test(record.name.trim())) return true;
  return false;
}

export function getRecentFiles(): RecentFileRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_FILES_KEY) || localStorage.getItem(LEGACY_RECENT_FILES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRealFileRecord);
  } catch {
    return [];
  }
}

export function addRecentFile(file: Omit<RecentFileRecord, "id" | "timestamp">): void {
  if (typeof window === "undefined") return;
  if (!file.name || (!file.size && !/\.[a-zA-Z0-9]{2,5}$/.test(file.name.trim()))) {
    return;
  }
  try {
    const list = getRecentFiles();
    const newEntry: RecentFileRecord = {
      ...file,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };
    const filtered = list.filter((item) => item.name !== file.name || item.toolId !== file.toolId);
    const updated = [newEntry, ...filtered].slice(0, 20);
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("editmypdf_recent_updated"));
  } catch (e) {
    console.warn("Failed to save recent file", e);
  }
}

export function removeRecentFile(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const list = getRecentFiles();
    const updated = list.filter((item) => item.id !== id);
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("editmypdf_recent_updated"));
  } catch (e) {
    console.warn("Failed to remove recent file", e);
  }
}

export function clearRecentFiles(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RECENT_FILES_KEY);
    window.dispatchEvent(new Event("editmypdf_recent_updated"));
  } catch (e) {
    console.warn("Failed to clear recent files", e);
  }
}
