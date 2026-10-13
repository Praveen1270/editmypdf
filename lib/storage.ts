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
const STARRED_TOOLS_KEY = "editmypdf_starred_tools";

// Default starred tools: popular tools to showcase
export const DEFAULT_STARRED_TOOL_IDS = ["merge", "split", "compress", "protect"];

export function isRealFileRecord(record: RecentFileRecord): boolean {
  if (!record || !record.name) return false;
  // If size is provided, it's a real file
  if (typeof record.size === "number" && record.size > 0) return true;
  // If name has a file extension (e.g., .pdf, .png, .jpg, .docx, .txt, etc.)
  if (/\.[a-zA-Z0-9]{2,5}$/.test(record.name.trim())) return true;
  return false;
}

export function getRecentFiles(): RecentFileRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_FILES_KEY) || localStorage.getItem("pdfkit_recent_files");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Only return actual files, never tools
    return parsed.filter(isRealFileRecord);
  } catch {
    return [];
  }
}

export function addRecentFile(file: Omit<RecentFileRecord, "id" | "timestamp">): void {
  if (typeof window === "undefined") return;
  // Reject entries that aren't actual files
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
    // Keep max 20 recent files, removing older duplicate names
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

export function getStarredToolIds(): string[] {
  if (typeof window === "undefined") return DEFAULT_STARRED_TOOL_IDS;
  try {
    const raw = localStorage.getItem(STARRED_TOOLS_KEY) || localStorage.getItem("pdfkit_starred_tools");
    if (!raw) {
      localStorage.setItem(STARRED_TOOLS_KEY, JSON.stringify(DEFAULT_STARRED_TOOL_IDS));
      return DEFAULT_STARRED_TOOL_IDS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_STARRED_TOOL_IDS;
  } catch {
    return DEFAULT_STARRED_TOOL_IDS;
  }
}

export function toggleStarredToolId(toolId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getStarredToolIds();
    let updated: string[];
    const isNowStarred = !current.includes(toolId);
    if (isNowStarred) {
      updated = [...current, toolId];
    } else {
      updated = current.filter((id) => id !== toolId);
    }
    localStorage.setItem(STARRED_TOOLS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("editmypdf_starred_updated"));
    return isNowStarred;
  } catch {
    return false;
  }
}

export function isToolStarred(toolId: string): boolean {
  return getStarredToolIds().includes(toolId);
}
