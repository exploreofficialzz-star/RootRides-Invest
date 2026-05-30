import { useRef, useState, useEffect, useCallback } from "react";

export function useCountUp(
  target: number,
  duration: number = 1500,
  prefix: string = "",
  suffix: string = ""
) {
  const [display, setDisplay] = useState(`${prefix}0${suffix}`);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      let formatted: string;
      if (target >= 1000000000) {
        formatted = `${prefix}${(current / 1000000000).toFixed(1)}B${suffix}`;
      } else if (target >= 1000000) {
        formatted = `${prefix}${(current / 1000000).toFixed(1)}M${suffix}`;
      } else if (target >= 1000) {
        formatted = `${prefix}${current.toLocaleString()}${suffix}`;
      } else {
        formatted = `${prefix}${current}${suffix}`;
      }

      setDisplay(formatted);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        let final: string;
        if (target >= 1000000000) {
          final = `${prefix}${(target / 1000000000).toFixed(1)}B${suffix}`;
        } else if (target >= 1000000) {
          final = `${prefix}${(target / 1000000).toFixed(1)}M${suffix}`;
        } else if (target >= 1000) {
          final = `${prefix}${target.toLocaleString()}${suffix}`;
        } else {
          final = `${prefix}${target}${suffix}`;
        }
        setDisplay(final);
      }
    };

    requestAnimationFrame(step);
  }, [target, duration, prefix, suffix]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animate]);

  return { ref, display };
}
