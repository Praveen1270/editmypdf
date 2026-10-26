import { SITE_CONFIG } from "@/lib/site-config";

export interface MarkdownPageData {
  title: string;
  description: string;
  canonicalPath: string; // e.g. "/compress-pdf" or "/"
  lastUpdated?: string; // YYYY-MM-DD
  content: string;
  related?: { title: string; href: string }[];
}

export function toAbsoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_CONFIG.url}${cleanPath}`;
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function formatTable(headers: string[], rows: string[][]): string {
  if (!headers.length || !rows.length) return "";
  const headerLine = `| ${headers.join(" | ")} |`;
  const separatorLine = `| ${headers.map(() => "---").join(" | ")} |`;
  const rowLines = rows.map((r) => `| ${r.join(" | ")} |`).join("\n");
  return `${headerLine}\n${separatorLine}\n${rowLines}`;
}

export function formatList(items: string[], ordered = false): string {
  return items
    .map((item, idx) => (ordered ? `${idx + 1}. ${item}` : `- ${item}`))
    .join("\n");
}

export function buildMarkdownPage(data: MarkdownPageData): string {
  const canonicalUrl = toAbsoluteUrl(data.canonicalPath);
  const updatedDate = data.lastUpdated || "2026-10-26";

  const parts: string[] = [];

  parts.push(`# ${data.title}`);
  parts.push(`\n> ${data.description.replace(/\n+/g, " ").trim()}`);
  parts.push(`\nCanonical: ${canonicalUrl}\nLast updated: ${updatedDate}`);
  parts.push(`\n${data.content.trim()}`);

  if (data.related && data.related.length > 0) {
    const relatedLinks = data.related
      .map((r) => `- [${r.title}](${toAbsoluteUrl(r.href)})`)
      .join("\n");
    parts.push(`\n## Related\n${relatedLinks}`);
  }

  return parts.join("\n") + "\n";
}
