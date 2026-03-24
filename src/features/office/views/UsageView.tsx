"use client";

import React from "react";

// Mock data — wire real data later
const DAILY: { day: string; tokens: number }[] = [
  { day: "Mon", tokens: 42000 },
  { day: "Tue", tokens: 68000 },
  { day: "Wed", tokens: 55000 },
  { day: "Thu", tokens: 91000 },
  { day: "Fri", tokens: 73000 },
  { day: "Sat", tokens: 29000 },
  { day: "Sun", tokens: 18000 },
];

const MODEL_BREAKDOWN: { label: string; pct: number; color: string }[] = [
  { label: "Claude Opus 4.6",   pct: 38, color: "#818CF8" },
  { label: "Claude Sonnet 4.6", pct: 45, color: "#60A5FA" },
  { label: "MiniMax M2.7",      pct: 17, color: "#34D399" },
];

const AGENT_BREAKDOWN: { emoji: string; name: string; pct: number }[] = [
  { emoji: "🤝", name: "Alfi",   pct: 32 },
  { emoji: "🔍", name: "Scout",  pct: 24 },
  { emoji: "🐇", name: "Benito", pct: 18 },
  { emoji: "🎨", name: "Pixel",  pct: 14 },
  { emoji: "🌸", name: "Nova",   pct: 12 },
];

const maxTokens = Math.max(...DAILY.map(d => d.tokens));

function formatK(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return `${n}`;
}

function HBar({ pct, color }: { pct: number; color?: string }) {
  return (
    <div style={{
      flex: 1,
      height: 8,
      background: "#1A2332",
      borderRadius: 4,
      overflow: "hidden",
    }}>
      <div style={{
        width: `${pct}%`,
        height: "100%",
        background: color ?? "#60A5FA",
        borderRadius: 4,
        transition: "width 0.4s ease",
      }} />
    </div>
  );
}

export function UsageView() {
  const ff: React.CSSProperties = {
    fontFamily: '"Segoe UI Semilight", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  };

  return (
    <div style={{
      ...ff,
      height: "100%",
      overflowY: "auto",
      background: "#0F1724",
      padding: "24px 32px",
    }}>
      <h2 style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 400, marginBottom: 4, marginTop: 0 }}>Token Usage</h2>
      <p style={{ color: "#94A3B8", fontSize: 12, marginBottom: 32, marginTop: 0 }}>Mock data — last 7 days</p>

      {/* Daily bar chart */}
      <div style={{ background: "#1A2332", border: "1px solid #1E293B", borderRadius: 10, padding: "20px 20px 16px", marginBottom: 28 }}>
        <div style={{ color: "#94A3B8", fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16 }}>Daily Activity</div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
          {DAILY.map(d => {
            const barH = Math.round((d.tokens / maxTokens) * 80);
            return (
              <div key={d.day} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 4 }}>
                <div style={{ fontSize: 9, color: "#94A3B8" }}>{formatK(d.tokens)}</div>
                <div style={{
                  width: "100%",
                  height: barH,
                  background: "linear-gradient(180deg, #60A5FA 0%, #3B82F6 100%)",
                  borderRadius: "3px 3px 0 0",
                }} />
                <div style={{ fontSize: 10, color: "#94A3B8" }}>{d.day}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* By model */}
      <div style={{ background: "#1A2332", border: "1px solid #1E293B", borderRadius: 10, padding: "20px", marginBottom: 28 }}>
        <div style={{ color: "#94A3B8", fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16 }}>By Model</div>
        {MODEL_BREAKDOWN.map(m => (
          <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: m.color,
              flexShrink: 0,
            }} />
            <span style={{ color: "#FFFFFF", fontSize: 12, width: 160, flexShrink: 0 }}>{m.label}</span>
            <HBar pct={m.pct} color={m.color} />
            <span style={{ color: "#94A3B8", fontSize: 11, width: 36, textAlign: "right", flexShrink: 0 }}>{m.pct}%</span>
          </div>
        ))}
      </div>

      {/* By agent */}
      <div style={{ background: "#1A2332", border: "1px solid #1E293B", borderRadius: 10, padding: "20px" }}>
        <div style={{ color: "#94A3B8", fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16 }}>Top Agents</div>
        {AGENT_BREAKDOWN.map(a => (
          <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{a.emoji}</span>
            <span style={{ color: "#FFFFFF", fontSize: 12, width: 64, flexShrink: 0 }}>{a.name}</span>
            <HBar pct={a.pct} />
            <span style={{ color: "#94A3B8", fontSize: 11, width: 36, textAlign: "right", flexShrink: 0 }}>{a.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
