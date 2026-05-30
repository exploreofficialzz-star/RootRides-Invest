import { useState, useEffect, useRef, useCallback } from "react";

const TESTIMONIALS = [
  {
    quote: "I invested \u20A620,000 in the Farm plan and I've been claiming \u20A62,500 daily. RootRides changed how I think about growing my money.",
    name: "Chinedu O.",
    plan: "Farm Plan Investor",
  },
  {
    quote: "The daily earnings are real. I started with Rice and kept reinvesting. Now I'm on the Cars plan earning \u20A64,835 every single day.",
    name: "Amina K.",
    plan: "Cars Plan Investor",
  },
  {
    quote: "I've referred 12 friends so far. The \u20A63,000 bonus per referral adds up fast. This is the easiest side income I've ever had.",
    name: "Tunde B.",
    plan: "Top Referrer",
  },
  {
    quote: "Bank withdrawals work exactly as promised. I get my money within 48 hours every month. Very reliable platform.",
    name: "Ngozi M.",
    plan: "Cement Plan Investor",
  },
  {
    quote: "As a student, the Rice plan was perfect for me. \u20A65,000 to start and \u20A6835 daily helps with my expenses.",
    name: "Emeka J.",
    plan: "Rice Plan Investor",
  },
];

const TOTAL_CARDS = TESTIMONIALS.length;
const RADIUS = 380;
const ANGLE_STEP = 360 / TOTAL_CARDS;

export default function OrbitalTestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoRotate = useCallback(() => {
    stopAutoRotate();
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TOTAL_CARDS);
    }, 40);
  }, []);

  const stopAutoRotate = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoRotate();
    return () => stopAutoRotate();
  }, [startAutoRotate, stopAutoRotate]);

  return (
    <div
      className="testimonial-carousel"
      onMouseEnter={stopAutoRotate}
      onMouseLeave={startAutoRotate}
    >
      <div
        className="testimonial-track"
        style={{ transform: `rotateY(${-activeIndex * ANGLE_STEP}deg)` }}
      >
        {TESTIMONIALS.map((t, index) => {
          const angle = index * ANGLE_STEP;
          const isActive = index === activeIndex;
          return (
            <div
              key={index}
              className={`testimonial-card ${isActive ? "active" : ""}`}
              style={{
                transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
                backfaceVisibility: "hidden",
              }}
            >
              <p className="testimonial-quote">"{t.quote}"</p>
              <div className="testimonial-name">{t.name}</div>
              <div className="testimonial-plan">{t.plan}</div>
            </div>
          );
        })}
      </div>
      <div className="carousel-dots">
        {TESTIMONIALS.map((_, index) => (
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
