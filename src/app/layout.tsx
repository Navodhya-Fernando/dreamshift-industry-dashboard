import type { Metadata } from "next";
import { Inter } from "next/font/google";
// @ts-ignore - Next.js handles global CSS side-effect imports
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DreamShift | Industry Insights",
  description: "Executive dashboard for lead conversion and industry analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body suppressHydrationWarning className={`${inter.className} min-h-screen`}>
        {children}
      </body>
    </html>
  );
}