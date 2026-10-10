import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Montserrat
} from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-sans', weight: ['300', '400', '500', '600'] });
const cormorant = Cormorant_Garamond({ variable: "--font-serif", subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "The Cinemoy — Exclusive Photography Offer",
  description: "Register, spin, and discover a special offer for your next photography session. Weddings, pre-weddings, birthdays and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", cormorant.variable, montserrat.variable)}>
      <body className="min-h-full flex flex-col font-sans bg-[#0C0B09] text-[#F5F0E8] overflow-x-hidden">
        <div className="noise-overlay" aria-hidden="true"></div>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
