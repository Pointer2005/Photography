import Image from 'next/image';
import { connection } from 'next/server';
import prisma from '@/lib/prisma';
import MainFlow from '@/components/MainFlow';
import { Card, CardContent } from "@/components/ui/card";

export const instant = false;

export default async function Home() {
  await connection();
  const now = new Date();
  const campaign = await prisma.campaign.findFirst({
    where: { status: 'ACTIVE' },
    include: {
      offers: {
        where: {
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } }
          ]
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="fixed inset-0 w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 pb-2.5 sm:pb-3.5 bg-[#09090b] overflow-hidden select-none">
      
      {/* Vibrant ambient glows clipped inside container */}
      <div className="absolute -top-24 -right-24 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-[radial-gradient(circle,rgba(236,72,153,0.18)_0%,transparent_70%)] rounded-full pointer-events-none transform-gpu" />
      <div className="absolute -bottom-24 -left-24 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-[radial-gradient(circle,rgba(99,102,241,0.18)_0%,transparent_70%)] rounded-full pointer-events-none transform-gpu" />

      {/* ── Main Content Container (Vertically Centered) ── */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md my-auto flex flex-col items-center shrink-0">
        
        {/* ── Centered Logo & Branding ─────────────────── */}
        <header className="flex flex-col items-center text-center mb-3 sm:mb-4 shrink-0">
          <h1 className="sr-only">the_Cinemoy - Shoot | Edit | Create</h1>
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden drop-shadow-[0_10px_28px_rgba(0,0,0,0.9)] border-2 border-white/25 bg-black/60 backdrop-blur-md mb-2">
            <Image
              src="/images/logo.png"
              alt="the_Cinemoy - Professional Experience"
              fill
              sizes="(max-width: 640px) 96px, 112px"
              className="object-contain rounded-full p-2"
              priority
            />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none drop-shadow-md">
            the_Cinemoy
          </p>
          <p className="text-white/70 font-semibold tracking-[0.16em] uppercase text-xs mt-1.5 drop-shadow-md">
            Weddings · Events · Commercial
          </p>
        </header>

        {/* ── Interactive Card ─────────────────────────── */}
        {campaign ? (
          <div className="w-full animate-fade-up">
            <MainFlow campaign={campaign} whatsappNumber={process.env.WHATSAPP_NUMBER || "919883135275"} />
          </div>
        ) : (
          <Card className="animate-fade-up bg-zinc-950/85 backdrop-blur-xl border-white/10 shadow-2xl relative w-full text-center overflow-hidden rounded-2xl sm:rounded-[2rem] transform-gpu">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-transparent z-0" />
            <CardContent className="p-6 sm:p-10 relative z-10 border-0">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500 mb-2 tracking-tight">Coming Soon</h2>
              <p className="text-zinc-400 font-medium text-sm leading-relaxed">
                Our exclusive offers are being prepared. Check back soon.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Footer Pinned to the Very Bottom ─────────── */}
      <footer className="relative z-10 w-full text-center py-1 shrink-0">
        <p className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold">
          © {new Date().getFullYear()} the_cinemoy
        </p>
      </footer>
    </main>
  );
}
