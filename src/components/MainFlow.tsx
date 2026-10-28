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
    { bg: '#ffffff', text: '#09090b' }, // White
    { bg: '#ec4899', text: '#ffffff' }, // pink-500
    { bg: '#6366f1', text: '#ffffff' }, // indigo-500
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
    <Card className="bg-zinc-950/85 backdrop-blur-xl border-white/10 shadow-2xl relative rounded-2xl sm:rounded-[2rem] overflow-hidden transform-gpu">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-transparent z-0" />
      <CardContent className="p-4 sm:p-6 relative z-10 border-0">

        {/* ── Error banner ───────────────────────── */}
        {error && (
          <Alert variant="destructive" className="mb-3 py-2.5 px-3.5 bg-red-950/30 border-red-500/20 text-red-200/90 animate-fade-up flex items-center gap-2.5 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ══════════════════════════════════════════
          STAGE: LOGIN
         ══════════════════════════════════════════ */}
        {stage === 'login' && (
          <div className="animate-fade-up">
            <div className="text-center mb-4 sm:mb-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1 tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">Discover</span> Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">Offer</span>
              </h2>
              <p className="text-zinc-400 text-sm font-medium">
                Enter your details to spin and claim
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3.5 sm:space-y-4">
              <div>
                <Label htmlFor="name-input" className="block text-xs uppercase tracking-wider text-pink-400 mb-1.5 font-bold">
                  Full Name
                </Label>
                <Input
                  id="name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border-white/15 text-white placeholder:text-zinc-500 focus-visible:border-pink-500 focus-visible:ring-pink-500/20 text-base h-12 px-4 backdrop-blur-md rounded-xl transition-all font-medium"
                  placeholder="e.g. Jane Doe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone-input" className="block text-xs uppercase tracking-wider text-pink-400 mb-1.5 font-bold">
                  Mobile Number
                </Label>
                <Input
                  id="phone-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-white/5 border-white/15 text-white placeholder:text-zinc-500 focus-visible:border-pink-500 focus-visible:ring-pink-500/20 text-base h-12 px-4 backdrop-blur-md rounded-xl transition-all font-medium"
                  placeholder="e.g. 9876543210"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-400 hover:to-indigo-400 text-white text-sm font-bold tracking-wider uppercase h-12 rounded-xl transition-all duration-300 hover:shadow-[0_8px_32px_rgba(236,72,153,0.4)] active:translate-y-0 mt-2 border-0 disabled:opacity-80 disabled:cursor-wait cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span className="tracking-widest animate-pulse">Verifying...</span>
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
            <div className="text-center mb-4 sm:mb-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1 tracking-tight">
                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">Name</span>
              </h2>
              <p className="text-zinc-400 text-sm font-medium">
                Tell us who you are
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-3.5 sm:space-y-4">
              <div>
                <Label htmlFor="name-input" className="block text-xs uppercase tracking-wider text-pink-400 mb-1.5 font-bold">
                  Full Name
                </Label>
                <Input
                  id="name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border-white/15 text-white placeholder:text-zinc-500 focus-visible:border-pink-500 focus-visible:ring-pink-500/20 text-base h-12 px-4 backdrop-blur-md rounded-xl transition-all font-medium"
                  placeholder="E.g., Rahul Roy"
                  required
                />
              </div>

              <div className="space-y-2.5 mt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-400 hover:to-indigo-400 text-white text-sm font-bold tracking-wider uppercase h-12 rounded-xl transition-all duration-300 hover:shadow-[0_8px_32px_rgba(236,72,153,0.4)] active:translate-y-0 border-0 disabled:opacity-80 disabled:cursor-wait cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span className="tracking-widest animate-pulse">Preparing...</span>
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
                  className="w-full text-zinc-400 hover:text-pink-400 hover:bg-transparent text-xs uppercase tracking-wider font-bold h-9 py-1"
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
          <div className="animate-scale-in flex flex-col items-center w-full">
            <div className="text-center mb-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1 tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">Spin</span> Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">Luck</span>
              </h2>
              <p className="text-zinc-400 text-sm font-medium">
                Tap SPIN in the center to reveal your prize
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
          <div className="animate-scale-in text-center">
            {/* Confetti badge */}
            <div className="mb-2 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/30">
              <span className="text-sm">✨</span>
              <span className="text-xs font-bold tracking-wider uppercase text-pink-400">
                Congratulations{name ? `, ${name.split(' ')[0]}` : ''}!
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold mb-1.5 text-white leading-tight tracking-tight">
              {claim.offer?.name}
            </h2>

            <p className="text-zinc-300 text-sm mb-3 max-w-sm mx-auto font-medium leading-relaxed">
              {claim.offer?.description}
            </p>

            {/* ── Claim Card ──────────────────────── */}
            <div
              ref={claimCardRef}
              className="bg-white/5 backdrop-blur-xl border border-pink-500/20 p-4 sm:p-5 rounded-2xl mb-3.5 relative overflow-hidden text-center"
            >
              {/* Offer Background Image */}
              {claim.offer?.imageUrl && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={claim.offer.imageUrl as string}
                    alt="Offer Background"
                    className="absolute inset-0 w-full h-full object-cover z-0 opacity-35 pointer-events-none mix-blend-luminosity"
                  />
                  {/* Soft gradient overlay */}
                  <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#09090b]/50 via-[#09090b]/70 to-[#09090b]/90 pointer-events-none" />
                </>
              )}

              {/* Corner accents */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-pink-500/50 rounded-tl-lg z-10" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-indigo-500/50 rounded-tr-lg z-10" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-indigo-500/50 rounded-bl-lg z-10" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-pink-500/50 rounded-br-lg z-10" />

              <div className="relative z-10">
                <p className="text-xs uppercase tracking-wider text-pink-400 mb-1 font-bold">
                  Exclusive Reward
                </p>
                <h3 className="text-lg sm:text-xl text-white tracking-tight mb-2.5 font-black leading-tight drop-shadow-md">
                  {claim.offer?.name}
                </h3>

                <div className="inline-block px-4 py-2 bg-black/60 rounded-xl border border-white/10 w-full mb-2">
                  <p className="text-xs uppercase tracking-wider text-zinc-400 font-bold mb-0.5">
                    Claim Code
                  </p>
                  <p className="text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400 tracking-[0.18em] font-extrabold font-mono">
                    {claim.claimCode}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-1 text-xs uppercase tracking-wider text-white/50 pt-2 border-t border-white/10 font-medium">
                  <span>For: <strong className="text-white">{name}</strong></span>
                  <span>{campaign.name}</span>
                </div>
              </div>
            </div>

            {/* ── Action Buttons ──────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleSaveCard}
                variant="outline"
                className="w-full h-12 py-3 bg-white/5 hover:bg-white/10 text-white font-bold tracking-wide rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-white/15 hover:border-white/25 text-sm cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Save Proof</span>
              </Button>

              <Button
                onClick={handleClaimWhatsApp}
                className="w-full h-12 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold tracking-wide rounded-xl transition-all duration-300 shadow-[0_6px_20px_rgba(37,211,102,0.2)] flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                <span>WhatsApp</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
