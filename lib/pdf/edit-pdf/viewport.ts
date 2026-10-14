/**
 * Viewport math: convert between PDF user-space points (bottom-left origin,
 * unrotated — the space pdf.js textContent and pdf-lib drawing share) and
 * on-screen CSS pixels for a pdf.js viewport at the current zoom.
 *
 * Using `viewport.transform` keeps rotated pages and non-zero
 * CropBox/MediaBox origins exact without special-casing.
 */

export interface ViewportLike {
  width: number;
  height: number;
  /** pdf.js 2D affine transform [a, b, c, d, e, f]. */
  transform: number[];
}

export function pdfPointToScreen(
  viewport: ViewportLike,
  x: number,
  y: number
): { sx: number; sy: number } {
  const t = viewport.transform;
  return {
    sx: t[0] * x + t[2] * y + t[4],
    sy: t[1] * x + t[3] * y + t[5],
  };
}

/** Inverse of pdfPointToScreen. Returns null for a degenerate transform. */
export function screenToPdfPoint(
  viewport: ViewportLike,
  sx: number,
  sy: number
): { x: number; y: number } | null {
  const t = viewport.transform;
  const [a, b, c, d, e, f] = t;
  const det = a * d - b * c;
  if (Math.abs(det) < 1e-9) return null;
  const dx = sx - e;
  const dy = sy - f;
  return {
    x: (d * dx - c * dy) / det,
    y: (-b * dx + a * dy) / det,
  };
}

/** Screen-space scale factor (CSS px per PDF point) along the x axis. */
export function screenScale(viewport: ViewportLike): number {
  const t = viewport.transform;
  return Math.hypot(t[0], t[1]);
}

/**
 * Rotation (degrees) of the viewport x-axis relative to PDF user space.
 * Used to orient overlay boxes so they sit exactly over rotated text/pages.
 */
export function viewportRotationDeg(viewport: ViewportLike): number {
  const t = viewport.transform;
  return (Math.atan2(t[1], t[0]) * 180) / Math.PI;
}
