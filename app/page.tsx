import type { Metadata } from "next";
import TypingTest from "@/components/TypingTest";
import Logo from "../public/logo.png"
import Image from "next/image";

export const metadata: Metadata = {
  title: "TypeSpeed – Free Online Typing Speed Test | Measure Your WPM",
  description:
    "Take the free online typing speed test and measure your WPM (words per minute), accuracy, and consistency. Choose from Easy, Medium, or Hard difficulty. No signup required.",
};

export default function Home() {
  return (
    <>
      <header style={{
        borderBottom: "1px solid var(--border)",
        padding: "1.2rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "2.5rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
  <Image
    src={Logo}
    alt="Logos"
    style={{
      width: "42px",height: "42px",objectFit: "contain",
    }}
  />
  <span
    style={{fontWeight: 700,fontSize: "1.1rem",color: "var(--yellow)",letterSpacing: "-0.01em",}}  >
            TypeSpeed
          </span>
        </div>
        <nav style={{ display: "flex", gap: "1.5rem" }}>
          <a href="/" style={{ color: "var(--muted)", fontSize: "0.85rem", textDecoration: "none" }}>Home</a>
          <a href="#how-it-works" style={{ color: "var(--muted)", fontSize: "0.85rem", textDecoration: "none" }}>How It Works</a>
          <a href="#faq" style={{ color: "var(--muted)", fontSize: "0.85rem", textDecoration: "none" }}>FAQ</a>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section style={{ textAlign: "center", marginBottom: "3.5rem", padding: "0 1.5rem" }}>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, marginBottom: "0.75rem", lineHeight: 1.2 }}>
            How fast do you type?
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1rem", maxWidth: 520, margin: "0 auto 0.5rem" }}>
            Measure your <strong style={{ color: "var(--text)" }}>WPM</strong>, accuracy, and consistency.
            Choose a difficulty, set your timer, and start typing.
          </p>
          <p style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
            No signup required — 100% free
          </p>
        </section>

        {/* The Test */}
        <section aria-label="Typing Speed Test">
          <TypingTest />
        </section>

        {/* WPM Scale */}
        <section style={{ maxWidth: 1100, margin: "4rem auto 0", padding: "0 1.5rem" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "2rem", textAlign: "center" }}>
            What is a good typing speed?
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
            {[
              { range: "< 30 WPM", label: "Novice", color: "#6c757d", desc: "Hunt and peck" },
              { range: "30–50 WPM", label: "Beginner", color: "#adb5bd", desc: "Two-finger typing" },
              { range: "50–70 WPM", label: "Intermediate", color: "#90e0ef", desc: "Average adult" },
              { range: "70–90 WPM", label: "Advanced", color: "#43aa8b", desc: "Above average" },
              { range: "90–120 WPM", label: "Expert", color: "#57e389", desc: "Professional typist" },
              { range: "120+ WPM", label: "Legendary", color: "#f9c74f", desc: "Top 1%" },
            ].map(tier => (
              <div key={tier.range} style={{
                background: "var(--surface)",
                border: `1px solid ${tier.color}33`,
                borderRadius: 8,
                padding: "1rem",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: tier.color }}>{tier.range}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text)", margin: "0.25rem 0" }}>{tier.label}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{tier.desc}</div>
              </div>
            ))}
          </div>
        </section>

           {/* How It Works */}
        <section id="how-it-works" style={{ maxWidth: 1100, margin: "5rem auto 0", padding: "0 1.5rem" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "2rem", textAlign: "center" }}>
            How the typing test works
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
            {[
              { step: "01", title: "Choose Settings", desc: "Select difficulty (Easy, Medium, Hard) and test duration (15s, 30s, 60s, 120s) to customize your test." },
              { step: "02", title: "Start Typing", desc: "Click the text area and begin typing. The timer starts automatically on your first keystroke." },
              { step: "03", title: "See Results", desc: "Your WPM, accuracy, consistency, and error count are calculated when the timer reaches zero." },
              { step: "04", title: "Improve", desc: "Practice daily. Most people improve 5–10 WPM per week with regular 10-minute practice sessions." },
            ].map(item => (
              <div key={item.step} style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "1.5rem",
              }}>
                <div style={{ fontSize: "0.7rem", color: "var(--green)", fontWeight: 700, marginBottom: "0.5rem", letterSpacing: "0.1em" }}>{item.step}</div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>{item.title}</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>


        {/* FAQ — great for SEO */}
        <section id="faq" style={{ maxWidth: 840, margin: "4rem auto 0", padding: "0 1.5rem" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "2rem", textAlign: "center" }}>
            Frequently asked questions
          </h2>
          {[
            {
              q: "How is WPM calculated?",
              a: "WPM (words per minute) is calculated by dividing the number of correctly typed characters by 5 (the average word length), then dividing by the elapsed time in minutes. This is the standard gross WPM formula used by most typing tests.",
            },
            {
              q: "What is a good typing accuracy?",
              a: "Aim for 95% or higher. Professional typists typically maintain 98–100% accuracy. Accuracy matters more than speed — a fast typist who makes many errors isn't more productive than a slower, accurate one.",
            },
            {
              q: "What is consistency in typing?",
              a: "Consistency measures how steady your typing rhythm is over time. A high consistency score (90%+) means your WPM stays stable throughout the test, which is a sign of solid muscle memory and technique.",
            },
            {
              q: "How can I improve my typing speed?",
              a: "Practice touch typing (using all 10 fingers without looking at the keyboard), start slow to build accuracy first, practice daily for 15–30 minutes, and focus on your weak keys. Most users see measurable improvement within 2 weeks.",
            },
            {
              q: "Is TypeSpeed free?",
              a: "Yes — TypeSpeed is completely free, requires no account or sign-up, and works on any device with a keyboard.",
            },
          ].map(item => (
            <details key={item.q} style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              marginBottom: "0.75rem",
              overflow: "hidden",
            }}>
              <summary style={{
                padding: "1rem 1.25rem",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.9rem",
                listStyle: "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "var(--text)",
              }}>
                {item.q}
                <span style={{ color: "var(--muted)", marginLeft: "1rem", flexShrink: 0 }}>+</span>
              </summary>
              <p style={{ padding: "0 1.25rem 1rem", color: "var(--muted)", fontSize: "0.875rem", lineHeight: 1.7 }}>
                {item.a}
              </p>
            </details>
          ))}
        </section>

        {/* SEO text block */}
        <section style={{ maxWidth: 900, margin: "4rem auto 0", padding: "0 1.5rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem" }}>
            About TypeSpeed — Free Online Typing Speed Test
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem", lineHeight: 1.8, marginBottom: "1rem" }}>
            TypeSpeed is a free online typing speed test designed to help you measure and improve your typing speed (WPM), accuracy, and consistency. Whether you&apos;re a student, programmer, writer, or office professional, knowing your typing speed is the first step to improving productivity.
          </p>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem", lineHeight: 1.8 }}>
            Unlike many other typing tests, TypeSpeed offers multiple difficulty levels — from simple common words to complex programming vocabulary — and flexible test durations from 15 seconds to 2 minutes. The real-time WPM counter and color-coded feedback help you identify problem areas as you type.
          </p>
        </section>
      </main>

      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "2rem 1.5rem",
        marginTop: "5rem",
        textAlign: "center",
        color: "var(--muted)",
        fontSize: "0.8rem",
      }}>
        <div style={{ marginBottom: "0.75rem" }}>
          <a href="/" style={{ color: "var(--muted)", textDecoration: "none", marginRight: "1.5rem" }}>Home</a>
          <a href="#how-it-works" style={{ color: "var(--muted)", textDecoration: "none", marginRight: "1.5rem" }}>How It Works</a>
          <a href="#faq" style={{ color: "var(--muted)", textDecoration: "none" }}>FAQ</a>
        </div>
        <p>© {new Date().getFullYear()} TypeSpeed. Free online typing speed test — no signup required.</p>
        <p style={{ marginTop: "0.4rem" }}>
          Measure your WPM · Track accuracy · Improve your typing
        </p>
      </footer>
    </>
  );
}
