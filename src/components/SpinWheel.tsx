'use client';

import { Wheel } from 'react-custom-roulette';

type Offer = {
  id: string;
  name: string;
  color: string;
};

type SpinWheelProps = {
  offers: Offer[];
  winningOfferId: string | null;
  onSpinStart: () => Promise<void>;
  onSpinComplete: () => void;
  isSpinning: boolean;
};

export default function SpinWheel({ offers, winningOfferId, onSpinStart, onSpinComplete, isSpinning }: SpinWheelProps) {
  
  const data = offers.map(o => ({
    option: o.name,
    style: { backgroundColor: o.color, textColor: '#1a1a1a' }
  }));
  
  // Find index of winning offer
  const prizeNumber = winningOfferId ? Math.max(0, offers.findIndex(o => o.id === winningOfferId)) : 0;
  
  // We only start the actual wheel component spin when we know the prize number
  const mustStartSpinning = isSpinning && winningOfferId !== null;

  return (
    <div className="relative flex flex-col items-center">
      {/* Wheel Wrapper with Premium Outer Ring */}
      <div className="p-2 rounded-full bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 shadow-[0_0_50px_rgba(212,175,55,0.3)] relative">
         <div className="bg-black rounded-full p-2 relative">
            <Wheel
              mustStartSpinning={mustStartSpinning}
              prizeNumber={prizeNumber}
              data={data.length > 0 ? data : [{ option: 'Loading...' }]}
              onStopSpinning={() => {
                onSpinComplete();
              }}
              outerBorderColor="#1a1a1a"
              outerBorderWidth={5}
              innerRadius={20}
              innerBorderColor="#D4AF37"
              innerBorderWidth={3}
              radiusLineColor="#1a1a1a"
              radiusLineWidth={1}
              fontSize={14}
              textDistance={65}
              spinDuration={0.8}
            />
            
            {/* Center Spin Button */}
            <button
              onClick={async () => {
                if (isSpinning || offers.length === 0) return;
                await onSpinStart();
              }}
              disabled={isSpinning}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-gold-300 via-gold-500 to-gold-600 hover:from-gold-200 hover:via-gold-400 hover:to-gold-500 text-charcoal font-black text-xl rounded-full transition-all hover:scale-[1.05] active:scale-[0.95] disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_20px_rgba(212,175,55,0.6)] flex items-center justify-center border-4 border-black z-20"
            >
              <span className="drop-shadow-md">
                {isSpinning && !winningOfferId ? '...' : 'SPIN'}
              </span>
            </button>
         </div>
      </div>
    </div>
  );
}

