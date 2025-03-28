import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "./Navbar";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bokföringssystem, Robert Angberg",
  description: "Bokföringssystem, Robert Angberg",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className={inter.className}>
        <SessionProvider>
          <Navbar />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
