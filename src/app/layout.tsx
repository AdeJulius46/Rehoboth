import type { Metadata } from "next";
import { Rethink_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const rethinkSans = Rethink_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${BRAND.name} — Business Management System`,
  description: `${BRAND.name} is a business management system (mini-ERP) for product/sales-driven companies.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${rethinkSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
