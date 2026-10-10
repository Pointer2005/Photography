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
    
    if (o.imageUrl) {
      baseData.image = {
        uri: o.imageUrl,
        landscape: true,
        sizeMultiplier: 1.2,
      };
    }
    
    return baseData;
  });

  // Find index of winning offer
  const prizeNumber = winningOfferId ? Math.max(0, offers.findIndex(o => o.id === winningOfferId)) : 0;

  const wheelContainerRef = useRef<HTMLDivElement>(null);

  // We only start the actual wheel component spin when we know the prize number
  const mustStartSpinning = isSpinning && winningOfferId !== null;

  // Synchronize ticking sound with actual wheel rotation
  useEffect(() => {
    if (!mustStartSpinning) return;

    let animationFrameId: number;
    let lastAngle: number | null = null;
    let totalRotation = 0;
    let lastSector = 0;
    const sectorAngle = 360 / (offers.length || 1);

    const checkRotation = () => {
      if (!wheelContainerRef.current) {
        animationFrameId = requestAnimationFrame(checkRotation);
        return;
      }

      const canvas = wheelContainerRef.current.querySelector('canvas');
      const rotationContainer = canvas?.parentElement;

      if (rotationContainer) {
        const style = window.getComputedStyle(rotationContainer);
        const matrix = style.transform;

        if (matrix && matrix !== 'none') {
          const values = matrix.split('(')[1].split(')')[0].split(',');
          const a = parseFloat(values[0]);
          const b = parseFloat(values[1]);
          
          // Calculate current angle in degrees (0 to 360)
          let angle = Math.atan2(b, a) * (180 / Math.PI);
          if (angle < 0) angle += 360;

          if (lastAngle !== null) {
            let diff = angle - lastAngle;
            
            // Handle wrap around
            if (diff > 180) diff -= 360;
            else if (diff < -180) diff += 360;

            totalRotation += diff;

            // Determine if we crossed a sector boundary
            const currentSector = Math.floor(Math.abs(totalRotation) / sectorAngle);
            if (currentSector !== lastSector) {
              playTick();
              lastSector = currentSector;
            }
          }
          lastAngle = angle;
        }
      }

      if (isSpinning) {
        animationFrameId = requestAnimationFrame(checkRotation);
      }
    };

    animationFrameId = requestAnimationFrame(checkRotation);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mustStartSpinning, isSpinning, offers.length, playTick]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Outer glow ring */}
      <div className="relative animate-pulse-glow rounded-full" ref={wheelContainerRef}>
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
              spinDuration={0.8}
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
