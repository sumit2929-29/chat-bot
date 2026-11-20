import type { Metadata } from "next";
import { Inter } from "next/font/google"; // You can keep Inter or change to another sans-serif
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SupportAI | Curious Rabit Solutions",
  description: "Intelligent Customer Support, Reimagined. A practical AI product by Curious Rabit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}