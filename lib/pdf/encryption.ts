import { isEncrypted } from "@pdfsmaller/pdf-decrypt";

export interface EncryptionInfo {
  encrypted: boolean;
  algorithm?: "AES-256" | "RC4";
  version?: number;
  revision?: number;
  keyLength?: number;
}

/**
 * Check if a PDF file is encrypted without decrypting it.
 */
export async function checkPdfEncryption(pdfBytes: Uint8Array): Promise<EncryptionInfo> {
  return await isEncrypted(pdfBytes);
}
