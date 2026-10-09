import { PrismaClient } from '@prisma/client';
import MainFlow from '@/components/MainFlow';

const prisma = new PrismaClient();

export const instant = false;

export default async function Home() {
  const campaign = await prisma.campaign.findFirst({
    where: { status: 'ACTIVE' },
    include: { offers: { where: { isActive: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="min-h-screen bg-charcoal bg-gradient-to-b from-black/80 to-charcoal text-cream selection:bg-gold-500/30 selection:text-gold-400">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none"></div>

      <div className="relative z-10 container mx-auto px-4 py-12 md:py-24 flex flex-col items-center justify-center min-h-screen">
        <header className="mb-12 md:mb-16 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="w-16 h-16 border-2 border-gold-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="font-serif text-2xl text-gold-400 italic">L</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-6 tracking-tight leading-tight max-w-4xl">
            Your Moments Deserve <br className="hidden md:block" />
            <span className="text-gold-400 italic font-light">Something Special.</span>
          </h1>
          <p className="text-lg md:text-xl text-cream/70 max-w-2xl mx-auto font-light tracking-wide leading-relaxed">
            Register, spin, and discover a special offer for your next photography session.
          </p>
        </header>

        {campaign ? (
          <MainFlow campaign={campaign} />
        ) : (
          <div className="bg-black/50 p-8 rounded-xl border border-white/10 text-center max-w-md w-full">
            <h2 className="text-xl font-serif text-gold-400 mb-2">No Active Campaigns</h2>
            <p className="text-cream/60">Check back later for special offers.</p>
          </div>
        )}
      </div>

      <footer className="relative z-10 text-center py-8 text-cream/40 text-sm">
        <p>© {new Date().getFullYear()} Photography Spin & Win. All rights reserved.</p>
      </footer>
    </main>
  );
}
