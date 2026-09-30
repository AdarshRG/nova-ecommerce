// ==============================================================================
// LAYOUT WRAPPER (app/layout.tsx)
// In Next.js App Router, layout.tsx is the top-level template wrapper.
// Every page in your application (like page.tsx) is passed into layout.tsx as 'children'.
// ==============================================================================

import type { Metadata } from "next"; // Type for SEO metadata (title, description)
import { Geist, Geist_Mono } from "next/font/google"; // Google Fonts optimized loader
import "./globals.css"; // Global Tailwind CSS import

// Initialize Geist Sans font with CSS variable name '--font-geist-sans'
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Initialize Geist Mono font with CSS variable name '--font-geist-mono'
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Define SEO metadata rendered in the HTML <head>
export const metadata: Metadata = {
  title: "NOVA E-Commerce | Next-Gen Hardware",
  description: "Premium hardware, electronics, and tech accessories.",
};

// Root Layout Component: Wraps every page inside <html lang="en"> <body>{children}</body> </html>
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* {children} receives page.tsx content */}
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
