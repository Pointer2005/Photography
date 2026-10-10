'use client';

import { useCallback, useRef } from 'react';

export function useSoundEffects() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const init = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Resume context if suspended (browser autoplay policy)
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const playTick = useCallback(() => {
    init();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }, [init]);

  const playWin = useCallback(() => {
    init();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    // Triumphant chord progression (C Major)
    playNote(523.25, now, 0.5);       // C5
    playNote(659.25, now + 0.15, 0.5); // E5
    playNote(783.99, now + 0.3, 0.5);  // G5
    playNote(1046.50, now + 0.45, 1.0); // C6
    
    // Add a little harmony
    playNote(392.00, now + 0.45, 1.0); // G4
    playNote(523.25, now + 0.45, 1.0); // C5
  }, [init]);

  return { playTick, playWin, init };
}
