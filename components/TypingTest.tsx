"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { generateText, calculateWPM, calculateAccuracy, calculateConsistency, Difficulty, Duration, TextMode } from "@/lib/words";
import Results from "./Results";

interface CharState {
  char: string;
  status: "pending" | "correct" | "incorrect" | "extra";
}

const STORAGE_KEY = "typespeed_settings";

function loadSettings(): { difficulty: Difficulty; duration: Duration; textMode: TextMode } {
  if (typeof window === "undefined") return { difficulty: "medium", duration: 30, textMode: "text" };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { difficulty: "medium", duration: 30, textMode: "text" };
    const parsed = JSON.parse(raw);
    return {
      difficulty: (["easy", "medium", "hard"] as Difficulty[]).includes(parsed.difficulty)
        ? parsed.difficulty : "medium",
      duration: ([15, 30, 60, 120] as Duration[]).includes(parsed.duration)
        ? parsed.duration : 30,
      textMode: (["text", "text+numbers", "text+numbers+symbols"] as TextMode[]).includes(parsed.textMode)
        ? parsed.textMode : "text",
    };
  } catch {
    return { difficulty: "medium", duration: 30, textMode: "text" };
  }
}

function saveSettings(difficulty: Difficulty, duration: Duration, textMode: TextMode) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ difficulty, duration, textMode }));
  } catch {}
}

// Default values used for SSR — must match to avoid hydration mismatch
const SSR_DEFAULTS = { difficulty: "medium" as Difficulty, duration: 30 as Duration, textMode: "text" as TextMode };

export default function TypingTest() {
  const [mounted, setMounted] = useState(false);

  // Always initialize with SSR defaults — client settings applied after mount
  const [difficulty, setDifficulty] = useState<Difficulty>(SSR_DEFAULTS.difficulty);
  const [duration, setDuration] = useState<Duration>(SSR_DEFAULTS.duration);
  const [textMode, setTextMode] = useState<TextMode>(SSR_DEFAULTS.textMode);
  const [text, setText] = useState("");
  const [charStates, setCharStates] = useState<CharState[]>([]);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState<Duration>(SSR_DEFAULTS.duration);
  const [wpm, setWpm] = useState(0);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const [correctChars, setCorrectChars] = useState(0);
  const [totalTyped, setTotalTyped] = useState(0);
  const [caretPos, setCaretPos] = useState(0);
  const [wpmPulse, setWpmPulse] = useState(false);
  const [visibleStartChar, setVisibleStartChar] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const textBoxRef = useRef<HTMLDivElement>(null);
  const charRefsMap = useRef<Map<number, HTMLSpanElement>>(new Map());
  const lineStartsRef = useRef<number[]>([]);
  const correctCharsRef = useRef<number>(0);
  const wpmHistoryRef = useRef<number[]>([]);
  const finalWpmRef = useRef<number>(0);

  const initTest = useCallback((diff: Difficulty, dur: Duration, mode: TextMode) => {
    const newText = generateText(diff, 120, mode);
    setText(newText);
    setCharStates(newText.split("").map(c => ({ char: c, status: "pending" })));
    setInput("");
    setStarted(false);
    setFinished(false);
    setTimeLeft(dur);
    setWpm(0);
    setWpmHistory([]);
    wpmHistoryRef.current = [];
    correctCharsRef.current = 0;
    finalWpmRef.current = 0;
    setCorrectChars(0);
    setTotalTyped(0);
    setCaretPos(0);
    setVisibleStartChar(0);
    charRefsMap.current.clear();
    lineStartsRef.current = [];
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // On mount: read saved settings, apply them, init test
  useEffect(() => {
    const s = loadSettings();
    setDifficulty(s.difficulty);
    setDuration(s.duration);
    setTextMode(s.textMode);
    setTimeLeft(s.duration);
    setMounted(true);
    initTest(s.difficulty, s.duration, s.textMode);
  }, []);

  // Recompute line starts after every render
  useEffect(() => {
    const box = textBoxRef.current;
    if (!box) return;
    const starts: number[] = [];
    let lastTop: number | null = null;
    charRefsMap.current.forEach((el, idx) => {
      const top = el.getBoundingClientRect().top;
      if (lastTop === null || Math.abs(top - lastTop) > 4) {
        starts.push(idx);
        lastTop = top;
      }
    });
    starts.sort((a, b) => a - b);
    lineStartsRef.current = starts;
  });

  const handleDifficulty = (d: Difficulty) => { setDifficulty(d); saveSettings(d, duration, textMode); initTest(d, duration, textMode); };
  const handleDuration = (d: Duration) => { setDuration(d); saveSettings(difficulty, d, textMode); initTest(difficulty, d, textMode); };
  const handleTextMode = (m: TextMode) => { setTextMode(m); saveSettings(difficulty, duration, m); initTest(difficulty, duration, m); };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (finished) return;

    if (!started && val.length > 0) {
      setStarted(true);
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const elapsed = (Date.now() - startTimeRef.current) / 1000;
          const w = calculateWPM(correctCharsRef.current, elapsed);
          wpmHistoryRef.current = [...wpmHistoryRef.current, w];
          finalWpmRef.current = w;
          setWpmHistory([...wpmHistoryRef.current]);
          setWpm(w);

          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setTimeout(() => setFinished(true), 50);
            return 0;
          }
          return (prev - 1) as Duration;
        });
      }, 1000);
    }

    setInput(val);
    const newStates = text.split("").map((char, i) => {
      if (i >= val.length) return { char, status: "pending" as const };
      if (val[i] === char) return { char, status: "correct" as const };
      return { char, status: "incorrect" as const };
    });
    setCharStates(newStates);

    const newCaretPos = val.length;
    setCaretPos(newCaretPos);

    requestAnimationFrame(() => {
      const box = textBoxRef.current;
      const caretEl = charRefsMap.current.get(newCaretPos);
      if (!box || !caretEl) return;
      const boxTop = box.getBoundingClientRect().top;
      const lineHeight = parseFloat(getComputedStyle(box).lineHeight);
      const caretTop = caretEl.getBoundingClientRect().top;
      const caretLine = Math.round((caretTop - boxTop) / lineHeight);
      if (caretLine >= 2) {
        const lines = lineStartsRef.current;
        if (lines.length >= 2) {
          const newStart = lines[1];
          setVisibleStartChar(prev => {
            if (newStart > prev) {
              charRefsMap.current.forEach((_, idx) => { if (idx < newStart) charRefsMap.current.delete(idx); });
              return newStart;
            }
            return prev;
          });
        }
      }
    });

    const correct = newStates.filter(c => c.status === "correct").length;
    correctCharsRef.current = correct;
    setCorrectChars(correct);
    setTotalTyped(val.length);

    const elapsed = started ? (Date.now() - startTimeRef.current) / 1000 : 0;
    const newWpm = calculateWPM(correct, elapsed > 0 ? elapsed : 1);
    setWpm(newWpm);
    setWpmPulse(true);
    setTimeout(() => setWpmPulse(false), 200);

    if (val.length >= text.length - 10) {
      const extra = generateText(difficulty, 60, textMode);
      setText(prev => prev + " " + extra);
      setCharStates(prev => [
        ...prev,
        ...(" " + extra).split("").map(c => ({ char: c, status: "pending" as const }))
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") { e.preventDefault(); initTest(difficulty, duration, textMode); }
  };

  const accuracy = calculateAccuracy(correctChars, totalTyped);
  const consistency = calculateConsistency(wpmHistory);
  const progress = ((duration - timeLeft) / duration) * 100;

  if (finished) {
    const finalHistory = wpmHistoryRef.current;
    const finalWpm = finalWpmRef.current || wpm;
    const finalAccuracy = calculateAccuracy(correctCharsRef.current, totalTyped);
    const finalConsistency = calculateConsistency(finalHistory);

    return (
      <Results
        wpm={finalWpm}
        accuracy={finalAccuracy}
        consistency={finalConsistency}
        wpmHistory={finalHistory}
        correctChars={correctCharsRef.current}
        totalTyped={totalTyped}
        duration={duration}
        difficulty={difficulty}
        onRetry={() => initTest(difficulty, duration, textMode)}
      />
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem" }}>
      {/* Controls */}
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem", flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: "0.5rem", background: "var(--surface)", borderRadius: 8, padding: "4px" }}>
          {(["easy", "medium", "hard"] as Difficulty[]).map(d => (
            <button key={d} onClick={() => handleDifficulty(d)} style={{
              padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer",
              fontFamily: "var(--font-mono)", fontSize: "0.8rem",
              fontWeight: difficulty === d ? 700 : 400,
              background: difficulty === d ? "var(--green)" : "transparent",
              color: difficulty === d ? "var(--bg)" : "var(--muted)", transition: "all 0.15s",
            }}>{d}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", background: "var(--surface)", borderRadius: 8, padding: "4px" }}>
          {([15, 30, 60, 120] as Duration[]).map(d => (
            <button key={d} onClick={() => handleDuration(d)} style={{
              padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer",
              fontFamily: "var(--font-mono)", fontSize: "0.8rem",
              fontWeight: duration === d ? 700 : 400,
              background: duration === d ? "var(--yellow)" : "transparent",
              color: duration === d ? "var(--bg)" : "var(--muted)", transition: "all 0.15s",
            }}>{d}s</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", background: "var(--surface)", borderRadius: 8, padding: "4px" }}>
          {([
            { value: "text", label: "abc" },
            { value: "text+numbers", label: "abc 123" },
            { value: "text+numbers+symbols", label: "abc 123 !@#" },
          ] as { value: TextMode; label: string }[]).map(m => (
            <button key={m.value} onClick={() => handleTextMode(m.value)} style={{
              padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer",
              fontFamily: "var(--font-mono)", fontSize: "0.8rem",
              fontWeight: textMode === m.value ? 700 : 400,
              background: textMode === m.value ? "#818cf8" : "transparent",
              color: textMode === m.value ? "#fff" : "var(--muted)",
              transition: "all 0.15s", whiteSpace: "nowrap",
            }}>{m.label}</button>
          ))}
        </div>
      </div>

      {/* Live Stats Bar */}
      <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div className={wpmPulse ? "wpm-pulse" : ""} style={{ fontSize: "2rem", fontWeight: 700, color: "var(--green)", lineHeight: 1 }}>
            {wpm}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 2 }}>wpm</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: "2rem", fontWeight: 700, lineHeight: 1,
            color: started ? (accuracy >= 90 ? "var(--green)" : accuracy >= 70 ? "var(--yellow)" : "var(--red)") : "var(--muted)"
          }}>
            {started ? `${accuracy}%` : "–"}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 2 }}>accuracy</div>
        </div>
        <div style={{ textAlign: "center" }}>
          {/* Render neutral until mounted to avoid hydration mismatch */}
          <div style={{
            fontSize: "2rem", fontWeight: 700, lineHeight: 1,
            color: !mounted
              ? "var(--text)"
              : timeLeft <= 5
                ? "var(--red)"
                : timeLeft <= 10
                  ? "var(--yellow)"
                  : "var(--text)"
          }}>
            {mounted ? timeLeft : SSR_DEFAULTS.duration}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 2 }}>seconds</div>
        </div>
      </div>

      {/* Progress bar */}
      {started && (
        <div style={{ height: 3, background: "var(--surface2)", borderRadius: 2, marginBottom: "1.5rem", overflow: "hidden" }}>
          <div className="progress-shimmer" style={{ height: "100%", width: `${progress}%`, borderRadius: 2, transition: "width 1s linear" }} />
        </div>
      )}

      {/* Text Display */}
      <div ref={textBoxRef} style={{
        background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12,
        padding: "2rem", fontSize: "1.25rem", lineHeight: "2.2", letterSpacing: "0.03em",
        cursor: "text", userSelect: "none", position: "relative", overflow: "hidden", maxHeight: 290,
      }} onClick={() => inputRef.current?.focus()}>
        {charStates.slice(visibleStartChar, visibleStartChar + 300).map((cs, i) => {
          const globalIdx = visibleStartChar + i;
          const isCaret = globalIdx === caretPos;
          return (
            <span key={globalIdx} ref={el => { if (el) charRefsMap.current.set(globalIdx, el); else charRefsMap.current.delete(globalIdx); }} style={{ position: "relative" }}>
              {isCaret && (
                <span className={started ? "caret-typing" : "caret-blink"} style={{
                  position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                  width: 2, height: "1.2em", background: "var(--caret)", borderRadius: 1,
                  boxShadow: "0 0 8px var(--caret)",
                }} />
              )}
              <span style={{
                color: cs.status === "correct" ? "var(--green)" : cs.status === "incorrect" ? "var(--red)" : "var(--muted)",
                background: cs.status === "incorrect" ? "rgba(249,65,68,0.15)" : "transparent",
                borderRadius: 2,
              }}>
                {cs.char === " " && cs.status === "incorrect" ? "·" : cs.char}
              </span>
            </span>
          );
        })}
      </div>

      <input
        ref={inputRef}
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 1, height: 1 }}
      />

      <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.75rem", color: "var(--muted)" }}>
        {!started ? "Click the text area and start typing" : "Press Tab to restart"}
      </div>
    </div>
  );
}