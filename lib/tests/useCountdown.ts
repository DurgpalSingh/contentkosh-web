'use client';

import { useEffect, useState } from 'react';

const secondsUntil = (target: string | null | undefined): number | null => {
  if (!target) return null;
  return Math.max(0, Math.floor((new Date(target).getTime() - Date.now()) / 1000));
};

/**
 * Seconds left until `target`, recomputed from the clock every second (no drift).
 * Returns null when there is no target.
 */
export function useCountdown(target: string | null | undefined): number | null {
  const [remaining, setRemaining] = useState(() => secondsUntil(target));

  useEffect(() => {
    setRemaining(secondsUntil(target));
    if (!target) return;
    const id = window.setInterval(() => {
      const next = secondsUntil(target);
      setRemaining(next);
      if (next === 0) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  return remaining;
}

/** 3725 → "1:02:05", 125 → "02:05". */
export function formatCountdown(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
