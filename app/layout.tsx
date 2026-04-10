import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AxiosRegistry from "@/components/AxiosRegistry";
import { Toaster } from "sonner";
import { EDITOR_GOOGLE_FONT_URLS } from "@/lib/richText/richTextFonts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  // devanagari subset ensures Geist covers Hindi glyphs as a fallback
  subsets: ["latin", "devanagari"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Contentkosh - Learning Management System",
  description: "A comprehensive LMS for coaching institutes and educational organizations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect for Google Fonts performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Load editor fonts declared in richTextFonts.ts */}
        {EDITOR_GOOGLE_FONT_URLS.map((url) => (
          <link key={url} rel="stylesheet" href={url} />
        ))}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AxiosRegistry />
        <Toaster richColors position="top-right" />
        {children}
      </body>
    </html>
  );
}
