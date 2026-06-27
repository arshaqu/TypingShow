"use client";
import { useEffect, useRef } from "react";
import { Difficulty, Duration } from "@/lib/words";

interface Props {
  wpm: number;
  accuracy: number;
  consistency: number;
  wpmHistory: number[];
  correctChars: number;
  totalTyped: number;
  duration: Duration;
  difficulty: Difficulty;
  onRetry: () => void;
}

function getRank(wpm: number): { label: string; color: string; emoji: string } {
  if (wpm >= 120) return { label: "Legendary", color: "#f9c74f", emoji: "🏆" };
  if (wpm >= 90) return { label: "Expert", color: "#57e389", emoji: "⚡" };
  if (wpm >= 70) return { label: "Advanced", color: "#43aa8b", emoji: "🚀" };
  if (wpm >= 50) return { label: "Intermediate", color: "#90e0ef", emoji: "🎯" };
  if (wpm >= 30) return { label: "Beginner", color: "#adb5bd", emoji: "📝" };
  return { label: "Novice", color: "#6c757d", emoji: "🌱" };
}

/** Read a CSS variable from the document root at runtime */
function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export default function Results({ wpm, accuracy, consistency, wpmHistory, correctChars, totalTyped, duration, difficulty, onRetry }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rank = getRank(wpm);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const W = rect.width;
    const H = 200;
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Read theme-aware colors at draw time
    const green = getCSSVar("--green") || "#57e389";
    const greenDim = getCSSVar("--green-dim") || "#2a6040";
    const bg = getCSSVar("--bg") || "#0d0d0d";

    const data = wpmHistory.length >= 2 ? wpmHistory : wpmHistory.length === 1 ? [0, wpmHistory[0]] : [0, 0];

    ctx.clearRect(0, 0, W, H);

    const max = Math.max(...data, 10);
    const padL = 48;
    const padR = 20;
    const padT = 20;
    const padB = 30;

    const toX = (i: number) => padL + (i / (data.length - 1)) * (W - padL - padR);
    const toY = (v: number) => padT + (1 - v / max) * (H - padT - padB);

    const pts = data.map((v, i) => ({ x: toX(i), y: toY(v) }));

    // Grid lines + Y axis labels
    ctx.strokeStyle = "rgba(128,128,128,0.15)";
    ctx.lineWidth = 1;
    ctx.fillStyle = "rgba(128,128,128,0.5)";
    ctx.font = "11px JetBrains Mono, monospace";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const v = Math.round((max / 4) * (4 - i));
      const y = padT + ((H - padT - padB) / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.stroke();
      ctx.fillText(String(v), padL - 6, y + 4);
    }

    // X axis label
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(128,128,128,0.5)";
    ctx.fillText("time →", W - padR, H - 6);

    // Gradient fill — use theme green values
    const grad = ctx.createLinearGradient(0, padT, 0, H - padB);
    grad.addColorStop(0, `${green}40`);  // 25% opacity
    grad.addColorStop(1, `${green}00`);  // 0% opacity

    ctx.beginPath();
    ctx.moveTo(pts[0].x, H - padB);
    ctx.lineTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpx = (prev.x + curr.x) / 2;
      ctx.bezierCurveTo(cpx, prev.y, cpx, curr.y, curr.x, curr.y);
    }
    ctx.lineTo(pts[pts.length - 1].x, H - padB);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Curve line
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpx = (prev.x + curr.x) / 2;
      ctx.bezierCurveTo(cpx, prev.y, cpx, curr.y, curr.x, curr.y);
    }
    ctx.strokeStyle = green;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.stroke();

    // Dots
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = green;
      ctx.fill();
      ctx.strokeStyle = bg;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

  }, [wpmHistory]);

  const errors = totalTyped - correctChars;
  const avgWpm = wpmHistory.length > 0
    ? Math.round(wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length)
    : wpm;

  return (
    <div className="fade-in" style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>

      {/* Rank Badge */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>{rank.emoji}</div>
        <div style={{ fontSize: "1rem", color: "var(--muted)", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.15em" }}>
          your rank
        </div>
        <div style={{ fontSize: "2rem", fontWeight: 700, color: rank.color }}>{rank.label}</div>
      </div>

      {/* Main Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "wpm", value: wpm, color: "var(--green)", sub: `avg ${avgWpm}` },
          { label: "accuracy", value: `${accuracy}%`, color: accuracy >= 90 ? "var(--green)" : accuracy >= 70 ? "var(--yellow)" : "var(--red)" },
          { label: "consistency", value: `${consistency}%`, color: "var(--yellow)" },
          { label: "chars", value: `${correctChars}/${totalTyped}`, color: "var(--text)", sub: `${errors} errors` },
          { label: "test time", value: `${duration}s`, color: "var(--muted)" },
          { label: "difficulty", value: difficulty, color: difficulty === "hard" ? "var(--red)" : difficulty === "medium" ? "var(--yellow)" : "var(--green)" },
        ].map(stat => (
          <div key={stat.label} style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "1.2rem 1rem",
            textAlign: "center",
            transition: "background 0.2s ease",
          }}>
            <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>{stat.label}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: stat.color, lineHeight: 1.1 }}>{stat.value}</div>
            {stat.sub && <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "0.3rem" }}>{stat.sub}</div>}
          </div>
        ))}
      </div>

      {/* WPM Chart */}
      <div
        ref={containerRef}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "1.5rem",
          marginBottom: "2rem",
          transition: "background 0.2s ease",
        }}
      >
        <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          wpm over time
        </div>
        {wpmHistory.length < 2 ? (
          <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: "0.85rem" }}>
            Not enough data — test must run for at least 2 seconds
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: 200, display: "block" }}
          />
        )}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
        <button
          onClick={onRetry}
          style={{
            padding: "12px 32px",
            background: "var(--green)",
            color: "var(--bg)",
            border: "none",
            borderRadius: 8,
            fontFamily: "var(--font-mono)",
            fontSize: "0.9rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "opacity 0.15s",
            letterSpacing: "0.05em",
          }}
          onMouseOver={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseOut={e => (e.currentTarget.style.opacity = "1")}
        >
          ↺ Try Again
        </button>
        <button
          onClick={() => {
            const shareText = `I just typed ${wpm} WPM with ${accuracy}% accuracy on TypeSpeed! 🚀 Can you beat me?`;
            if (navigator.share) {
              navigator.share({ title: "TypeSpeed Result", text: shareText, url: window.location.href });
            } else {
              navigator.clipboard.writeText(shareText);
              alert("Result copied to clipboard!");
            }
          }}
          style={{
            padding: "12px 32px",
            background: "transparent",
            color: "var(--text)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontFamily: "var(--font-mono)",
            fontSize: "0.9rem",
            cursor: "pointer",
            transition: "border-color 0.15s",
            letterSpacing: "0.05em",
          }}
          onMouseOver={e => (e.currentTarget.style.borderColor = "var(--green)")}
          onMouseOut={e => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          ↗ Share
        </button>
      </div>

      {/* Tab hint */}
      <div style={{ textAlign: "center", marginTop: "1.5rem", marginBottom: "2rem", fontSize: "0.75rem", color: "var(--muted)" }}>
        Press <kbd style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 4, padding: "1px 6px", fontFamily: "var(--font-mono)" }}>Tab</kbd> to start a new test
      </div>
    </div>
  );
}