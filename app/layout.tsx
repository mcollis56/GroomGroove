import type { Metadata } from "next";
import { Cormorant_Garamond, Crimson_Text } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const crimson = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-crimson",
});

// Placeholder for Musetta script font - will be replaced with actual font files
const musetta = localFont({
  src: [
    {
      path: "../public/fonts/musetta.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-musetta",
  fallback: ["cursive"],
});

export const metadata: Metadata = {
  title: "Musetta - Curating Exceptional Living",
  description: "Art, interiors, and objects that tell compelling stories across eras and movements.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${crimson.variable} ${musetta.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
