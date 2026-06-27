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

export default function Results({ wpm, accuracy, consistency, wpmHistory, correctChars, totalTyped, duration, difficulty, onRetry }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rank = getRank(wpm);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || wpmHistory.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const max = Math.max(...wpmHistory, 10);
    const pts = wpmHistory.map((v, i) => ({
      x: (i / (wpmHistory.length - 1)) * (W - 40) + 20,
      y: H - 30 - ((v / max) * (H - 50)),
    }));

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = 10 + ((H - 40) / 4) * i;
      ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(W - 20, y); ctx.stroke();
    }

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "rgba(87,227,137,0.3)");
    grad.addColorStop(1, "rgba(87,227,137,0)");
    ctx.beginPath();
    ctx.moveTo(pts[0].x, H - 30);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, H - 30);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.forEach((p, i) => {
      if (i === 0) return;
      const prev = pts[i - 1];
      const cpx = (prev.x + p.x) / 2;
      ctx.bezierCurveTo(cpx, prev.y, cpx, p.y, p.x, p.y);
    });
    ctx.strokeStyle = "#57e389";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.stroke();

    // Dots
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#57e389";
      ctx.fill();
    });

    // Axis labels
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "11px JetBrains Mono, monospace";
    ctx.fillText(`${max} wpm`, 22, 20);
    ctx.fillText("0", 22, H - 10);
    ctx.fillText("time →", W - 80, H - 10);
  }, [wpmHistory]);

  const errors = totalTyped - correctChars;
  const avgWpm = wpmHistory.length > 0
    ? Math.round(wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length)
    : wpm;

  return (
    <div className="fade-in" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
      {/* Rank Badge */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
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
          }}>
            <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>{stat.label}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: stat.color, lineHeight: 1.1 }}>{stat.value}</div>
            {stat.sub && <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "0.3rem" }}>{stat.sub}</div>}
          </div>
        ))}
      </div>

      {/* WPM Chart */}
      {wpmHistory.length > 1 && (
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "1.5rem",
          marginBottom: "2rem",
        }}>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            wpm over time
          </div>
          <canvas ref={canvasRef} width={800} height={180} style={{ width: "100%", height: 180, display: "block" }} />
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
        <button
          onClick={onRetry}
          style={{
            padding: "12px 32px",
            background: "var(--green)",
            color: "#0d0d0d",
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
      <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.75rem", color: "var(--muted)" }}>
        Press <kbd style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 4, padding: "1px 6px", fontFamily: "var(--font-mono)" }}>Tab</kbd> to start a new test
      </div>
    </div>
  );
}
