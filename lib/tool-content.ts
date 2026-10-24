import type { ToolContentData } from "@/components/tools/ToolContent";

export const TOOL_CONTENT: Record<string, ToolContentData> = {
  "excel-to-pdf": {
    title: "Convert Excel spreadsheets to PDF",
    intro:
      "Turn an .xlsx or .xls workbook into a shareable PDF that looks the same on every device. PDFs are ideal for sending reports, price lists and invoices because the recipient can't accidentally change a formula or break the layout.",
    steps: [
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
    faqs: [
      { q: "Will my formulas be kept?", a: "The PDF shows calculated values, not formulas. That's the point: it's a read-only copy." },
      { q: "Can I convert only one sheet?", a: "Yes - remove other sheets first or select the sheet if the option is shown." },
      { q: "Is it free?", a: "Yes, with no sign-up." },
    ],
    privacy: "Conversion happens in your browser, so your spreadsheet isn't uploaded to our servers.",
  },
  "csv-to-pdf": {
    title: "Turn CSV data into a clean, printable PDF",
    intro:
      "CSV files are plain text and hard to read or print. This tool lays your comma-separated data out as a formatted table in a PDF, so it's ready to share, print or archive.",
    steps: [
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
    faqs: [
      { q: "Why do my columns look jumbled?", a: "Usually the wrong delimiter; try semicolon or tab." },
      { q: "Can I style the table?", a: "Basic formatting is applied automatically; for custom styling, open the CSV in Excel and use the Excel to PDF tool." },
      { q: "Is my data uploaded?", a: "No." },
    ],
    privacy: "Your data stays on your device.",
  },
  "word-to-pdf": {
    title: "Convert Word documents to PDF",
    intro:
      "Send a resume, letter, assignment or contract that looks exactly as you wrote it. PDF keeps fonts, spacing and images fixed so the layout doesn't shift on someone else's screen or phone.",
    steps: [
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
    faqs: [
      { q: "Will it keep my formatting?", a: "In most cases yes; very complex layouts should be checked after conversion." },
      { q: "Is it free for long documents?", a: "Yes." },
      { q: "Can I convert back?", a: "Use the PDF to Word tool, though results vary for complex layouts." },
    ],
    privacy: "Files are handled in your browser and aren't stored.",
  },
  "pdf-to-word": {
    title: "Convert PDF to editable Word (.docx)",
    intro:
      "Need to change text in a PDF? Converting it to Word lets you edit paragraphs, fix typos and reuse content in a normal document.",
    valueProp:
      "Converts the text, headings and images of your PDF into an editable .docx you can open in Word, Google Docs or LibreOffice - without uploading the file. Best results come from PDFs that were exported from a word processor (real text, simple layouts). Honest limitations: complex multi-column layouts, heavy design and scanned images of text may need manual cleanup, because a PDF stores positions, not paragraphs.",
    steps: [
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
    faqs: [
      { q: "Are fonts kept?", a: "Fonts are matched where available; otherwise a similar font is used." },
      { q: "Will images be included?", a: "Yes." },
      { q: "Can I convert a scanned PDF?", a: "Text won't be editable without OCR. Use the OCR PDF tool first for scanned documents." },
    ],
    privacy: "Your PDF is processed on your device and not retained.",
  },
  "ebook-to-pdf": {
    title: "Convert eBooks to PDF",
    intro:
      "Read an ebook on any device, print it, or annotate it by turning it into a PDF. Useful for study material, manuals and documents you own.",
    steps: [
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
    faqs: [
      { q: "Why does the layout differ from my reader app?", a: "eBooks adapt to the screen; a PDF fixes a page size." },
      { q: "Can I change the font size?", a: "Not after conversion; PDF layout is fixed." },
      { q: "Is the text still searchable?", a: "Yes." },
    ],
    privacy: "The conversion runs in your browser; your books aren't uploaded.",
  },
  "create-pdf": {
    title: "Make a PDF from text, images or documents",
    intro:
      "Create a new PDF in seconds without installing software. Combine images, type text, or start from a document and export it as a PDF.",
    steps: [
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
    faqs: [
      { q: "Do I need an account?", a: "No." },
      { q: "Will there be a watermark?", a: "No." },
      { q: "Can I edit it later?", a: "Yes, with the Edit PDF tool." },
    ],
    privacy: "Everything is built on your device. Nothing is uploaded.",
  },
  "pdf-to-excel": {
    title: "Extract tables from PDF to Excel",
    intro:
      "Retyping tables from a PDF is slow and error-prone. This tool detects tables and exports them to a spreadsheet so you can sort, filter and calculate.",
    valueProp:
      "Pulls tables out of a PDF into rows and columns you can sort and calculate. It works best on PDFs with real, ruled or clearly aligned tables, such as bank statements, invoices and reports. Tables that span pages are detected per page; merged cells and tables inside scanned images may need manual adjustment. Review totals after export before relying on the data.",
    steps: [
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
    faqs: [
      { q: "Does it merge all tables into one sheet?", a: "Tables from each page are placed in order; review the result." },
      { q: "Are numbers kept as numbers?", a: "Numeric values are exported as numbers where detected." },
      { q: "Is it private?", a: "Yes, processing is local." },
    ],
    privacy: "Your data stays on your device.",
  },
  "pdf-to-epub": {
    title: "Make a PDF readable on e-readers",
    intro:
      "PDFs have fixed pages, which are awkward to read on small screens. Converting to EPUB lets text reflow to fit a phone, tablet or e-reader and lets you change font size.",
    steps: [
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
    faqs: [
      { q: "Will images be included?", a: "Yes, as inline images." },
      { q: "Can I read it on Kindle?", a: "Most Kindle apps accept EPUB via \"Send to Kindle\"." },
      { q: "Is it free?", a: "Yes." },
    ],
    privacy: "Your file is processed on your device.",
  },
  "pdf-to-html": {
    title: "Convert PDF to HTML for the web",
    intro:
      "Publish a PDF's content as a web page so it's searchable, accessible and mobile-friendly, instead of forcing visitors to download a file.",
    valueProp:
      "Turns a PDF into HTML you can publish or embed, keeping text, headings and links as real, selectable page content rather than a flat image. Useful for putting a brochure, menu or report on a website, or making content searchable. Fidelity is highest for text-based PDFs; exact positioning of complex designs may differ slightly from the original.",
    steps: [
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
    faqs: [
      { q: "Is the HTML clean enough to edit?", a: "It's readable; expect to tidy styles for production." },
      { q: "Will links work?", a: "Yes, existing hyperlinks are kept." },
      { q: "Is it private?", a: "Yes." },
    ],
    privacy: "Your file stays on your device.",
  },
  "pos-billing": {
    title: "Create simple bills and receipts as PDFs",
    intro:
      "Generate a clean, printable bill for your shop, stall or small business without installing billing software. Add items, quantities and prices, and the tool totals everything for you.",
    steps: [
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
    faqs: [
      { q: "Do I need an account?", a: "No." },
      { q: "Is my sales data stored?", a: "Not on our servers." },
    ],
    privacy: "Your data stays on your device.",
  },
};

export const VALUE_PROPS: Record<string, string> = {
  about:
    "EditMyPDF exists because most free PDF sites make you upload private documents to a stranger's server and then bury the download behind a signup or watermark. This site was built by one developer in India to do the opposite: tools that run in your browser, with no account, no watermark and no file retention. There's no team of marketers behind it - bugs get reported to and fixed by the person who wrote the code. Contact: founder@editmypdf.co.in",
  "pdf-to-word":
    "Converts the text, headings and images of your PDF into an editable .docx you can open in Word, Google Docs or LibreOffice - without uploading the file. Best results come from PDFs that were exported from a word processor (real text, simple layouts). Honest limitations: complex multi-column layouts, heavy design and scanned images of text may need manual cleanup, because a PDF stores positions, not paragraphs.",
  "pdf-to-excel":
    "Pulls tables out of a PDF into rows and columns you can sort and calculate. It works best on PDFs with real, ruled or clearly aligned tables, such as bank statements, invoices and reports. Tables that span pages are detected per page; merged cells and tables inside scanned images may need manual adjustment. Review totals after export.",
  "pdf-to-html":
    "Turns a PDF into HTML you can publish or embed, keeping text, headings and links as real, selectable page content rather than a flat image. Useful for putting a brochure, menu or report on a website, or making content searchable. Fidelity is highest for text-based PDFs; exact positioning of complex designs may differ slightly from the original.",
};

export const WORKFLOW_DESCRIPTIONS: Record<string, { title: string; description: string }> = {
  "merge-compress": {
    title: "Merge and compress PDFs",
    description:
      "Combine several PDFs into one document, then shrink the result in the same run. Use it when you need to email or upload a bundle (an application pack, invoices for a month) and the merged file is too large to send.",
  },
  "compress-protect": {
    title: "Compress and protect PDFs",
    description:
      "Reduce a PDF's file size and lock it with a password in one step. Use it before sharing sensitive documents such as contracts or ID scans over email or messaging apps.",
  },
  "rotate-numbers": {
    title: "Rotate and number PDFs",
    description:
      "Fix sideways pages, then stamp page numbers on every page. Ideal for scanned documents that came in with mixed orientation and need clean numbering for printing or filing.",
  },
  "flatten-sanitize": {
    title: "Flatten and sanitize PDFs",
    description:
      "Flatten form fields and annotations into fixed page content, and strip hidden metadata such as author and edit history. Use it when you're sending a final copy that shouldn't be editable or reveal who created it.",
  },
};

export const HOMEPAGE_ABOUT = {
  heading: "About EditMyPDF",
  text:
    "EditMyPDF is a free, browser-based PDF toolkit built and maintained by Praveen, an independent developer in Hyderabad, India. Merge, compress, convert and edit PDFs for anyone, anywhere. Files are processed locally on your device, so your documents are not uploaded to a server.",
  shortMeta: "EditMyPDF - free PDF tools by an independent developer in India. Works in your browser; no sign-up.",
};
