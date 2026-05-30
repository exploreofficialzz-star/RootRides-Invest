import { useState, useEffect } from "react";

export default function CinematicRadialWipe() {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsComplete(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`radial-wipe ${isComplete ? "is-complete" : ""}`}>
      <div className="radial-wipe-spinner" />
      <div className="radial-wipe-spinner" />
      <div className="radial-wipe-spinner" />
    </div>
  );
}
