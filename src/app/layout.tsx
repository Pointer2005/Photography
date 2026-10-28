import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const outfit = Outfit({ 
  subsets: ['latin'], 
  variable: '--font-sans', 
  weight: ['300', '400', '500', '600', '700', '800'] 
});

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
    <html lang="en" className={cn("h-full", "antialiased", outfit.variable)}>
      <body className="min-h-full flex flex-col font-sans bg-[#09090b] text-zinc-100 overflow-x-hidden selection:bg-pink-500/30 selection:text-pink-200">
        <div className="noise-overlay" aria-hidden="true"></div>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
