'use client';

import { useState, useRef, useEffect } from 'react';
import { startCustomerFlow, registerCustomer, executeSpin, markWhatsAppClaimInitiated } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';

const SpinWheel = dynamic(() => import('./SpinWheel'), { ssr: false });

type Campaign = {
  id: string;
  name: string;
  offers: { id: string; name: string; imageUrl?: string | null;[key: string]: unknown }[];
};

type ClaimData = {
  claimCode: string;
  offerId: string;
  offer?: {
    name: string;
    description: string | null;
    imageUrl?: string | null;
  };
  [key: string]: unknown;
};

export default function MainFlow({ campaign, whatsappNumber }: { campaign: Campaign; whatsappNumber: string }) {
  const [stage, setStage] = useState<'login' | 'register' | 'wheel' | 'result'>('login');
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [claim, setClaim] = useState<ClaimData | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingSpinRef = useRef<Promise<{ success: boolean; claim?: unknown; message?: string }> | null>(null);

  // Preload dynamic SpinWheel bundle early in background
  useEffect(() => {
    import('./SpinWheel');
  }, []);

  // Pre-calculate winning prize as soon as user reaches the wheel stage
  // This allows the wheel to spin IMMEDIATELY on click without network lag
  useEffect(() => {
    if (stage === 'wheel' && customerId && !claim && !pendingSpinRef.current) {
      pendingSpinRef.current = executeSpin(customerId, campaign.id)
        .then((result) => {
          if (result.success && result.claim) {
            setClaim(result.claim as unknown as ClaimData);
          }
          return result;
        })
        .catch((err) => {
          console.error("Spin preload error:", err);
          return { success: false, message: "Network error" };
        });
    }
  }, [stage, customerId, campaign.id, claim]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError("Please provide your name.");
      return;
    }

    if (!trimmedPhone) {
      setError("Please provide your mobile number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await startCustomerFlow(trimmedName, trimmedPhone, campaign.id);

      if (result.success) {
        if (result.normalizedPhone) {
          setPhone(result.normalizedPhone);
        }
        if (result.name) {
          setName(result.name);
        }
        setCustomerId(result.customerId!);
        if (result.claim) {
          setClaim(result.claim as unknown as ClaimData);
          setStage('result');
        } else {
          setStage('wheel');
        }
      } else {
        setError(result.message || "An error occurred");
      }
    } catch (err) {
      console.error("Login verification error:", err);
      setError("Connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name) {
      setError("Please provide your name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('campaignId', campaign.id);

      const result = await registerCustomer(null, formData);
      if (!result.success) {
        setError(result.message || "Registration failed. Check your inputs.");
        return;
      }

      setCustomerId(result.customerId || null);
      setStage('wheel');
    } catch (err) {
      console.error("Registration error:", err);
      setError("Registration error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSpinStart = async () => {
    if (!customerId) return;
    setIsSpinning(true);

    // If pre-fetch already resolved, wheel will spin instantly on this frame
    if (claim) {
      return;
    }

    // If pre-fetch is in flight, await it
    if (pendingSpinRef.current) {
      const result = await pendingSpinRef.current;
      if (!result?.success) {
        setError(result?.message || "Spin failed");
        setIsSpinning(false);
      }
      return;
    }

    // Fallback: execute directly
    const result = await executeSpin(customerId, campaign.id);
    if (!result.success) {
      setError(result.message || "Spin failed");
      setIsSpinning(false);
      return;
    }

    setClaim(result.claim ? (result.claim as unknown as ClaimData) : null);
  };

  const handleSpinComplete = () => {
    setIsSpinning(false);
    setStage('result');
  };

  const handleClaimWhatsApp = () => {
    if (!claim) return;

    markWhatsAppClaimInitiated(claim.claimCode);

    const text = `Hello! I would like to claim my photography offer.

Name: ${name}
Phone: ${phone}
Offer: ${claim.offer?.name}
Claim ID: ${claim.claimCode}
Campaign: ${campaign.name}

Please let me know how to redeem it.`;

    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

    window.open(url, '_blank');
  };

  const wheelSlices = [
    { bg: '#09090b', text: '#ec4899' },
    { bg: '#ec4899', text: '#09090b' },
    { bg: '#27272a', text: '#f4f4f5' },
    { bg: '#6366f1', text: '#09090b' },
    { bg: '#f4f4f5', text: '#ec4899' },
    { bg: '#09090b', text: '#6366f1' },
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
          backgroundColor: '#09090b',
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

  return (
    <Card className="bg-zinc-950/80 backdrop-blur-xl border-white/10 shadow-2xl relative rounded-[2rem] overflow-hidden transform-gpu">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-transparent z-0" />
      <CardContent className="p-6 sm:p-8 md:p-10 relative z-10 border-0">

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
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">Discover</span> Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">Offer</span>
              </h2>
              <p className="text-zinc-400 text-sm font-medium">
                Enter your details to spin and claim
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <Label htmlFor="name-input" className="block text-[15px] uppercase tracking-[0.2em] text-pink-500 mb-2.5 font-bold">
                  Full Name
                </Label>
                <Input
                  id="name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus-visible:border-pink-500 focus-visible:ring-pink-500/20 text-lg py-6 backdrop-blur-md rounded-xl transition-all duration-300 font-medium"
                  placeholder="e.g. Jane Doe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone-input" className="block text-[15px] uppercase tracking-[0.2em] text-pink-500 mb-2.5 font-bold">
                  Mobile Number
                </Label>
                <Input
                  id="phone-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus-visible:border-pink-500 focus-visible:ring-pink-500/20 text-lg py-6 backdrop-blur-md rounded-xl transition-all duration-300 font-medium"
                  placeholder="e.g. 1234567890 or +91..."
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-400 hover:to-indigo-400 text-white text-[12px] font-extrabold tracking-[0.15em] uppercase py-6 rounded-xl transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_8px_32px_rgba(236,72,153,0.4)] active:translate-y-0 mt-4 border-0 disabled:opacity-80 disabled:cursor-wait"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center justify-center gap-2.5">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span className="tracking-widest animate-pulse">Verifying Details...</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center gap-2 group">
                    <span>Continue to Spin</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                )}
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
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">Name</span>
              </h2>
              <p className="text-zinc-400 text-sm font-medium">
                Tell us who you are
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <Label htmlFor="name-input" className="block text-[10px] uppercase tracking-[0.2em] text-pink-500 mb-3 font-bold">
                  Full Name
                </Label>
                <Input
                  id="name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus-visible:border-pink-500 focus-visible:ring-pink-500/20 text-lg py-6 backdrop-blur-md rounded-xl transition-all duration-300 font-medium"
                  placeholder="E.g., Rahul Roy"
                  required
                />
              </div>

              <div className="space-y-3 mt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-400 hover:to-indigo-400 text-white text-[12px] font-extrabold tracking-[0.15em] uppercase py-6 rounded-xl transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_8px_32px_rgba(236,72,153,0.4)] active:translate-y-0 border-0 disabled:opacity-80 disabled:cursor-wait"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center justify-center gap-2.5">
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span className="tracking-widest animate-pulse">Preparing Wheel...</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center gap-2 group">
                      <span>Submit & Play</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStage('login')}
                  className="w-full text-zinc-400 hover:text-pink-400 hover:bg-transparent text-[12px] uppercase tracking-[0.1em] font-bold"
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
          <div className="animate-scale-in flex flex-col items-center py-2 w-full">
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">Spin</span> Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">Luck</span>
              </h2>
              <p className="text-zinc-400 text-sm font-medium">
                Tap the center to reveal your offer
              </p>
            </div>
            <div className="w-full flex items-center justify-center">
              <SpinWheel
                offers={mappedOffers}
                winningOfferId={claim?.offerId || null}
                onSpinStart={handleSpinStart}
                onSpinComplete={handleSpinComplete}
                isSpinning={isSpinning}
              />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
          STAGE: RESULT
         ══════════════════════════════════════════ */}
        {stage === 'result' && claim && (
          <div className="animate-scale-in text-center py-4">
            {/* Confetti badge */}
            <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30">
              <span className="text-base">✨</span>
              <span className="text-[10px] font-black tracking-[0.15em] uppercase text-pink-500">
                Congratulations{name ? `, ${name.split(' ')[0]}` : ''}!
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-white leading-tight tracking-tight">
              {claim.offer?.name}
            </h2>

            <p className="text-zinc-300 text-sm md:text-base mb-8 max-w-sm mx-auto font-medium leading-relaxed">
              {claim.offer?.description}
            </p>

            {/* ── Claim Card ──────────────────────── */}
            <div
              ref={claimCardRef}
              className="bg-white/5 backdrop-blur-xl border border-pink-500/20 p-8 rounded-[2rem] mb-8 relative overflow-hidden"
            >
              {/* Offer Background Image */}
              {claim.offer?.imageUrl && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={claim.offer.imageUrl as string}
                    alt="Offer Background"
                    className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 pointer-events-none mix-blend-luminosity"
                  />
                  {/* Soft gradient overlay to keep text readable without hiding the image */}
                  <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#09090b]/50 via-[#09090b]/70 to-[#09090b]/90 pointer-events-none" />
                </>
              )}

              {/* Corner accents */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-pink-500/50 rounded-tl-xl z-10"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-indigo-500/50 rounded-tr-xl z-10"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-indigo-500/50 rounded-bl-xl z-10"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-pink-500/50 rounded-br-xl z-10"></div>

              {/* Subtle glow */}
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl pointer-events-none z-10"></div>

              <div className="relative z-10">
                <p className="text-[10px] uppercase tracking-[0.2em] text-pink-400 mb-2 font-bold">
                  Exclusive Offer
                </p>
                <h3 className="text-2xl sm:text-3xl text-white tracking-tight mb-5 font-black leading-tight drop-shadow-md">
                  {claim.offer?.name}
                </h3>

                <div className="inline-block px-5 py-3 bg-black/60 rounded-xl border border-white/10 w-full mb-2">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-zinc-400 font-bold mb-1">
                    Claim Code
                  </p>
                  <p className="text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400 tracking-[0.2em] font-extrabold font-mono">
                    {claim.claimCode}
                  </p>
                </div>

                <div className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.2em] text-white/50 mt-5 pt-4 border-t border-white/10 font-medium">
                  <span>Issued to: <span className="text-white font-bold">{name}</span></span>
                  <span>Valid for {campaign.name}</span>
                </div>
              </div>
            </div>

            {/* ── Action Buttons ──────────────────── */}
            <div className="space-y-3">
              <Button
                onClick={handleSaveCard}
                variant="outline"
                className="w-full py-6 bg-white/5 hover:bg-white/10 text-white font-bold tracking-wide rounded-xl transition-all duration-300 flex items-center justify-center gap-3 border border-white/10 hover:border-white/20 text-sm h-auto"
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
