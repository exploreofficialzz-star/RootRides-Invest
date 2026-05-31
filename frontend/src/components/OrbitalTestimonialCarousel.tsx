import { useState, useEffect, useRef, useCallback } from "react";
import type { Testimonial } from "@/lib/api";

const RADIUS = 380;

interface Props {
  testimonials: Testimonial[];
}

export default function OrbitalTestimonialCarousel({ testimonials }: Props) {
  const total = testimonials.length;
  const angleStep = total > 0 ? 360 / total : 72;

  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoRotate = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 40);
  }, [total]);

  const stopAutoRotate = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (total === 0) return;
    startAutoRotate();
    return () => stopAutoRotate();
  }, [startAutoRotate, stopAutoRotate, total]);

  if (total === 0) return null;

  return (
    <div
      className="testimonial-carousel"
      onMouseEnter={stopAutoRotate}
      onMouseLeave={startAutoRotate}
    >
      <div
        className="testimonial-track"
        style={{ transform: `rotateY(${-activeIndex * angleStep}deg)` }}
      >
        {testimonials.map((t, index) => {
          const angle = index * angleStep;
          const isActive = index === activeIndex;
          return (
            <div
              key={t.id}
              className={`testimonial-card ${isActive ? "active" : ""}`}
              style={{
                transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
                backfaceVisibility: "hidden",
              }}
            >
              <p className="testimonial-quote">"{t.quote}"</p>
              <div className="testimonial-name">{t.name}</div>
              <div className="testimonial-plan">{t.plan_label}</div>
            </div>
          );
        })}
      </div>
      <div className="carousel-dots">
        {testimonials.map((_, index) => (
          <div
            key={index}
            className={`carousel-dot ${index === activeIndex ? "active" : ""}`}
            onClick={() => {
              stopAutoRotate();
              setActiveIndex(index);
              startAutoRotate();
            }}
          />
        ))}
      </div>
    </div>
  );
}
