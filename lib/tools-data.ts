// ---------------------------------------------------------------------------
// Single source of truth for every PDF tool / workflow on EditMyPDF.
//
// A "tool" is one entry here. The marketed count is TOOL_COUNT (entries,
// including the 4 workflow presets); ROUTE_TOOL_COUNT counts only entries
// with a real route (presets are query variants of /workflows).
//
// Everything else is derived from this file — never re-typed elsewhere:
// routes (slug), sitemap, llms.txt, SEO titles, home-page lists, related
// tools, the markdown registry, and the ToolContent guides.
//
// Rules for adding a tool:
//   1. Add one entry below (id, slug, name, description, categoryId, icon,
//      keywords, steps, features, limitations, faq). `href` is DERIVED from
//      `slug` (or `preset`) — never authored here.
//   2. Add the route directory `app/<slug>/` (slug != id in 23 cases — the
//      registry is the only place that maps one to the other).
//   3. Counts, sitemap, llms.txt, SEO and the home page pick it up
//      automatically. Nothing else needs a hard-coded copy.
// ---------------------------------------------------------------------------

export type ToolCategoryId =
  | "workflows"
  | "organize"
  | "optimize"
  | "convert"
  | "edit"
  | "security"
  | "intelligence";

/** One of the 8 master categories (the only category system). */
export interface CategoryDef {
  id: ToolCategoryId | "all";
  name: string;
  description: string;
}

export const CATEGORIES: CategoryDef[] = [
  { id: "all", name: "All Tools", description: "Complete browser-based PDF toolkit" },
  { id: "workflows", name: "Workflows", description: "Chained multi-step automated operations" },
  { id: "organize", name: "Organize PDF", description: "Merge, split, reorder, rotate, remove, and extract pages" },
  { id: "optimize", name: "Optimize PDF", description: "Compress, repair, OCR, and streamline PDF files" },
  { id: "convert", name: "Convert PDF", description: "Convert between PDF, Office, images, HTML, and Markdown" },
  { id: "edit", name: "Edit PDF", description: "Edit text, annotate, watermark, crop, and fill PDF forms" },
  { id: "security", name: "PDF Security", description: "Protect, unlock, sign, redact, and compare documents" },
  { id: "intelligence", name: "PDF Intelligence", description: "AI summarizer, document translator, and smart extraction" },
];

export interface ToolItem {
  /** Stable id used by layouts, ToolPageLayout and the markdown registry. */
  id: string;
  /** Route segment. Kept distinct from `id` where the URL differs (23 tools). */
  slug: string;
  /**
   * Derived from `slug` (`/${slug}`) — or `/workflows?preset=<preset>` for
   * workflow presets. Never authored; see `getToolHref` / `PDF_TOOLS` below.
   */
  href: string;
  /** Workflow preset id (e.g. "merge-compress"). Only set on preset entries. */
  preset?: string;
  name: string;
  description: string;
  categoryId: ToolCategoryId;
  /** lucide icon name, resolved by the caller's icon map. */
  icon: string;
  keywords: string[];
  steps: { title: string; desc: string }[];
  features: string[];
  limitations: string[];
  faq: { q: string; a: string }[];
  /** Query-first SEO title ("<query> - <benefit>"). Falls back in lib/seo.ts when absent. */
  seoTitle?: string;
  // --- Merged from the old lib/tool-content.ts (single copy lives here) ---
  /** Display title for the ToolContent guide (old TOOL_CONTENT title). */
  guideTitle?: string;
  /** Long-form intro shown by ToolContent / markdown tool pages. */
  intro?: string;
  /** Plain-language how-to steps (old TOOL_CONTENT steps) for ToolContent. */
  guideSteps?: string[];
  tips?: string[];
  notes?: string[];
  privacy?: string;
  valueProp?: string;
}

/** Canonical href for a tool: real route, or the /workflows preset URL. */
export function getToolHref(tool: Pick<ToolItem, "slug" | "preset">): string {
  return tool.preset ? `/workflows?preset=${tool.preset}` : `/${tool.slug}`;
}

/** True when the entry has its own route (workflow presets do not). */
export function isRealToolRoute(tool: Pick<ToolItem, "preset">): boolean {
  return !tool.preset;
}

/** The popular-tools list, as ids in display order (single copy). */
export const POPULAR_TOOL_IDS: string[] = [
  "merge",
  "split",
  "compress",
  "edit-pdf",
  "pdf-to-word",
  "word-to-pdf",
  "images-to-pdf",
  "pdf-to-images",
  "sign-pdf",
  "protect",
  "unlock",
  "ocr",
  "remove-pages",
  "rotate",
  "pdf-to-markdown",
  "workflows",
];

// Authored entries: everything except the derived `href`.
const TOOL_ENTRIES: Omit<ToolItem, "href">[] = [
  {
    id: "workflow-merge-compress",
    name: "Merge & Compress",
    slug: "workflows",
    preset: "merge-compress",
    categoryId: "workflows",
    description: "Combine multiple PDFs in sequence, then losslessly optimize file size in browser RAM.",
    icon: "Layers",
    keywords: ["workflow", "merge compress", "combine optimize", "pipeline"],
    steps: [{ title: "Upload", desc: "Select 2 or more PDFs." }, { title: "Run", desc: "Merge and compress in memory." }, { title: "Download", desc: "Save optimized single PDF." }],
    features: ["Zero upload memory execution", "Sequential merge", "Stream compression"],
    limitations: ["Requires 2 or more input PDFs"],
    faq: [{ q: "Are files uploaded?", a: "No, everything runs in your local browser RAM." }],
  },
  {
    id: "workflow-compress-protect",
    name: "Compress & Protect",
    slug: "workflows",
    preset: "compress-protect",
    categoryId: "workflows",
    description: "Optimize document size and apply AES-256 client-side password protection in one step.",
    icon: "Lock",
    keywords: ["workflow", "compress protect", "encrypt compress", "secure pdf"],
    steps: [{ title: "Upload", desc: "Select PDF to optimize." }, { title: "Password", desc: "Enter encryption password." }, { title: "Run", desc: "Compress and encrypt." }],
    features: ["AES-256 encryption", "Stream compression", "Private and instant"],
    limitations: ["Remember your password; passwords cannot be recovered."],
    faq: [{ q: "What encryption is used?", a: "Native Web Crypto standard AES-256." }],
  },
  {
    id: "workflow-rotate-numbers",
    name: "Rotate & Add Numbers",
    slug: "workflows",
    preset: "rotate-numbers",
    categoryId: "workflows",
    description: "Permanently rotate all pages and stamp clean sequential page numbers.",
    icon: "RotateCw",
    keywords: ["workflow", "rotate number", "page numbers", "orientation"],
    steps: [{ title: "Upload", desc: "Select PDF document." }, { title: "Configure", desc: "Choose angle and placement." }, { title: "Run", desc: "Rotate and number pages." }],
    features: ["Multi-angle rotation", "Sequential page numbers", "Custom placement"],
    limitations: ["Applies uniform rotation across document"],
    faq: [{ q: "Can I choose number placement?", a: "Yes, bottom center or bottom right." }],
  },
  {
    id: "workflow-flatten-sanitize",
    name: "Flatten & Sanitize",
    slug: "workflows",
    preset: "flatten-sanitize",
    categoryId: "workflows",
    description: "Flatten interactive AcroForms & annotations and scrub personal author metadata for secure public distribution.",
    icon: "Shield",
    keywords: ["workflow", "flatten sanitize", "metadata scrub", "secure sharing"],
    steps: [{ title: "Upload", desc: "Select PDF document." }, { title: "Run", desc: "Flatten forms and scrub metadata." }, { title: "Download", desc: "Save clean confidential PDF." }],
    features: ["Form field flattening", "Metadata scrubbing", "Print-ready output"],
    limitations: ["Flattened forms can no longer be edited interactively"],
    faq: [{ q: "What metadata is removed?", a: "Title, author, subject, creator, and producer tags." }],
  },
  {
    id: "merge",
    name: "Merge PDF",
    seoTitle: "Merge PDF Files Online - Free & Private",
    slug: "merge-pdf",
    categoryId: "organize",
    description: "Combine multiple PDF documents into a single organized file with customizable page order. Processed locally in your browser.",
    icon: "Files",
    keywords: ["merge", "combine", "join", "pdf", "concatenate", "unite"],
    steps: [
      { title: "Select Files", desc: "Choose or drag and drop 2 or more PDF documents into the upload area." },
      { title: "Arrange Order", desc: "Use the up and down arrow buttons to arrange documents in your exact sequence." },
      { title: "Merge & Download", desc: "Click Merge PDFs to combine pages instantly and download your single PDF." },
    ],
    features: [
      "Merge unlimited PDF documents",
      "Interactive page-count and file-size preview",
      "Reorder files before merging",
      "Preserves original document formatting and outlines",
    ],
    limitations: [
      "Encrypted PDFs must be unlocked with their password before merging.",
      "Extremely large files (>500MB) depend on available system RAM.",
    ],
    faq: [
      { q: "Is there a limit on how many files I can merge?", a: "No arbitrary software limits. Since processing happens inside your browser RAM, you can merge as many files as your device memory allows." },
      { q: "Are my uploaded PDFs sent to any server?", a: "Never. All merging happens directly in your browser using WebAssembly. Files never leave your computer." },
    ],
  },
  {
    id: "split",
    name: "Split PDF",
    seoTitle: "Split PDF Online - Free & Private",
    slug: "split-pdf",
    categoryId: "organize",
    description: "Extract specific page ranges or split every page into separate individual documents packaged into a convenient ZIP file.",
    icon: "Scissors",
    keywords: ["split", "extract", "separate", "ranges", "pages", "divide"],
    steps: [
      { title: "Upload PDF", desc: "Select or drop the document you wish to divide." },
      { title: "Choose Split Mode", desc: "Select between extracting a page range or splitting all pages into separate files." },
      { title: "Download", desc: "Click Split PDF to generate a new PDF or download a ZIP archive containing all pages." },
    ],
    features: [
      "Custom page range parsing (e.g. 1-3, 5, 8-10)",
      "Extract selected pages into a single combined PDF",
      "Export all pages as separate PDFs inside a ZIP archive",
      "Real-time page count and range validation",
    ],
    limitations: [
      "Password-protected files must be unlocked prior to splitting.",
    ],
    faq: [
      { q: "How do I format page ranges?", a: "You can enter individual pages and ranges separated by commas, such as '1-3, 5, 8-10'." },
      { q: "Does splitting reduce document quality?", a: "No. Splitting extracts original page streams losslessly without rasterizing or recompressing." },
    ],
  },
  {
    id: "organize",
    name: "Organize PDF Pages",
    seoTitle: "Organize PDF Pages - Reorder & Rotate",
    slug: "organize-pdf",
    categoryId: "organize",
    description: "Visual PDF page organizer. View page thumbnails, reorder page sequence, duplicate pages, or delete unwanted pages.",
    icon: "LayoutGrid",
    keywords: ["organize", "reorder", "delete pages", "duplicate pages", "rearrange", "sort"],
    steps: [
      { title: "Upload Document", desc: "Drop your PDF into the organizer to load high-resolution visual thumbnails." },
      { title: "Rearrange Pages", desc: "Drag or use arrow controls to reorder pages. Duplicate or delete pages as needed." },
      { title: "Save Document", desc: "Click Save Organized PDF to compile and download your updated document." },
    ],
    features: [
      "High-resolution interactive page thumbnails",
      "Reorder pages with intuitive controls",
      "Duplicate pages with a single click",
      "Delete unwanted pages",
      "Individual page rotation",
    ],
    limitations: [
      "Documents with hundreds of pages may take a few seconds to render initial canvas thumbnails.",
    ],
    faq: [
      { q: "Can I undo page deletions?", a: "Yes, you can reset the organizer at any time prior to downloading the finished file." },
      { q: "Does reordering alter page links or bookmarks?", a: "Page contents and annotations are preserved; page numbering adjusts according to the new sequence." },
    ],
  },
  {
    id: "rotate",
    name: "Rotate PDF",
    seoTitle: "Rotate PDF Online - Free & Instant",
    slug: "rotate-pdf",
    categoryId: "organize",
    description: "Permanently adjust page rotation by 90°, 180°, or 270°. Select individual pages or rotate all pages at once with live thumbnail previews.",
    icon: "RotateCw",
    keywords: ["rotate", "turn", "orientation", "landscape", "portrait", "flip"],
    steps: [
      { title: "Select PDF", desc: "Drop the PDF whose pages need orientation adjustments." },
      { title: "Rotate Pages", desc: "Rotate all pages simultaneously or click individual thumbnails to turn them 90° clockwise." },
      { title: "Download", desc: "Download the permanently rotated PDF file." },
    ],
    features: [
      "Rotate clockwise (90°), counter-clockwise (-90°), or upside-down (180°)",
      "Batch rotate selected pages or entire document",
      "Interactive visual previews showing current angles",
      "Lossless rotation without re-encoding page contents",
    ],
    limitations: [
      "Rotates page viewing orientation metadata according to PDF ISO 32000 specifications.",
    ],
    faq: [
      { q: "Is rotation permanent?", a: "Yes. When you download the output, the rotation metadata is written directly into the PDF structure so it opens correctly in any PDF viewer." },
      { q: "Will rotating decrease document sharpness?", a: "No, rotation is 100% lossless vector orientation." },
    ],
  },
  {
    id: "extract",
    name: "Extract PDF Pages",
    seoTitle: "Extract PDF Pages - Save Specific Pages",
    slug: "extract-pdf-pages",
    categoryId: "organize",
    description: "Extract specific pages from a PDF document into a clean new document or individual files. Select pages visually or by range.",
    icon: "FolderOutput",
    keywords: ["extract", "pick pages", "select pages", "separate", "save pages"],
    steps: [
      { title: "Upload PDF", desc: "Drop the document from which you want to extract pages." },
      { title: "Select Pages", desc: "Click page thumbnails or enter ranges (e.g. 1, 3-5) to choose pages." },
      { title: "Extract & Save", desc: "Click Extract Pages to generate your new document." },
    ],
    features: [
      "Visual checkbox selection on live page thumbnails",
      "Select All / Deselect All shortcuts",
      "Extract to a single PDF or separate files in a ZIP archive",
      "Lossless extraction preserving text and vector graphics",
    ],
    limitations: [
      "Must select at least one page to extract.",
    ],
    faq: [
      { q: "What is the difference between Split and Extract?", a: "Split focuses on dividing documents into sections or individual pages; Extract provides visual thumbnail selection to cherry-pick pages into a new file." },
      { q: "Are original files affected?", a: "No, extraction generates a brand-new file. Your original file remains untouched." },
    ],
  },
  {
    id: "compress",
    name: "Compress PDF",
    seoTitle: "Compress PDF Online - Reduce File Size Free",
    slug: "compress-pdf",
    categoryId: "optimize",
    description: "Reduce PDF document file size with three selectable compression presets while preserving vectors and text. Honest size accounting.",
    icon: "Minimize2",
    keywords: ["compress", "shrink", "reduce", "optimize", "smaller", "downsize"],
    steps: [
      { title: "Upload PDF", desc: "Choose the document you wish to compress." },
      { title: "Choose Preset", desc: "Select Low (lossless structural cleanup), Recommended (balanced 150 DPI), or High (maximum compact)." },
      { title: "Download", desc: "View the exact reduction percentage and download your optimized document." },
    ],
    features: [
      "Low, Recommended, and High compression presets",
      "Honest size reduction reporting (no fabricated savings)",
      "Lossless structural object stream optimization",
      "Downsamples oversized embedded raster imagery when needed",
    ],
    limitations: [
      "PDFs that already contain heavily compressed images or only vector text may experience modest reduction.",
    ],
    faq: [
      { q: "How does local compression work?", a: "It cleans redundant PDF objects and compresses embedded raster graphics using client-side canvas re-encoding." },
      { q: "Why did my file size decrease only slightly?", a: "If your PDF already has optimized streams and minimal bitmap images, there is no redundant data to remove. We never display fake savings." },
    ],
  },
  {
    id: "pdf-to-images",
    name: "PDF to Images",
    seoTitle: "Convert PDF to JPG & PNG - Free & Fast",
    slug: "pdf-to-images",
    categoryId: "convert",
    description: "Convert PDF pages into high-resolution PNG or JPG images with custom scaling. Download individually or as a ZIP package.",
    icon: "Image",
    keywords: ["pdf to image", "pdf to png", "pdf to jpg", "convert", "export", "extract photos"],
    steps: [
      { title: "Upload PDF", desc: "Select the document whose pages you want to turn into images." },
      { title: "Configure Settings", desc: "Choose PNG (lossless) or JPG (compact), plus resolution scaling (1x, 1.5x, 2x)." },
      { title: "Export", desc: "Download individual page images or all pages bundled in a ZIP archive." },
    ],
    features: [
      "Export as PNG (lossless) or JPEG (compact)",
      "Configurable DPI resolutions (72, 110, 150 DPI)",
      "Preview gallery of converted pages",
      "Download individual images or all pages as a ZIP file",
    ],
    limitations: [
      "Very high resolutions on large documents require sufficient browser memory.",
    ],
    faq: [
      { q: "Which format should I choose: PNG or JPG?", a: "Choose PNG for crisp documents with text, diagrams, and transparent elements; choose JPG for photos and scanned documents to save space." },
      { q: "Can I convert just specific pages?", a: "Yes, you can specify custom page ranges such as '1-3, 5'." },
    ],
  },
  {
    id: "excel-to-pdf",
    name: "Excel to PDF",
    seoTitle: "Excel to PDF Converter Online - Free & Private",
    slug: "excel-to-pdf",
    categoryId: "convert",
    description: "Convert XLSX/XLS spreadsheets to PDF, keeping tables, colours and merged cells approximated.",
    icon: "FileSpreadsheet",
    keywords: ["excel to pdf", "xlsx to pdf", "spreadsheet", "table"],
    steps: [
      { title: "Upload", desc: "Drop an .xlsx or .xls file." },
      { title: "Options", desc: "Choose orientation and paper size." },
      { title: "Download", desc: "Export the PDF." },
    ],
    features: ["Multiple sheets", "Auto column widths", "Pagination", "Fit to width"],
    limitations: ["Complex formatting and charts are approximated."],
    faq: [
      { q: "Will my formulas be kept?", a: "The PDF shows calculated values, not formulas. That's the point: it's a read-only copy." },
      { q: "Can I convert only one sheet?", a: "Yes - remove other sheets first or select the sheet if the option is shown." },
      { q: "Is it free?", a: "Yes, with no sign-up." },
    ],
    guideTitle: "Convert Excel spreadsheets to PDF",
    intro: "Turn an .xlsx or .xls workbook into a shareable PDF that looks the same on every device. PDFs are ideal for sending reports, price lists and invoices because the recipient can't accidentally change a formula or break the layout.",
    guideSteps: [
      "Click \"Choose file\" or drag your Excel workbook into the box.",
      "Check the preview and, if offered, pick which sheets to include.",
      "Press Convert.",
      "Download your PDF.",
    ],
    tips: [
      "Set a print area in Excel first so only the cells you want appear.",
      "Use \"Fit all columns on one page\" in Excel's page setup to avoid tables splitting across pages.",
      "Wide tables usually look best in landscape orientation.",
    ],
    notes: [
      "Accepts .xlsx and .xls.",
      "Very large workbooks depend on your device's memory, so convert one sheet at a time for huge files.",
    ],
    privacy: "Conversion happens in your browser, so your spreadsheet isn't uploaded to our servers.",
  },
  {
    id: "csv-to-pdf",
    name: "CSV to PDF",
    seoTitle: "CSV to PDF Converter Online - Free & Private",
    slug: "csv-to-pdf",
    categoryId: "convert",
    description: "Convert CSV files into a clean, paginated PDF table with detected headers.",
    icon: "Table",
    keywords: ["csv to pdf", "csv", "table", "comma separated"],
    steps: [
      { title: "Upload", desc: "Drop a .csv file." },
      { title: "Options", desc: "Choose orientation and paper size." },
      { title: "Download", desc: "Export the PDF." },
    ],
    features: ["Delimiter auto-detection", "Header detection", "Pagination"],
    limitations: ["Very wide tables may split across pages."],
    faq: [
      { q: "Why do my columns look jumbled?", a: "Usually the wrong delimiter; try semicolon or tab." },
      { q: "Can I style the table?", a: "Basic formatting is applied automatically; for custom styling, open the CSV in Excel and use the Excel to PDF tool." },
      { q: "Is my data uploaded?", a: "No." },
    ],
    guideTitle: "Turn CSV data into a clean, printable PDF",
    intro: "CSV files are plain text and hard to read or print. This tool lays your comma-separated data out as a formatted table in a PDF, so it's ready to share, print or archive.",
    guideSteps: [
      "Select or drop your .csv file.",
      "Confirm the delimiter (comma, semicolon or tab) if asked.",
      "Preview the table.",
      "Click Convert and download the PDF.",
    ],
    notes: [
      "The first row is treated as the header.",
      "Exports from Excel in some regions use semicolons instead of commas; choose the matching delimiter if columns look merged.",
      "UTF-8 files display non-English text most reliably.",
      "Very wide tables are scaled or split across pages to stay readable.",
    ],
    privacy: "Your data stays on your device.",
  },
  {
    id: "markdown-to-pdf",
    name: "Markdown to PDF",
    seoTitle: "Markdown to PDF Converter Online - Free & Private",
    slug: "markdown-to-pdf",
    categoryId: "convert",
    description: "Convert Markdown files or pasted text into a formatted, paginated PDF.",
    icon: "FileCode",
    keywords: ["markdown to pdf", "md to pdf", "markdown", "md"],
    steps: [
      { title: "Paste or Upload", desc: "Paste Markdown or upload a .md file." },
      { title: "Choose Theme", desc: "Pick a visual theme." },
      { title: "Download", desc: "Export the PDF." },
    ],
    features: ["Headings, lists, code blocks, tables", "Multiple themes", "Page numbers"],
    limitations: ["Complex HTML in markdown is not rendered."],
    faq: [{ q: "Is code syntax highlighted?", a: "Code blocks are rendered in monospace." }],
  },
  {
    id: "html-to-pdf",
    name: "HTML to PDF",
    seoTitle: "HTML to PDF Converter Online - Free & Private",
    slug: "html-to-pdf",
    categoryId: "convert",
    description: "Convert an uploaded HTML file or pasted code into a PDF with CSS preserved.",
    icon: "Code2",
    keywords: ["html to pdf", "html", "web page to pdf"],
    steps: [
      { title: "Paste or Upload", desc: "Paste HTML or upload a .html file." },
      { title: "Options", desc: "Choose page size." },
      { title: "Download", desc: "Export the PDF." },
    ],
    features: ["Headings, paragraphs, lists, tables", "Code blocks", "Pagination"],
    limitations: ["Remote assets are not fetched; inline CSS only."],
    faq: [{ q: "Are images included?", a: "Remote images are skipped for privacy." }],
  },
  {
    id: "word-to-pdf",
    name: "Word to PDF",
    seoTitle: "Word to PDF Converter Online - Free & Private",
    slug: "word-to-pdf",
    categoryId: "convert",
    description: "Convert DOC and DOCX Word documents to PDF, keeping headings, lists and tables.",
    icon: "FileType",
    keywords: ["word to pdf", "docx to pdf", "doc to pdf", "word"],
    steps: [
      { title: "Upload", desc: "Drop a .docx file." },
      { title: "Options", desc: "Choose page size." },
      { title: "Download", desc: "Export the PDF." },
    ],
    features: ["Headings and lists", "Tables", "Images (embedded as data URIs by mammoth)"],
    limitations: ["Complex layouts and tracked changes are approximated."],
    faq: [
      { q: "Will it keep my formatting?", a: "In most cases yes; very complex layouts should be checked after conversion." },
      { q: "Is it free for long documents?", a: "Yes." },
      { q: "Can I convert back?", a: "Use the PDF to Word tool, though results vary for complex layouts." },
    ],
    guideTitle: "Convert Word documents to PDF",
    intro: "Send a resume, letter, assignment or contract that looks exactly as you wrote it. PDF keeps fonts, spacing and images fixed so the layout doesn't shift on someone else's screen or phone.",
    guideSteps: [
      "Upload your .docx or .doc file.",
      "Wait a moment while it converts.",
      "Download the PDF and check it opens correctly.",
    ],
    tips: [
      "Use common fonts (Arial, Calibri, Times New Roman). If your document uses a rare font that isn't available, a substitute may be used.",
      "Check tracked changes and comments: accept or remove them first if you don't want them to appear.",
      "After converting, you can compress or password-protect the result using our other tools.",
    ],
    notes: [
      "Text, headings, tables, images, bullet lists and page breaks are preserved. Headers, footers and page numbers are kept where the converter supports them.",
      "Accepts .docx and .doc. Large documents with many embedded images depend on your device's memory.",
    ],
    privacy: "Files are handled in your browser and aren't stored.",
  },
  {
    id: "pdf-to-word",
    name: "PDF to Word",
    seoTitle: "PDF to Word Converter Online - Free & Private",
    slug: "pdf-to-word",
    categoryId: "convert",
    description: "Convert a PDF's text into an editable Word document (.docx).",
    icon: "FileText",
    keywords: ["pdf to word", "pdf to docx", "pdf to doc"],
    steps: [
      { title: "Upload", desc: "Drop a PDF." },
      { title: "Convert", desc: "Extract text and build DOCX." },
      { title: "Download", desc: "Export the Word file." },
    ],
    features: ["Headings detected by font size", "Paragraphs and spacing", "Multi-page"],
    limitations: ["Complex layouts and images are not preserved."],
    faq: [
      { q: "Are fonts kept?", a: "Fonts are matched where available; otherwise a similar font is used." },
      { q: "Will images be included?", a: "Yes." },
      { q: "Can I convert a scanned PDF?", a: "Text won't be editable without OCR. Use the OCR PDF tool first for scanned documents." },
    ],
    guideTitle: "Convert PDF to editable Word (.docx)",
    intro: "Need to change text in a PDF? Converting it to Word lets you edit paragraphs, fix typos and reuse content in a normal document.",
    guideSteps: [
      "Upload your PDF.",
      "Click Convert.",
      "Download the .docx and open it in Word, Google Docs or LibreOffice.",
    ],
    notes: [
      "Best results: PDFs created from Word or Google Docs, with real selectable text and simple layouts.",
      "Fair results: reports with images and tables; expect some manual tidying.",
      "Weaker results: scanned pages, multi-column magazines and heavily designed brochures.",
      "Quick check before converting: try selecting text in your PDF. If you can highlight words, the file has real text and will convert well. If you can't, it's a scan.",
      "Input: .pdf. Output: .docx. Password-protected PDFs must be unlocked first.",
    ],
    privacy: "Your PDF is processed on your device and not retained.",
    valueProp: "Converts the text, headings and images of your PDF into an editable .docx you can open in Word, Google Docs or LibreOffice - without uploading the file. Best results come from PDFs that were exported from a word processor (real text, simple layouts). Honest limitations: complex multi-column layouts, heavy design and scanned images of text may need manual cleanup, because a PDF stores positions, not paragraphs.",
  },
  {
    id: "ebook-to-pdf",
    name: "eBook to PDF",
    seoTitle: "EPUB to PDF Converter Online - Free & Private",
    slug: "ebook-to-pdf",
    categoryId: "convert",
    description: "Convert DRM-free EPUB e-books to a paginated PDF.",
    icon: "Book",
    keywords: ["ebook to pdf", "epub to pdf", "mobi to pdf"],
    steps: [
      { title: "Upload", desc: "Drop an .epub file." },
      { title: "Options", desc: "Choose page size." },
      { title: "Download", desc: "Export the PDF." },
    ],
    features: ["Chapter concatenation", "EPUB 3 support", "Title from metadata"],
    limitations: ["MOBI/AZW3 not supported; DRM-protected files are rejected."],
    faq: [
      { q: "Why does the layout differ from my reader app?", a: "eBooks adapt to the screen; a PDF fixes a page size." },
      { q: "Can I change the font size?", a: "Not after conversion; PDF layout is fixed." },
      { q: "Is the text still searchable?", a: "Yes." },
    ],
    guideTitle: "Convert eBooks to PDF",
    intro: "Read an ebook on any device, print it, or annotate it by turning it into a PDF. Useful for study material, manuals and documents you own.",
    guideSteps: [
      "Upload your ebook file (e.g. .epub).",
      "Choose page size if the option appears (A4 is a good default for printing).",
      "Press Convert and download the PDF.",
    ],
    notes: [
      "Reflowable ebooks have no fixed pages, so page breaks in the PDF are generated during conversion.",
      "Cover image, chapter headings and embedded images are kept.",
      "DRM-protected ebooks (for example many store-bought Kindle or Adobe books) can't be converted; use files you own without DRM.",
      "EPUB is the main supported format. Large illustrated books use more memory.",
    ],
    privacy: "The conversion runs in your browser; your books aren't uploaded.",
  },
  {
    id: "fingerprint",
    name: "Fingerprint PDF",
    seoTitle: "Fingerprint PDF Online - Trace Leaks Free",
    slug: "fingerprint-pdf",
    categoryId: "optimize",
    description: "Add invisible per-recipient marks so a leaked copy can be traced to its source.",
    icon: "Fingerprint",
    keywords: ["fingerprint", "trace", "leak", "watermark", "recipient"],
    steps: [
      { title: "Upload PDF", desc: "Drop the document." },
      { title: "Recipients", desc: "Enter recipient names." },
      { title: "Download", desc: "Get a zip of fingerprinted copies." },
    ],
    features: ["Per-recipient invisible marks", "Metadata + text layers", "Verify mode", "Export recipient table as CSV"],
    limitations: ["Marks can be destroyed by re-saving or printing to PDF."],
    faq: [{ q: "Is it tamper-proof?", a: "No mark is tamper-proof." }],
  },
  {
    id: "create-pdf",
    name: "Create PDF",
    seoTitle: "Create PDF Online - Free & Private",
    slug: "create-pdf",
    categoryId: "convert",
    description: "A writing surface with formatting, images and styles that exports straight to PDF.",
    icon: "PenTool",
    keywords: ["create pdf", "rich text", "editor", "write pdf"],
    steps: [
      { title: "Write", desc: "Format your document." },
      { title: "Page Setup", desc: "Choose size and margins." },
      { title: "Export", desc: "Download the PDF." },
    ],
    features: ["Headings, lists, tables, images", "Page setup", "Autosave to IndexedDB"],
    limitations: ["Advanced CSS layouts are approximated."],
    faq: [
      { q: "Do I need an account?", a: "No." },
      { q: "Will there be a watermark?", a: "No." },
      { q: "Can I edit it later?", a: "Yes, with the Edit PDF tool." },
    ],
    guideTitle: "Make a PDF from text, images or documents",
    intro: "Create a new PDF in seconds without installing software. Combine images, type text, or start from a document and export it as a PDF.",
    guideSteps: [
      "Choose what you're starting with (text, images or a file).",
      "Arrange content and pick page size and orientation.",
      "Click Create and download the PDF.",
    ],
    tips: [
      "Use A4 for India and most of the world, Letter for US documents.",
      "Compress large photo PDFs afterwards with our Compress PDF tool to meet upload limits on government and job portals.",
      "Reorder images before creating the PDF; page order follows your arrangement.",
    ],
    notes: [
      "Images: JPG, PNG. File size depends on your device's memory.",
    ],
    privacy: "Everything is built on your device. Nothing is uploaded.",
  },
  {
    id: "p2p-share",
    name: "P2P Share",
    seoTitle: "Share PDF Online Privately - P2P, No Upload",
    slug: "p2p-share",
    categoryId: "organize",
    description: "Send files directly from one browser to another with no server upload.",
    icon: "Share2",
    keywords: ["p2p", "peer to peer", "share", "send files", "webrtc"],
    steps: [
      { title: "Sender", desc: "Pick files and get a code." },
      { title: "Receiver", desc: "Enter code on the other device." },
      { title: "Transfer", desc: "Files send directly browser-to-browser." },
    ],
    features: ["No server upload", "Chunked transfer with back-pressure", "Multiple files", "PIN option"],
    limitations: ["Both tabs must stay open; uses a public signaling broker."],
    faq: [{ q: "Is it private?", a: "Data goes directly between browsers (DTLS encrypted)." }],
  },
  {
    id: "whiteboard",
    name: "Collaborative Whiteboard",
    seoTitle: "Online Whiteboard - Draw & Collaborate",
    slug: "whiteboard",
    categoryId: "organize",
    description: "A shared drawing canvas: open a link, draw together, no sign-up.",
    icon: "PenTool",
    keywords: ["whiteboard", "draw", "collaborate", "canvas", "sketch"],
    steps: [
      { title: "Host", desc: "Create a room and share the code." },
      { title: "Join", desc: "Enter the code on another device." },
      { title: "Draw", desc: "Draw together in real time." },
    ],
    features: ["Pen and eraser", "Color and size", "Clear canvas", "Export PNG"],
    limitations: ["Small groups only; data is gone when everyone leaves."],
    faq: [{ q: "Is it private?", a: "Strokes go directly between peers." }],
  },
  {
    id: "chat-with-pdf",
    name: "Chat with PDF",
    seoTitle: "Chat With PDF Online - Ask Your PDF Free",
    slug: "chat-with-pdf",
    categoryId: "intelligence",
    description: "Ask questions about your PDFs; answers stream back with page citations. Requires a Gemini API key.",
    icon: "MessageSquare",
    keywords: ["chat with pdf", "ask pdf", "gemini", "ai", "questions"],
    steps: [
      { title: "Upload PDFs", desc: "Drop one or more PDFs." },
      { title: "API Key", desc: "Enter your Gemini API key (kept in memory)." },
      { title: "Ask", desc: "Ask questions; answers stream with citations." },
    ],
    features: ["Up to 10 PDFs", "Streaming replies", "Page citations", "Local text extraction"],
    limitations: ["Extracted text leaves the device for this tool only."],
    faq: [{ q: "Is my key stored?", a: "Kept in memory only." }],
  },
  {
    id: "ai-summarizer",
    name: "AI PDF Summarizer",
    seoTitle: "AI PDF Summarizer Online - Summarize Free",
    slug: "ai-summarizer",
    categoryId: "intelligence",
    description: "Summarize a PDF with quick, bullet or detailed modes using Gemini.",
    icon: "Sparkles",
    keywords: ["summarize", "summary", "ai", "gemini", "tldr"],
    steps: [
      { title: "Upload", desc: "Drop a PDF." },
      { title: "Mode", desc: "Choose quick, bullets or detailed." },
      { title: "Generate", desc: "Get the summary." },
    ],
    features: ["Quick, bullets, detailed modes", "Streaming", "Download as text/PDF"],
    limitations: ["Requires a Gemini API key."],
    faq: [{ q: "Is my key stored?", a: "Kept in memory only." }],
  },
  {
    id: "pdf-to-excel",
    name: "PDF to Excel",
    seoTitle: "PDF to Excel Converter Online - Free & Private",
    slug: "pdf-to-excel",
    categoryId: "convert",
    description: "Extract tables from a PDF into an Excel workbook.",
    icon: "Table",
    keywords: ["pdf to excel", "pdf to xlsx", "extract tables", "pdf to spreadsheet"],
    steps: [
      { title: "Upload", desc: "Drop a PDF." },
      { title: "Convert", desc: "Tables are detected and extracted." },
      { title: "Download", desc: "Export the XLSX." },
    ],
    features: ["One sheet per page", "Column clustering", "Editable output"],
    limitations: ["Complex multi-column layouts may need manual cleanup."],
    faq: [
      { q: "Does it merge all tables into one sheet?", a: "Tables from each page are placed in order; review the result." },
      { q: "Are numbers kept as numbers?", a: "Numeric values are exported as numbers where detected." },
      { q: "Is it private?", a: "Yes, processing is local." },
    ],
    guideTitle: "Extract tables from PDF to Excel",
    intro: "Retyping tables from a PDF is slow and error-prone. This tool detects tables and exports them to a spreadsheet so you can sort, filter and calculate.",
    guideSteps: [
      "Upload your PDF.",
      "Click Convert.",
      "Download the .xlsx and check the columns.",
    ],
    notes: [
      "Works best with: bank and card statements, invoices, price lists and financial reports with real selectable text; tables with visible lines or clearly aligned columns.",
      "May need manual cleanup: merged cells and tables that break across pages; scanned documents (image-only PDFs); layouts where text wraps over multiple lines inside one cell.",
      "Always check your numbers after converting, especially for accounting.",
      "Input: .pdf with text. Output: .xlsx. Size depends on your device's memory.",
    ],
    privacy: "Your data stays on your device.",
    valueProp: "Pulls tables out of a PDF into rows and columns you can sort and calculate. It works best on PDFs with real, ruled or clearly aligned tables, such as bank statements, invoices and reports. Tables that span pages are detected per page; merged cells and tables inside scanned images may need manual adjustment. Review totals after export before relying on the data.",
  },
  {
    id: "headers-footers",
    name: "Headers & Footers",
    seoTitle: "Add Header & Footer to PDF - Free & Private",
    slug: "headers-footers",
    categoryId: "edit",
    description: "Add custom text, dates and page numbers at the top and bottom of every page.",
    icon: "AlignJustify",
    keywords: ["headers", "footers", "page numbers", "tokens"],
    steps: [
      { title: "Upload", desc: "Drop a PDF." },
      { title: "Slots", desc: "Fill left/center/right slots for header and footer." },
      { title: "Download", desc: "Export the PDF." },
    ],
    features: ["Six slots", "Tokens: {page}, {pages}, {date}, {filename}, {title}", "Skip first page"],
    limitations: ["Existing headers/footers are not removed."],
    faq: [{ q: "Can I use page numbers?", a: "Use {page} and {pages} tokens." }],
  },
  {
    id: "images-to-pdf",
    name: "Images to PDF",
    seoTitle: "Images to PDF Converter Online - Free & Private",
    slug: "images-to-pdf",
    categoryId: "convert",
    description: "Convert photos and graphics into a standardized PDF with custom page sizes, orientations, and margins.",
    icon: "FileImage",
    keywords: ["image to pdf", "jpg to pdf", "png to pdf", "webp", "photo", "pictures"],
    steps: [
      { title: "Upload Images", desc: "Select multiple JPG, PNG, or WebP image files." },
      { title: "Configure Layout", desc: "Select page size (A4, Letter, Fit), orientation (Auto, Portrait, Landscape), and margins." },
      { title: "Generate PDF", desc: "Click Create PDF to compile images into a single clean PDF." },
    ],
    features: [
      "Supports JPG, PNG, and WebP images",
      "Standard paper sizes: A4, US Letter, or Fit to Image dimensions",
      "Auto, Portrait, and Landscape orientation",
      "Margin controls: None, Small (20pt), Normal (40pt)",
      "Contain or Cover image scaling",
    ],
    limitations: [
      "Unsupported animated GIFs or SVG vector files should be converted to PNG first.",
    ],
    faq: [
      { q: "Can I reorder images before creating the PDF?", a: "Yes! Use the move up and move down arrows to arrange photos in your desired sequence." },
      { q: "Does this compress my original photos?", a: "Images are embedded at high visual fidelity without excessive downsampling." },
    ],
  },
  {
    id: "ocr",
    name: "OCR (Searchable PDF)",
    seoTitle: "OCR PDF Online - Searchable PDF Free",
    slug: "ocr-pdf",
    categoryId: "optimize",
    description: "Recognise text in scanned PDFs and create a searchable PDF with an invisible text layer, or export plain text.",
    icon: "ScanText",
    keywords: ["ocr", "searchable", "scanned", "text recognition", "tesseract"],
    steps: [
      { title: "Upload PDF", desc: "Drop a scanned or image-only PDF." },
      { title: "Choose Language", desc: "Select the document language." },
      { title: "Run OCR", desc: "Recognise text and build searchable PDF or text." },
    ],
    features: ["Word-level invisible text layer", "Multi-language", "Text-only export", "Confidence score"],
    limitations: ["First run downloads the language model; handwriting accuracy is limited."],
    faq: [{ q: "Does it upload my file?", a: "No, OCR runs locally; only the model is fetched." }],
  },
  {
    id: "pdf-to-text",
    name: "PDF to Text",
    seoTitle: "PDF to Text Converter - Extract Text Free",
    slug: "pdf-to-text",
    categoryId: "convert",
    description: "Extract selectable text from PDF documents. Copy extracted text to your clipboard or download as a clean plain text (.txt) file.",
    icon: "FileText",
    keywords: ["pdf to text", "extract text", "read pdf", "txt", "copy text", "transcribe"],
    steps: [
      { title: "Upload Document", desc: "Drop your PDF to parse embedded text streams." },
      { title: "Review Extracted Text", desc: "Preview extracted text formatted by page numbers in real time." },
      { title: "Copy or Download", desc: "Copy text to your clipboard or download as a .txt plain text file." },
    ],
    features: [
      "Instant client-side text extraction using PDF.js",
      "Structured output delineated by page numbers",
      "One-click Copy to Clipboard",
      "Download as UTF-8 plain text (.txt) file",
      "Word count and character statistics",
    ],
    limitations: [
      "Scanned paper documents containing pure pixel images without an embedded OCR text layer will return empty. Requires OCR for pure image scans.",
    ],
    faq: [
      { q: "Why is some text missing from my scanned document?", a: "If a PDF was generated by scanning physical paper without OCR, the file consists only of photos rather than encoded characters. This tool extracts selectable digital text." },
      { q: "Are my extracted documents sent to any AI or OCR API?", a: "No. Extraction runs 100% locally on your computer." },
    ],
  },
  {
    id: "pdf-to-grayscale",
    name: "PDF to Grayscale",
    seoTitle: "Convert PDF to Grayscale - Black & White",
    slug: "pdf-to-grayscale",
    categoryId: "convert",
    description: "Convert color PDF documents to clean grayscale. Ideal for saving black-and-white printer ink and standardizing office documents.",
    icon: "Palette",
    keywords: ["grayscale", "black and white", "monochrome", "color to bw", "printer friendly"],
    steps: [
      { title: "Select PDF", desc: "Choose the color document you want to convert." },
      { title: "Convert to Grayscale", desc: "Click Convert to apply monochrome luminance transformation locally." },
      { title: "Download", desc: "Download your grayscale PDF ready for printing." },
    ],
    features: [
      "Converts color imagery, charts, and graphics to standard grayscale",
      "Calibrated luminance formula (0.299R + 0.587G + 0.114B)",
      "Preserves original page dimensions and aspect ratios",
      "Helps reduce colored toner/ink usage during printing",
    ],
    limitations: [
      "Conversion rasterizes pages to high-resolution monochrome images; text becomes graphical.",
    ],
    faq: [
      { q: "Why convert a PDF to grayscale?", a: "Grayscale documents prevent color printer toner usage, ensure consistent contrast on photocopiers, and standardize multi-source documents." },
      { q: "Will conversion blur small text?", a: "We render at high resolution (150 DPI) to ensure fine typography remains crisp." },
    ],
  },
  {
    id: "page-numbers",
    name: "Add Page Numbers",
    seoTitle: "Add Page Numbers to PDF - Free & Fast",
    slug: "add-page-numbers",
    categoryId: "edit",
    description: "Insert customizable page numbers, templates, positions, and formatting into any PDF with live placement preview.",
    icon: "Hash",
    keywords: ["page numbers", "pagination", "numbering", "footer", "header", "bates"],
    steps: [
      { title: "Upload PDF", desc: "Select the document you wish to number." },
      { title: "Customize Format", desc: "Choose position (top/bottom), alignment (left/center/right), starting number, and format template." },
      { title: "Apply & Download", desc: "Stamp numbers across pages and download your updated PDF." },
    ],
    features: [
      "Custom format templates (e.g. 'Page {n} of {total}', '{n} / {total}')",
      "Top and bottom vertical placement",
      "Left, center, and right horizontal alignment",
      "Option to skip cover or title page",
      "Adjustable font size and edge margins",
    ],
    limitations: [
      "Numbers are stamped over existing page content; ensure margins do not overlap critical text.",
    ],
    faq: [
      { q: "Can I skip the title or cover page?", a: "Yes, check the 'Skip first page' option to begin numbering starting on page 2." },
      { q: "Can I start numbering at a custom number like 10?", a: "Yes, you can configure the 'Start At' field to any positive integer." },
    ],
  },
  {
    id: "watermark",
    name: "Watermark PDF",
    seoTitle: "Watermark PDF Online - Custom Text Stamp",
    slug: "watermark-pdf",
    categoryId: "edit",
    description: "Stamp customized text watermarks across document pages with live opacity, rotation, and color control.",
    icon: "Stamp",
    keywords: ["watermark", "stamp", "brand", "draft", "confidential", "overlay"],
    steps: [
      { title: "Upload PDF", desc: "Drop the PDF you want to watermark." },
      { title: "Customize Watermark", desc: "Type your text, adjust opacity, angle, color, and select a preset (diagonal, center, footer)." },
      { title: "Download", desc: "Download your watermarked document." },
    ],
    features: [
      "Custom text with adjustable opacity (5% - 100%)",
      "Position presets: Diagonal, Centered, and Footer",
      "Rotation angle slider (-90° to +90°)",
      "Color picker support",
      "Apply to all pages or specific page ranges",
    ],
    limitations: [
      "Watermarks are stamped on top of page content to prevent removal by basic viewers.",
    ],
    faq: [
      { q: "Can watermarks be removed easily?", a: "Watermarks are embedded directly into the PDF content stream, making them permanent in standard readers." },
      { q: "Can I watermark only certain pages?", a: "Yes, choose 'Custom Range' and enter page numbers like '1-3, 5'." },
    ],
  },
  {
    id: "edit-pdf",
    name: "Edit PDF",
    seoTitle: "Edit PDF Online - Edit Text & Sign Free",
    slug: "edit-pdf",
    categoryId: "edit",
    description: "Full visual PDF editor: click any text to edit it in place with matched fonts, plus whiteout, signatures, images, highlights, links, shapes and form fields. 100% private in-browser editing.",
    icon: "PenLine",
    keywords: ["edit pdf", "pdf editor", "edit pdf text in place", "whiteout pdf", "sign pdf", "highlight pdf", "add image to pdf", "pdf annotator", "fill pdf form"],
    steps: [
      { title: "Upload PDF", desc: "Drop a PDF (up to ~50 MB, password-protected OK). It opens in the visual editor with page thumbnails." },
      { title: "Edit Anything", desc: "Click existing text to edit it in place with the same font and color. Add whiteout, signatures, images, highlights, links, shapes and form fields." },
      { title: "Apply & Download", desc: "Click Apply & Download to burn every change into a new PDF with links, images and annotations intact." },
    ],
    features: [
      "In-place text editing with embedded-font matching and subset fallback notice",
      "Whiteout, freehand draw, rectangles, ellipses, lines and arrows",
      "Highlight, underline and strikethrough as real annotations",
      "Draw / type / upload signatures saved on your device",
      "Images (PNG/JPG) with aspect-lock resize, real link annotations",
      "Fillable form fields + filling existing AcroForm fields",
      "Page delete, rotate, reorder and blank-page insert with undo/redo",
      "100% client-side execution — files never leave your device",
    ],
    limitations: [
      "Scanned (image-only) pages have no editable text; you can still add text, whiteout and sign.",
      "Save embeds metric-compatible bundled fonts; exotic embedded subsets fall back with a notice.",
      "Very large files (~100 pages) render pages lazily; initial text indexing takes a few seconds.",
    ],
    faq: [
      {
        q: "How do I edit existing text in a PDF?",
        a: "Upload your PDF, keep the Text tool active, hover any paragraph until it highlights, and click it. An inline box appears exactly over the original with the same font, size and color. Type your changes, then Apply & Download.",
      },
      {
        q: "Will the edited text keep the original font?",
        a: "The editor registers the PDF's own embedded fonts for on-screen editing. If you type characters the embedded subset doesn't contain, it falls back to the closest bundled metric-compatible font and shows a notice. On download the chosen font is embedded.",
      },
      {
        q: "Is my PDF uploaded to a server?",
        a: "No. Rendering uses pdf.js and writing uses pdf-lib entirely inside your browser tab. Your file stays on your device.",
      },
      {
        q: "Can I sign, whiteout or highlight a PDF?",
        a: "Yes. Use the Sign tool (draw, type or upload a signature saved in your browser), Whiteout (drag a rectangle that is burned in on save), and Highlight/Underline/Strike (created as proper PDF annotations).",
      },
      {
        q: "What about scanned PDFs?",
        a: "Scanned pages are images without a text layer, so there is no text to edit in place. The editor tells you this and you can still add text boxes, whiteout, sign and annotate. OCR may be added later.",
      },
    ],
  },
  {
    id: "add-text",
    name: "Add Text to PDF",
    seoTitle: "Add Text to PDF - Header, Notes & Footer",
    slug: "add-text-to-pdf",
    categoryId: "edit",
    description: "Place custom text notes, annotations, dates, or signatures onto specific PDF pages with visual placement controls.",
    icon: "Type",
    keywords: ["add text", "annotate", "type on pdf", "overlay", "fill pdf", "notes"],
    steps: [
      { title: "Upload PDF", desc: "Select the document you wish to add text onto." },
      { title: "Configure Text", desc: "Enter your text, choose page, select font size, color, and position." },
      { title: "Apply & Download", desc: "Stamp the text onto the document and download the result." },
    ],
    features: [
      "Visual coordinate placement (click on preview to place text)",
      "Preset alignments: Header, Footer, Center, Top Left, Bottom Right",
      "Adjustable font size (8pt to 48pt) and custom text colors",
      "Target specific page or apply across all pages",
    ],
    limitations: [
      "This tool adds new text overlays on top of the document. It does not re-flow or replace existing underlying text.",
    ],
    faq: [
      { q: "Can I use this to edit typos in existing PDF text?", a: "No. PDF is a fixed-layout format. This tool adds new text annotations over the page rather than modifying underlying text." },
      { q: "Can I position text anywhere on the page?", a: "Yes, click anywhere on the page preview canvas to place your text at that exact coordinate." },
    ],
  },
  {
    id: "crop",
    name: "Crop PDF",
    seoTitle: "Crop PDF Online - Trim Margins Free",
    slug: "crop-pdf",
    categoryId: "edit",
    description: "Adjust page boundaries and trim unwanted margins using numeric margin controls. Apply to all pages or specific pages.",
    icon: "Crop",
    keywords: ["crop", "trim", "margins", "cut pdf", "boundary", "resize margin"],
    steps: [
      { title: "Select PDF", desc: "Upload the document you want to crop." },
      { title: "Adjust Margins", desc: "Set Top, Bottom, Left, and Right crop margins in points." },
      { title: "Crop & Download", desc: "Apply the new CropBox boundary and download the trimmed PDF." },
    ],
    features: [
      "Configurable margins (Top, Bottom, Left, Right in points)",
      "ISO 32000 standard CropBox boundary modification",
      "Real-time visual preview of cropped area",
      "Apply crop to all pages or individual pages",
    ],
    limitations: [
      "Cropping adjusts the viewing CropBox. Compatible with standard PDF readers (Acrobat, Preview, Chrome). Content outside the box is hidden from view.",
    ],
    faq: [
      { q: "Does cropping delete the hidden content permanently?", a: "Standard PDF cropping sets a CropBox boundary that tells readers not to display content outside the box." },
      { q: "What units are used for margin inputs?", a: "Standard typography points (1 inch = 72 points; 1 mm ≈ 2.83 points)." },
    ],
  },
  {
    id: "resize",
    name: "Resize PDF Pages",
    seoTitle: "Resize PDF Pages - A4, Letter & Custom",
    slug: "resize-pdf",
    categoryId: "edit",
    description: "Change PDF page dimensions to standard sizes like A4, US Letter, A3, or Legal with automatic content scaling.",
    icon: "Maximize",
    keywords: ["resize", "paper size", "a4 to letter", "a3", "scale pdf", "page dimension"],
    steps: [
      { title: "Upload PDF", desc: "Drop the document whose page dimensions you want to modify." },
      { title: "Select Target Size", desc: "Choose standard A4, US Letter, A3, Legal, or custom dimensions." },
      { title: "Resize & Download", desc: "Scale pages into the new canvas and download the resized document." },
    ],
    features: [
      "Standard sizes: A4, US Letter, A3, Legal",
      "Orientation options: Portrait, Landscape, or Auto",
      "Content scaling: Fit to page with proportional aspect ratio preservation",
      "Lossless vector embedding using pdf-lib embedPage",
    ],
    limitations: [
      "Extreme aspect ratio differences (e.g. square to tall legal) may show letterbox margins to prevent distortion.",
    ],
    faq: [
      { q: "Will resizing stretch or distort my text?", a: "No, content is scaled proportionally to fit the new page boundaries without stretching." },
      { q: "Can I convert Letter to A4 for international printing?", a: "Yes, this is one of the most popular uses for this tool." },
    ],
  },
  {
    id: "protect",
    name: "Protect PDF",
    seoTitle: "Password Protect PDF - AES-256 Encryption",
    slug: "protect-pdf",
    categoryId: "security",
    description: "Encrypt your PDF document locally with a password using industry-standard AES-256 (PDF 2.0 / ISO 32000-2) encryption.",
    icon: "Lock",
    keywords: ["protect", "encrypt", "password", "lock", "security", "aes-256"],
    steps: [
      { title: "Upload PDF", desc: "Select the document you want to secure." },
      { title: "Set Password", desc: "Enter and confirm your strong document password." },
      { title: "Encrypt & Download", desc: "Generate an encrypted PDF openable only with your password." },
    ],
    features: [
      "ISO 32000-2 standard AES-256 bit encryption",
      "Web Crypto API hardware acceleration",
      "Configurable printing and copying permissions",
      "Passwords never leave your device RAM",
    ],
    limitations: [
      "Because encryption is 100% local with no cloud backdoors, lost passwords cannot be recovered.",
    ],
    faq: [
      { q: "What PDF readers can open protected files?", a: "All standard readers including Adobe Acrobat, Apple Preview, Google Chrome, Safari, and Microsoft Edge." },
      { q: "Is the password transmitted to any server?", a: "Never. The key derivation and cipher occur entirely in browser memory." },
    ],
  },
  {
    id: "unlock",
    name: "Unlock PDF",
    seoTitle: "Unlock PDF Online - Remove Password Free",
    slug: "unlock-pdf",
    categoryId: "security",
    description: "Remove password protection and encryption from your PDF document using your password. Processed 100% locally in your browser.",
    icon: "Unlock",
    keywords: ["unlock", "decrypt", "remove password", "open", "security", "decipher"],
    steps: [
      { title: "Upload Encrypted PDF", desc: "Drop your password-protected PDF." },
      { title: "Enter Password", desc: "Provide the valid document password." },
      { title: "Download Unlocked File", desc: "Save a clean, unprotected PDF document." },
    ],
    features: [
      "Local AES-256 and RC4 password-based decryption",
      "Verifies valid password in memory",
      "Exports unprotected PDF that opens without prompts",
      "Immediate clear error reporting for invalid passwords",
    ],
    limitations: [
      "Requires the valid document password. We do not support password cracking or bypassing legitimate security.",
    ],
    faq: [
      { q: "Can this tool crack a password I forgot?", a: "No. This tool is designed to decrypt PDFs when you know the password, removing the prompt for future viewing." },
      { q: "Are passwords saved in browser cookies?", a: "No, passwords exist only in volatile RAM for the single operation." },
    ],
  },
  {
    id: "metadata-editor",
    name: "PDF Metadata Editor",
    seoTitle: "PDF Metadata Editor - Edit & Strip Tags",
    slug: "pdf-metadata-editor",
    categoryId: "edit",
    description: "Inspect and edit PDF metadata properties including Title, Author, Subject, Keywords, Creator, and Producer. Strip all metadata for privacy.",
    icon: "FileSliders",
    keywords: ["metadata", "author", "title", "strip metadata", "sanitize", "properties", "exif"],
    steps: [
      { title: "Upload PDF", desc: "Drop your PDF to read embedded metadata fields." },
      { title: "Edit or Strip", desc: "Modify Title, Author, Subject, and Keywords, or click 'Strip All Metadata' for privacy." },
      { title: "Download", desc: "Save the updated PDF with sanitized properties." },
    ],
    features: [
      "Read and edit Title, Author, Subject, Keywords, Producer, Creator",
      "One-click 'Strip All Metadata' privacy sanitization",
      "Preserves all page content and visual layouts",
      "Instant client-side inspection",
    ],
    limitations: [
      "Custom non-standard XMP schemas may require advanced desktop inspection tools.",
    ],
    faq: [
      { q: "Why should I strip PDF metadata?", a: "PDFs often contain hidden metadata such as your computer username, company name, software versions, and edit history. Stripping metadata prevents accidental leaks." },
      { q: "Does editing metadata change the document text?", a: "No, only the invisible document header properties are changed." },
    ],
  },
  {
    id: "page-counter",
    name: "PDF Page Counter",
    seoTitle: "PDF Page Counter - Inspect Dimensions",
    slug: "pdf-page-counter",
    categoryId: "optimize",
    description: "Inspect page counts, dimensions (pt, mm, in), standard paper sizes, encryption status, and metadata. Download a plain-text audit report.",
    icon: "Binary",
    keywords: ["page counter", "count pages", "inspect pdf", "dimensions", "file info", "audit"],
    steps: [
      { title: "Upload PDF", desc: "Select or drop your PDF document." },
      { title: "Inspect Properties", desc: "Review total pages, per-page dimensions, file size, and encryption status." },
      { title: "Download Report", desc: "Optionally export a plain-text document audit report (.txt)." },
    ],
    features: [
      "Accurate total page count",
      "Exact page dimensions in Points, Millimeters, and Inches",
      "Automatic detection of standard paper formats (A4, Letter, Legal, A3)",
      "File size calculation in bytes, KB, and MB",
      "Downloadable plain-text audit report (.txt)",
    ],
    limitations: [
      "Heavily corrupted files that cannot be parsed by standard engines cannot be measured.",
    ],
    faq: [
      { q: "Can I inspect multi-size documents where pages have different dimensions?", a: "Yes, our inspector lists the dimensions of each individual page." },
      { q: "Is any file data transmitted?", a: "Zero data is transmitted. All parsing happens inside your browser." },
    ],
  },
  {
    id: "compare",
    name: "Compare PDFs",
    seoTitle: "Compare Two PDF Files - Visual & Text Diff",
    slug: "compare-pdfs",
    categoryId: "security",
    description: "Load two PDF documents locally to compare page counts, file sizes, and text content line-by-line. Highlights detected differences.",
    icon: "GitCompare",
    keywords: ["compare", "diff", "difference", "compare documents", "revision", "changes"],
    steps: [
      { title: "Upload Both PDFs", desc: "Drop Document A (original) and Document B (modified)." },
      { title: "Run Comparison", desc: "Click Compare to analyze page counts, sizes, and text differences." },
      { title: "Review Highlights", desc: "Inspect added, removed, and matching text lines side by side." },
    ],
    features: [
      "Compare file size and total page counts",
      "Line-by-line text content difference analysis",
      "Visual color-coded diff (green for added, red for removed)",
      "Comparison summary statistics",
    ],
    limitations: [
      "Text comparison relies on embedded text layers. Scanned bitmap PDFs, images, and non-text visual alterations are not detected by text diffing.",
    ],
    faq: [
      { q: "Can this compare scanned contracts?", a: "If the PDFs do not have embedded text layers, text diffing cannot read the contents. Scanned documents require visual pixel comparison." },
      { q: "Are both documents kept confidential?", a: "Yes. Both documents are processed exclusively in your browser memory." },
    ],
  },
  {
    id: "flatten",
    name: "Flatten PDF",
    seoTitle: "Flatten PDF Online - Free & Private",
    slug: "flatten-pdf",
    categoryId: "optimize",
    description: "Flatten form fields, annotations and scripts into fixed page content so the PDF can no longer be edited as a form.",
    icon: "Layers",
    keywords: ["flatten", "form", "fields", "annotations", "lock", "static"],
    steps: [
      { title: "Upload PDF", desc: "Drop a PDF with form fields or annotations." },
      { title: "Choose Options", desc: "Select what to flatten (forms, annotations, scripts)." },
      { title: "Download", desc: "Export a static, non-editable PDF." },
    ],
    features: [
      "Flatten AcroForm fields with values drawn",
      "Remove annotations, stamps and comments",
      "Strip JavaScript actions and XFA data",
      "Optional rasterize-to-image mode",
    ],
    limitations: [
      "Flattening is one-way; keep the original if you need to edit later.",
    ],
    faq: [
      { q: "Does flattening keep text selectable?", a: "Yes, unless you choose rasterize mode." },
    ],
  },
  {
    id: "redact",
    name: "Redact PDF",
    seoTitle: "Redact PDF Online - Remove Text Free",
    slug: "redact-pdf",
    categoryId: "security",
    description: "Permanently remove sensitive text and areas, leaving black boxes. Verifies no hidden text survives.",
    icon: "Eraser",
    keywords: ["redact", "blackout", "sensitive", "privacy", "remove text"],
    steps: [
      { title: "Upload PDF", desc: "Drop the document to redact." },
      { title: "Mark Areas", desc: "Draw boxes or search for terms to redact." },
      { title: "Verify & Download", desc: "Confirm no redacted text remains, then download." },
    ],
    features: [
      "Draw redaction boxes on pages",
      "Search & redact by term or regex",
      "Safe mode rasterizes pages so text cannot be recovered",
      "Post-redaction verification scan",
    ],
    limitations: [
      "Safe mode converts pages to images; text is no longer selectable on redacted pages.",
    ],
    faq: [
      { q: "Is a black box enough?", a: "No — this tool deletes underlying content, not just covers it." },
    ],
  },
  {
    id: "privacy-scan",
    name: "Privacy Risk Scanner",
    seoTitle: "PDF Privacy Scanner Online - Check Risks Free",
    slug: "privacy-scan",
    categoryId: "optimize",
    description: "Scan for hidden metadata, scripts, attachments and image EXIF, then export a cleaned copy.",
    icon: "ShieldAlert",
    keywords: ["privacy", "metadata", "hidden", "scan", "sanitize", "exif"],
    steps: [
      { title: "Upload PDF", desc: "Drop the document to scan." },
      { title: "Review Findings", desc: "See hidden data grouped by risk level." },
      { title: "Clean & Download", desc: "Remove selected items and download a sanitized copy." },
    ],
    features: [
      "Scan Info dictionary and XMP metadata",
      "Detect JavaScript, XFA and attachments",
      "Flag annotations and external links",
      "Export a cleaned, sanitized copy",
    ],
    limitations: [
      "Image EXIF is flagged; full removal requires re-encoding images.",
    ],
    faq: [
      { q: "Does scanning upload my file?", a: "No, everything runs locally." },
    ],
  },
  {
    id: "invert",
    name: "Invert PDF Colours",
    seoTitle: "Invert PDF Colours Online - Dark Mode Free",
    slug: "invert-pdf",
    categoryId: "convert",
    description: "Create a permanent dark-mode, sepia or grayscale version of your PDF.",
    icon: "Moon",
    keywords: ["invert", "dark mode", "sepia", "grayscale", "colour"],
    steps: [
      { title: "Upload PDF", desc: "Drop the document." },
      { title: "Choose Mode", desc: "Pick invert, dark, sepia or grayscale." },
      { title: "Download", desc: "Export the transformed PDF." },
    ],
    features: [
      "Invert, dark, sepia and grayscale modes",
      "Selectable text preserved as images",
      "Adjustable DPI",
    ],
    limitations: [
      "Pages are rasterized; text is no longer selectable.",
    ],
    faq: [
      { q: "Is text still selectable?", a: "No, pages become images." },
    ],
  },
  {
    id: "repair",
    name: "Repair PDF",
    seoTitle: "Repair PDF Online - Fix Corrupted PDF",
    slug: "repair-pdf",
    categoryId: "optimize",
    description: "Recover content from corrupted, truncated or broken PDFs using multiple strategies.",
    icon: "Wrench",
    keywords: ["repair", "recover", "corrupt", "broken", "fix", "damaged"],
    steps: [
      { title: "Upload PDF", desc: "Drop the damaged file." },
      { title: "Repair", desc: "Tries strategies until one opens cleanly." },
      { title: "Download", desc: "Export the recovered PDF." },
    ],
    features: [
      "Lenient reload and re-save",
      "Rebuild cross-reference table",
      "Truncated file repair",
      "Page tree reconstruction and salvage",
    ],
    limitations: [
      "Severely damaged files may only be partially recovered.",
    ],
    faq: [
      { q: "Which strategy was used?", a: "The report shows the strategy that succeeded." },
    ],
  },
  {
    id: "scan-to-pdf",
    name: "Scan to PDF",
    seoTitle: "Scan to PDF Online - Camera to PDF Free",
    slug: "scan-to-pdf",
    categoryId: "organize",
    description: "Use your camera as a document scanner: capture pages, enhance and export a PDF.",
    icon: "ScanLine",
    keywords: ["scan", "camera", "document scanner", "photo to pdf"],
    steps: [
      { title: "Open Camera", desc: "Allow camera access." },
      { title: "Capture Pages", desc: "Capture each page." },
      { title: "Export PDF", desc: "Choose filter and download." },
    ],
    features: ["Live camera capture", "Grayscale / B&W filters", "Multi-page export"],
    limitations: ["Requires camera permission; no auto edge detection in this build."],
    faq: [{ q: "Does it upload images?", a: "No, everything stays local." }],
  },
  {
    id: "pdf-to-epub",
    name: "PDF to EPUB",
    seoTitle: "PDF to EPUB Converter Online - Free & Private",
    slug: "pdf-to-epub",
    categoryId: "convert",
    description: "Convert a PDF into an EPUB e-book for Kindle, Kobo and Apple Books.",
    icon: "BookOpen",
    keywords: ["pdf to epub", "ebook", "kindle", "kobo", "epub"],
    steps: [
      { title: "Upload PDF", desc: "Drop the document." },
      { title: "Set Metadata", desc: "Title and author." },
      { title: "Download", desc: "Export the EPUB file." },
    ],
    features: ["Chapter splitting", "EPUB 3 structure", "Title/author metadata"],
    limitations: ["Complex layouts are flattened to paragraphs."],
    faq: [
      { q: "Will images be included?", a: "Yes, as inline images." },
      { q: "Can I read it on Kindle?", a: "Most Kindle apps accept EPUB via \"Send to Kindle\"." },
      { q: "Is it free?", a: "Yes." },
    ],
    guideTitle: "Make a PDF readable on e-readers",
    intro: "PDFs have fixed pages, which are awkward to read on small screens. Converting to EPUB lets text reflow to fit a phone, tablet or e-reader and lets you change font size.",
    guideSteps: [
      "Upload your PDF.",
      "Click Convert.",
      "Download the .epub and open it in Apple Books, Google Play Books, Kobo or Calibre.",
    ],
    notes: [
      "Best for: novels, essays, articles and other text-focused PDFs.",
      "Less suited to: textbooks with complex diagrams, math, multi-column magazines and scanned books. Page layout can't be preserved in a reflowable format, and some headers, footers or page numbers may appear in the text and need cleanup.",
      "Use a PDF with real selectable text, not a scan.",
      "Check chapter breaks after converting; they're detected from headings.",
      "Input: .pdf. Output: .epub. Large books depend on your device's memory.",
    ],
    privacy: "Your file is processed on your device.",
  },
  {
    id: "pdf-to-html",
    name: "PDF to HTML",
    seoTitle: "PDF to HTML Converter Online - Free & Private",
    slug: "pdf-to-html",
    categoryId: "convert",
    description: "Convert a PDF into a single HTML file with positioned or reflowable text.",
    icon: "Code",
    keywords: ["pdf to html", "html", "web page", "convert"],
    steps: [
      { title: "Upload PDF", desc: "Drop the document." },
      { title: "Choose Layout", desc: "Positioned or reflowable." },
      { title: "Download", desc: "Export the HTML file." },
    ],
    features: [
      "Positioned layout preserves exact placement",
      "Reflowable semantic HTML",
      "Single self-contained file",
    ],
    limitations: [
      "Complex graphics are not converted to SVG.",
    ],
    faq: [
      { q: "Is the HTML clean enough to edit?", a: "It's readable; expect to tidy styles for production." },
      { q: "Will links work?", a: "Yes, existing hyperlinks are kept." },
      { q: "Is it private?", a: "Yes." },
    ],
    guideTitle: "Convert PDF to HTML for the web",
    intro: "Publish a PDF's content as a web page so it's searchable, accessible and mobile-friendly, instead of forcing visitors to download a file.",
    guideSteps: [
      "Upload your PDF.",
      "Click Convert.",
      "Download the HTML and open it in a browser to check it.",
    ],
    notes: [
      "Text, headings, links and images are kept as web content. Output can be embedded in a site, a CMS or an email template.",
      "Use cases: put a brochure, menu or price list on a website; make documents indexable by search engines; reuse report text in a blog or knowledge base.",
      "Fidelity: text-based PDFs convert best. Precisely positioned designs can differ slightly in spacing, and you may want to adjust CSS afterwards. Scanned PDFs become images rather than text.",
      "Input: .pdf. Output: .html with assets. Size depends on device memory.",
    ],
    privacy: "Your file stays on your device.",
    valueProp: "Turns a PDF into HTML you can publish or embed, keeping text, headings and links as real, selectable page content rather than a flat image. Useful for putting a brochure, menu or report on a website, or making content searchable. Fidelity is highest for text-based PDFs; exact positioning of complex designs may differ slightly from the original.",
  },
  {
    id: "gst-invoice",
    name: "GST Invoice Generator",
    seoTitle: "GST Invoice Generator - Tax Invoices",
    slug: "gst-invoice",
    categoryId: "edit",
    description: "Create GST-compliant tax invoices with CGST/SGST or IGST, then download a PDF with no watermark.",
    icon: "Receipt",
    keywords: ["gst", "invoice", "tax", "cgst", "sgst", "igst"],
    steps: [
      { title: "Seller Profile", desc: "Enter business details and GSTIN." },
      { title: "Buyer & Items", desc: "Add buyer and line items." },
      { title: "Download", desc: "Generate and download the invoice PDF." },
    ],
    features: ["GSTIN validation", "CGST/SGST/IGST split", "Amount in words", "Tax summary by rate", "Local history"],
    limitations: ["E-invoicing and GSTR filing are out of scope."],
    faq: [{ q: "Is data uploaded?", a: "No, stored locally in your browser." }],
  },
  {
    id: "pos-billing",
    name: "POS Billing",
    seoTitle: "POS Billing Software Online - GST Receipts Free",
    slug: "pos-billing",
    categoryId: "edit",
    description: "Point-of-sale billing: products, cart, GST receipts and reports, usable offline.",
    icon: "ShoppingCart",
    keywords: ["pos", "billing", "receipt", "shop", "cash register"],
    steps: [
      { title: "Products", desc: "Manage product catalogue." },
      { title: "Bill", desc: "Add items to cart and checkout." },
      { title: "Receipt", desc: "Print or save receipt." },
    ],
    features: ["Barcode search", "GST receipts", "Daily reports", "Offline"],
    limitations: ["Data clears if browser data is cleared; back up regularly."],
    faq: [
      { q: "Do I need an account?", a: "No." },
      { q: "Is my sales data stored?", a: "Not on our servers." },
    ],
    guideTitle: "Create simple bills and receipts as PDFs",
    intro: "Generate a clean, printable bill for your shop, stall or small business without installing billing software. Add items, quantities and prices, and the tool totals everything for you.",
    guideSteps: [
      "Enter your business name and contact details.",
      "Add items with quantity and price.",
      "Add tax or discount if needed.",
      "Download or print the PDF.",
    ],
    tips: [
      "Keep an invoice number sequence for your records.",
      "Check GST details and rates before issuing bills to customers. This tool formats a bill; it doesn't replace accounting or tax advice.",
      "Save PDFs in a dated folder for easy filing.",
    ],
    notes: [
      "Good for: small retail shops, home businesses, freelancers and event stalls that need a quick receipt.",
    ],
    privacy: "Your data stays on your device.",
  },
  {
    id: "latex-resume",
    name: "LaTeX Resume",
    seoTitle: "LaTeX Resume Builder Online - ATS-Friendly PDF",
    slug: "latex-resume",
    categoryId: "edit",
    description: "Build an ATS-friendly resume with four typeset templates. Export PDF or .tex. Everything runs in your browser.",
    icon: "FileText",
    keywords: ["resume", "cv", "latex", "ats", "builder"],
    steps: [
      { title: "Open builder", desc: "A complete example resume is already loaded." },
      { title: "Edit details", desc: "Replace name, contact, roles and bullets." },
      { title: "Pick template", desc: "Choose Classic, Modern, Sidebar or Academic CV." },
      { title: "Download", desc: "Save as PDF or export .tex for Overleaf." },
    ],
    features: ["Four typeset templates", "ATS warnings", "Export PDF or .tex", "Import .tex", "Autosave in browser"],
    limitations: ["Runs in browser; no server upload."],
    faq: [{ q: "Is it free?", a: "Yes, no sign-up, no watermark." }],
  },
  {
    id: "remove-pages",
    name: "Remove PDF Pages",
    seoTitle: "Remove PDF Pages Online - Delete Pages Free",
    slug: "remove-pdf-pages",
    categoryId: "organize",
    description: "Select pages to delete and export the remaining document.",
    icon: "Trash2",
    keywords: ["remove pages", "delete pages", "drop pages"],
    steps: [{ title: "Upload", desc: "Drop a PDF." }, { title: "Select", desc: "Choose pages to remove." }, { title: "Download", desc: "Export remaining pages." }],
    features: ["Visual thumbnail selection", "Keeps remaining pages in order"],
    limitations: ["Cannot remove all pages; at least one must remain."],
    faq: [{ q: "Is it local?", a: "Yes, runs in browser." }],
  },
  {
    id: "sign-pdf",
    name: "Sign PDF",
    seoTitle: "Sign PDF Online - Free & Private",
    slug: "sign-pdf",
    categoryId: "security",
    description: "Add a visual signature image to a page of your PDF.",
    icon: "PenLine",
    keywords: ["sign", "signature", "visual signature"],
    steps: [{ title: "Upload PDF", desc: "Drop a PDF." }, { title: "Signature", desc: "Choose a PNG/JPG signature." }, { title: "Download", desc: "Export signed PDF." }],
    features: ["PNG and JPG signatures", "Page selection"],
    limitations: ["Visual signature only; not a cryptographic digital signature."],
    faq: [{ q: "Is it legally binding?", a: "A visual signature is not equivalent to a cryptographic digital signature." }],
  },
  {
    id: "pdf-to-markdown",
    name: "PDF to Markdown",
    seoTitle: "PDF to Markdown Converter - Free & Private",
    slug: "pdf-to-markdown",
    categoryId: "intelligence",
    description: "Extract text from a PDF and format it as Markdown with headings.",
    icon: "FileCode",
    keywords: ["pdf to markdown", "markdown", "md"],
    steps: [{ title: "Upload", desc: "Drop a PDF." }, { title: "Convert", desc: "Extract and format." }, { title: "Download", desc: "Export .md." }],
    features: ["Heading detection by font size", "Per-page sections"],
    limitations: ["Complex layouts are approximated."],
    faq: [{ q: "Are images included?", a: "Images are not extracted in this build." }],
  },
  {
    id: "pdf-to-powerpoint",
    name: "PDF to PowerPoint",
    seoTitle: "PDF to PowerPoint Converter - Free & Private",
    slug: "pdf-to-powerpoint",
    categoryId: "convert",
    description: "Convert PDF pages into a PowerPoint presentation with extracted text.",
    icon: "Presentation",
    keywords: ["pdf to powerpoint", "pdf to pptx"],
    steps: [{ title: "Upload", desc: "Drop a PDF." }, { title: "Convert", desc: "Build PPTX." }, { title: "Download", desc: "Export .pptx." }],
    features: ["One slide per page", "Text positioning"],
    limitations: ["Complex graphics are not preserved."],
    faq: [{ q: "Is layout exact?", a: "Text positions are approximated." }],
  },
  {
    id: "powerpoint-to-pdf",
    name: "PowerPoint to PDF",
    seoTitle: "PowerPoint to PDF Converter - Free & Private",
    slug: "powerpoint-to-pdf",
    categoryId: "convert",
    description: "Convert a PowerPoint presentation to PDF using extracted slide text.",
    icon: "FileType",
    keywords: ["powerpoint to pdf", "pptx to pdf"],
    steps: [{ title: "Upload", desc: "Drop a .pptx." }, { title: "Convert", desc: "Extract text." }, { title: "Download", desc: "Export PDF." }],
    features: ["One page per slide", "Text extraction"],
    limitations: ["Visual layout, images and charts are not preserved."],
    faq: [{ q: "Are animations preserved?", a: "No." }],
  },
  {
    id: "pdf-forms",
    name: "PDF Forms",
    seoTitle: "Fill PDF Forms Online - Free & Private",
    slug: "pdf-forms",
    categoryId: "edit",
    description: "Detect and fill interactive form fields, then save the completed document.",
    icon: "FormInput",
    keywords: ["pdf forms", "fill form", "acroform"],
    steps: [{ title: "Upload", desc: "Drop a form PDF." }, { title: "Fill", desc: "Enter values." }, { title: "Download", desc: "Export filled PDF." }],
    features: ["Text, checkbox, radio, dropdown fields"],
    limitations: ["XFA forms are not supported."],
    faq: [{ q: "Are values saved?", a: "Yes, into the PDF." }],
  },
  {
    id: "translate-pdf",
    name: "Translate PDF",
    seoTitle: "Translate PDF Online - Free & Private",
    slug: "translate-pdf",
    categoryId: "intelligence",
    description: "Extract document text for translation without sending it to a service.",
    icon: "Languages",
    keywords: ["translate pdf", "translation"],
    steps: [{ title: "Upload", desc: "Drop a PDF." }, { title: "Extract", desc: "Get text." }, { title: "Translate", desc: "Use your preferred tool." }],
    features: ["Local text extraction"],
    limitations: ["No translation engine is bundled; text is not sent externally."],
    faq: [{ q: "Is text uploaded?", a: "No." }],
  },
  {
    id: "workflows",
    name: "Workflows",
    slug: "workflows",
    categoryId: "workflows",
    description: "Run common multi-step PDF tasks such as merge then compress.",
    icon: "Workflow",
    keywords: ["workflow", "merge compress", "pipeline"],
    steps: [{ title: "Select", desc: "Choose files." }, { title: "Run", desc: "Merge then compress." }, { title: "Download", desc: "Export result." }],
    features: ["Merge then compress workflow"],
    limitations: ["Additional workflows can be added."],
    faq: [{ q: "Is it local?", a: "Yes." }],
  }
];

// ---------------------------------------------------------------------------
// Derived registry + lookups. Nothing below is authored per-tool.
// ---------------------------------------------------------------------------

export const PDF_TOOLS: ToolItem[] = TOOL_ENTRIES.map((t) => ({
  ...t,
  href: getToolHref(t),
}));

/** Marketed tool count: every registry entry, presets included. */
export const TOOL_COUNT = PDF_TOOLS.length;

/** Real routes only: presets are query variants of /workflows, not routes. */
export const ROUTE_TOOL_COUNT = PDF_TOOLS.filter(isRealToolRoute).length;

export function getToolById(id: string): ToolItem | undefined {
  return PDF_TOOLS.find((t) => t.id === id);
}

export function getToolBySlug(slug: string): ToolItem | undefined {
  return PDF_TOOLS.find((t) => !t.preset && t.slug === slug);
}

/** Tools in the order the ids are given; unknown ids are skipped. */
export function getToolsByIds(ids: string[]): ToolItem[] {
  const byId = new Map(PDF_TOOLS.map((t) => [t.id, t]));
  const out: ToolItem[] = [];
  for (const id of ids) {
    const tool = byId.get(id);
    if (tool) out.push(tool);
  }
  return out;
}

/** Tools in one master category; "all" returns every entry (presets included). */
export function getToolsByCategory(categoryId: ToolCategoryId | "all"): ToolItem[] {
  if (categoryId === "all") return [...PDF_TOOLS];
  return PDF_TOOLS.filter((t) => t.categoryId === categoryId);
}
