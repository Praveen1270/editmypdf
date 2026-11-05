# EditMyPDF — Privacy-First Browser-Based PDF Tools Suite

<a href="https://findly.tools/editmypdf?utm_source=editmypdf" target="_blank" rel="noopener noreferrer">
  <img src="https://findly.tools/badges/findly-tools-badge-light.svg" alt="Featured on Findly.tools" width="175" height="55" />
</a>
<a href="https://www.tinyshelf.co/?ref=editmypdf.co.in" title="Featured on TinyShelf" target="_blank" rel="noopener noreferrer">
  <img src="https://www.tinyshelf.co/badge/tinyshelf-badge-dark-f4d1216a.svg" alt="Featured on TinyShelf" width="216" height="64" />
</a>

**EditMyPDF** is a modern, lightweight, privacy-first PDF utility website providing 60 tools in one place — 56 standalone routes plus 4 workflow presets (see below). The single source of truth is `lib/tools-data.ts`; counts in this file are derived from it.

## Core Principle: Files Never Leave Your Device

All PDF processing occurs **100% locally in your browser** using WebAssembly, HTML5 Canvas, Web Crypto API, and client-side JavaScript (`pdf-lib`, `pdfjs-dist`, `@pdfsmaller/pdf-encrypt`, `@pdfsmaller/pdf-decrypt`).

- **No Uploads**: Documents are never sent to a server, cloud storage, external API, or third-party processing service.
- **Offline Capable**: All utilities work offline once loaded; WebAssembly workers are self-hosted on origin.
- **No Accounts**: Zero registration, no tracking cookies, no telemetry on documents.
- **Volatile Memory**: Files reside only in temporary browser RAM and are immediately dereferenced for garbage collection upon resetting.
- **Verifiable**: Open browser DevTools Network tab (F12) to verify 0 upload requests.

---

## The 60 PDF Tools

| Tool | Route | Capabilities |
|------|-------|--------------|
| **1. Merge PDF** | `/merge-pdf` | Combine multiple PDF documents into a single organized file with customizable page order. |
| **2. Split PDF** | `/split-pdf` | Extract specific page ranges or split every page into separate individual documents packaged into a convenient ZIP file. |
| **3. Organize PDF Pages** | `/organize-pdf` | Visual PDF page organizer. |
| **4. Rotate PDF** | `/rotate-pdf` | Permanently adjust page rotation by 90°, 180°, or 270°. |
| **5. Extract PDF Pages** | `/extract-pdf-pages` | Extract specific pages from a PDF document into a clean new document or individual files. |
| **6. Compress PDF** | `/compress-pdf` | Reduce PDF document file size with three selectable compression presets while preserving vectors and text. |
| **7. PDF to Images** | `/pdf-to-images` | Convert PDF pages into high-resolution PNG or JPG images with custom scaling. |
| **8. Excel to PDF** | `/excel-to-pdf` | Convert XLSX/XLS spreadsheets to PDF, keeping tables, colours and merged cells approximated. |
| **9. CSV to PDF** | `/csv-to-pdf` | Convert CSV files into a clean, paginated PDF table with detected headers. |
| **10. Markdown to PDF** | `/markdown-to-pdf` | Convert Markdown files or pasted text into a formatted, paginated PDF. |
| **11. HTML to PDF** | `/html-to-pdf` | Convert an uploaded HTML file or pasted code into a PDF with CSS preserved. |
| **12. Word to PDF** | `/word-to-pdf` | Convert DOC and DOCX Word documents to PDF, keeping headings, lists and tables. |
| **13. PDF to Word** | `/pdf-to-word` | Convert a PDF's text into an editable Word document (.docx). |
| **14. eBook to PDF** | `/ebook-to-pdf` | Convert DRM-free EPUB e-books to a paginated PDF. |
| **15. Fingerprint PDF** | `/fingerprint-pdf` | Add invisible per-recipient marks so a leaked copy can be traced to its source. |
| **16. Create PDF** | `/create-pdf` | A writing surface with formatting, images and styles that exports straight to PDF. |
| **17. P2P Share** | `/p2p-share` | Send files directly from one browser to another with no server upload. |
| **18. Collaborative Whiteboard** | `/whiteboard` | A shared drawing canvas: open a link, draw together, no sign-up. |
| **19. Chat with PDF** | `/chat-with-pdf` | Ask questions about your PDFs; answers stream back with page citations. |
| **20. AI PDF Summarizer** | `/ai-summarizer` | Summarize a PDF with quick, bullet or detailed modes using Gemini. |
| **21. PDF to Excel** | `/pdf-to-excel` | Extract tables from a PDF into an Excel workbook. |
| **22. Headers & Footers** | `/headers-footers` | Add custom text, dates and page numbers at the top and bottom of every page. |
| **23. Images to PDF** | `/images-to-pdf` | Convert photos and graphics into a standardized PDF with custom page sizes, orientations, and margins. |
| **24. OCR (Searchable PDF)** | `/ocr-pdf` | Recognise text in scanned PDFs and create a searchable PDF with an invisible text layer, or export plain text. |
| **25. PDF to Text** | `/pdf-to-text` | Extract selectable text from PDF documents. |
| **26. PDF to Grayscale** | `/pdf-to-grayscale` | Convert color PDF documents to clean grayscale. |
| **27. Add Page Numbers** | `/add-page-numbers` | Insert customizable page numbers, templates, positions, and formatting into any PDF with live placement preview. |
| **28. Watermark PDF** | `/watermark-pdf` | Stamp customized text watermarks across document pages with live opacity, rotation, and color control. |
| **29. Edit PDF** | `/edit-pdf` | Full visual PDF editor: click any text to edit it in place with matched fonts, plus whiteout, signatures, images, highlights, links, shapes and form fields. |
| **30. Add Text to PDF** | `/add-text-to-pdf` | Place custom text notes, annotations, dates, or signatures onto specific PDF pages with visual placement controls. |
| **31. Crop PDF** | `/crop-pdf` | Adjust page boundaries and trim unwanted margins using numeric margin controls. |
| **32. Resize PDF Pages** | `/resize-pdf` | Change PDF page dimensions to standard sizes like A4, US Letter, A3, or Legal with automatic content scaling. |
| **33. Protect PDF** | `/protect-pdf` | Encrypt your PDF document locally with a password using industry-standard AES-256 (PDF 2.0 / ISO 32000-2) encryption. |
| **34. Unlock PDF** | `/unlock-pdf` | Remove password protection and encryption from your PDF document using your password. |
| **35. PDF Metadata Editor** | `/pdf-metadata-editor` | Inspect and edit PDF metadata properties including Title, Author, Subject, Keywords, Creator, and Producer. |
| **36. PDF Page Counter** | `/pdf-page-counter` | Inspect page counts, dimensions (pt, mm, in), standard paper sizes, encryption status, and metadata. |
| **37. Compare PDFs** | `/compare-pdfs` | Load two PDF documents locally to compare page counts, file sizes, and text content line-by-line. |
| **38. Flatten PDF** | `/flatten-pdf` | Flatten form fields, annotations and scripts into fixed page content so the PDF can no longer be edited as a form. |
| **39. Redact PDF** | `/redact-pdf` | Permanently remove sensitive text and areas, leaving black boxes. |
| **40. Privacy Risk Scanner** | `/privacy-scan` | Scan for hidden metadata, scripts, attachments and image EXIF, then export a cleaned copy. |
| **41. Invert PDF Colours** | `/invert-pdf` | Create a permanent dark-mode, sepia or grayscale version of your PDF. |
| **42. Repair PDF** | `/repair-pdf` | Recover content from corrupted, truncated or broken PDFs using multiple strategies. |
| **43. Scan to PDF** | `/scan-to-pdf` | Use your camera as a document scanner: capture pages, enhance and export a PDF. |
| **44. PDF to EPUB** | `/pdf-to-epub` | Convert a PDF into an EPUB e-book for Kindle, Kobo and Apple Books. |
| **45. PDF to HTML** | `/pdf-to-html` | Convert a PDF into a single HTML file with positioned or reflowable text. |
| **46. GST Invoice Generator** | `/gst-invoice` | Create GST-compliant tax invoices with CGST/SGST or IGST, then download a PDF with no watermark. |
| **47. POS Billing** | `/pos-billing` | Point-of-sale billing: products, cart, GST receipts and reports, usable offline. |
| **48. LaTeX Resume** | `/latex-resume` | Build an ATS-friendly resume with four typeset templates. |
| **49. Remove PDF Pages** | `/remove-pdf-pages` | Select pages to delete and export the remaining document. |
| **50. Sign PDF** | `/sign-pdf` | Add a visual signature image to a page of your PDF. |
| **51. PDF to Markdown** | `/pdf-to-markdown` | Extract text from a PDF and format it as Markdown with headings. |
| **52. PDF to PowerPoint** | `/pdf-to-powerpoint` | Convert PDF pages into a PowerPoint presentation with extracted text. |
| **53. PowerPoint to PDF** | `/powerpoint-to-pdf` | Convert a PowerPoint presentation to PDF using extracted slide text. |
| **54. PDF Forms** | `/pdf-forms` | Detect and fill interactive form fields, then save the completed document. |
| **55. Translate PDF** | `/translate-pdf` | Extract document text for translation without sending it to a service. |
| **56. Workflows** | `/workflows` | Run common multi-step PDF tasks such as merge then compress. |

### Workflow presets (4)

Multi-step tools that run on `/workflows` with a preset query:

- **Merge & Compress** (`/workflows?preset=merge-compress`) — Combine multiple PDFs in sequence, then losslessly optimize file size in browser RAM.
- **Compress & Protect** (`/workflows?preset=compress-protect`) — Optimize document size and apply AES-256 client-side password protection in one step.
- **Rotate & Add Numbers** (`/workflows?preset=rotate-numbers`) — Permanently rotate all pages and stamp clean sequential page numbers.
- **Flatten & Sanitize** (`/workflows?preset=flatten-sanitize`) — Flatten interactive AcroForms & annotations and scrub personal author metadata for secure public distribution.

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

# Run automated PDF engine test suite (42/42 tests)
npm test

# Generate + verify the /edit-pdf editor matrix (84/84 checks:
# Word, Docs, LaTeX, InDesign, scanned, rotated, 100-page, Telugu/Hindi)
npm run test:edit-pdf

# Build production application (69 page routes)
npm run build

# Start local server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
