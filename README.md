# EditMyPDF — Privacy-First Browser-Based PDF Tools Suite

**EditMyPDF** is a modern, lightweight, privacy-first PDF utility website providing 21 useful tools in one place.

## Core Principle: Files Never Leave Your Device

All PDF processing occurs **100% locally in your browser** using WebAssembly, HTML5 Canvas, Web Crypto API, and client-side JavaScript (`pdf-lib`, `pdfjs-dist`, `@pdfsmaller/pdf-encrypt`, `@pdfsmaller/pdf-decrypt`).

- **No Uploads**: Documents are never sent to a server, cloud storage, external API, or third-party processing service.
- **Offline Capable**: All utilities work offline once loaded; WebAssembly workers are self-hosted on origin.
- **No Accounts**: Zero registration, no tracking cookies, no telemetry on documents.
- **Volatile Memory**: Files reside only in temporary browser RAM and are immediately dereferenced for garbage collection upon resetting.
- **Verifiable**: Open browser DevTools Network tab (F12) to verify 0 upload requests.

---

## The 21 PDF Tools

| Tool | Route | Capabilities |
|------|-------|--------------|
| **1. Edit PDF Text** *(Flagship)* | `/edit-pdf-text` | Click and edit existing text directly on the page while matching original typography, sizing, and layout. |
| **2. Merge PDF** | `/merge-pdf` | Combine multiple PDF files into one with custom page order and reordering controls. |
| **3. Split PDF** | `/split-pdf` | Extract custom page ranges (`1-3, 5`), extract to a single PDF, or split all pages into a ZIP archive. |
| **4. Organize PDF Pages** | `/organize-pdf` | Visual thumbnail grid to reorder, duplicate, delete, and rotate individual pages. |
| **5. Rotate PDF** | `/rotate-pdf` | Permanently rotate individual or all pages (90°, 180°, 270°) with live thumbnail previews. |
| **6. Extract PDF Pages** | `/extract-pdf-pages` | Select specific pages visually or via ranges and export as a single PDF or multi-file ZIP. |
| **7. Compress PDF** | `/compress-pdf` | Reduce PDF size with 3 presets (Low, Recommended, High) and honest byte reduction reporting. |
| **8. PDF to Images** | `/pdf-to-images` | Convert PDF pages into PNG or JPG with selectable resolution (72 to 150 DPI) and ZIP export. |
| **9. Images to PDF** | `/images-to-pdf` | Convert JPG, PNG, and WebP images to standardized PDF (A4, Letter, Fit-to-image) with margins. |
| **10. PDF to Text** | `/pdf-to-text` | Extract digital text content streams with word and character statistics; copy or export `.txt`. |
| **11. PDF to Grayscale** | `/pdf-to-grayscale` | Convert color documents to monochrome grayscale via luminance filtering (`0.299R + 0.587G + 0.114B`). |
| **12. Add Page Numbers** | `/add-page-numbers` | Add page numbering with customizable placement (top/bottom, left/center/right), templates, and cover skip. |
| **13. Watermark PDF** | `/watermark-pdf` | Apply custom text watermarks with opacity, rotation, color, and presets (diagonal, center, footer). |
| **14. Add Text to PDF** | `/add-text-to-pdf` | Place text notes, headers, footers, or annotations on all or specific pages with coordinate controls. |
| **15. Crop PDF** | `/crop-pdf` | Trim margins via point inputs (Top, Bottom, Left, Right) adjusting compliant ISO 32000 `CropBox` boundaries. |
| **16. Resize PDF Pages** | `/resize-pdf` | Change page dimensions to A4, US Letter, US Legal, A3, or custom dimensions with proportional scaling. |
| **17. Protect PDF** | `/protect-pdf` | Encrypt PDF files locally using industry-standard **AES-256** (PDF 2.0 / ISO 32000-2). |
| **18. Unlock PDF** | `/unlock-pdf` | Remove supported password protection and export decrypted PDF without cloud transmission. |
| **19. PDF Metadata Editor** | `/pdf-metadata-editor` | View and edit Title, Author, Subject, Keywords, Creator, Producer. Strip all metadata to sanitize. |
| **20. PDF Page Counter** | `/pdf-page-counter` | Inspect page count, dimensions (points, mm, inches), format detection, and export plain-text audit report. |
| **21. Compare PDFs** | `/compare-pdfs` | Side-by-side comparison of two PDFs; computes line-by-line diff, added/removed counts, and page metrics. |

---

## Informational & Legal Pages

- **Privacy Policy**: `/privacy-policy` (Client-side execution, memory lifecycle, GDPR/CCPA disclosures)
- **Terms of Service**: `/terms` (Acceptable use, ownership, liability boundaries)
- **Contact & Support**: `/contact` (Troubleshooting guidance, client-side FAQ, and GitHub issue tracker)
- **Output Disclaimer**: `/disclaimer` (PDF version variability, OCR requirements, verification advisory)
- **Cookie & Storage Policy**: `/cookie-policy` (Zero tracking cookies, volatile RAM disclosures)
- **FAQ**: `/faq` (Searchable accordion covering privacy, limits, encryption, compatibility)
- **How It Works**: `/how-it-works` (Architecture breakdown and DevTools verification instructions)
- **Security Architecture**: `/security` (AES-256 Web Crypto standards, memory wiping, dependency governance)
- **Accessibility Statement**: `/accessibility` (WCAG 2.1 AA conformance, keyboard navigation)
- **Dynamic XML Sitemap & Robots**: `/sitemap.xml`, `/robots.txt`

---

## Technology Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS (Apple-minimalist design aesthetic)
- **PDF Engines**:
  - `pdf-lib`: Document generation, page manipulation, stream assembly, CropBox adjustments
  - `pdfjs-dist`: Client-side rendering, text content parsing, thumbnail generation with self-hosted worker
  - `@pdfsmaller/pdf-encrypt` & `@pdfsmaller/pdf-decrypt`: Web Crypto API-powered AES-256 encryption & decryption
  - `jszip`: In-browser ZIP bundling for multi-file exports
- **Icons**: `lucide-react`

---

## Development & Testing

```bash
# Install dependencies
npm install

# Run automated PDF engine test suite (34/34 tests)
npm test

# Build production application (37 pre-rendered static routes)
npm run build

# Start local server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
