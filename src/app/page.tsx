import prisma from '@/lib/prisma';
import MainFlow from '@/components/MainFlow';
import BackgroundCarousel from '@/components/BackgroundCarousel';
import { Card, CardContent } from "@/components/ui/card";

export const instant = false;

export default async function Home() {
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
        
        {/* Branding text overlay on the images */}
        <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 lg:bottom-16 lg:left-16 z-20">
          <h1 className="animate-fade-up text-5xl md:text-6xl lg:text-[84px] font-black text-white tracking-tighter leading-[0.9] mb-3 md:mb-4 drop-shadow-2xl">
            Capture <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">Every Vibe.</span>
          </h1>
          <p className="animate-fade-up delay-200 text-white/80 font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs">
            Weddings · Events · Portraits
          </p>
        </div>
      </div>

      {/* ── Right Half: Interactive Form ───────────────────────────────── */}
      <div className="relative w-full lg:w-1/2 min-h-[55vh] lg:min-h-screen flex flex-col items-center justify-center p-6 md:p-12 lg:p-16 bg-[#09090b] z-10">
        
        {/* Vibrant ambient glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-pink-500/15 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none"></div>

        {/* ── Main Content Card ───────────────────── */}
        <div className="relative z-10 w-full max-w-md">
          {campaign ? (
            <div className="animate-fade-up delay-400">
              <MainFlow campaign={campaign} whatsappNumber={process.env.WHATSAPP_NUMBER || "919883135275"} />
            </div>
          ) : (
            <Card className="animate-fade-up delay-400 bg-white/5 backdrop-blur-2xl border-white/10 shadow-2xl relative w-full text-center overflow-hidden rounded-[2rem]">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-transparent z-0" />
              <CardContent className="p-10 relative z-10 border-0">
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500 mb-3 tracking-tight">Coming Soon</h2>
                <p className="text-zinc-400 font-medium text-sm leading-relaxed">
                  Our exclusive offers are being prepared. Check back soon.
                </p>
              </CardContent>
            </Card>
          )}

          {/* ── Footer ────────────────────────────────── */}
          <footer className="mt-12 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold">
              © {new Date().getFullYear()} the_cinemoy
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}
