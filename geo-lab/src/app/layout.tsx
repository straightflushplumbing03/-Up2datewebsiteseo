import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Straight Flush — GEO Intelligence Lab",
  description:
    "Autonomous Generative Engine Optimization and AI search command center for Straight Flush Plumbing & Leak Detection.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
