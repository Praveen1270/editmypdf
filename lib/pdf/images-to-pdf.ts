import { PDFDocument } from "pdf-lib";

export interface ImageSourceItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl: string;
}

export type PageSizeOption = "fit" | "a4" | "letter";
export type OrientationOption = "auto" | "portrait" | "landscape";
export type MarginOption = "none" | "small" | "normal";
export type ImageFitOption = "contain" | "cover";

export interface ImagesToPdfOptions {
  pageSize: PageSizeOption;
  orientation: OrientationOption;
  margin: MarginOption;
  fit: ImageFitOption;
}

const MARGIN_VALUES: Record<MarginOption, number> = {
  none: 0,
  small: 20,
  normal: 40,
};

const STANDARD_PAGE_SIZES = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
};

/**
 * Converts any browser image (like WebP) into PNG Uint8Array via HTML Canvas.
 */
async function convertFileToPngBytes(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Unable to create canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Image conversion failed"));
          return;
        }
        blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load image "${file.name}"`));
    };
    img.src = objectUrl;
  });
}

export async function convertImagesToPdf(
  images: ImageSourceItem[],
  options: ImagesToPdfOptions,
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  if (images.length === 0) {
    throw new Error("Please add at least one image to create a PDF.");
  }

  const pdfDoc = await PDFDocument.create();
  const marginPt = MARGIN_VALUES[options.margin];

  for (let i = 0; i < images.length; i++) {
    const item = images[i];
    onProgress?.(i + 1, images.length);

    let embeddedImage;
    const arrayBuffer = await item.file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    if (item.type === "image/jpeg" || item.type === "image/jpg") {
      embeddedImage = await pdfDoc.embedJpg(uint8);
    } else if (item.type === "image/png") {
      embeddedImage = await pdfDoc.embedPng(uint8);
    } else {
      // WebP, GIF, BMP, etc. -> convert to PNG via Canvas
      const pngBytes = await convertFileToPngBytes(item.file);
      embeddedImage = await pdfDoc.embedPng(pngBytes);
    }

    const imgNaturalW = embeddedImage.width;
    const imgNaturalH = embeddedImage.height;

    let targetPageW: number;
    let targetPageH: number;

    if (options.pageSize === "fit") {
      targetPageW = imgNaturalW + marginPt * 2;
      targetPageH = imgNaturalH + marginPt * 2;
    } else {
      const base = STANDARD_PAGE_SIZES[options.pageSize];
      targetPageW = base.width;
      targetPageH = base.height;

      // Orientation adjustment
      if (options.orientation === "landscape") {
        if (targetPageW < targetPageH) {
          [targetPageW, targetPageH] = [targetPageH, targetPageW];
        }
      } else if (options.orientation === "portrait") {
        if (targetPageW > targetPageH) {
          [targetPageW, targetPageH] = [targetPageH, targetPageW];
        }
      } else {
        // Auto orientation: match image aspect ratio
        const imgIsLandscape = imgNaturalW > imgNaturalH;
        if (imgIsLandscape && targetPageW < targetPageH) {
          [targetPageW, targetPageH] = [targetPageH, targetPageW];
        } else if (!imgIsLandscape && targetPageW > targetPageH) {
          [targetPageW, targetPageH] = [targetPageH, targetPageW];
        }
      }
    }

    const page = pdfDoc.addPage([targetPageW, targetPageH]);

    const printableW = targetPageW - marginPt * 2;
    const printableH = targetPageH - marginPt * 2;

    let drawW: number;
    let drawH: number;

    if (options.fit === "contain" || options.pageSize === "fit") {
      const scale = Math.min(printableW / imgNaturalW, printableH / imgNaturalH);
      drawW = imgNaturalW * scale;
      drawH = imgNaturalH * scale;
    } else {
      // cover
      const scale = Math.max(printableW / imgNaturalW, printableH / imgNaturalH);
      drawW = imgNaturalW * scale;
      drawH = imgNaturalH * scale;
    }

    const drawX = marginPt + (printableW - drawW) / 2;
    const drawY = marginPt + (printableH - drawH) / 2;

    page.drawImage(embeddedImage, {
      x: drawX,
      y: drawY,
      width: drawW,
      height: drawH,
    });
  }

  return await pdfDoc.save();
}
