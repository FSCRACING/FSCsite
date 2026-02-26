// designed by alongio
"use client";

import React, { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import LogoActive from "./LogoActive";
import CataniaParallax from "./CataniaParallax";

import ColorBends from "./ColorBends";
import FlowingMenu from "./FlowingMenu";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

type XYWH = { x: number; y: number; w: number; h: number };

export default function Hero({ booted }: { booted: boolean }) {
  const heroRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // ✅ Parallax ON/OFF (fade)
  const [parallaxOn, setParallaxOn] = useState(false);

  // ===== MENU state =====
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const [, setDomReady] = useState(false);
  useEffect(() => setDomReady(true), []);

  // ESC to close menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ===== BG gating (solo quando pct==0) =====
  const [rbMounted, setRbMounted] = useState(true);
  const [rbVisible, setRbVisible] = useState(true);
  const rbWantedRef = useRef<boolean>(true);
  const rbHideTimerRef = useRef<number | null>(null);

  const setRB = (on: boolean) => {
    if (rbWantedRef.current === on) return;
    rbWantedRef.current = on;

    if (rbHideTimerRef.current) {
      window.clearTimeout(rbHideTimerRef.current);
      rbHideTimerRef.current = null;
    }

    if (on) {
      setRbMounted(true);
      requestAnimationFrame(() => setRbVisible(true));
    } else {
      setRbVisible(false);
      rbHideTimerRef.current = window.setTimeout(() => setRbMounted(false), 360);
    }
  };

  useEffect(() => {
    if (!booted) return;

    const heroPage = heroRef.current;
    const stage = stageRef.current;
    if (!heroPage || !stage) return;

    const $ = <T extends Element>(s: string, r: ParentNode = heroPage) => r.querySelector(s) as T | null;
    const $$ = <T extends Element>(s: string, r: ParentNode = heroPage) => Array.from(r.querySelectorAll(s)) as T[];

    const CONTENT = {
      catania: {
        textHTML: `
          <span class="hi">Tra acqua e <span class="hi2">lava</span></span> una cultura tecnica che spinge a costruire.
          L’<span class="hi">Università di Catania</span> alimenta ricerca e competenze.
          Il team nasce qui: trasformiamo il territorio in <span class="hi2">collaborazione</span> e crescita.
        `,
      },
    };

    const stack = $("#stack") as HTMLDivElement | null;
    const line1 = $("#line1") as HTMLDivElement | null;
    const line2 = $("#line2") as HTMLDivElement | null;
    const line3 = $("#line3") as HTMLDivElement | null;

    const catLayer = $("#catLayer") as HTMLDivElement | null;
    const catC = $("#catC") as HTMLSpanElement | null;
    const catA = $("#catA") as HTMLSpanElement | null;
    const catT = $("#catT") as HTMLSpanElement | null;

    const aniaLayer = $("#aniaLayer") as HTMLDivElement | null;
    const aniaWord = $("#aniaWord") as HTMLDivElement | null;

    const uniLayer = $("#uniLayer") as HTMLDivElement | null;
    const uniText = $("#uniText") as HTMLDivElement | null;

    const wheelBase = $("#wheelBase") as SVGGElement | null;
    const wheelClick = $("#wheelClick") as SVGGElement | null;

    if (
      !stack ||
      !line1 ||
      !line2 ||
      !line3 ||
      !catLayer ||
      !catC ||
      !catA ||
      !catT ||
      !aniaLayer ||
      !aniaWord ||
      !uniLayer ||
      !uniText
    ) {
      return;
    }

    // ===== build lines =====
    const makeLine = (container: HTMLElement, text: string) => {
      container.innerHTML = "";
      for (const ch of Array.from(text)) {
        const s = document.createElement("span");
        s.className = "glyph";
        s.textContent = ch;
        container.appendChild(s);
      }
    };

    makeLine(line1, "FSC");
    makeLine(line2, "RACING");
    makeLine(line3, "TEAM");

    const glyphs1 = $$(".glyph", line1) as HTMLElement[];
    const glyphs2 = $$(".glyph", line2) as HTMLElement[];
    const glyphs3 = $$(".glyph", line3) as HTMLElement[];

    const Csrc = glyphs1.find((g) => g.textContent === "C");
    const Asrc = glyphs2.find((g) => g.textContent === "A");
    const Tsrc = glyphs3.find((g) => g.textContent === "T");
    if (!Csrc || !Asrc || !Tsrc) return;

    // build ANIA
    aniaWord.innerHTML = "";
    for (const ch of Array.from("ANIA")) {
      const s = document.createElement("span");
      s.className = "glyph";
      s.textContent = ch;
      aniaWord.appendChild(s);
    }
    const aniaGlyphs = $$(".glyph", aniaWord) as HTMLElement[];

    // ===== wheel click (+180) =====
    let extraDeg = 0;
    const onWheelClick = (e: Event) => {
      e.preventDefault();
      extraDeg += 180;
    };
    (wheelClick || wheelBase)?.addEventListener("click", onWheelClick);

    // ===== reveal =====
    const reveals = $$<HTMLElement>("[data-reveal]", stage);
    const cssStagger =
      parseInt(getComputedStyle(document.documentElement).getPropertyValue("--stagger") || "120", 10) || 120;
    const cssDur =
      parseInt(getComputedStyle(document.documentElement).getPropertyValue("--dur") || "980", 10) || 980;

    const playRevealOnce = () => {
      reveals.forEach((el) => {
        const inner = el.querySelector<HTMLElement>(".inner");
        const wipe = el.querySelector<HTMLElement>(".wipe");
        if (!inner || !wipe) return;

        inner.style.opacity = "0";
        inner.style.transform = "translateY(-18px)";
        inner.style.filter = "blur(10px)";
        wipe.style.transform = "translateY(0%)";
      });

      animate(reveals.map((r) => r.querySelector<HTMLElement>(".wipe")).filter(Boolean) as HTMLElement[], {
        translateY: ["0%", "110%"],
        duration: cssDur,
        delay: stagger(cssStagger),
        ease: "inOutQuad",
      });

      animate(reveals.map((r) => r.querySelector<HTMLElement>(".inner")).filter(Boolean) as HTMLElement[], {
        opacity: [0, 1],
        translateY: [-18, 0],
        filter: ["blur(10px)", "blur(0px)"],
        duration: cssDur,
        delay: stagger(cssStagger, { start: 80 }),
        ease: "outQuad",
      });
    };

    // ===== LOCK logic =====
    let scrollLocked = true;

    const setScrollLock = (on: boolean) => {
      scrollLocked = !!on;
      document.documentElement.classList.toggle("lock", scrollLocked);
      document.body.classList.toggle("lock", scrollLocked);
    };

    const heroMostlyInView = () => {
      const r = heroPage.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const visible = Math.min(vh, Math.max(0, Math.min(vh, r.bottom) - Math.max(0, r.top)));
      return visible / vh > 0.58;
    };

    const atTop = () => (window.scrollY || document.documentElement.scrollTop || 0) <= 1;

    // ✅ dichiarati UNA VOLTA SOLA
    let targetPct = 0;
    let pct = 0;

    const onScrollCheck = () => {
      if (!scrollLocked && heroMostlyInView() && atTop()) {
        targetPct = 100;
        pct = 100;
        setScrollLock(true);
      }
    };
    window.addEventListener("scroll", onScrollCheck, { passive: true });

    const blockedKeys = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " ", "Spacebar"]);
    const onKeyDown = (e: KeyboardEvent) => {
      if (!scrollLocked) return;
      if (!heroMostlyInView()) return;

      const wantsDown = e.key === "ArrowDown" || e.key === "PageDown" || e.key === " " || e.key === "Spacebar";
      if (wantsDown && pct >= 99.5) {
        setScrollLock(false);
        return;
      }
      if (blockedKeys.has(e.key)) e.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown, { passive: false });

    const onTouchMove = (e: TouchEvent) => {
      if (!scrollLocked) return;
      if (!heroMostlyInView()) return;
      e.preventDefault();
    };
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    const onWheel = (e: WheelEvent) => {
      if (!heroMostlyInView()) return;
      const dy = e.deltaY || 0;

      if (scrollLocked) {
        if (dy > 0 && pct >= 99.5) {
          setScrollLock(false);
          return;
        }
        e.preventDefault();
        const step = dy * 0.06;
        targetPct = clamp(targetPct + step, 0, 100);
        if (targetPct > 99.5) targetPct = 100;
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });

    // ===== content apply =====
    const applyCataniaContent = () => {
      uniText.innerHTML = CONTENT.catania.textHTML;
    };

    // ===== measure/layout =====
    const measure = {
      ready: false,
      stackRect: null as DOMRect | null,
      C0: null as XYWH | null,
      A0: null as XYWH | null,
      T0: null as XYWH | null,
      wCsrc: 0,
      wAsrc: 0,
      wTsrc: 0,
      ovFontPx: 0,
      ovGap: 0,
      wCov: 0,
      wAov: 0,
      wTov: 0,
      wAniaOv: 0,
      blockMinY: 0,
      blockCX: 0,
    };

    const rectInStack = (el: Element, stackRect: DOMRect): XYWH => {
      const r = el.getBoundingClientRect();
      return { x: r.left - stackRect.left, y: r.top - stackRect.top, w: r.width, h: r.height };
    };

    const clearForMeasure = () => {
      const all = [...glyphs1, ...glyphs2, ...glyphs3, ...aniaGlyphs, catC, catA, catT] as HTMLElement[];
      for (const g of all) {
        g.dataset._t = g.style.transform || "";
        g.dataset._o = g.style.opacity || "";
        g.dataset._f = g.style.filter || "";
        g.style.transform = "";
        g.style.opacity = "";
        g.style.filter = "";
      }

      stack.dataset._st = stack.style.transform || "";
      stack.style.transform = "";

      catLayer.dataset._op = catLayer.style.opacity || "";
      aniaLayer.dataset._op = aniaLayer.style.opacity || "";
      uniLayer.dataset._op = uniLayer.style.opacity || "";

      catLayer.style.opacity = "1";
      aniaLayer.style.opacity = "1";
      uniLayer.style.opacity = "1";

      aniaWord.dataset._t = aniaWord.style.transform || "";
      aniaWord.style.transform = "";
    };

    const restoreAfterMeasure = () => {
      const all = [...glyphs1, ...glyphs2, ...glyphs3, ...aniaGlyphs, catC, catA, catT] as HTMLElement[];
      for (const g of all) {
        g.style.transform = g.dataset._t || "";
        g.style.opacity = g.dataset._o || "";
        g.style.filter = g.dataset._f || "";
        delete g.dataset._t;
        delete g.dataset._o;
        delete g.dataset._f;
      }

      stack.style.transform = stack.dataset._st || "";
      delete stack.dataset._st;

      catLayer.style.opacity = catLayer.dataset._op || "";
      aniaLayer.style.opacity = aniaLayer.dataset._op || "";
      uniLayer.style.opacity = uniLayer.dataset._op || "";

      delete catLayer.dataset._op;
      delete aniaLayer.dataset._op;
      delete uniLayer.dataset._op;

      aniaWord.style.transform = aniaWord.dataset._t || "";
      delete aniaWord.dataset._t;
    };

    const recalcLayout = () => {
      clearForMeasure();

      const stackRect = stack.getBoundingClientRect();
      measure.stackRect = stackRect;

      const ovFontPx = parseFloat(getComputedStyle(catLayer).fontSize);
      measure.ovFontPx = ovFontPx;
      measure.ovGap = ovFontPx * 0.06;

      const rC = rectInStack(Csrc, stackRect);
      const rA = rectInStack(Asrc, stackRect);
      const rT = rectInStack(Tsrc, stackRect);

      measure.C0 = rC;
      measure.A0 = rA;
      measure.T0 = rT;

      measure.wCsrc = rC.w;
      measure.wAsrc = rA.w;
      measure.wTsrc = rT.w;

      measure.wCov = catC.getBoundingClientRect().width;
      measure.wAov = catA.getBoundingClientRect().width;
      measure.wTov = catT.getBoundingClientRect().width;
      measure.wAniaOv = aniaWord.getBoundingClientRect().width;

      const allGlyphs = [...glyphs1, ...glyphs2, ...glyphs3];
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity;

      for (const g of allGlyphs) {
        const rr = rectInStack(g, stackRect);
        minX = Math.min(minX, rr.x);
        maxX = Math.max(maxX, rr.x + rr.w);
        minY = Math.min(minY, rr.y);
      }
      measure.blockMinY = minY;
      measure.blockCX = (minX + maxX) / 2;

      measure.ready = true;
      restoreAfterMeasure();
    };

    const onResize = () => recalcLayout();
    window.addEventListener("resize", onResize);

    // ===== render loop =====
    let raf = 0;
    let parallaxWasOn = false;

    const render = () => {
      if (!measure.ready || !measure.stackRect || !measure.C0 || !measure.A0 || !measure.T0) {
        raf = requestAnimationFrame(render);
        return;
      }

      // smooth pct
      pct = lerp(pct, targetPct, 0.18);
      if (targetPct === 100 && pct > 99.5) pct = 100;
      if (targetPct === 0 && pct < 0.5) pct = 0;

      // ColorBends SOLO quando FSC/RACING/TEAM (pct==0)
      const shouldShowRB = heroMostlyInView() && scrollLocked && targetPct <= 0.001 && pct <= 0.001;
      setRB(shouldShowRB);

      // wheel
      if (wheelClick) wheelClick.style.transform = `rotate(${extraDeg.toFixed(2)}deg)`;
      if (wheelBase) wheelBase.style.transform = `rotate(${(pct * 7.2).toFixed(2)}deg)`;

      // ✅ PARALLAX: visibile SOLO a 100, sparisce appena < 100
      const EPS = 0.05; // tolleranza per il lerp (0.05 => ~99.95)
      const wantParallax = pct >= (100 - EPS);

      if (wantParallax !== parallaxWasOn) {
        parallaxWasOn = wantParallax;
        setParallaxOn(wantParallax);
      }


      // layout math
      const ovGap = measure.ovGap;
      const spacingAfterT = measure.ovFontPx * 0.1;

      const fullWordW = measure.wCov + ovGap + measure.wAov + ovGap + measure.wTov + spacingAfterT + measure.wAniaOv;

      const fullStartX = measure.blockCX - fullWordW / 2;
      const CxF = fullStartX;
      const AxF = CxF + measure.wCov + ovGap;
      const TxF = AxF + measure.wAov + ovGap;
      const yF = measure.blockMinY - measure.ovFontPx * 0.82;

      const tA = clamp(pct / 50, 0, 1);
      const tB = clamp((pct - 50) / 50, 0, 1);

      const tMove = smootherstep(tA);
      const tFadeA = smootherstep(clamp((tA - 0.1) / 0.8, 0, 1));
      const tFadeB = smootherstep(clamp((tB - 0.1) / 0.8, 0, 1));

      const sC0 = measure.wCsrc / Math.max(1, measure.wCov);
      const sA0 = measure.wAsrc / Math.max(1, measure.wAov);
      const sT0 = measure.wTsrc / Math.max(1, measure.wTov);

      const placeClone = (el: HTMLElement, m0: XYWH, x1: number, y1: number, t: number, s0: number) => {
        const tt = clamp(t, 0, 1);
        const x = lerp(m0.x, x1, tt);
        const y = lerp(m0.y, y1, tt);
        const s = lerp(s0, 1, tt);
        el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
      };

      // CAT layer
      const catOp = smootherstep(clamp((tA - 0.03) / 0.22, 0, 1));
      catLayer.style.opacity = catOp.toFixed(3);

      placeClone(catC, measure.C0, CxF, yF, tMove, sC0);
      placeClone(catA, measure.A0, AxF, yF, tMove, sA0);
      placeClone(catT, measure.T0, TxF, yF, tMove, sT0);

      const catBlur = lerp(10, 0, smootherstep(clamp((tA - 0.12) / 0.68, 0, 1)));
      catC.style.filter = `blur(${catBlur.toFixed(2)}px)`;
      catA.style.filter = `blur(${catBlur.toFixed(2)}px)`;
      catT.style.filter = `blur(${catBlur.toFixed(2)}px)`;

      // fade out original
      const restOpacity = lerp(1, 0, tFadeA);
      const restBlur = lerp(0, 10, tFadeA);
      const restY = lerp(0, -10, tFadeA);

      const applyRest = (g: HTMLElement) => {
        g.style.opacity = restOpacity.toFixed(3);
        g.style.filter = `blur(${restBlur.toFixed(2)}px)`;
        g.style.transform = `translate3d(0,${restY.toFixed(2)}px,0)`;
      };
      glyphs1.forEach(applyRest);
      glyphs2.forEach(applyRest);
      glyphs3.forEach(applyRest);

      // ANIA
      const a = tFadeB;
      const aniaX = TxF + measure.wTov + spacingAfterT;
      const aniaBaseY = yF + measure.ovFontPx * 0.02;
      const aY = lerp(-10, 0, a);

      aniaWord.style.transform = `translate3d(${aniaX.toFixed(2)}px, ${(aniaBaseY + aY).toFixed(2)}px, 0)`;
      aniaLayer.style.opacity = a.toFixed(3);

      aniaGlyphs.forEach((g, i) => {
        const start = i * 0.12;
        const dur = 1 - start;
        const tt = clamp((a - start) / Math.max(0.001, dur), 0, 1);
        g.style.opacity = tt.toFixed(3);
        g.style.filter = `blur(${lerp(10, 0, tt).toFixed(2)}px)`;
        g.style.transform = `translate3d(${lerp(-12, 0, tt).toFixed(2)}px,0,0)`;
      });

      // UNI late
      const u = smootherstep(clamp((pct - 86) / 14, 0, 1));
      uniLayer.style.opacity = u.toFixed(3);

      const gapEm = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--underTitleGapEm")) || 1.22;
      const extraPx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--underTitleExtraPx")) || 12;
      const uniY = yF + measure.ovFontPx * gapEm + extraPx;

      const yOff = lerp(22, 0, u);
      const blur = lerp(10, 0, u);
      uniText.style.textAlign = "left";
      uniText.style.transform = `translate3d(${fullStartX.toFixed(2)}px, ${(uniY + yOff).toFixed(2)}px, 0)`;
      uniText.style.filter = `blur(${blur.toFixed(2)}px)`;

      // sway
      const swayAmp = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--swayPx") || "14") || 14;
      const swayT = smootherstep(clamp((pct - 70) / 30, 0, 1));
      const sway = Math.sin((pct / 100) * Math.PI * 2) * swayAmp * swayT;
      const lift = lerp(0, -6, tFadeA);
      stack.style.transform = `translate3d(${sway.toFixed(2)}px,${lift.toFixed(2)}px,0)`;

      raf = requestAnimationFrame(render);
    };

    // ===== start =====
    window.scrollTo(0, 0);
    targetPct = 0;
    pct = 0;

    setScrollLock(true);
    applyCataniaContent();
    playRevealOnce();
    recalcLayout();
    window.setTimeout(recalcLayout, 60);

    raf = requestAnimationFrame(render);

    // cleanup
    return () => {
      cancelAnimationFrame(raf);

      setParallaxOn(false);

      window.removeEventListener("scroll", onScrollCheck as any);
      window.removeEventListener("keydown", onKeyDown as any);
      window.removeEventListener("touchmove", onTouchMove as any);
      window.removeEventListener("wheel", onWheel as any);
      window.removeEventListener("resize", onResize as any);

      (wheelClick || wheelBase)?.removeEventListener("click", onWheelClick);
      document.documentElement.classList.remove("lock");
      document.body.classList.remove("lock");

      if (rbHideTimerRef.current) window.clearTimeout(rbHideTimerRef.current);
      rbHideTimerRef.current = null;
    };
  }, [booted]);

  return (
    <section className="page" id="heroPage" ref={heroRef}>
      {/* TOP BAR */}
      <div className="topbar">
        <button
          className={`hamb ${menuOpen ? "is-on" : ""}`}
          aria-label={menuOpen ? "Chiudi menu" : "Apri menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>

      {/* Drawer */}
      <div className={`drawerShade ${menuOpen ? "is-on" : ""}`} onClick={() => setMenuOpen(false)} />
      <aside className={`drawer ${menuOpen ? "is-on" : ""}`} aria-hidden={!menuOpen}>
        <div className="drawerHead">
          <div className="drawerTitle">MENU</div>
        </div>

        <div className="drawerBody">
          {menuOpen ? (
            <FlowingMenu
              items={[
                { text: "Home", link: "#heroPage", onClick: () => goTo("heroPage") },
                { text: "Team", link: "#teamPage", onClick: () => goTo("teamPage") },
                { text: "Contacts", link: "#contacts", onClick: () => goTo("contacts") },
                { text: "Area Riservata", link: "/admin/index.html", onClick: () => { setMenuOpen(false); window.location.assign("/admin/index.html"); } },
              ]}
              bgColor="transparent"
              speed={5}
            />
          ) : null}
        </div>
      </aside>

      {/* ColorBends SOLO quando FSC/RACING/TEAM */}
      {rbMounted && (
        <div className={`rbBgWrap ${rbVisible ? "is-on" : ""}`} aria-hidden="true">
          <ColorBends
            colors={["#ff0000", "#000000", "#ff0000"]}
            rotation={0}
            speed={0.2}
            scale={1}
            frequency={1}
            warpStrength={1}
            mouseInfluence={1}
            parallax={0.5}
            noise={0.1}
            transparent
            autoRotate={0}
            color="#000000"
          />
          <div className="rbBgVignette" />
        </div>
      )}
      {/* ✅ PARALLAX ancorato all'hero, full viewport, sotto le scritte */}
      <div className={`heroParallax ${parallaxOn ? "is-on" : ""}`} aria-hidden={!parallaxOn}>
        <CataniaParallax active={parallaxOn} />
      </div>


      <div className="stage" id="stage" ref={stageRef}>
        <section className="reveal left" data-reveal>
          <div className="wipe" />
          <div className="inner">
            <div className="eleWrap" aria-label="Liotru logo">
              <LogoActive />
            </div>
          </div>
        </section>

        <section className="reveal right" data-reveal>
          <div className="wipe" />
          <div className="inner">
            <div className="stack" id="stack">
              <div className="uniLayer" id="uniLayer" aria-hidden="true">
                <div className="uniText" id="uniText" />
              </div>

              <div className="catLayer" id="catLayer" aria-hidden="true">
                <span className="glyph" id="catC">C</span>
                <span className="glyph" id="catA">A</span>
                <span className="glyph" id="catT">T</span>
              </div>

              <div className="aniaLayer" id="aniaLayer" aria-hidden="true">
                <div className="aniaWord" id="aniaWord" />
              </div>

              <div className="line" id="line1" />
              <div className="line" id="line2" />
              <div className="line" id="line3" />
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
