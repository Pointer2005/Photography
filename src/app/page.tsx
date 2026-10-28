import Image from 'next/image';
import { connection } from 'next/server';
import prisma from '@/lib/prisma';
import MainFlow from '@/components/MainFlow';
import BackgroundCarousel from '@/components/BackgroundCarousel';
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
    <main className="relative min-h-screen flex flex-col lg:flex-row bg-[#09090b] overflow-x-hidden">
      
      {/* ── Left Half: Photography & Branding ─────────────────────── */}
      <div className="relative w-full lg:w-1/2 h-[50vh] lg:h-screen shrink-0 border-b lg:border-b-0 lg:border-r border-white/5">
        <BackgroundCarousel />
        
        {/* Branding overlay on the images */}
        <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 lg:bottom-16 lg:left-16 z-20 flex flex-col items-start">
          <h1 className="sr-only">the_Cinemoy - Shoot | Edit | Create</h1>
          <div className="animate-fade-up relative w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 rounded-full overflow-hidden drop-shadow-[0_12px_28px_rgba(0,0,0,0.85)] filter">
            <Image
              src="/images/logo.png"
              alt="the_Cinemoy - Professional Experience"
              fill
              sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, (max-width: 1024px) 192px, 256px"
              className="object-contain rounded-full"
              priority
            />
          </div>
          <p className="animate-fade-up delay-200 text-white/80 font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs mt-3 drop-shadow-md">
            Weddings · Events · Commercial
          </p>
        </div>
      </div>

      {/* ── Right Half: Interactive Form ───────────────────────────────── */}
      <div className="relative w-full lg:w-1/2 min-h-[30vh] lg:min-h-screen flex flex-col items-center justify-center p-2 md:p-12 lg:p-16 bg-[#09090b] z-10 ">
        
        {/* Vibrant ambient glows with GPU-accelerated radial gradients */}
        <div className="absolute top-[-10%] right-[-10%] w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(236,72,153,0.16)_0%,transparent_70%)] rounded-full pointer-events-none transform-gpu"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(99,102,241,0.16)_0%,transparent_70%)] rounded-full pointer-events-none transform-gpu"></div>

        {/* ── Main Content Card ───────────────────── */}
        <div className="relative z-10 w-full max-w-md">
          {campaign ? (
            <div className="animate-fade-up delay-400">
              <MainFlow campaign={campaign} whatsappNumber={process.env.WHATSAPP_NUMBER || "919883135275"} />
            </div>
          ) : (
            <Card className="animate-fade-up delay-400 bg-zinc-950/80 backdrop-blur-xl border-white/10 shadow-2xl relative w-full text-center overflow-hidden rounded-[2rem] transform-gpu">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-transparent z-0" />
              <CardContent className="p-10 relative z-10 border-0">
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500 mb-3 tracking-tight">Coming Soon</h2>
                <p className="text-zinc-400 font-medium text-sm leading-relaxed">
                  Our exclusive offers are being prepared. Check back soon.
                </p>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
          {/* ── Footer ────────────────────────────────── */}
          <footer className="mt-2 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold">
              © {new Date().getFullYear()} the_cinemoy
            </p>
          </footer>
    </main>
  );
}
