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
      <div className="fixed top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Ambient glow — bottom corner */}
      <div className="fixed bottom-[-80px] right-[-80px] w-[300px] h-[300px] bg-[#D4AF37]/8 rounded-full blur-[100px] pointer-events-none"></div>

      {/* ── Content ───────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16 md:py-24">

        {/* ── Header ──────────────────────────────── */}
        <header className="mb-14 md:mb-20 text-center max-w-3xl mx-auto">
          {/* Headline — editorial treatment: display face, tight leading */}
          <h1 className="animate-fade-up delay-100 text-4xl md:text-[56px] lg:text-[72px] font-serif text-white/95 leading-[1.05] tracking-tight font-medium mb-6">
            Every Moment <br className="hidden md:block" />
            <span className="italic text-[#D4AF37] font-light">Deserves Art.</span>
          </h1>

          {/* Divider */}
          <div className="animate-fade-up delay-200 w-16 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mx-auto mb-8"></div>

          {/* Subtitle — caption style, uppercase, tracked */}
          <p className="animate-fade-up delay-300 text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-white/50 font-medium max-w-md mx-auto leading-relaxed">
            Weddings · Pre-weddings · Birthdays · Special Events
          </p>
        </header>

        {/* ── Main Content Card ───────────────────── */}
        {campaign ? (
          <div className="animate-fade-up delay-400 w-full max-w-md md:max-w-[560px]">
            <MainFlow campaign={campaign} whatsappNumber={process.env.WHATSAPP_NUMBER || "919883135275"} />
          </div>
        ) : (
          <Card className="animate-fade-up delay-400 bg-black/40 backdrop-blur-3xl border-[#D4AF37]/15 shadow-2xl relative max-w-md md:max-w-[560px] w-full text-center overflow-hidden rounded-2xl">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent z-0" />
            <CardContent className="p-10 relative z-10 border-0">
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-3 tracking-wide italic">Coming Soon</h2>
              <p className="text-white/60 font-light text-sm leading-relaxed">
                Our exclusive offers are being prepared. Check back soon.
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Event type pills ────────────────────── */}
        <div className="animate-fade-up delay-600 mt-16 md:mt-20 flex flex-wrap items-center justify-center gap-3 md:gap-4 max-w-xl">
          {['Wedding', 'Pre-Wedding', 'Birthday', 'Maternity', 'Corporate'].map((event) => (
            <span
              key={event}
              className="px-5 py-2.5 text-[9px] uppercase tracking-[0.2em] text-white/40 border border-white/10 rounded-full font-medium hover:border-[#D4AF37]/30 hover:text-[#D4AF37]/80 hover:bg-[#D4AF37]/5 transition-all duration-300 cursor-default"
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
