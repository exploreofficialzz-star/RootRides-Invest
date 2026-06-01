import { useState, useEffect } from "react";

export default function CinematicRadialWipe() {
  // Only play once per browser session
  const alreadyPlayed = typeof window !== "undefined"
    ? sessionStorage.getItem("intro_played") === "1"
    : true;

  const [isComplete, setIsComplete] = useState(alreadyPlayed);

  useEffect(() => {
    if (alreadyPlayed) return;
    const timer = setTimeout(() => {
      setIsComplete(true);
      sessionStorage.setItem("intro_played", "1");
    }, 2200); // was 6000ms — much faster now
    return () => clearTimeout(timer);
  }, []);

  if (isComplete) return null;

  return (
    <div className={`radial-wipe ${isComplete ? "is-complete" : ""}`}>
      <div className="radial-wipe-spinner" />
      <div className="radial-wipe-spinner" />
      <div className="radial-wipe-spinner" />
    </div>
  );
}
