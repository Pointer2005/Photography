'use client';

import { useEffect, useRef, useCallback } from 'react';
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

const SLICE_COLORS = [
  { bg: '#18181b', text: '#F472B6' }, // Dark Zinc + Pink
  { bg: '#DB2777', text: '#FFFFFF' }, // Rich Pink + White
  { bg: '#27272a', text: '#FBBF24' }, // Zinc + Warm Gold
  { bg: '#4F46E5', text: '#FFFFFF' }, // Indigo + White
  { bg: '#F4F0E8', text: '#09090b' }, // Cream + Dark Charcoal
  { bg: '#09090b', text: '#818CF8' }, // Charcoal + Indigo
];

function splitTextIntoLines(text: string, maxLen = 14): string[] {
  const words = text.trim().split(/\s+/);
  if (words.length <= 1) return [text];

  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxLen) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  if (lines.length > 2) {
    return [lines[0], lines.slice(1).join(' ')];
  }
  return lines;
}

export default function SpinWheel({
  offers,
  winningOfferId,
  onSpinStart,
  onSpinComplete,
  isSpinning
}: SpinWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { playTick, playWin, init } = useSoundEffects();

  const animFrameRef = useRef<number | null>(null);
  const isSpinningRef = useRef(false);
  const rotationRef = useRef(0);
  const winningOfferIdRef = useRef<string | null>(winningOfferId);

  useEffect(() => {
    winningOfferIdRef.current = winningOfferId;
  }, [winningOfferId]);

  const numSlices = offers.length || 6;
  const sliceAngle = (2 * Math.PI) / numSlices;

  // Draw wheel on canvas
  const drawWheel = useCallback((angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;
    const innerRadius = 38;

    ctx.clearRect(0, 0, size, size);

    // Save context for entire wheel rotation
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(angle);

    for (let i = 0; i < numSlices; i++) {
      const offer = offers[i];
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const colors = SLICE_COLORS[i % SLICE_COLORS.length];
      const bgColor = offer?.color || colors.bg;
      const textColor = offer?.textColor || colors.text;

      // Draw Slice Sector
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = bgColor;
      ctx.fill();

      // Divider line
      ctx.strokeStyle = 'rgba(200, 162, 78, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Slice Text
      ctx.save();
      const midAngle = startAngle + sliceAngle / 2;
      ctx.rotate(midAngle);

      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 20px Outfit, sans-serif';

      const offerName = offer?.name || `Offer ${i + 1}`;
      const lines = splitTextIntoLines(offerName, 13);
      const textRadius = radius * 0.65;

      if (lines.length === 1) {
        ctx.fillText(lines[0], textRadius, 0);
      } else {
        ctx.fillText(lines[0], textRadius, -11);
        ctx.font = '600 17px Outfit, sans-serif';
        ctx.fillText(lines[1], textRadius, 11);
      }
      ctx.restore();
    }

    // Outer Rim Border
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#DFC07A';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Outer decorative dots
    const numDots = numSlices * 4;
    for (let d = 0; d < numDots; d++) {
      const dotAngle = (d * (2 * Math.PI)) / numDots;
      const dotX = Math.cos(dotAngle) * (radius - 5);
      const dotY = Math.sin(dotAngle) * (radius - 5);

      ctx.beginPath();
      ctx.arc(dotX, dotY, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = d % 2 === 0 ? '#FFE8A3' : '#7A5F25';
      ctx.fill();
    }

    // Inner Cutout Border
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#0C0B09';
    ctx.fill();
    ctx.strokeStyle = '#C8A24E';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
  }, [offers, numSlices, sliceAngle]);

  // Initial draw and redraw on offers change
  useEffect(() => {
    drawWheel(rotationRef.current);
  }, [drawWheel]);

  // Spin animation
  const startSpinAnimation = useCallback(() => {
    if (isSpinningRef.current) return;
    isSpinningRef.current = true;

    const startAngle = rotationRef.current;
    const totalDuration = 3600; // 3.6s snappy casino spin
    const startTime = performance.now();

    // Initial estimation of target angle; updated once prize ID is confirmed
    let finalAngle: number | null = null;
    let lastTickAngle = startAngle;

    const computeFinalAngle = (targetId: string | null) => {
      let targetIndex = 0;
      if (targetId && offers.length > 0) {
        const found = offers.findIndex(o => o.id === targetId);
        if (found >= 0) targetIndex = found;
      }
      // Pointer is at the top-right (-43 degrees / 317 degrees, ~1:45 o'clock)
      // where it was before in react-custom-roulette
      const pointerAngle = (317 * Math.PI) / 180;
      const targetSliceCenter = targetIndex * sliceAngle + sliceAngle / 2;
      const targetNormalized = pointerAngle - targetSliceCenter;
      const fullSpins = 6 * (2 * Math.PI);
      return startAngle + fullSpins + ((targetNormalized - (startAngle % (2 * Math.PI)) + 4 * Math.PI) % (2 * Math.PI));
    };

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / totalDuration);

      // Instant-launch ease-out cubic curve (moves at maximum speed on frame 0, decelerates smoothly)
      const ease = 1 - Math.pow(1 - progress, 3);

      if (finalAngle === null) {
        if (winningOfferIdRef.current || progress > 0.3) {
          finalAngle = computeFinalAngle(winningOfferIdRef.current);
        }
      }

      const activeTargetAngle = finalAngle !== null
        ? finalAngle
        : startAngle + 6 * (2 * Math.PI);

      const currentAngle = startAngle + (activeTargetAngle - startAngle) * ease;
      rotationRef.current = currentAngle;
      drawWheel(currentAngle);

      // Trigger tick sound on crossing each slice sector boundary
      if (Math.abs(currentAngle - lastTickAngle) >= sliceAngle * 0.8) {
        playTick();
        lastTickAngle = currentAngle;
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        isSpinningRef.current = false;
        playWin();
        onSpinComplete();
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [drawWheel, offers, onSpinComplete, playTick, playWin, sliceAngle]);

  const handleSpinClick = async () => {
    if (isSpinning || isSpinningRef.current || offers.length === 0) return;
    init();

    // 1. Instantly start the wheel spinning at frame 0 (0ms wait)
    startSpinAnimation();

    // 2. In parallel, run onSpinStart to resolve winning offer
    await onSpinStart();
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-[310px] sm:max-w-[330px] mx-auto select-none">
      {/* Outer Container with Luxury Glow */}
      <div className="relative p-1.5 rounded-full bg-gradient-to-br from-[#DFC07A] via-[#C8A24E] to-[#7A5F25] shadow-[0_0_35px_rgba(200,162,78,0.22)] w-full aspect-square flex items-center justify-center">
        {/* Dark Bezel Inset */}
        <div className="bg-[#0C0B09] rounded-full p-1.5 w-full h-full relative flex items-center justify-center overflow-hidden">
          {/* Wheel Canvas */}
          <canvas
            ref={canvasRef}
            width={680}
            height={680}
            className="w-full h-full rounded-full"
            style={{ imageRendering: 'auto' }}
          />

          {/* Center Spin Button */}
          <button
            onClick={handleSpinClick}
            disabled={isSpinning}
            aria-label="Spin the wheel"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[72px] h-[72px] sm:w-20 sm:h-20 bg-gradient-to-br from-[#DFC07A] via-[#C8A24E] to-[#9E7D3A] hover:from-[#E8CC8C] hover:via-[#D4AF55] hover:to-[#B0892F] text-[#0C0B09] font-serif font-black text-sm sm:text-base rounded-full transition-transform duration-200 hover:scale-[1.05] active:scale-[0.95] disabled:opacity-85 shadow-[0_0_24px_rgba(200,162,78,0.5)] flex items-center justify-center border-[3px] border-[#0C0B09] z-20 tracking-[0.15em] uppercase cursor-pointer"
          >
            <span className="drop-shadow-sm font-extrabold tracking-widest">
              {isSpinning ? '...' : 'SPIN'}
            </span>
          </button>
        </div>

        {/* Pointer (restored to top-right where it was before) */}
        <div className="absolute top-2 right-1.5 w-[50px] sm:w-[54px] z-30 drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] pointer-events-none select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/roulette-pointer.png"
            alt="Wheel Pointer"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}
