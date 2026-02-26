import { useEffect, useState } from "react";
import type React from "react";

type Opts = {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
};

export function useInView<T extends Element>(
  ref: React.RefObject<T | null>,
  opts: Opts = {}
) {
  const { root = null, rootMargin = "0px", threshold = 0.6 } = opts;
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => setInView(!!entries[0]?.isIntersecting),
      { root, rootMargin, threshold }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [ref, root, rootMargin, JSON.stringify(threshold)]);

  return inView;
}
