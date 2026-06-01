import type { Metadata } from "next";
import { Playfair_Display, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lion City Bank — SQL Analytics Terminal",
  description:
    "Master SQL through real banking scenarios at Lion City Bank (Singapore). Each correct query docks a new ship in your harbour — from Tugboat to Supertanker.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`h-full antialiased ${playfair.variable} ${ibmPlexMono.variable}`}>
      <body className="h-full overflow-hidden" suppressHydrationWarning>
        <Analytics />
        <SpeedInsights />
        {children}
      </body>
    </html>
  );
}
