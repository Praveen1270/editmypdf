// Theme storage keys. "pdfkit-theme" is the pre-rename key, kept as a
// read-only legacy fallback; new writes always use "editmypdf-theme".
// The inline theme script in app/layout.tsx must use these same keys.
export type Theme = "light" | "dark";

export const THEME_STORAGE_KEYS = ["editmypdf-theme", "pdfkit-theme"];

export const DEFAULT_THEME: Theme = "light";
