import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PwaProvider } from "@/components/pwa/PwaProvider";

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "PDFKit — Privacy-First PDF Tools in Your Browser",
  description:
    "Merge, split, compress, convert, rotate, protect, and edit PDF files directly in your browser. 100% local processing. Files never leave your device.",
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
    "privacy-first",
    "offline pdf",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="flex min-h-screen flex-col bg-white text-foreground selection:bg-primary/20">
        <PwaProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </PwaProvider>
      </body>
    </html>
  );
}

