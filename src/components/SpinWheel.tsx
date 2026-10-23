'use client';

import { useEffect, useRef } from 'react';
import { Wheel } from 'react-custom-roulette';
import { useSoundEffects } from '@/hooks/useSoundEffects';

type Offer = {
  id: string;
  name: string;
  color: string;
  textColor?: string;
  imageUrl?: string;
};

type SpinWheelProps = {
  offers: Offer[];
  winningOfferId: string | null;
  onSpinStart: () => Promise<void>;
  onSpinComplete: () => void;
  isSpinning: boolean;
};

export default function SpinWheel({ offers, winningOfferId, onSpinStart, onSpinComplete, isSpinning }: SpinWheelProps) {
  const { playTick, playWin, init } = useSoundEffects();

  const data = offers.map(o => {
    const baseData: Record<string, unknown> = {
      option: o.name,
      style: { backgroundColor: o.color, textColor: o.textColor || '#0C0B09' }
    };

    // We intentionally do not attach the image to baseData here
    // so the wheel always renders solid background colors with text.

    return baseData;
  });

  // Find index of winning offer
  const prizeNumber = winningOfferId ? Math.max(0, offers.findIndex(o => o.id === winningOfferId)) : 0;

  const wheelContainerRef = useRef<HTMLDivElement>(null);

  // We only start the actual wheel component spin when we know the prize number
  const mustStartSpinning = isSpinning && winningOfferId !== null;

  // Synchronize ticking sound with wheel rotation using procedural audio schedule
  // This avoids expensive getComputedStyle / layout reflows on every animation frame
  useEffect(() => {
    if (!mustStartSpinning) return;

    const tickDelays: number[] = [];
    let currentTime = 40;

    // Acceleration phase (0ms - 900ms): intervals rapidly decrease
    let interval = 130;
    while (currentTime < 900) {
      tickDelays.push(currentTime);
      interval = Math.max(35, interval * 0.84);
      currentTime += interval;
    }

    // Peak cruising phase (900ms - 1200ms): fast uniform clicks
    while (currentTime < 1200) {
      tickDelays.push(currentTime);
      currentTime += 36;
    }

    // Deceleration phase (1200ms - 3800ms): intervals expand naturally to a stop
    interval = 38;
    while (currentTime < 3800) {
      tickDelays.push(currentTime);
      interval = interval * 1.14;
      currentTime += interval;
    }

    const timerIds = tickDelays.map(delay =>
      setTimeout(() => {
        playTick();
      }, delay)
    );

    return () => {
      timerIds.forEach(clearTimeout);
    };
  }, [mustStartSpinning, playTick]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Outer glow ring with hardware acceleration */}
      <div className="relative rounded-full shadow-[0_0_35px_rgba(200,162,78,0.25)]" ref={wheelContainerRef}>
        {/* Premium outer ring */}
        <div className="p-[3px] rounded-full bg-gradient-to-br from-[#DFC07A] via-[#C8A24E] to-[#7A5F25]">
          <div className="bg-[#0C0B09] rounded-full p-2 relative">
            <Wheel
              mustStartSpinning={mustStartSpinning}
              prizeNumber={prizeNumber}
              data={data.length > 0 ? data : [{ option: 'Loading...' }]}
              onStopSpinning={() => {
                playWin();
                onSpinComplete();
              }}
              outerBorderColor="#0C0B09"
              outerBorderWidth={3}
              innerRadius={15}
              innerBorderColor="#C8A24E"
              innerBorderWidth={2}
              radiusLineColor="#0C0B09"
              radiusLineWidth={1}
              fontSize={13}
              textDistance={65}
              spinDuration={0.35}
            />

            {/* Center Spin Button */}
            <button
              onClick={async () => {
                if (isSpinning || offers.length === 0) return;
                init();
                await onSpinStart();
              }}
              disabled={isSpinning}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-[#DFC07A] via-[#C8A24E] to-[#9E7D3A] hover:from-[#E8CC8C] hover:via-[#D4AF55] hover:to-[#B0892F] text-[#0C0B09] font-serif font-bold text-sm rounded-full transition-all duration-300 hover:scale-[1.05] active:scale-[0.95] disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_24px_rgba(200,162,78,0.3)] flex items-center justify-center border-[3px] border-[#0C0B09] z-20 tracking-[0.15em] uppercase"
            >
              <span className="drop-shadow-sm">
                {isSpinning && !winningOfferId ? '...' : 'Spin'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
