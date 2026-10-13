/**
 * Safe client-side Blob downloader and memory lifecycle management.
 */

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Clean up references and revoke URL after short delay
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

export function downloadBytes(
  bytes: Uint8Array,
  filename: string,
  mimeType: string = "application/pdf"
): void {
  const blob = new Blob([bytes as unknown as BlobPart], { type: mimeType });
  downloadBlob(blob, filename);
}
