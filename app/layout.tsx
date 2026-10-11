import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Library Catalog Search",
  description: "See whether a title is available across Bay Area and Southern California libraries.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
