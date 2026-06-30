"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  generateText, calculateWPM, calculateAccuracy, calculateConsistency,
  Difficulty, Duration, Mode, saveHistoryEntry,
} from "@/lib/words";
import Results from "./Results";
import History from "./History";

interface CharState {
  char: string;
  status: "pending" | "correct" | "incorrect" | "extra";
}

const STORAGE_KEY = "typespeed_settings";

interface Settings {
  difficulty: Difficulty;
  duration: Duration;
  mode: Mode;
  numbers: boolean;
  punctuation: boolean;
}

const SSR_DEFAULTS: Settings = {
  difficulty: "medium", duration: 30, mode: "time", numbers: false, punctuation: false,
};

function loadSettings(): Settings {
  if (typeof window === "undefined") return SSR_DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SSR_DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      difficulty: (["easy", "medium", "hard"] as Difficulty[]).includes(parsed.difficulty) ? parsed.difficulty : "medium",
      duration: ([15, 30, 60, 120] as Duration[]).includes(parsed.duration) ? parsed.duration : 30,
      mode: (["time", "zen"] as Mode[]).includes(parsed.mode) ? parsed.mode : "time",
      numbers: !!parsed.numbers,
      punctuation: !!parsed.punctuation,
    };
  } catch {
    return SSR_DEFAULTS;
  }
}

function saveSettings(s: Settings) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

export default function TypingTest() {
  const [mounted, setMounted] = useState(false);

  const [difficulty, setDifficulty] = useState<Difficulty>(SSR_DEFAULTS.difficulty);
  const [duration, setDuration] = useState<Duration>(SSR_DEFAULTS.duration);
  const [mode, setMode] = useState<Mode>(SSR_DEFAULTS.mode);
  const [numbers, setNumbers] = useState(SSR_DEFAULTS.numbers);
  const [punctuation, setPunctuation] = useState(SSR_DEFAULTS.punctuation);

  const [text, setText] = useState("");
  const [charStates, setCharStates] = useState<CharState[]>([]);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState<Duration>(SSR_DEFAULTS.duration);
  const [elapsedZen, setElapsedZen] = useState(0); // seconds, counts up in zen mode
  const [wpm, setWpm] = useState(0);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const [correctChars, setCorrectChars] = useState(0);
  const [totalTyped, setTotalTyped] = useState(0);
  const [caretPos, setCaretPos] = useState(0);
  const [wpmPulse, setWpmPulse] = useState(false);
  const [visibleStartChar, setVisibleStartChar] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const textBoxRef = useRef<HTMLDivElement>(null);
  const charRefsMap = useRef<Map<number, HTMLSpanElement>>(new Map());
  const lineStartsRef = useRef<number[]>([]);
  const correctCharsRef = useRef<number>(0);
  const wpmHistoryRef = useRef<number[]>([]);
  const finalWpmRef = useRef<number>(0);
  const savedRef = useRef<boolean>(false);

  const textOptions = { numbers, punctuation };

  const initTest = useCallback((diff: Difficulty, dur: Duration, m: Mode, nums: boolean, punct: boolean) => {
    const newText = generateText(diff, 120, { numbers: nums, punctuation: punct });
    setText(newText);
    setCharStates(newText.split("").map(c => ({ char: c, status: "pending" })));
    setInput("");
    setStarted(false);
    setFinished(false);
    setTimeLeft(dur);
    setElapsedZen(0);
    setWpm(0);
    setWpmHistory([]);
    wpmHistoryRef.current = [];
    correctCharsRef.current = 0;
    finalWpmRef.current = 0;
    savedRef.current = false;
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
    setMode(s.mode);
    setNumbers(s.numbers);
    setPunctuation(s.punctuation);
    setTimeLeft(s.duration);
    setMounted(true);
    initTest(s.difficulty, s.duration, s.mode, s.numbers, s.punctuation);
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

  const persist = (overrides: Partial<Settings> = {}) => {
    const s: Settings = { difficulty, duration, mode, numbers, punctuation, ...overrides };
    saveSettings(s);
    return s;
  };

  const handleDifficulty = (d: Difficulty) => {
    setDifficulty(d);
    persist({ difficulty: d });
    initTest(d, duration, mode, numbers, punctuation);
  };
  const handleDuration = (d: Duration) => {
    setDuration(d);
    setMode("time");
    persist({ duration: d, mode: "time" });
    initTest(difficulty, d, "time", numbers, punctuation);
  };
  const handleZen = () => {
    setMode("zen");
    persist({ mode: "zen" });
    initTest(difficulty, duration, "zen", numbers, punctuation);
  };
  const handleNumbers = () => {
    const v = !numbers;
    setNumbers(v);
    persist({ numbers: v });
    initTest(difficulty, duration, mode, v, punctuation);
  };
  const handlePunctuation = () => {
    const v = !punctuation;
    setPunctuation(v);
    persist({ punctuation: v });
    initTest(difficulty, duration, mode, numbers, v);
  };

  const finishTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setFinished(true);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (finished) return;

    if (!started && val.length > 0) {
      setStarted(true);
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const w = calculateWPM(correctCharsRef.current, elapsed);
        wpmHistoryRef.current = [...wpmHistoryRef.current, w];
        finalWpmRef.current = w;
        setWpmHistory([...wpmHistoryRef.current]);
        setWpm(w);

        if (mode === "zen") {
          setElapsedZen(Math.floor(elapsed));
          return;
        }

        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setTimeout(() => setFinished(true), 50);
            return 0 as Duration;
          }
          return (prev - 1) as Duration;
        });
      }, 1000);
    }

    setInput(val);

    if (mode === "zen") {
      // Zen mode: no target text to match against — everything typed counts as "correct"
      const correct = val.length;
      correctCharsRef.current = correct;
      setCorrectChars(correct);
      setTotalTyped(val.length);
      setCaretPos(val.length);

      const elapsed = started ? (Date.now() - startTimeRef.current) / 1000 : 0;
      const newWpm = calculateWPM(correct, elapsed > 0 ? elapsed : 1);
      setWpm(newWpm);
      setWpmPulse(true);
      setTimeout(() => setWpmPulse(false), 200);
      return;
    }

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
      const extra = generateText(difficulty, 60, textOptions);
      setText(prev => prev + " " + extra);
      setCharStates(prev => [
        ...prev,
        ...(" " + extra).split("").map(c => ({ char: c, status: "pending" as const }))
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      initTest(difficulty, duration, mode, numbers, punctuation);
    }
    if (e.key === "Escape" && mode === "zen" && started) {
      e.preventDefault();
      finishTest();
    }
  };

  // Save to history exactly once when a test finishes
  useEffect(() => {
    if (!finished || savedRef.current) return;
    savedRef.current = true;
    const finalHistory = wpmHistoryRef.current;
    const finalWpm = finalWpmRef.current || wpm;
    const finalAccuracy = mode === "zen" ? 100 : calculateAccuracy(correctCharsRef.current, totalTyped);
    const finalConsistency = calculateConsistency(finalHistory);
    saveHistoryEntry({
      wpm: finalWpm,
      accuracy: finalAccuracy,
      consistency: finalConsistency,
      difficulty,
      mode,
      duration: mode === "zen" ? null : duration,
      numbers,
      punctuation,
    });
    setHistoryRefresh(r => r + 1);
  }, [finished]);

  const accuracy = mode === "zen" ? 100 : calculateAccuracy(correctChars, totalTyped);
  const consistency = calculateConsistency(wpmHistory);
  const progress = mode === "zen" ? 0 : ((duration - timeLeft) / duration) * 100;

  if (finished) {
    const finalHistory = wpmHistoryRef.current;
    const finalWpm = finalWpmRef.current || wpm;
    const finalAccuracy = mode === "zen" ? 100 : calculateAccuracy(correctCharsRef.current, totalTyped);
    const finalConsistency = calculateConsistency(finalHistory);

    return (
      <>
        <Results
          wpm={finalWpm}
          accuracy={finalAccuracy}
          consistency={finalConsistency}
          wpmHistory={finalHistory}
          correctChars={correctCharsRef.current}
          totalTyped={totalTyped}
          duration={duration}
          difficulty={difficulty}
          onRetry={() => initTest(difficulty, duration, mode, numbers, punctuation)}
        />
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button
            onClick={() => setHistoryOpen(true)}
            style={{
              background: "transparent", border: "1px solid var(--border)", borderRadius: 6,
              padding: "8px 16px", color: "var(--muted)", cursor: "pointer", fontSize: "0.8rem",
            }}
          >
            View history
          </button>
        </div>
        <History open={historyOpen} onClose={() => setHistoryOpen(false)} refreshKey={historyRefresh} />
      </>
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
              fontWeight: mode === "time" && duration === d ? 700 : 400,
              background: mode === "time" && duration === d ? "var(--yellow)" : "transparent",
              color: mode === "time" && duration === d ? "var(--bg)" : "var(--muted)", transition: "all 0.15s",
            }}>{d}s</button>
          ))}
          <button onClick={handleZen} style={{
            padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer",
            fontFamily: "var(--font-mono)", fontSize: "0.8rem",
            fontWeight: mode === "zen" ? 700 : 400,
            background: mode === "zen" ? "#a78bfa" : "transparent",
            color: mode === "zen" ? "#fff" : "var(--muted)", transition: "all 0.15s",
          }}>zen</button>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", background: "var(--surface)", borderRadius: 8, padding: "4px" }}>
          <button onClick={handleNumbers} style={{
            padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer",
            fontFamily: "var(--font-mono)", fontSize: "0.8rem",
            fontWeight: numbers ? 700 : 400,
            background: numbers ? "#818cf8" : "transparent",
            color: numbers ? "#fff" : "var(--muted)", transition: "all 0.15s",
          }}>123</button>
          <button onClick={handlePunctuation} style={{
            padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer",
            fontFamily: "var(--font-mono)", fontSize: "0.8rem",
            fontWeight: punctuation ? 700 : 400,
            background: punctuation ? "#818cf8" : "transparent",
            color: punctuation ? "#fff" : "var(--muted)", transition: "all 0.15s",
          }}>punctuation</button>
        </div>

        <button
          onClick={() => setHistoryOpen(true)}
          style={{
            background: "var(--surface)", border: "none", borderRadius: 8,
            padding: "10px 14px", color: "var(--muted)", cursor: "pointer", fontSize: "0.8rem",
            fontFamily: "var(--font-mono)",
          }}
        >
          history
        </button>
      </div>

      {/* Live Stats Bar */}
      <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div className={wpmPulse ? "wpm-pulse" : ""} style={{ fontSize: "2rem", fontWeight: 700, color: "var(--green)", lineHeight: 1 }}>
            {wpm}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 2 }}>wpm</div>
        </div>
        {mode !== "zen" && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "2rem", fontWeight: 700, lineHeight: 1,
              color: started ? (accuracy >= 90 ? "var(--green)" : accuracy >= 70 ? "var(--yellow)" : "var(--red)") : "var(--muted)"
            }}>
              {started ? `${accuracy}%` : "–"}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 2 }}>accuracy</div>
          </div>
        )}
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: "2rem", fontWeight: 700, lineHeight: 1,
            color: mode === "zen"
              ? "var(--text)"
              : !mounted
                ? "var(--text)"
                : timeLeft <= 5 ? "var(--red)" : timeLeft <= 10 ? "var(--yellow)" : "var(--text)"
          }}>
            {mode === "zen" ? (started ? elapsedZen : "∞") : (mounted ? timeLeft : SSR_DEFAULTS.duration)}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 2 }}>
            {mode === "zen" ? "elapsed" : "seconds"}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {started && mode !== "zen" && (
        <div style={{ height: 3, background: "var(--surface2)", borderRadius: 2, marginBottom: "1.5rem", overflow: "hidden" }}>
          <div className="progress-shimmer" style={{ height: "100%", width: `${progress}%`, borderRadius: 2, transition: "width 1s linear" }} />
        </div>
      )}

      {/* Text Display */}
      {mode === "zen" ? (
        <div ref={textBoxRef} style={{
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12,
          padding: "2rem", fontSize: "1.5rem", lineHeight: "2.2", letterSpacing: "0.03em",
          cursor: "text", minHeight: 200, maxHeight: 290, overflow: "hidden", color: "var(--text)",
        }} onClick={() => inputRef.current?.focus()}>
          {input.length === 0
            ? <span style={{ color: "var(--muted)" }}>Just start typing — anything. Press Esc to finish.</span>
            : input}
          <span className={started ? "caret-typing" : "caret-blink"} style={{
            display: "inline-block", width: 2, height: "1.2em", background: "var(--caret)",
            marginLeft: 2, verticalAlign: "middle", boxShadow: "0 0 8px var(--caret)",
          }} />
        </div>
      ) : (
        <div ref={textBoxRef} style={{
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12,
          padding: "2rem", fontSize: "1.5rem", lineHeight: "2.2", letterSpacing: "0.03em",
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
      )}

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
        {mode === "zen"
          ? (!started ? "Click the text area and start typing" : "Press Esc to finish · Tab to restart")
          : (!started ? "Click the text area and start typing" : "Press Tab to restart")}
      </div>

      <History open={historyOpen} onClose={() => setHistoryOpen(false)} refreshKey={historyRefresh} />
    </div>
  );
}