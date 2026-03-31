import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SQLawk - Learn SQL Through Flocking",
  description: "A gamified SQL learning experience where each correct query spawns a beautiful bird to join your flock. Master SQL from Hatchling to Phoenix!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full overflow-hidden" suppressHydrationWarning>{children}</body>
    </html>
  );
}
