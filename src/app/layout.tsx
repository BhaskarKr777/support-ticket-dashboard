
import type { Metadata } from "next";
import { Manrope, Geist_Mono } from "next/font/google";

import "./globals.css";
import { Header } from "@/components/layout/header";
import { StoreProvider } from "@/store/provider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Support Ticket Dashboard",
  description:
    "A support ticket management dashboard for tracking, prioritizing, and resolving customer requests.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <StoreProvider>
          <Header />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}