import type { Metadata } from "next";
import { StoreProvider } from "@/store/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Support Ticket Dashboard",
  description: "Support ticket management dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}