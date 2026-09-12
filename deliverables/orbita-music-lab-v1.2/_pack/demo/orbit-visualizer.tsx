import { useEffect, useRef } from "react";
import type { EngineDiagnostics, OrbitaTheme } from "@/orbita-music-lab";

const WORLD_HEX: Record<string, string> = {
  menta: "#7baf9e",
  durazno: "#c4a07a",
  lavanda: "#9aa0b4",
  glaciar: "#a8b8c4",
  eclipse: "#a87878",
  procedural: "#c5cbd4",
  idle: "#c5cbd4",
};

type Props = {
  analyser: AnalyserNode | null;
  diagnostics: EngineDiagnostics;
  theme: OrbitaTheme | "idle";
};

export function OrbitVisualizer({ analyser, diagnostics, theme }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const binsRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = (now: number) => {
      const parent = canvas.parentElement;
      const width = parent?.clientWidth ?? 640;
      const height = parent?.clientHeight ?? 320;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const color = WORLD_HEX[theme] ?? WORLD_HEX.idle!;
      let energy = 0.12;
      if (analyser) {
        if (!binsRef.current || binsRef.current.length !== analyser.frequencyBinCount) {
          binsRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
        }
        analyser.getByteFrequencyData(binsRef.current);
        const bins = binsRef.current;
        let sum = 0;
        for (let i = 0; i < bins.length; i++) sum += bins[i] ?? 0;
        energy = sum / (bins.length * 255);
      }

      const beatPulse = diagnostics.running
        ? 1 + Math.max(0, 1 - (diagnostics.currentBeat % 1)) * 0.08 * (0.4 + diagnostics.intensity)
        : 1;
      const t = now / 1000;
      const maxR = Math.min(width, height) * 0.42;

      ctx.fillStyle = "#0b0c0e";
      ctx.fillRect(0, 0, width, height);
      const glow = ctx.createRadialGradient(cx, cy, 8, cx, cy, maxR * 1.4);
      glow.addColorStop(0, hexAlpha(color, 0.16 + energy * 0.2));
      glow.addColorStop(1, "rgba(11,12,14,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      for (let i = 1; i <= 4; i++) {
        const r = (maxR * i) / 4.2 * beatPulse;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = hexAlpha("#e8e6e1", 0.14 + i * 0.03);
        ctx.lineWidth = i === 2 ? 1.6 : 1;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(cx, cy, 9 + energy * 10, 0, Math.PI * 2);
      ctx.fillStyle = hexAlpha(color, 0.95);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.strokeStyle = hexAlpha(color, 0.35);
      ctx.lineWidth = 1;
      ctx.stroke();

      const orbits = [0.34, 0.58, 0.82];
      orbits.forEach((frac, i) => {
        const r = maxR * frac * beatPulse;
        const speed = (0.18 + i * 0.07) * (0.7 + diagnostics.intensity);
        const angle = t * speed + i * 1.7;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r * 0.98;
        ctx.beginPath();
        ctx.arc(x, y, 2.4 + (i === 0 ? 1.2 : 0), 0, Math.PI * 2);
        ctx.fillStyle = i === 0 ? "#e8e6e1" : hexAlpha(color, 0.85);
        ctx.fill();
      });

      if (binsRef.current) {
        const bins = binsRef.current;
        const count = 36;
        for (let i = 0; i < count; i++) {
          const idx = Math.floor((i / count) * bins.length);
          const mag = (bins[idx] ?? 0) / 255;
          const ang = (i / count) * Math.PI * 2 - Math.PI / 2;
          const inner = maxR * 0.9;
          const outer = inner + mag * maxR * 0.18;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(ang) * inner, cy + Math.sin(ang) * inner);
          ctx.lineTo(cx + Math.cos(ang) * outer, cy + Math.sin(ang) * outer);
          ctx.strokeStyle = hexAlpha(color, 0.25 + mag * 0.45);
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [analyser, diagnostics.running, diagnostics.intensity, diagnostics.currentBeat, theme]);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden />;
}

function hexAlpha(hex: string, alpha: number): string {
  const raw = hex.replace("#", "");
  const n = parseInt(raw, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}
