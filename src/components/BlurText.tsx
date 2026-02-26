import { motion, Transition, Easing } from "motion/react";
import { useEffect, useRef, useState, useMemo } from "react";

type BlurTextProps = {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Record<string, string | number>;
  animationTo?: Array<Record<string, string | number>>;
  easing?: Easing | Easing[];
  onAnimationComplete?: () => void;
  stepDuration?: number;
};

const buildKeyframes = (
  from: Record<string, string | number>,
  steps: Array<Record<string, string | number>>
): Record<string, Array<string | number>> => {
  const keys = new Set<string>([
    ...Object.keys(from),
    ...steps.flatMap((s) => Object.keys(s)),
  ]);

  const keyframes: Record<string, Array<string | number>> = {};

  keys.forEach((k) => {
    // start value: from[k] oppure il primo valore presente negli steps, altrimenti 0
    const firstStepVal = steps.find((s) => s[k] !== undefined)?.[k];
    let prev: string | number =
      from[k] !== undefined ? from[k] : firstStepVal !== undefined ? firstStepVal : 0;

    const arr: Array<string | number> = [prev];

    for (const s of steps) {
      const v = s[k] !== undefined ? s[k] : prev;
      arr.push(v);
      prev = v;
    }

    keyframes[k] = arr;
  });

  return keyframes;
};

const BlurText: React.FC<BlurTextProps> = ({
  text = "",
  delay = 200,
  className = "",
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
  rootMargin = "0px",
  animationFrom,
  animationTo,
  easing = (t: number) => t,
  onAnimationComplete,
  stepDuration = 0.35,
}) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  // Trigger once quando entra in view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // trigger once
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const defaultFrom = useMemo(
    () =>
      direction === "top"
        ? { filter: "blur(10px)", opacity: 0, y: -50 }
        : { filter: "blur(10px)", opacity: 0, y: 50 },
    [direction]
  );

  const defaultTo = useMemo(
    () => [
      {
        filter: "blur(5px)",
        opacity: 0.5,
        y: direction === "top" ? 5 : -5,
      },
      { filter: "blur(0px)", opacity: 1, y: 0 },
    ],
    [direction]
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;

  const animateKeyframes = useMemo(
    () => buildKeyframes(fromSnapshot, toSnapshots),
    [fromSnapshot, toSnapshots]
  );

  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = useMemo(
    () =>
      Array.from({ length: stepCount }, (_, i) =>
        stepCount === 1 ? 0 : i / (stepCount - 1)
      ),
    [stepCount]
  );

  // ✅ supporto \n: ogni riga è un “blocco”
  const lines = useMemo(
    () => text.split(/\r?\n/).map((l) => l.trim()),
    [text]
  );

  // segmentazione per riga
  const segmentedLines = useMemo(() => {
    return lines.map((line) => {
      if (!line) return [];
      return animateBy === "words"
        ? line.split(/\s+/).filter(Boolean)
        : Array.from(line);
    });
  }, [lines, animateBy]);

  const totalSegments = useMemo(
    () => segmentedLines.reduce((sum, arr) => sum + arr.length, 0),
    [segmentedLines]
  );

  let globalIndex = 0;

  return (
    <p ref={ref} className={`blur-text ${className}`}>
      {segmentedLines.map((elements, lineIdx) => {
        if (elements.length === 0) {
          // riga vuota -> spazio verticale minimo (opzionale)
          return <span key={lineIdx} style={{ display: "block", height: "0.6em" }} />;
        }

        return (
          <span key={lineIdx} style={{ display: "block" }}>
            {elements.map((segment, i) => {
              const idx = globalIndex++;
              const isLast = idx === totalSegments - 1;

              const spanTransition: Transition = {
                duration: totalDuration,
                times,
                delay: (idx * delay) / 1000,
                ease: easing,
              };

              return (
                <span key={`${lineIdx}-${i}`}>
                  <motion.span
                    initial={fromSnapshot}
                    animate={inView ? animateKeyframes : fromSnapshot}
                    transition={spanTransition}
                    onAnimationComplete={isLast ? onAnimationComplete : undefined}
                    style={{
                      display: "inline-block",
                      willChange: "transform, filter, opacity",
                    }}
                  >
                    {animateBy === "letters" && segment === " " ? "\u00A0" : segment}
                  </motion.span>

                  {/* spazio tra parole (wrap naturale) */}
                  {animateBy === "words" && i < elements.length - 1 ? " " : null}
                </span>
              );
            })}
          </span>
        );
      })}
    </p>
  );
};

export default BlurText;