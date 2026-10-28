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
  { bg: '#FFFFFF', text: '#09090b' }, // White + Dark Charcoal
  { bg: '#EC4899', text: '#FFFFFF' }, // Pink-500 + White
  { bg: '#6366F1', text: '#FFFFFF' }, // Indigo-500 + White
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
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Slice Text
      ctx.save();
      const midAngle = startAngle + sliceAngle / 2;
      ctx.rotate(midAngle);

      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const offerName = offer?.name || `Offer ${i + 1}`;
      const lines = splitTextIntoLines(offerName, 13);
      const textRadius = radius * 0.63;

      if (lines.length === 1) {
        ctx.font = '800 28px Outfit, sans-serif';
        ctx.fillText(lines[0], textRadius, 0);
      } else {
        ctx.font = '800 24px Outfit, sans-serif';
        ctx.fillText(lines[0], textRadius, -13);
        ctx.font = '700 21px Outfit, sans-serif';
        ctx.fillText(lines[1], textRadius, 14);
      }
      ctx.restore();
    }

    // Outer Rim Border
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Outer decorative dots in alternating pink-500 and indigo-500
    const numDots = numSlices * 4;
    for (let d = 0; d < numDots; d++) {
      const dotAngle = (d * (2 * Math.PI)) / numDots;
      const dotX = Math.cos(dotAngle) * (radius - 5);
      const dotY = Math.sin(dotAngle) * (radius - 5);

      ctx.beginPath();
      ctx.arc(dotX, dotY, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = d % 2 === 0 ? '#EC4899' : '#6366F1';
      ctx.fill();
    }

    // Inner Cutout Border
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#09090B';
    ctx.fill();
    ctx.strokeStyle = '#EC4899';
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
    <div className="relative flex flex-col items-center justify-center w-[min(68vw,260px)] sm:w-[300px] md:w-[330px] lg:w-[360px] aspect-square mx-auto select-none">
      {/* Outer Container with Vibrant Glow */}
      <div className="relative p-1 sm:p-1.5 rounded-full bg-gradient-to-br from-pink-500 via-white/30 to-indigo-500 shadow-[0_0_28px_rgba(236,72,153,0.3)] w-full h-full flex items-center justify-center">
        {/* Dark Bezel Inset */}
        <div className="bg-[#09090b] rounded-full p-1 sm:p-1.5 w-full h-full relative flex items-center justify-center overflow-hidden">
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
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-pink-500 to-indigo-500 hover:from-pink-400 hover:to-indigo-400 text-white font-black text-xs sm:text-sm lg:text-base rounded-full transition-transform duration-200 hover:scale-[1.05] active:scale-[0.95] disabled:opacity-85 shadow-[0_0_20px_rgba(236,72,153,0.5)] flex items-center justify-center border-2 sm:border-[3px] border-[#09090b] z-20 tracking-[0.15em] uppercase cursor-pointer"
          >
            <span className="drop-shadow-sm font-extrabold tracking-wider">
              {isSpinning ? '...' : 'SPIN'}
            </span>
          </button>
        </div>

        {/* Pointer */}
        <div className="absolute top-1 sm:top-2 right-1 sm:right-1.5 w-[38px] sm:w-[46px] lg:w-[52px] z-30 drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)] pointer-events-none select-none">
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
