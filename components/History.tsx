"use client";
import { useEffect, useState } from "react";
import { HistoryEntry, loadHistory, clearHistory } from "@/lib/words";

interface HistoryProps {
  open: boolean;
  onClose: () => void;
  refreshKey?: number; // bump this to force a reload after a new test finishes
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
    " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export default function History({ open, onClose, refreshKey }: HistoryProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (open) setEntries(loadHistory());
  }, [open, refreshKey]);

  if (!open) return null;

  const bestWpm = entries.reduce((m, e) => Math.max(m, e.wpm), 0);
  const avgWpm = entries.length ? Math.round(entries.reduce((s, e) => s + e.wpm, 0) / entries.length) : 0;
  const avgAcc = entries.length ? Math.round(entries.reduce((s, e) => s + e.accuracy, 0) / entries.length) : 0;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: "1.5rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12,
          padding: "1.75rem", maxWidth: 720, width: "100%", maxHeight: "80vh",
          overflowY: "auto", boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>History</h2>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1.2rem" }}
            aria-label="Close history"
          >
            ✕
          </button>
        </div>

        {entries.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            No tests yet — finish a typing test to see it show up here.
          </p>
        ) : (
          <>
            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.25rem" }}>
              <Stat label="best wpm" value={bestWpm} color="var(--green)" />
              <Stat label="avg wpm" value={avgWpm} color="var(--yellow)" />
              <Stat label="avg accuracy" value={`${avgAcc}%`} color="var(--text)" />
              <Stat label="tests" value={entries.length} color="var(--text)" />
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                <thead>
                  <tr style={{ color: "var(--muted)", textAlign: "left", borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "6px 8px" }}>Date</th>
                    <th style={{ padding: "6px 8px" }}>Mode</th>
                    <th style={{ padding: "6px 8px" }}>Difficulty</th>
                    <th style={{ padding: "6px 8px" }}>WPM</th>
                    <th style={{ padding: "6px 8px" }}>Acc</th>
                    <th style={{ padding: "6px 8px" }}>Consistency</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "6px 8px", color: "var(--muted)" }}>{formatDate(e.date)}</td>
                      <td style={{ padding: "6px 8px" }}>
                        {e.mode === "zen" ? "zen" : `${e.duration}s`}
                        {e.numbers ? " · 123" : ""}
                        {e.punctuation ? " · !?" : ""}
                      </td>
                      <td style={{ padding: "6px 8px", textTransform: "capitalize" }}>{e.difficulty}</td>
                      <td style={{ padding: "6px 8px", color: "var(--green)", fontWeight: 700 }}>{e.wpm}</td>
                      <td style={{ padding: "6px 8px" }}>{e.accuracy}%</td>
                      <td style={{ padding: "6px 8px" }}>{e.consistency}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "1.25rem", textAlign: "right" }}>
              <button
                onClick={() => { clearHistory(); setEntries([]); }}
                style={{
                  background: "transparent", border: "1px solid var(--border)", borderRadius: 6,
                  padding: "6px 12px", color: "var(--red)", cursor: "pointer", fontSize: "0.75rem",
                }}
              >
                Clear history
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div>
      <div style={{ fontSize: "1.3rem", fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{label}</div>
    </div>
  );
}