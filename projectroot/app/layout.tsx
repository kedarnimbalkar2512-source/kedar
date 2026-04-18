import type { Metadata } from "next";
import { IBM_Plex_Serif, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import "@/app/globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

const plexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  variable: "--font-ibm-plex-serif",
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  title: "Vital ID Platform",
  description: "A trusted medical identity and collaborative diagnosis dashboard powered by Next.js and Supabase."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${plexSerif.variable}`}>
        {children}
      </body>
    </html>
  );
}
