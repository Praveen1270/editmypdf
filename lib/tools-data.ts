export type ToolCategory = "organize" | "convert" | "layout" | "security";

export type SidebarCategoryId =
  | "scan-workflow"
  | "page-management"
  | "edit-annotate"
  | "create-convert-pdf"
  | "convert-other"
  | "security-privacy"
  | "collaborate-share";

export interface SidebarCategoryDef {
  id: SidebarCategoryId;
  label: string;
}

export const SIDEBAR_CATEGORIES: SidebarCategoryDef[] = [
  { id: "scan-workflow", label: "Scan & Workflow" },
  { id: "page-management", label: "Page Management" },
  { id: "edit-annotate", label: "Edit & Annotate" },
  { id: "create-convert-pdf", label: "Create & Convert → PDF" },
  { id: "convert-other", label: "Convert → Other" },
  { id: "security-privacy", label: "Security & Privacy" },
  { id: "collaborate-share", label: "Collaborate & Share" },
];

export interface ToolItem {
  id: string;
  name: string;
  title: string;
  href: string;
  category: ToolCategory;
  categoryName: string;
  sidebarCategory: SidebarCategoryId;
  description: string;
  shortDesc: string;
  iconName: string;
  keywords: string[];
  steps: { title: string; desc: string }[];
  features: string[];
  limitations: string[];
  faq: { q: string; a: string }[];
}

export const CATEGORIES: { id: ToolCategory; name: string }[] = [
  { id: "organize", name: "Organize PDFs" },
  { id: "convert", name: "Convert and Compress" },
  { id: "layout", name: "Edit Page Layout" },
  { id: "security", name: "Secure and Inspect" },
];

export interface ToolDirectoryCategory {
  id: string;
  name: string;
  description: string;
  toolIds: string[];
}

export const TOOL_CATEGORIES: ToolDirectoryCategory[] = [
  {
    id: "organize-pages",
    name: "Organize pages",
    description: "Reorder, combine, divide, and orient your documents",
    toolIds: ["merge", "split", "organize", "rotate", "extract-pages"],
  },
  {
    id: "edit-pdf",
    name: "Edit PDF",
    description: "Modify content, margins, page numbers, text, and properties",
    toolIds: ["edit-pdf", "edit-pdf-text", "add-text", "watermark", "page-numbers", "crop", "resize", "metadata-editor"],
  },
  {
    id: "convert-files",
    name: "Convert files",
    description: "Transform PDFs into image formats, plain text, or monochrome",
    toolIds: ["pdf-to-images", "images-to-pdf", "pdf-to-text", "pdf-to-grayscale"],
  },
  {
    id: "optimize",
    name: "Optimize",
    description: "Reduce file sizes, count pages, and compare document changes",
    toolIds: ["compress", "page-counter", "compare-pdfs"],
  },
  {
    id: "security",
    name: "Security",
    description: "AES-256 client-side encryption and password removal",
    toolIds: ["protect", "unlock"],
  },
];

export const PDF_TOOLS: ToolItem[] = [
  // --- Category 1: Organize PDFs ---
  {
    id: "merge",
    name: "Merge PDF",
    title: "Merge PDF Files Online — 100% Free & Private",
    href: "/merge-pdf",
    category: "organize",
    categoryName: "Organize PDFs",
    sidebarCategory: "page-management",
    description: "Combine multiple PDF documents into a single organized file with customizable page order. Processed locally in your browser.",
    shortDesc: "Combine multiple PDFs into one document.",
    iconName: "Files",
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
    title: "Split PDF — Extract Pages or Ranges Privately",
    href: "/split-pdf",
    category: "organize",
    categoryName: "Organize PDFs",
    sidebarCategory: "page-management",
    description: "Extract specific page ranges or split every page into separate individual documents packaged into a convenient ZIP file.",
    shortDesc: "Extract pages or divide a document.",
    iconName: "Scissors",
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
    title: "Organize PDF Pages — Reorder, Duplicate & Delete Pages",
    href: "/organize-pdf",
    category: "organize",
    categoryName: "Organize PDFs",
    sidebarCategory: "page-management",
    description: "Visual PDF page organizer. View page thumbnails, reorder page sequence, duplicate pages, or delete unwanted pages.",
    shortDesc: "Reorder, duplicate, or delete pages visually.",
    iconName: "LayoutGrid",
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
    title: "Rotate PDF Pages — 90°, 180°, 270° Orientation",
    href: "/rotate-pdf",
    category: "organize",
    categoryName: "Organize PDFs",
    sidebarCategory: "page-management",
    description: "Permanently adjust page rotation by 90°, 180°, or 270°. Select individual pages or rotate all pages at once with live thumbnail previews.",
    shortDesc: "Correct page orientation permanently.",
    iconName: "RotateCw",
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
    title: "Extract PDF Pages — Save Specific Pages to New PDF",
    href: "/extract-pdf-pages",
    category: "organize",
    categoryName: "Organize PDFs",
    sidebarCategory: "page-management",
    description: "Extract specific pages from a PDF document into a clean new document or individual files. Select pages visually or by range.",
    shortDesc: "Save selected pages into a new PDF.",
    iconName: "FolderOutput",
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

  // --- Category 2: Convert and Compress ---
  {
    id: "compress",
    name: "Compress PDF",
    title: "Compress PDF — Reduce PDF File Size Locally",
    href: "/compress-pdf",
    category: "convert",
    categoryName: "Convert and Compress",
    sidebarCategory: "scan-workflow",
    description: "Reduce PDF document file size with three selectable compression presets while preserving vectors and text. Honest size accounting.",
    shortDesc: "Reduce file size without quality loss.",
    iconName: "Minimize2",
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
    title: "PDF to Images — Convert PDF Pages to PNG or JPG",
    href: "/pdf-to-images",
    category: "convert",
    categoryName: "Convert and Compress",
    sidebarCategory: "convert-other",
    description: "Convert PDF pages into high-resolution PNG or JPG images with custom scaling. Download individually or as a ZIP package.",
    shortDesc: "Export PDF pages as PNG or JPG images.",
    iconName: "Image",
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
    id: "images-to-pdf",
    name: "Images to PDF",
    title: "Images to PDF — Convert JPG, PNG & WebP to PDF",
    href: "/images-to-pdf",
    category: "convert",
    categoryName: "Convert and Compress",
    sidebarCategory: "create-convert-pdf",
    description: "Convert photos and graphics into a standardized PDF with custom page sizes, orientations, and margins.",
    shortDesc: "Turn images into a single standardized PDF.",
    iconName: "FileImage",
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
    id: "pdf-to-text",
    name: "PDF to Text",
    title: "PDF to Text — Extract Text from PDF Documents",
    href: "/pdf-to-text",
    category: "convert",
    categoryName: "Convert and Compress",
    sidebarCategory: "convert-other",
    description: "Extract selectable text from PDF documents. Copy extracted text to your clipboard or download as a clean plain text (.txt) file.",
    shortDesc: "Extract readable text to copy or download as TXT.",
    iconName: "FileText",
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
    title: "PDF to Grayscale — Convert Color PDFs to Black & White",
    href: "/pdf-to-grayscale",
    category: "convert",
    categoryName: "Convert and Compress",
    sidebarCategory: "convert-other",
    description: "Convert color PDF documents to clean grayscale. Ideal for saving black-and-white printer ink and standardizing office documents.",
    shortDesc: "Convert color PDFs to monochrome grayscale.",
    iconName: "Palette",
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

  // --- Category 3: Edit Page Layout ---
  {
    id: "page-numbers",
    name: "Add Page Numbers",
    title: "Add Page Numbers to PDF Document",
    href: "/add-page-numbers",
    category: "layout",
    categoryName: "Edit Page Layout",
    sidebarCategory: "edit-annotate",
    description: "Insert customizable page numbers, templates, positions, and formatting into any PDF with live placement preview.",
    shortDesc: "Add customizable numbering to PDF pages.",
    iconName: "Hash",
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
    title: "Watermark PDF — Add Text Watermarks Privately",
    href: "/watermark-pdf",
    category: "layout",
    categoryName: "Edit Page Layout",
    sidebarCategory: "edit-annotate",
    description: "Stamp customized text watermarks across document pages with live opacity, rotation, and color control.",
    shortDesc: "Add customized text watermarks to pages.",
    iconName: "Stamp",
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
    id: "edit-pdf-text",
    name: "Edit PDF Text",
    title: "Edit PDF Text Online — Modify Existing Text Directly in PDF",
    href: "/edit-pdf-text",
    category: "layout",
    categoryName: "Edit Page Layout",
    sidebarCategory: "edit-annotate",
    description: "Edit existing text directly in your PDF while preserving the original layout and font styling as closely as possible. 100% private in-browser editing.",
    shortDesc: "Fix text in your PDF without rebuilding the document.",
    iconName: "Type",
    keywords: ["edit text", "replace text", "modify text", "change text in pdf", "edit existing text", "pdf editor", "correct text"],
    steps: [
      { title: "Upload PDF", desc: "Select or drop your PDF document to load its pages and extract selectable text." },
      { title: "Click Any Text", desc: "Navigate to any page and click or select the existing text element you wish to edit." },
      { title: "Edit & Preview", desc: "Modify the wording, adjust font styling or size, and inspect the real-time preview." },
      { title: "Export Document", desc: "Click Export PDF to download your modified document with intact formatting." },
    ],
    features: [
      "Click-to-edit existing text directly on the rendered PDF page",
      "Automatic detection of font family, size, baseline, and coordinates",
      "Clean background-matched text replacement preserving surrounding layout",
      "Support for standard fonts with bold, italic, and color controls",
      "Real-time interactive page preview reflecting applied changes",
      "Full Undo / Redo history with multi-page edit tracking",
      "Automatic detection and honest reporting for scanned documents",
      "100% client-side execution in volatile RAM—zero server uploads",
    ],
    limitations: [
      "Works on vector PDFs with extractable text; scanned image pages require vector text.",
      "Custom subsetted or proprietary embedded fonts fall back to standard matching typography.",
    ],
    faq: [
      {
        q: "How does Edit PDF Text modify existing text?",
        a: "EditMyPDF extracts text positioning and font geometry directly from your document stream. When you apply an edit, it cleanly covers the original text boundary using a calibrated page patch and draws replacement text using matching typographic metrics.",
      },
      {
        q: "Will the original font be preserved?",
        a: "We inspect the embedded font metadata (such as Helvetica, Times Roman, Courier, Arial, etc.) and match the original family, size, weight, and color as closely as technically feasible. Where proprietary subsetted fonts prevent exact embedding, compatible typographic fallbacks are provided.",
      },
      {
        q: "Can I edit scanned documents?",
        a: "If a PDF consists solely of scanned photos without selectable vector text, our engine alerts you immediately that the page is image-based.",
      },
    ],
  },
  {
    id: "edit-pdf",
    name: "Edit PDF",
    title: "Edit PDF Online — Full Visual Editor, 100% Private",
    href: "/edit-pdf",
    category: "layout",
    categoryName: "Edit Page Layout",
    sidebarCategory: "edit-annotate",
    description: "Full visual PDF editor: click any text to edit it in place with matched fonts, plus whiteout, signatures, images, highlights, links, shapes and form fields. 100% private in-browser editing.",
    shortDesc: "Edit text in place, sign, whiteout, highlight & annotate.",
    iconName: "PenLine",
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
    title: "Add Text to PDF — Place Text Overlays on Pages",
    href: "/add-text-to-pdf",
    category: "layout",
    categoryName: "Edit Page Layout",
    sidebarCategory: "edit-annotate",
    description: "Place custom text notes, annotations, dates, or signatures onto specific PDF pages with visual placement controls.",
    shortDesc: "Add text overlays, notes, and annotations to pages.",
    iconName: "Type",
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
    title: "Crop PDF — Trim Page Margins & Canvas Boundaries",
    href: "/crop-pdf",
    category: "layout",
    categoryName: "Edit Page Layout",
    sidebarCategory: "page-management",
    description: "Adjust page boundaries and trim unwanted margins using numeric margin controls. Apply to all pages or specific pages.",
    shortDesc: "Trim margins and adjust page boundaries.",
    iconName: "Crop",
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
    title: "Resize PDF Pages — Change Page Dimensions to A4, Letter, A3",
    href: "/resize-pdf",
    category: "layout",
    categoryName: "Edit Page Layout",
    sidebarCategory: "page-management",
    description: "Change PDF page dimensions to standard sizes like A4, US Letter, A3, or Legal with automatic content scaling.",
    shortDesc: "Change page dimensions to A4, Letter, A3, etc.",
    iconName: "Maximize",
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

  // --- Category 4: Secure and Inspect ---
  {
    id: "protect",
    name: "Protect PDF",
    title: "Password Protect PDF — Standard AES-256 Encryption",
    href: "/protect-pdf",
    category: "security",
    categoryName: "Secure and Inspect",
    sidebarCategory: "security-privacy",
    description: "Encrypt your PDF document locally with a password using industry-standard AES-256 (PDF 2.0 / ISO 32000-2) encryption.",
    shortDesc: "Encrypt PDFs locally with a strong password.",
    iconName: "Lock",
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
    title: "Unlock PDF — Remove Password Security Privately",
    href: "/unlock-pdf",
    category: "security",
    categoryName: "Secure and Inspect",
    sidebarCategory: "security-privacy",
    description: "Remove password protection and encryption from your PDF document using your password. Processed 100% locally in your browser.",
    shortDesc: "Remove password protection using your password.",
    iconName: "Unlock",
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
    title: "PDF Metadata Editor — View, Edit & Strip Document Properties",
    href: "/pdf-metadata-editor",
    category: "security",
    categoryName: "Secure and Inspect",
    sidebarCategory: "security-privacy",
    description: "Inspect and edit PDF metadata properties including Title, Author, Subject, Keywords, Creator, and Producer. Strip all metadata for privacy.",
    shortDesc: "View, edit, or strip PDF metadata fields.",
    iconName: "FileSliders",
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
    title: "PDF Page Counter & Properties Inspector — Free Audit Tool",
    href: "/pdf-page-counter",
    category: "security",
    categoryName: "Secure and Inspect",
    sidebarCategory: "scan-workflow",
    description: "Inspect page counts, dimensions (pt, mm, in), standard paper sizes, encryption status, and metadata. Download a plain-text audit report.",
    shortDesc: "Inspect page count, dimensions & document properties.",
    iconName: "Binary",
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
    title: "Compare PDFs — Side-by-Side Local Document Comparison",
    href: "/compare-pdfs",
    category: "security",
    categoryName: "Secure and Inspect",
    sidebarCategory: "collaborate-share",
    description: "Load two PDF documents locally to compare page counts, file sizes, and text content line-by-line. Highlights detected differences.",
    shortDesc: "Compare two PDFs for text and structural changes.",
    iconName: "GitCompare",
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
];

export function getToolsBySidebarCategory(categoryId: SidebarCategoryId): ToolItem[] {
  return PDF_TOOLS.filter((t) => t.sidebarCategory === categoryId);
}

export function getSidebarCategoryCounts(): Record<SidebarCategoryId, number> {
  const counts: Partial<Record<SidebarCategoryId, number>> = {};
  for (const cat of SIDEBAR_CATEGORIES) {
    counts[cat.id] = PDF_TOOLS.filter((t) => t.sidebarCategory === cat.id).length;
  }
  return counts as Record<SidebarCategoryId, number>;
}
