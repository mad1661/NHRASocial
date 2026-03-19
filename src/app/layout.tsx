import type { Metadata } from "next";
import { Bodoni_Moda, IBM_Plex_Sans } from "next/font/google";

import "@/app/globals.css";

const displayFont = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-display",
});

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "NHRA Content Intelligence",
  description:
    "A race-week content intelligence dashboard for what is working now, who is winning attention, and what NHRA should post next.",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>{children}</body>
    </html>
  );
}
