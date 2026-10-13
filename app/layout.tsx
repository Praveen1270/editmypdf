import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PwaProvider } from "@/components/pwa/PwaProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://pdfkit.local"),
  title: {
    default: "PDFKit — Privacy-First PDF Tools in Your Browser",
    template: "%s | PDFKit",
  },
  description:
    "Merge, split, compress, convert, rotate, protect, and edit PDF files directly in your browser. 100% local processing. Files never leave your device.",
  applicationName: "PDFKit",
  authors: [{ name: "PDFKit Team" }],
  creator: "PDFKit",
  publisher: "PDFKit",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pdfkit.local",
    siteName: "PDFKit",
    title: "PDFKit — Privacy-First PDF Tools in Your Browser",
    description:
      "20 free, private PDF utilities running 100% locally in your browser. Merge, split, compress, protect, and convert without file uploads.",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "PDFKit — Privacy-First PDF Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDFKit — Privacy-First PDF Tools in Your Browser",
    description:
      "20 free, private PDF utilities running 100% locally in your browser. Zero uploads, offline ready.",
    images: ["/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  keywords: [
    "pdf tools",
    "merge pdf",
    "split pdf",
    "compress pdf",
    "pdf to images",
    "images to pdf",
    "rotate pdf",
    "watermark pdf",
    "protect pdf",
    "unlock pdf",
    "privacy-first pdf",
    "offline pdf",
    "client-side pdf editor",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('pdfkit-theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-background text-foreground selection:bg-action-primary selection:text-action-primary-text">
        <ThemeProvider>
          <PwaProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </PwaProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
