import { useEffect, useRef } from "react";

const TICKER_ITEMS = [
  { text: "RICE", isDiamond: false },
  { text: "\u25C6", isDiamond: true },
  { text: "\u20A65,000", isDiamond: false },
  { text: "\u25C6", isDiamond: true },
  { text: "CEMENT", isDiamond: false },
  { text: "\u25C6", isDiamond: true },
  { text: "\u20A610,000", isDiamond: false },
  { text: "\u25C6", isDiamond: true },
  { text: "FARM", isDiamond: false },
  { text: "\u25C6", isDiamond: true },
  { text: "\u20A620,000", isDiamond: false },
  { text: "\u25C6", isDiamond: true },
  { text: "MACHINERY", isDiamond: false },
  { text: "\u25C6", isDiamond: true },
  { text: "\u20A630,000", isDiamond: false },
  { text: "\u25C6", isDiamond: true },
  { text: "CARS", isDiamond: false },
  { text: "\u25C6", isDiamond: true },
  { text: "\u20A650,000", isDiamond: false },
];

function TickerTrack() {
  return (
    <ul className="ticker-track" aria-hidden="true">
      {TICKER_ITEMS.map((item, i) => (
        <li
          key={i}
          className={`word-wrapper ${item.isDiamond ? "diamond" : ""}`}
          aria-hidden={item.isDiamond ? "true" : undefined}
        >
          <span className="word">{item.text}</span>
        </li>
      ))}
    </ul>
  );
}

export default function AnimatedTextTicker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const container = containerRef.current;
    if (!container) return;

    const words = container.querySelectorAll<HTMLElement>(".word");
    if (!words.length) return;

    words.forEach((word) => {
      const text = word.textContent || "";
      word.innerHTML = "";
      text.split("").forEach((char, ci) => {
        const span = document.createElement("span");
        span.textContent = char;
        span.classList.add("char");
        const wordEl = word.closest(".word-wrapper");
        const wi = wordEl
          ? Array.from(wordEl.parentElement?.children || []).indexOf(wordEl)
          : 0;
        const delay = (wi + ci) * 0.04;
        span.style.animationDelay = `${delay}s`;
        word.appendChild(span);
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const tickerRect = container.getBoundingClientRect();
          const isLeftEdge =
            entry.boundingClientRect.left < tickerRect.width * 0.3;

          const chars = entry.target.querySelectorAll(".char");
          chars.forEach((char) => {
            if (isLeftEdge && entry.isIntersecting) {
              char.classList.add("is-visible");
            } else if (!entry.isIntersecting) {
              char.classList.remove("is-visible");
            }
          });
        });
      },
      { root: container, threshold: 0.5 }
    );

    const wordWrappers = container.querySelectorAll(".word-wrapper");
    wordWrappers.forEach((wrapper) => observer.observe(wrapper));

    const handleResize = () => {
      container.classList.add("paused");
      setTimeout(() => container.classList.remove("paused"), 200);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div ref={containerRef} className="animated-ticker">
      <TickerTrack />
      <TickerTrack />
    </div>
  );
}
