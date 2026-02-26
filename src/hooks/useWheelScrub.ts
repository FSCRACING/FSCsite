import { useEffect, useRef, useState } from "react";

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

type Opts = {
  enabled: boolean;
  step?: number;       // sensibilità wheel
  smooth?: number;     // smoothing 0..1
  preventDefault?: boolean;
};

export function useWheelScrub({
  enabled,
  step = 0.0017,
  smooth = 0.18,
  preventDefault = true,
}: Opts) {
  const [p, setP] = useState(0);
  const target = useRef(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const onWheel = (e: WheelEvent) => {
      if (preventDefault) e.preventDefault();
      target.current = clamp01(target.current + e.deltaY * step);
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    const tick = () => {
      setP((cur) => {
        const t = target.current;
        if (smooth <= 0) return t;
        return cur + (t - cur) * smooth;
      });
      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("wheel", onWheel as any);
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
    };
  }, [enabled, step, smooth, preventDefault]);

  const setInstant = (v: number) => {
    target.current = clamp01(v);
    setP(target.current);
  };

  return { p, setInstant };
}
