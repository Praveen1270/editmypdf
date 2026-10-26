/**
 * Parses HTTP Accept header to determine whether text/markdown has a higher
 * preference (q-value) than text/html.
 *
 * Rules:
 * - Missing Accept or wildcard alone MUST return false (serve HTML).
 * - Only explicit text/markdown (or text/* with explicit higher q) qualifies.
 * - text/markdown must have a higher q than text/html.
 */
export function prefersMarkdown(acceptHeader: string | null | undefined): boolean {
  if (!acceptHeader || !acceptHeader.trim()) {
    return false;
  }

  // Quick check
  if (!acceptHeader.includes("text/markdown") && !acceptHeader.includes("text/*")) {
    return false;
  }

  let markdownQ = 0;
  let htmlQ = 0;
  let wildcardQ = 0;

  const entries = acceptHeader.split(",").map((s) => s.trim());

  for (const entry of entries) {
    const parts = entry.split(";").map((p) => p.trim());
    const mime = parts[0].toLowerCase();
    let q = 1.0;

    for (let i = 1; i < parts.length; i++) {
      if (parts[i].startsWith("q=")) {
        const val = parseFloat(parts[i].slice(2));
        if (!isNaN(val)) q = val;
      }
    }

    if (mime === "text/markdown") {
      markdownQ = Math.max(markdownQ, q);
    } else if (mime === "text/html") {
      htmlQ = Math.max(htmlQ, q);
    } else if (mime === "*/*") {
      wildcardQ = Math.max(wildcardQ, q);
    } else if (mime === "text/*" && markdownQ === 0) {
      // General text/* fallback only if text/markdown was not explicitly set
      markdownQ = Math.max(markdownQ, q);
    }
  }

  // If text/markdown was not specifically requested, do not serve markdown
  if (markdownQ <= 0) {
    return false;
  }

  // If html was not explicitly specified, but wildcard was, assume html matches wildcard
  if (htmlQ === 0 && wildcardQ > 0) {
    htmlQ = wildcardQ;
  }

  return markdownQ > htmlQ;
}
