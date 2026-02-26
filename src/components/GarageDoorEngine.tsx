// designed by alongio
import React, { useEffect, useMemo, useRef, useState } from "react";
import CarBlueprintIndex from "./CarBlueprintIndex";

type Props = {
  modelUrl?: string;
};

export default function GarageDoorEngine({ modelUrl = "/car.glb" }: Props) {
  const frameRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [inside, setInside] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);

  const engineEnabled = useMemo(() => {
    if (!open) return false;
    if (fullscreen) return true;
    return inside || focusWithin;
  }, [open, fullscreen, inside, focusWithin]);

  const closeGarage = () => {
    setFullscreen(false);
    setOpen(false);
  };

  // Fullscreen: blocco scroll body
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [fullscreen]);

  // ✅ SHIELD anti-scroll: blocca wheel/touch pagina quando garage OPEN e evento dentro frame (o fullscreen)
  useEffect(() => {
    const onWheelCapture = (e: WheelEvent) => {
      if (!open) return;
      const frame = frameRef.current;
      if (!frame) return;

      const target = e.target as Node | null;
      const inFrame = fullscreen || (target ? frame.contains(target) : false);
      if (!inFrame) return;

      if (e.cancelable) e.preventDefault();
    };

    const onTouchMoveCapture = (e: TouchEvent) => {
      if (!open) return;
      const frame = frameRef.current;
      if (!frame) return;

      const target = e.target as Node | null;
      const inFrame = fullscreen || (target ? frame.contains(target) : false);
      if (!inFrame) return;

      if (e.cancelable) e.preventDefault();
    };

    window.addEventListener("wheel", onWheelCapture, { passive: false, capture: true });
    window.addEventListener("touchmove", onTouchMoveCapture, { passive: false, capture: true });

    return () => {
      window.removeEventListener("wheel", onWheelCapture as any, true as any);
      window.removeEventListener("touchmove", onTouchMoveCapture as any, true as any);
    };
  }, [open, fullscreen]);

  // ✅ ESC: chiude SEMPRE il garage (e anche fullscreen)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (!open && !fullscreen) return;

      e.preventDefault();
      closeGarage();
    };

    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey as any);
  }, [open, fullscreen]);

  const toggleFullscreen = () => {
    setFullscreen((v) => !v);
    if (!open) setOpen(true);
  };

  return (
    <section className="garageSec" aria-label="Garage engine section" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
      {/* scrim fullscreen: click => esci fullscreen (garage resta aperto) */}
      <div
        className={`garageScrim2 ${fullscreen ? "is-on" : ""}`}
        onClick={() => setFullscreen(false)}
      />

      <div
        ref={frameRef}
        className={`garageFrame2 ${open ? "is-open" : ""} ${fullscreen ? "is-full" : ""}`}
        tabIndex={-1}
        onMouseEnter={() => setInside(true)}
        onMouseLeave={() => setInside(false)}
        onFocusCapture={() => setFocusWithin(true)}
        onBlurCapture={() => setFocusWithin(false)}
      >
        {/* HUD minimal: solo fullscreen */}
        <div className="garageHud2">
          <div className="garageHudRight2">
            <button
              className="garageBtn2 garageBtnGhost2"
              type="button"
              onClick={toggleFullscreen}
              title="Toggle fullscreen"
            >
              {fullscreen ? "Esci full" : "Fullscreen"}
            </button>
          </div>
        </div>

        {/* VIEWPORT */}
        <div className="garageViewport2" aria-label="3D viewport">
          <div className="garageEngine2">
            <CarBlueprintIndex modelUrl={modelUrl} enabled={engineEnabled} captureWheel captureKeys />
          </div>

          {/* CTA + EXIT in basso quando OPEN */}
          {open && (
            <div className="garageBottomBar" aria-label="Garage bottom controls">
              <div className="garageBottomText" aria-hidden="true">
                Scorri in alto o in basso
              </div>

              <button className="garageExitBtn" type="button" onClick={closeGarage}>
                Esci
              </button>
            </div>
          )}
        </div>

        {/* GARAGE DOOR OVERLAY (toggle) */}
        <div className={`garageDoorWrap2 ${open ? "is-open" : ""}`} aria-hidden={open}>
          <div className="garageDoor2" />
          <div className="garageLip2" />
          <div className="garageSensor2" />

          {/* CTA apertura (senza background) */}
          {!open && (
            <button className="garageOpenCta" type="button" onClick={() => setOpen(true)}>
              <div className="garageOpenBig">GARAGE</div>
              <div className="garageOpenSub">scopri il progetto</div>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}