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
    <main className="relative min-h-[100dvh] flex flex-col items-center justify-center p-3 sm:p-6 bg-[#09090b] overflow-x-hidden">
      
      {/* Vibrant ambient glows with GPU-accelerated radial gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-[radial-gradient(circle,rgba(236,72,153,0.14)_0%,transparent_70%)] rounded-full pointer-events-none transform-gpu" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-[radial-gradient(circle,rgba(99,102,241,0.14)_0%,transparent_70%)] rounded-full pointer-events-none transform-gpu" />

      {/* ── Main Content Container ───────────────────── */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md my-auto flex flex-col items-center">
        
        {/* ── Centered Logo & Branding ─────────────────── */}
        <header className="flex flex-col items-center text-center mb-2.5 sm:mb-4">
          <h1 className="sr-only">the_Cinemoy - Shoot | Edit | Create</h1>
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden drop-shadow-[0_8px_24px_rgba(0,0,0,0.85)] border border-white/20 bg-black/40 backdrop-blur-md mb-1.5 sm:mb-2">
            <Image
              src="/images/logo.png"
              alt="the_Cinemoy - Professional Experience"
              fill
              sizes="(max-width: 640px) 64px, 80px"
              className="object-contain rounded-full p-1 sm:p-1.5"
              priority
            />
          </div>
          <p className="text-base sm:text-lg font-black text-white tracking-tight leading-tight drop-shadow-md">
            the_Cinemoy
          </p>
          <p className="text-white/70 font-bold tracking-[0.16em] uppercase text-[9px] sm:text-[10px] mt-0.5 drop-shadow-md">
            Weddings · Events · Commercial
          </p>
        </header>

        {/* ── Interactive Card ─────────────────────────── */}
        {campaign ? (
          <div className="w-full animate-fade-up">
            <MainFlow campaign={campaign} whatsappNumber={process.env.WHATSAPP_NUMBER || "919883135275"} />
          </div>
        ) : (
          <Card className="animate-fade-up bg-zinc-950/80 backdrop-blur-xl border-white/10 shadow-2xl relative w-full text-center overflow-hidden rounded-2xl sm:rounded-[2rem] transform-gpu">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-transparent z-0" />
            <CardContent className="p-6 sm:p-10 relative z-10 border-0">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500 mb-2 tracking-tight">Coming Soon</h2>
              <p className="text-zinc-400 font-medium text-xs sm:text-sm leading-relaxed">
                Our exclusive offers are being prepared. Check back soon.
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Footer ────────────────────────────────── */}
        <footer className="mt-2.5 sm:mt-3 text-center">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold">
            © {new Date().getFullYear()} the_cinemoy
          </p>
        </footer>
      </div>
    </main>
  );
}
