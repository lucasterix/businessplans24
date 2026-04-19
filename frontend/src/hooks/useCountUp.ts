import { useEffect, useState } from 'react';

/**
 * Animated number — counts from 0 (or `from`) to `target` over `duration` ms.
 * Uses requestAnimationFrame with an ease-out curve.
 */
export function useCountUp(target: number | null, duration = 1200, from = 0): number {
  const [value, setValue] = useState(from);
  useEffect(() => {
    if (target == null) return;
    let raf = 0;
    const start = performance.now();
    const delta = target - from;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setValue(Math.round(from + delta * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, from]);
  return value;
}
