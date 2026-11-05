// ---------------------------------------------------------------------------
// Single source of truth for FAQ content.
//
// - FAQ_ITEMS: the full FAQ page list. Rendered by app/faq/page.tsx, used for
//   the FAQPage JSON-LD in app/faq/layout.tsx, and for the markdown FAQ page
//   in lib/md/registry.ts. Edit an answer here and all three agree.
// - HOME_FAQ_ITEMS: the shorter set shown on the home page
//   (components/home/FaqSection.tsx).
//
// Counts use TOOL_COUNT from the registry — never a literal.
// ---------------------------------------------------------------------------

import { TOOL_COUNT } from "./tools-data";

export interface FaqItem {
  q: string;
  a: string;
  category: "privacy" | "technical" | "tools" | "security";
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    category: "privacy",
    q: "Are my PDF files uploaded to any server or cloud storage?",
    a: "Never. All document operations happen entirely on your computer or mobile device inside your browser's local runtime. Neither your files, extracted text, or passwords are ever transmitted over the network.",
  },
  {
    category: "privacy",
    q: "How can I independently verify that files stay on my device?",
    a: "Open your browser Developer Tools (F12 or Cmd+Option+I), navigate to the Network tab, and process any file. You will observe zero POST or upload requests. You can also turn off your internet connection completely after loading the page and the tools will still function.",
  },
  {
    category: "technical",
    q: "What are the file size limits?",
    a: "There are no arbitrary software limits imposed by EditMyPDF. Because processing relies on client-side RAM, documents up to several hundred megabytes process smoothly on most modern laptops and desktops. Mobile devices with limited RAM may experience memory constraints with extremely large files.",
  },
  {
    category: "technical",
    q: "Which browsers are supported?",
    a: "EditMyPDF is compatible with all modern standards-compliant web browsers supporting WebAssembly and the HTML5 File API, including Google Chrome, Mozilla Firefox, Apple Safari, and Microsoft Edge on desktop, tablet, and mobile.",
  },
  {
    category: "tools",
    q: "Why did PDF to Text return no text from my document?",
    a: "If your PDF was created by scanning physical paper with an office scanner or photo app without OCR (Optical Character Recognition), the document contains only bitmap pictures of pages. Text extraction requires selectable digital characters. Pure image scans require OCR software.",
  },
  {
    category: "tools",
    q: "How does the local PDF compression tool work?",
    a: "Our compression engine eliminates duplicate structural objects, optimizes cross-reference streams, and re-encodes oversized embedded raster graphics at calibrated resolutions. We report honest before-and-after measurements and never display fabricated savings.",
  },
  {
    category: "security",
    q: "What encryption standard does Protect PDF use?",
    a: "We utilize industry-standard AES-256 bit encryption (PDF 2.0 / ISO 32000-2) and AES-128 via the native Web Crypto API. The resulting protected files are fully compatible with Adobe Acrobat, Apple Preview, Google Chrome, and standard PDF readers.",
  },
  {
    category: "security",
    q: "Can Unlock PDF recover a forgotten password?",
    a: "No. EditMyPDF is designed to decrypt PDFs when you know the legitimate document password. We do not support password cracking or bypassing security controls.",
  },
  {
    category: "technical",
    q: "Can I use EditMyPDF completely offline?",
    a: `Yes. Once the initial application scripts and PDF worker are loaded into your browser cache, you can disconnect Wi-Fi or enable Airplane Mode and all ${TOOL_COUNT} PDF utilities will continue working offline.`,
  },
  {
    category: "privacy",
    q: "Do I need an account or subscription to use EditMyPDF?",
    a: `No. EditMyPDF requires no account, registration, or credit card. All ${TOOL_COUNT} tools are completely free to use without restrictions.`,
  },
];

export const HOME_FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "Is EditMyPDF really 100% free with no limits?",
    a: "Yes. All tools on EditMyPDF are completely free to use. There are no subscriptions, paywalls, watermarks, trial periods, or artificial daily conversion limits.",
  },
  {
    q: "Are my PDF files uploaded to any servers?",
    a: "No. All PDF processing happens locally in your browser's RAM memory using JavaScript and WebAssembly. Your documents are never sent across the internet to our servers or any third-party APIs.",
  },
  {
    q: "How does in-browser PDF editing and conversion work?",
    a: "Modern web browsers are capable of running powerful WebAssembly binaries and high-performance JavaScript engines (pdf-lib, pdf.js, fontkit, Tesseract.js). We load the processing libraries onto your browser once, and your computer's CPU processes the files locally.",
  },
  {
    q: "What is the maximum file size I can edit or convert?",
    a: "Since processing takes place in your local computer memory, the practical limit is determined by your device's available RAM. Most modern computers and smartphones can effortlessly handle files between 100MB and 200MB. For maximum browser stability, we recommend files under 150MB.",
  },
  {
    q: "Can I use EditMyPDF on mobile phones and tablets?",
    a: "Yes. EditMyPDF is fully responsive and supports all modern mobile browsers on iOS and Android. You can also install it as a Progressive Web App (PWA) to your home screen for one-tap access.",
  },
  {
    q: "Does EditMyPDF work offline?",
    a: "Yes. Once the web application and tools are cached by your browser's service worker, the core PDF processing utilities can operate completely offline without an active internet connection.",
  },
];
