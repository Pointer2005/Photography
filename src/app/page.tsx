import { PrismaClient } from '@prisma/client';
import MainFlow from '@/components/MainFlow';
import BackgroundCarousel from '@/components/BackgroundCarousel';
import { Card, CardContent } from "@/components/ui/card";

const prisma = new PrismaClient();

export const instant = false;

export default async function Home() {
  const campaign = await prisma.campaign.findFirst({
    where: { status: 'ACTIVE' },
    include: { offers: { where: { isActive: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* ── Background Layers ─────────────────────── */}
      <BackgroundCarousel />

      {/* Ambient glow — top */}
      <div className="fixed top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#C8A24E]/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Ambient glow — bottom corner */}
      <div className="fixed bottom-[-80px] right-[-80px] w-[300px] h-[300px] bg-[#C8A24E]/8 rounded-full blur-[100px] pointer-events-none"></div>

      {/* ── Content ───────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16 md:py-24">

        {/* ── Header ──────────────────────────────── */}
        <header className="mb-12 md:mb-16 text-center max-w-2xl mx-auto">
          {/* Logo mark */}
          {/* <div className="animate-fade-up mb-8 inline-flex items-center justify-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center border border-[#C8A24E]/30 bg-[#0C0B09]/80 backdrop-blur-sm animate-pulse-glow">
              <span className="font-serif text-xl text-[#C8A24E] italic tracking-wide">A</span>
            </div>
          </div> */}

          {/* Headline — editorial treatment: display face, tight leading */}
          <h1 className="animate-fade-up delay-100 text-3xl md:text-[42px] lg:text-[52px] font-serif text-[#F5F0E8] leading-[1.15] tracking-[0.03em] font-normal mb-6">
            Every Moment{' '}
            <br className="hidden md:block" />
            <span className="text-[#C8A24E]">Deserves Art.</span>
          </h1>

          {/* Divider */}
          <div className="animate-fade-up delay-200 w-12 h-px bg-gradient-to-r from-transparent via-[#C8A24E]/40 to-transparent mx-auto mb-6"></div>

          {/* Subtitle — caption style, uppercase, tracked */}
          <p className="animate-fade-up delay-300 text-[11px] md:text-xs uppercase tracking-[0.2em] text-[#F5F0E8]/60 font-light max-w-md mx-auto leading-relaxed">
            Weddings · Pre-weddings · Birthdays · Special Events
          </p>
        </header>

        {/* ── Main Content Card ───────────────────── */}
        {campaign ? (
          <div className="animate-fade-up delay-400 w-full max-w-md md:max-w-[560px]">
            <MainFlow campaign={campaign} whatsappNumber={process.env.WHATSAPP_NUMBER || "919883135275"} />
          </div>
        ) : (
          <Card className="animate-fade-up delay-400 bg-[#161412]/55 backdrop-blur-3xl border-[#C8A24E]/15 shadow-2xl relative max-w-md md:max-w-[560px] w-full text-center overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C8A24E]/25 to-transparent z-0" />
            <CardContent className="p-10 relative z-10 border-0">
              <h2 className="text-xl font-serif text-[#C8A24E] mb-3 tracking-wide">Coming Soon</h2>
              <p className="text-[#F5F0E8]/65 font-light text-sm leading-relaxed">
                Our exclusive offers are being prepared. Check back soon.
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Event type pills ────────────────────── */}
        <div className="animate-fade-up delay-600 mt-12 md:mt-16 flex flex-wrap items-center justify-center gap-3 max-w-lg">
          {['Wedding', 'Pre-Wedding', 'Birthday', 'Maternity', 'Corporate'].map((event) => (
            <span
              key={event}
              className="px-4 py-2 text-[10px] uppercase tracking-[0.15em] text-[#F5F0E8]/50 border border-[#F5F0E8]/15 rounded-full font-light hover:border-[#C8A24E]/30 hover:text-[#C8A24E]/80 transition-all duration-300 cursor-default"
            >
              {event}
            </span>
          ))}
        </div>
      </div>

      {/* ── Footer ────────────────────────────────── */}
      <footer className="relative z-10 text-center py-8 border-t border-[#F5F0E8]/10">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#F5F0E8]/40 font-light">
          © {new Date().getFullYear()} the_cinemoy
        </p>
      </footer>
    </main>
  );
}
