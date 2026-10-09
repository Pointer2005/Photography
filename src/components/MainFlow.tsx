'use client';

import { useState, useRef } from 'react';
import { registerCustomer, executeSpin, verifyOtp } from '@/app/actions';
import dynamic from 'next/dynamic';

const SpinWheel = dynamic(() => import('./SpinWheel'), { ssr: false });

type Campaign = {
  id: string;
  name: string;
  offers: any[];
};

export default function MainFlow({ campaign }: { campaign: Campaign }) {
  const [stage, setStage] = useState<'login' | 'register' | 'otp' | 'wheel' | 'result'>('login');
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [claim, setClaim] = useState<any | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [otp, setOtp] = useState('');
  const [mockOtp, setMockOtp] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone || !consent) {
      setError("Please provide your phone number and consent.");
      return;
    }

    const { checkCustomerPhone } = await import('@/app/actions');
    const result = await checkCustomerPhone(phone, consent);

    if (result.success) {
      if (result.isNewUser) {
        setStage('register');
      } else {
        setName(result.name || '');
        setCustomerId(result.customerId!);
        setMockOtp(result.mockOtp!);
        setStage('otp');
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
    setMockOtp(result.mockOtp || '');
    setStage('otp');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!customerId) return;

    const result = await verifyOtp(customerId, otp, campaign.id);
    if (!result.success) {
      setError(result.message || "Invalid OTP.");
      return;
    }

    if (result.claim) {
      // Already played
      setClaim(result.claim);
      setStage('result');
    } else {
      setStage('wheel');
    }
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

    setClaim(result.claim);
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

  const wheelColors = ['#D4AF37', '#B59410', '#FDFBF7', '#E5C158', '#9B7B0A', '#F9E596'];

  const mappedOffers = campaign.offers.map((offer, index) => ({
    id: offer.id,
    name: offer.name,
    color: wheelColors[index % wheelColors.length],
  }));

  // Figure out the winning offer if any, for wheel pointer mapping
  // Note: For a real rotating wheel, we would calculate the exact rotate angle.
  // We'll just pass the claim offer ID if available.

  const claimCardRef = useRef<HTMLDivElement>(null);

  const handleSaveCard = async () => {
    if (claimCardRef.current) {
      try {
        const htmlToImage = await import('html-to-image');
        const dataUrl = await htmlToImage.toPng(claimCardRef.current, {
          backgroundColor: '#1a1a1a', // charcoal roughly
          pixelRatio: 2, // High resolution
        });
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `Aetheris_Offer_${claim?.claimCode || 'card'}.png`;
        link.click();
      } catch (err) {
        console.error("Failed to save card image", err);
      }
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-charcoal/80 p-8 rounded-2xl border border-gold-500/20 shadow-2xl backdrop-blur-sm">
      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 text-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      {stage === 'login' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl font-serif mb-6 text-gold-400 text-center">Enter Phone Number</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm text-cream/70 mb-2 font-medium">Mobile Number</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-gold-500/30 rounded-lg focus:outline-none focus:border-gold-500 text-cream transition-colors"
                placeholder="+91 98765 43210"
                required
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="pt-1">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="w-4 h-4 rounded border-gold-500/50 bg-black/50 checked:bg-gold-500 checked:border-gold-500 focus:ring-gold-500 focus:ring-offset-charcoal transition-all"
                  required
                />
              </div>
              <span className="text-sm text-cream/60 group-hover:text-cream/80 transition-colors leading-relaxed">
                I consent to being contacted regarding this offer and agree to the terms and conditions.
              </span>
            </label>

            <button
              type="submit"
              className="w-full py-4 bg-gold-500 hover:bg-gold-400 text-charcoal font-bold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-4"
            >
              Continue
            </button>
          </form>
        </div>
      )}

      {stage === 'register' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl font-serif mb-6 text-gold-400 text-center">What's Your Name?</h2>
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm text-cream/70 mb-2 font-medium">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-gold-500/30 rounded-lg focus:outline-none focus:border-gold-500 text-cream transition-colors"
                placeholder="Jane Doe"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gold-500 hover:bg-gold-400 text-charcoal font-bold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-4"
            >
              Submit & Send OTP
            </button>
            <button
              type="button"
              onClick={() => setStage('login')}
              className="w-full py-2 text-sm text-cream/50 hover:text-white transition-colors"
            >
              Go Back
            </button>
          </form>
        </div>
      )}

      {stage === 'otp' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl font-serif mb-6 text-gold-400 text-center">Verify Your Number</h2>
          <p className="text-cream/70 text-center mb-6">
            We've sent a code to <span className="text-white font-bold">{phone}</span>.<br />
            <span className="text-gold-400 text-xs">(For this demo, your OTP is: {mockOtp})</span>
          </p>
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm text-cream/70 mb-2 font-medium">Enter OTP Code</label>
              <input
                id="otp"
                type="text"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-gold-500/30 rounded-lg focus:outline-none focus:border-gold-500 text-center tracking-widest text-xl text-cream transition-colors"
                placeholder="••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gold-500 hover:bg-gold-400 text-charcoal font-bold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-4"
            >
              Verify & Play
            </button>
            <button
              type="button"
              onClick={() => setStage('register')}
              className="w-full py-2 text-sm text-cream/50 hover:text-white transition-colors"
            >
              Change Phone Number
            </button>
          </form>
        </div>
      )}

      {stage === 'wheel' && (
        <div className="animate-in zoom-in-95 duration-700 flex flex-col items-center py-4">
          <h2 className="text-3xl font-serif mb-8 text-gold-400 text-center">Spin Your Luck</h2>
          <SpinWheel
            offers={mappedOffers}
            winningOfferId={claim?.offerId || null}
            onSpinStart={handleSpinStart}
            onSpinComplete={handleSpinComplete}
            isSpinning={isSpinning}
          />
        </div>
      )}

      {stage === 'result' && claim && (
        <div className="animate-in zoom-in-105 duration-1000 text-center py-6">
          <div className="mb-4 inline-block px-4 py-1 rounded-full border border-gold-500/50 text-gold-400 text-xs font-bold tracking-widest uppercase">
            Congratulations, {name.split(' ')[0]}!
          </div>

          <h2 className="text-5xl font-serif mb-2 text-white">
            {claim.offer?.name}
          </h2>

          <p className="text-cream/80 text-lg mb-8 max-w-xs mx-auto">
            {claim.offer?.description}
          </p>

          <div
            ref={claimCardRef}
            className="bg-black/40 border border-gold-500/40 p-6 rounded-xl mb-8 relative overflow-hidden group shadow-[0_0_30px_rgba(212,175,55,0.15)]"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-gold-500"></div>
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-gold-500/10 rounded-full blur-xl"></div>

            <p className="text-sm text-cream/60 mb-1">Your Claim ID</p>
            <p className="text-3xl font-mono text-gold-400 tracking-wider font-bold mb-4 drop-shadow-md">
              {claim.claimCode}
            </p>
            <div className="text-sm text-cream/70 font-medium mb-2">
              Offer: {claim.offer?.name}
            </div>
            <div className="text-xs text-cream/40 mt-4 pt-4 border-t border-gold-500/20">
              Valid for {campaign.name}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSaveCard}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-cream font-bold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 border border-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Save Image Proof
            </button>

            <button
              onClick={handleClaimWhatsApp}
              className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              Claim on WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
