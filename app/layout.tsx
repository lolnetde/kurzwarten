import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "KurzWarten",
  description: "Digitale Warteschlangen einfach verwalten.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
