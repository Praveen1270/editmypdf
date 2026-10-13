import { encryptPDF, EncryptPDFOptions, AlreadyEncryptedError } from "@pdfsmaller/pdf-encrypt";
import { decryptPDF, isEncrypted } from "@pdfsmaller/pdf-decrypt";

export interface ProtectOptions {
  algorithm?: "AES-256" | "RC4";
  ownerPassword?: string;
  allowPrinting?: boolean;
  allowModifying?: boolean;
  allowCopying?: boolean;
  allowAnnotating?: boolean;
}

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

/**
 * Encrypt a PDF document locally using standard AES-256 (or RC4).
 * Never transmits password or document over any network.
 */
export async function protectPDF(
  pdfBytes: Uint8Array,
  userPassword: string,
  options?: ProtectOptions
): Promise<Uint8Array> {
  if (!userPassword || userPassword.length === 0) {
    throw new Error("Password cannot be empty.");
  }

  const encryptOpts: EncryptPDFOptions = {
    algorithm: options?.algorithm || "AES-256",
    ownerPassword: options?.ownerPassword || undefined,
    allowPrinting: options?.allowPrinting ?? true,
    allowModifying: options?.allowModifying ?? false,
    allowCopying: options?.allowCopying ?? true,
    allowAnnotating: options?.allowAnnotating ?? true,
  };

  try {
    return await encryptPDF(pdfBytes, userPassword, encryptOpts);
  } catch (err: any) {
    if (err instanceof AlreadyEncryptedError || err?.code === "ALREADY_ENCRYPTED") {
      throw new Error("This PDF is already encrypted with a password. Please unlock it first.");
    }
    throw err;
  }
}

/**
 * Decrypt a password-protected PDF document locally.
 * Throws clean error messages if password is incorrect or document is not encrypted.
 */
export async function unlockPDF(
  pdfBytes: Uint8Array,
  password: string
): Promise<Uint8Array> {
  if (!password) {
    throw new Error("Please enter the document password.");
  }

  const status = await isEncrypted(pdfBytes);
  if (!status.encrypted) {
    throw new Error("This PDF is not password protected.");
  }

  try {
    return await decryptPDF(pdfBytes, password);
  } catch (err: any) {
    const msg = err?.message || "";
    if (msg.includes("Incorrect password") || msg.includes("does not match")) {
      throw new Error("Incorrect password. Please verify and try again.");
    }
    if (msg.includes("Unsupported encryption")) {
      throw new Error("This PDF uses an unsupported encryption variant.");
    }
    throw new Error(msg || "Failed to decrypt PDF. Please check your password.");
  }
}
