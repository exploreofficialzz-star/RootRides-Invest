import { useEffect, useRef } from "react";

const ICON_KEYS = ["wheat", "circleDollarSign", "tractor", "building2", "carFront"];

class Particle {
  canvas: HTMLCanvasElement;
  iconKey: string;
  size: number;
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  opacity: number;
  sineOffset: number;
  sineSpeed: number;
  sineAmp: number;
  rotation: number;
  rotationSpeed: number;

  constructor(canvas: HTMLCanvasElement, iconKey: string) {
    this.canvas = canvas;
    this.iconKey = iconKey;
    this.size = Math.random() * 18 + 14;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = -Math.random() * 0.4 - 0.1;
    this.opacity = Math.random() * 0.12 + 0.04;
    this.sineOffset = Math.random() * Math.PI * 2;
    this.sineSpeed = Math.random() * 0.008 + 0.003;
    this.sineAmp = Math.random() * 0.5 + 0.3;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.003;
  }

  getColor() {
    if (this.iconKey === "wheat" || this.iconKey === "circleDollarSign")
      return "#0F766E";
    if (this.iconKey === "tractor" || this.iconKey === "building2")
      return "#14B8A6";
    return "#F59E0B";
  }

  update(mouse: { x: number; y: number }) {
    this.x +=
      this.speedX +
      Math.sin(Date.now() * this.sineSpeed + this.sineOffset) * this.sineAmp;
    this.y += this.speedY;
    this.rotation += this.rotationSpeed;

    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = 120;

    if (dist < radius && dist > 0) {
      const force = (radius - dist) / radius;
      this.x += (dx / dist) * force * 2;
      this.y += (dy / dist) * force * 2;
    }

    if (this.y < -this.size) this.y = this.canvas.height + this.size;
    if (this.x < -this.size) this.x = this.canvas.width + this.size;
    if (this.x > this.canvas.width + this.size) this.x = -this.size;
  }

  draw(ctx: CanvasRenderingContext2D, mouse: { x: number; y: number }) {
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const scale = dist < 120 ? 1 + ((120 - dist) / 120) * 0.4 : 1;

    ctx.globalAlpha = this.opacity * scale;
    ctx.strokeStyle = this.getColor();
    ctx.lineWidth = 1.5;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(scale, scale);

    const s = this.size;
    ctx.beginPath();

    switch (this.iconKey) {
      case "wheat":
        ctx.moveTo(0, s * 0.6);
        ctx.lineTo(0, -s * 0.4);
        ctx.moveTo(0, s * 0.1);
        ctx.quadraticCurveTo(-s * 0.6, -s * 0.4, -s * 0.4, -s * 0.2);
        ctx.moveTo(0, -s * 0.1);
        ctx.quadraticCurveTo(-s * 0.5, -s * 0.6, -s * 0.3, -s * 0.4);
        ctx.moveTo(0, s * 0.1);
        ctx.quadraticCurveTo(s * 0.6, -s * 0.4, s * 0.4, -s * 0.2);
        ctx.moveTo(0, -s * 0.1);
        ctx.quadraticCurveTo(s * 0.5, -s * 0.6, s * 0.3, -s * 0.4);
        break;
      case "circleDollarSign":
        ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2);
        ctx.moveTo(0, -s * 0.3);
        ctx.lineTo(0, s * 0.3);
        ctx.moveTo(s * 0.15, -s * 0.2);
        ctx.quadraticCurveTo(-s * 0.15, -s * 0.05, s * 0.15, s * 0.2);
        break;
      case "tractor":
        ctx.arc(-s * 0.3, s * 0.25, s * 0.25, 0, Math.PI * 2);
        ctx.arc(s * 0.35, s * 0.35, s * 0.15, 0, Math.PI * 2);
        ctx.moveTo(-s * 0.05, s * 0.25);
        ctx.lineTo(s * 0.2, s * 0.35);
        ctx.moveTo(-s * 0.2, -s * 0.1);
        ctx.lineTo(-s * 0.2, -s * 0.5);
        ctx.lineTo(s * 0.2, -s * 0.5);
        ctx.lineTo(s * 0.2, -s * 0.1);
        break;
      case "building2":
        ctx.moveTo(-s * 0.3, -s * 0.5);
        ctx.lineTo(-s * 0.3, s * 0.5);
        ctx.lineTo(s * 0.3, s * 0.5);
        ctx.lineTo(s * 0.3, -s * 0.5);
        ctx.closePath();
        for (let row = 0; row < 2; row++) {
          for (let col = 0; col < 3; col++) {
            ctx.moveTo(-s * 0.15 + col * s * 0.15, -s * 0.25 + row * s * 0.2);
            ctx.lineTo(-s * 0.05 + col * s * 0.15, -s * 0.25 + row * s * 0.2);
            ctx.lineTo(-s * 0.05 + col * s * 0.15, -s * 0.15 + row * s * 0.2);
            ctx.lineTo(-s * 0.15 + col * s * 0.15, -s * 0.15 + row * s * 0.2);
            ctx.closePath();
          }
        }
        break;
      case "carFront":
        ctx.moveTo(-s * 0.5, s * 0.2);
        ctx.quadraticCurveTo(-s * 0.5, -s * 0.1, -s * 0.3, -s * 0.3);
        ctx.lineTo(s * 0.3, -s * 0.3);
        ctx.quadraticCurveTo(s * 0.5, -s * 0.1, s * 0.5, s * 0.2);
        ctx.closePath();
        ctx.moveTo(-s * 0.35, -s * 0.05);
        ctx.arc(-s * 0.35, -s * 0.05, s * 0.06, 0, Math.PI * 2);
        ctx.moveTo(s * 0.35, -s * 0.05);
        ctx.arc(s * 0.35, -s * 0.05, s * 0.06, 0, Math.PI * 2);
        ctx.moveTo(-s * 0.3, s * 0.3);
        ctx.arc(-s * 0.3, s * 0.3, s * 0.12, 0, Math.PI * 2);
        ctx.moveTo(s * 0.3, s * 0.3);
        ctx.arc(s * 0.3, s * 0.3, s * 0.12, 0, Math.PI * 2);
        break;
    }

    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

export default function FloatingIconParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();

    const particles: Particle[] = [];
    for (let i = 0; i < 40; i++) {
      particles.push(
        new Particle(canvas, ICON_KEYS[i % ICON_KEYS.length])
      );
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) * dpr;
      mouse.y = (e.clientY - rect.top) * dpr;
    };

    container.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      const rect = container.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width * dpr, rect.height * dpr);

      particles.forEach((p) => {
        p.update(mouse);
        p.draw(ctx, mouse);
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-[1]">
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}
