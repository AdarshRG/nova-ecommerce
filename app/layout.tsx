// ==============================================================================
// LAYOUT WRAPPER (app/layout.tsx)
// In Next.js App Router, layout.tsx is the top-level template wrapper.
// Every page in your application (like page.tsx) is passed into layout.tsx as 'children'.
// ==============================================================================

import type { Metadata } from "next"; // Type for SEO metadata (title, description)
import "./globals.css"; // Global Tailwind CSS import

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
    <html lang="en" className="h-full antialiased">
      {/* {children} receives page.tsx content */}
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}

