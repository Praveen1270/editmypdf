# EditMyPDF — Product & Business Context

**Site**: https://editmypdf.co.in  
**Repository**: https://github.com/Praveen1270/editmypdf  
**Last Updated**: 2026-10-14  

---

## 1. Product Overview
EditMyPDF is a private, client-side PDF utility suite that runs entirely in the user's web browser using WebAssembly, HTML5 Canvas, Web Workers, PDF.js, and pdf-lib. No document files are ever uploaded to any external server.

- **Primary URL**: `https://editmypdf.co.in` (Source: `app/layout.tsx#L19`)
- **Total Functional Tools**: 22 dedicated client-side tools (Source: `lib/tools-data.ts#L92`)
- **Supported Architecture**: 100% Client-side browser execution, PWA installable, offline-capable (Source: `components/pwa/PwaProvider.tsx`, `app/manifest.ts`)

---

## 2. The Buyer & Ideal Customer Profile (ICP)
1. **Privacy-Constrained Professionals**: Lawyers, paralegals, accountants, CPAs, HR departments, and compliance officers handling confidential contracts, NDAs, employee records, and tax returns who are legally barred from uploading client files to third-party cloud servers.
2. **Healthcare & Financial Workers**: Medical billing staff, clinic administrators, and bank analysts working with HIPAA / GDPR / PCI sensitive records that require local execution.
3. **Remote Knowledge Workers & Freelancers**: Daily digital workers who need fast PDF modifications (merging invoices, editing typo on a proposal, signing a contract) without hitting freemium paywalls or daily upload limits.
4. **Students & Academics**: University students extracting journal pages, rotating scanned notes, compressing research papers, or converting lecture slides to PDF.

---

## 3. Pricing, Plans & Commercial Terms
- **Price**: $0.00 / 100% Free forever (Source: `components/seo/JsonLd.tsx#L29`, `README.md`)
- **Account / Signups**: None. No registration, no email capture, no OAuth required.
- **Paywalls & Quotas**: Zero daily task limits, zero paywalled features, zero watermarks forced on output.
- **File Size Restrictions**: No artificial server limits. Limited only by the client device's browser memory (RAM).

---

## 4. Key Differentiators & Proven Claims
1. **Zero Server Uploads**: Processing happens locally via Web Workers and WASM. Network tab inspectable—no PDF payload ever leaves the device (Source: `README.md`, `app/security/page.tsx`).
2. **In-Place PDF Text Editing with Multi-Font & Script Matching**:
   - Matches standard serif, sans-serif, and monospace typefaces with bundled metrics-compatible fonts (Arimo for Arial/Helvetica, Tinos for Times New Roman, Cousine for Courier, Carlito for Calibri, Caladea for Cambria).
   - Multi-script support including Latin, Devanagari (Hindi), and Telugu (Source: `lib/pdf/edit-pdf/font-matching.ts`, `tests/verify-edit-pdf.mjs`).
3. **Offline & PWA Capability**: Full ServiceWorker cache and web app manifest allow processing files even when disconnected from the internet (Source: `public/sw.js`, `app/manifest.ts`).
4. **Instant Processing Speed**: No network upload queue latency. 100-page documents parse in milliseconds on client hardware.

---

## 5. Tool Catalog (22 Tools)
All tools are defined in `lib/tools-data.ts`:

### Organize & Layout
1. `/merge-pdf` — Combine multiple PDFs in custom order
2. `/split-pdf` — Split PDF into individual pages or page ranges
3. `/organize-pdf` — Reorder, duplicate, rotate, and delete pages visually
4. `/rotate-pdf` — Rotate document pages (90°, 180°, 270°)
5. `/extract-pdf-pages` — Extract specific page ranges into a new PDF or ZIP

### Edit & Annotate
6. `/edit-pdf` — Full visual PDF editor with text block editing, freehand drawing, shapes, and signature stamps
7. `/edit-pdf-text` — In-place text replacement with font family, size, weight, and color matching
8. `/add-text-to-pdf` — Add custom headers, footers, notes, and callouts
9. `/watermark-pdf` — Add text watermarks with custom rotation, opacity, and positioning
10. `/add-page-numbers` — Insert formatted page numbers (Page X of Y, Roman, top/bottom)
11. `/crop-pdf` — Visual and numerical margin trimming
12. `/resize-pdf` — Standardize dimensions to A4, Letter, Legal, or custom sizes
13. `/pdf-metadata-editor` — View, edit, or strip Title, Author, Subject, Keywords, Creator

### Conversion & Optimization
14. `/compress-pdf` — Reduce PDF size with client-side canvas rasterization and stream optimization
15. `/pdf-to-images` — Render PDF pages into JPG or PNG images (single or ZIP archive)
16. `/images-to-pdf` — Convert multiple JPG, PNG, and WebP images into a single PDF
17. `/pdf-to-text` — Extract raw textual content from document streams
18. `/pdf-to-grayscale` — Convert color PDFs to black & white for printing/archiving
19. `/pdf-page-counter` — Instantly count pages and inspect per-page dimensions without upload
20. `/compare-pdfs` — Side-by-side visual diff and extracted text comparison

### Security & Privacy
21. `/protect-pdf` — Client-side AES-256 encryption with password protection
22. `/unlock-pdf` — Decrypt password-protected PDFs locally

---

## 6. Primary Competitors
1. **iLovePDF** (`ilovepdf.com`): Market leader. Uploads files to cloud servers. Imposes 2 free tasks/hour or daily cap, paywalls OCR and advanced editing.
2. **Smallpdf** (`smallpdf.com`): High brand recognition. Server-side processing. Heavy 1-2 free document daily limit, aggressive Pro upgrade prompts ($9-12/mo).
3. **Sejda** (`sejda.com`): Popular browser PDF editor. 3 free tasks per hour limit, 50MB / 200 page ceiling. Files processed on cloud servers.
4. **PDF24 Tools** (`tools.pdf24.org`): Free tool suite. Historically server-based execution (files uploaded to German servers). Dated UI.
5. **DocFly** (`docfly.com`): 3 free export downloads per month, subscription required thereafter.
6. **Adobe Acrobat Online** (`adobe.com/acrobat/online`): Heavy login friction, requires Adobe ID, pushes $19.99/mo Acrobat Pro subscription.
