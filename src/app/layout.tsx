import type { Metadata } from "next";
import { 
  Cinzel,
  Lato, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const cinzel = Cinzel({ variable: "--font-cinzel", subsets: ["latin"], display: "swap" });
const lato = Lato({ variable: "--font-lato", subsets: ["latin"], weight: ["300", "400", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "Aetheris Photography — Exclusive Offer",
  description: "Register, spin, and discover a special offer for your next photography session. Weddings, pre-weddings, birthdays and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", cinzel.variable, lato.variable, "font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col font-sans bg-[#0C0B09] text-[#F5F0E8]">
        <div className="noise-overlay" aria-hidden="true"></div>
        {children}
      </body>
    </html>
  );
}
