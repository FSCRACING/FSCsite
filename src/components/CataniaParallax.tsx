import React, { useEffect, useRef } from "react";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

type Props = {
  active: boolean;
  // bottom -> top: 4,3,2,1 (come nel tuo HTML)
  src4?: string;
  src3?: string;
  src2?: string;
  src1?: string;
};

export default function CataniaParallax({
  active,
  src4 = "/parallax/4.png",
  src3 = "/parallax/3.png",
  src2 = "/parallax/2.png",
  src1 = "/parallax/1.png",
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);

  const l1Ref = useRef<SVGImageElement | null>(null);
  const l2Ref = useRef<SVGImageElement | null>(null);
  const l3Ref = useRef<SVGImageElement | null>(null);
  const l4Ref = useRef<SVGImageElement | null>(null);

  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const layers = [
      { el: l1Ref, mx: 22, my: 14, sx: 0.16 }, // foreground
      { el: l2Ref, mx: 14, my: 9, sx: 0.1 },
      { el: l3Ref, mx: 9, my: 6, sx: 0.07 },
      { el: l4Ref, mx: 5, my: 3, sx: 0.04 }, // background
    ];

    let targetX = 0,
      targetY = 0,
      targetS = 0;
    let curX = 0,
      curY = 0,
      curS = 0;

    const smoothing = 0.1;
    const scrollMax = 120;

    const setTargetsFromPointer = (clientX: number, clientY: number) => {
      const r = stage.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) return;

      const nx = ((clientX - r.left) / r.width) * 2 - 1; // -1..1
      const ny = ((clientY - r.top) / r.height) * 2 - 1;

      targetX = clamp(nx, -1, 1);
      targetY = clamp(ny, -1, 1);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!activeRef.current) return;
      setTargetsFromPointer(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!activeRef.current) return;
      const t = e.touches?.[0];
      if (!t) return;
      setTargetsFromPointer(t.clientX, t.clientY);
    };

    const onWheel = (e: WheelEvent) => {
      if (!activeRef.current) return;
      targetS = clamp(targetS + (e.deltaY / 1200), -1, 1);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });

    let raf = 0;
    const tick = () => {
      // se non attivo, rientra verso il centro (senza stacchi)
      if (!activeRef.current) {
        targetX *= 0.92;
        targetY *= 0.92;
        targetS *= 0.9;
      }

      curX += (targetX - curX) * smoothing;
      curY += (targetY - curY) * smoothing;
      curS += (targetS - curS) * smoothing;

      const scrollPx = curS * scrollMax;

      for (const L of layers) {
        const el = L.el.current;
        if (!el) continue;

        const tx = (-curX) * L.mx;
        const ty = (-curY) * L.my + (-scrollPx) * L.sx;
        const z = 1 + Math.abs(curX) * 0.006 + Math.abs(curY) * 0.006;

        el.style.transform = `translate(${tx}px, ${ty}px) scale(${z})`;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove as any);
      window.removeEventListener("touchmove", onTouchMove as any);
      window.removeEventListener("wheel", onWheel as any);
    };
  }, []);

  return (
    <div className="pxStage" ref={stageRef} aria-hidden={!active}>
      <svg
        className="pxScene"
        viewBox="0 0 2048 1365"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* sotto */}
        <image ref={l4Ref} className="pxLayer" href={src4} x="0" y="0" width="2048" height="1365" preserveAspectRatio="xMidYMid meet" />
        <image ref={l3Ref} className="pxLayer" href={src3} x="0" y="0" width="2048" height="1365" preserveAspectRatio="xMidYMid meet" />
        <image ref={l2Ref} className="pxLayer" href={src2} x="0" y="0" width="2048" height="1365" preserveAspectRatio="xMidYMid meet" />
        {/* sopra */}
        <image ref={l1Ref} className="pxLayer" href={src1} x="0" y="0" width="2048" height="1365" preserveAspectRatio="xMidYMid meet" />
      </svg>

      <div className="pxVignette" />
    </div>
  );
}
