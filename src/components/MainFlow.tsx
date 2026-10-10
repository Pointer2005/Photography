'use client';

import { useState, useRef } from 'react';
import { registerCustomer, executeSpin } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const SpinWheel = dynamic(() => import('./SpinWheel'), { ssr: false });

type Campaign = {
  id: string;
  name: string;
  offers: { id: string; name: string; imageUrl?: string | null;[key: string]: unknown }[];
};

export default function MainFlow({ campaign }: { campaign: Campaign }) {
  const [stage, setStage] = useState<'login' | 'register' | 'wheel' | 'result'>('login');
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [claim, setClaim] = useState<{ claimCode: string; offerId: string; offer?: { name: string; description: string | null; imageUrl?: string | null };[key: string]: unknown } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone || !consent) {
      setError("Please provide your phone number and consent.");
      return;
    }

    const { checkCustomerPhone } = await import('@/app/actions');
    const result = await checkCustomerPhone(phone, consent, campaign.id);

    if (result.success) {
      if (result.isNewUser) {
        setStage('register');
      } else {
        setName(result.name || '');
        setCustomerId(result.customerId!);
        if (result.claim) {
          setClaim(result.claim);
          setStage('result');
        } else {
          setStage('wheel');
        }
      }
    } else {
      setError(result.message || "An error occurred");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name) {
      setError("Please provide your name.");
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('consentGiven', 'on'); // Already consented in login stage
    formData.append('campaignId', campaign.id);

    const result = await registerCustomer(null, formData);
    if (!result.success) {
      setError(result.message || "Registration failed. Check your inputs.");
      return;
    }

    setCustomerId(result.customerId || null);
    setStage('wheel');
  };

  const handleSpinStart = async () => {
    if (!customerId) return;
    setIsSpinning(true);

    const result = await executeSpin(customerId, campaign.id);
    if (!result.success) {
      setError(result.message || "Spin failed");
      setIsSpinning(false);
      return;
    }

    setClaim(result.claim || null);
    // The SpinWheel component handles the delay/animation
  };

  const handleSpinComplete = () => {
    setIsSpinning(false);
    setStage('result');
  };

  const handleClaimWhatsApp = () => {
    if (!claim) return;

    // Configured from environment in production, but here's a placeholder
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210";
    const text = `Hello! I would like to claim my photography offer.

Name: ${name}
Phone: ${phone}
Offer: ${claim.offer?.name}
Claim ID: ${claim.claimCode}
Campaign: ${campaign.name}

I have attached a screenshot of my winning offer. Please let me know how to redeem it.`;

    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

    window.open(url, '_blank');
  };

  const wheelSlices = [
    { bg: '#161412', text: '#C8A24E' },
    { bg: '#C8A24E', text: '#0C0B09' },
    { bg: '#1E1B17', text: '#F5F0E8' },
    { bg: '#B0892F', text: '#0C0B09' },
    { bg: '#252219', text: '#C8A24E' },
    { bg: '#9E7D3A', text: '#0C0B09' },
  ];

  const mappedOffers = campaign.offers.map((offer, index) => ({
    id: offer.id,
    name: offer.name,
    imageUrl: offer.imageUrl || undefined,
    color: wheelSlices[index % wheelSlices.length].bg,
    textColor: wheelSlices[index % wheelSlices.length].text,
  }));

  const claimCardRef = useRef<HTMLDivElement>(null);

  const handleSaveCard = async () => {
    if (claimCardRef.current) {
      try {
        const htmlToImage = await import('html-to-image');
        const dataUrl = await htmlToImage.toPng(claimCardRef.current, {
          backgroundColor: '#0C0B09',
          pixelRatio: 2,
        });
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `ABC_Offer_${claim?.claimCode || 'card'}.png`;
        link.click();
      } catch (err) {
        console.error("Failed to save card image", err);
      }
    }
  };

  // Step indicator
  const stageIndex = { login: 0, register: 0, wheel: 1, result: 2 };
  const currentStep = stageIndex[stage as keyof typeof stageIndex];
  const stepLabels = ['Details', 'Spin', 'Claim'];

  return (
    <Card className="bg-[#161412]/55 backdrop-blur-3xl border-[#C8A24E]/15 shadow-2xl relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C8A24E]/25 to-transparent z-0" />
      <CardContent className="p-8 md:p-10 relative z-10 border-0">

        {/* ── Step indicator ──────────────────────Details─ */}
        {currentStep < 3 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {stepLabels.slice(0, 3).map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-2 h-2 rounded-full transition-all duration-500 ${i <= currentStep
                        ? 'bg-[#C8A24E] shadow-[0_0_8px_rgba(200,162,78,0.4)]'
                        : 'bg-[#F5F0E8]/25'
                      }`}
                  />
                  <span className={`text-[9px] uppercase tracking-[0.15em] transition-colors duration-300 ${i <= currentStep ? 'text-[#C8A24E]' : 'text-[#F5F0E8]/35'
                    }`}>
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`w-8 h-px mb-4 transition-all duration-500 ${i < currentStep ? 'bg-[#C8A24E]/50' : 'bg-[#F5F0E8]/15'
                    }`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Error banner ───────────────────────── */}
        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-950/30 border-red-500/20 text-red-200/80 animate-fade-up flex items-center gap-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ══════════════════════════════════════════
          STAGE: LOGIN
         ══════════════════════════════════════════ */}
        {stage === 'login' && (
          <div className="animate-fade-up">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-[28px] font-serif text-[#F5F0E8] mb-2 tracking-wide">
                Discover Your <span className="text-[#C8A24E]">Offer</span>
              </h2>
              <p className="text-[#F5F0E8]/65 text-sm font-light">
                Enter your mobile number to begin
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="phone-input" className="block text-[10px] uppercase tracking-[0.15em] text-[#C8A24E]/80 mb-3 font-medium">
                  Mobile Number
                </Label>
                <Input
                  id="phone-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-white/5 border-[#F5F0E8]/15 text-[#F5F0E8] focus-visible:border-[#C8A24E] focus-visible:ring-[#C8A24E]/20 text-lg py-6 backdrop-blur-sm"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer group py-1" htmlFor="consent-check">
                <div className="pt-1 flex-shrink-0">
                  <Checkbox
                    id="consent-check"
                    checked={consent}
                    onCheckedChange={(checked) => setConsent(checked as boolean)}
                    className="border-[#F5F0E8]/25 bg-[#F5F0E8]/5 data-[state=checked]:bg-[#C8A24E] data-[state=checked]:text-[#0C0B09] data-[state=checked]:border-[#C8A24E]"
                    required
                  />
                </div>
                <span className="text-[13px] text-[#F5F0E8]/60 group-hover:text-[#F5F0E8]/80 transition-colors font-light leading-relaxed">
                  I consent to being contacted regarding this offer and agree to the terms.
                </span>
              </label>

              <Button type="submit" className="w-full bg-[#C8A24E] hover:bg-[#DFC07A] text-[#0C0B09] text-[13px] font-bold tracking-[0.12em] uppercase py-6 rounded-xl transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(200,162,78,0.25)] mt-2">
                Continue
              </Button>
            </form>
          </div>
        )}

        {/* ══════════════════════════════════════════
          STAGE: REGISTER
         ══════════════════════════════════════════ */}
        {stage === 'register' && (
          <div className="animate-fade-up">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-[28px] font-serif text-[#F5F0E8] mb-2 tracking-wide">
                Your <span className="text-[#C8A24E]">Name</span>
              </h2>
              <p className="text-[#F5F0E8]/40 text-sm font-light">
                Tell us who you are
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <Label htmlFor="name-input" className="block text-[10px] uppercase tracking-[0.15em] text-[#C8A24E]/80 mb-3 font-medium">
                  Full Name
                </Label>
                <Input
                  id="name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border-[#F5F0E8]/15 text-[#F5F0E8] focus-visible:border-[#C8A24E] focus-visible:ring-[#C8A24E]/20 text-lg py-6 backdrop-blur-sm"
                  placeholder="E.g., Jane Doe"
                  required
                />
              </div>

              <div className="space-y-3 mt-2">
                <Button type="submit" className="w-full bg-[#C8A24E] hover:bg-[#DFC07A] text-[#0C0B09] text-[13px] font-bold tracking-[0.12em] uppercase py-6 rounded-xl transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(200,162,78,0.25)]">
                  Submit & Play
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStage('login')}
                  className="w-full text-[#F5F0E8]/90 hover:text-[#C8A24E] hover:bg-transparent text-[12px] uppercase tracking-[0.1em]"
                >
                  ← Go Back
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ══════════════════════════════════════════
          STAGE: WHEEL
         ══════════════════════════════════════════ */}
        {stage === 'wheel' && (
          <div className="animate-scale-in flex flex-col items-center py-2">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-[28px] font-serif text-[#F5F0E8] mb-2 tracking-wide">
                Spin Your <span className="text-[#C8A24E]">Luck</span>
              </h2>
              <p className="text-[#F5F0E8]/65 text-sm font-light">
                Tap the center to reveal your offer
              </p>
            </div>
            <SpinWheel
              offers={mappedOffers}
              winningOfferId={claim?.offerId || null}
              onSpinStart={handleSpinStart}
              onSpinComplete={handleSpinComplete}
              isSpinning={isSpinning}
            />
          </div>
        )}

        {/* ══════════════════════════════════════════
          STAGE: RESULT
         ══════════════════════════════════════════ */}
        {stage === 'result' && claim && (
          <div className="animate-scale-in text-center py-4">
            {/* Confetti badge */}
            <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C8A24E]/15 border border-[#C8A24E]/30">
              <span className="text-base">✨</span>
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#C8A24E]">
                Congratulations{name ? `, ${name.split(' ')[0]}` : ''}!
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-serif mb-3 text-[#F5F0E8] leading-tight tracking-wide">
              {claim.offer?.name}
            </h2>

            <p className="text-[#F5F0E8]/70 text-sm md:text-base mb-8 max-w-sm mx-auto font-light leading-relaxed">
              {claim.offer?.description}
            </p>

            {/* ── Claim Card ──────────────────────── */}
            <div
              ref={claimCardRef}
              className="bg-[#161412]/80 backdrop-blur-xl border border-[#C8A24E]/20 p-8 rounded-2xl mb-8 relative overflow-hidden"
            >
              {/* Offer Background Image */}
              {claim.offer?.imageUrl && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={claim.offer.imageUrl as string}
                    alt="Offer Background"
                    className="absolute inset-0 w-full h-full object-cover z-0 opacity-50 pointer-events-none"
                  />
                  {/* Soft gradient overlay to keep text readable without hiding the image */}
                  <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#161412]/30 via-[#161412]/50 to-[#161412]/90 pointer-events-none" />
                </>
              )}

              {/* Corner accents */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-[#C8A24E]/35 rounded-tl-lg z-10"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-[#C8A24E]/35 rounded-tr-lg z-10"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-[#C8A24E]/35 rounded-bl-lg z-10"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-[#C8A24E]/35 rounded-br-lg z-10"></div>

              {/* Subtle glow */}
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#C8A24E]/15 rounded-full blur-3xl pointer-events-none z-10"></div>

              <div className="relative z-10">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#C8A24E]/80 mb-2 font-medium">
                  Claim Code
                </p>
                <p className="text-3xl text-[#F5F0E8] tracking-[0.15em] mb-6 font-light">
                  {claim.claimCode}
                </p>
                <div className="inline-block px-4 py-2.5 bg-[#0C0B09]/60 rounded-lg border border-[#F5F0E8]/10 text-sm text-[#C8A24E] font-light w-full">
                  {claim.offer?.name}
                </div>
                <div className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.15em] text-[#F5F0E8]/45 mt-6 pt-4 border-t border-[#F5F0E8]/10">
                  <span>Issued to: <span className="text-[#F5F0E8]/80 font-medium">{name}</span></span>
                  <span>Valid for {campaign.name}</span>
                </div>
              </div>
            </div>

            {/* ── Action Buttons ──────────────────── */}
            <div className="space-y-3">
              <Button
                onClick={handleSaveCard}
                variant="outline"
                className="w-full py-6 bg-[#F5F0E8]/8 hover:bg-[#F5F0E8]/12 text-[#F5F0E8]/80 font-light tracking-wide rounded-xl transition-all duration-300 flex items-center justify-center gap-3 border border-[#F5F0E8]/12 hover:border-[#F5F0E8]/25 text-sm h-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Save Image Proof
              </Button>

              <Button
                onClick={handleClaimWhatsApp}
                className="w-full py-6 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium tracking-wide rounded-xl transition-all duration-300 shadow-[0_8px_24px_rgba(37,211,102,0.15)] hover:shadow-[0_8px_24px_rgba(37,211,102,0.3)] flex items-center justify-center gap-3 hover:-translate-y-0.5 text-sm h-auto"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                Claim on WhatsApp
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
