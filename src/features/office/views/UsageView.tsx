"use client";

import React, { useEffect, useState } from "react";

interface DayData { day: string; tokens: number; cost: number }
interface ModelEntry { label: string; tokens: number; cost: number; pct: number }
interface AgentEntry { emoji: string; name: string; tokens: number; cost: number; pct: number }

interface UsageData {
  days: DayData[];
  modelBreakdown: ModelEntry[];
  agentBreakdown: AgentEntry[];
  totalCost: number;
  totalTokens: number;
}

const MODEL_COLORS: Record<string, string> = {
  "Claude Opus 4.6":   "#818CF8",
  "Claude Sonnet 4.6": "#60A5FA",
  "MiniMax M2.7":      "#34D399",
};

function formatK(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return `${n}`;
}

function formatCost(n: number) {
  return `$${n.toFixed(2)}`;
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
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then(r => r.json())
      .then((d: UsageData) => { setData(d); setLoading(false); })
      .catch(e => { setError(String(e)); setLoading(false); });
  }, []);

  const ff: React.CSSProperties = {
    fontFamily: '"Segoe UI Semilight", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  };

  const hasData = data && data.totalTokens > 0;
  const days = data?.days ?? [];
  const maxTokens = Math.max(...days.map(d => d.tokens), 1);

  return (
    <div style={{
      ...ff,
      height: "100%",
      overflowY: "auto",
      background: "#0F1724",
      padding: "24px 32px",
    }}>
      <h2 style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 400, marginBottom: 4, marginTop: 0 }}>Token Usage</h2>
      <p style={{ color: "#94A3B8", fontSize: 12, marginBottom: 32, marginTop: 0 }}>
        {loading ? "Loading…" : error ? "Error loading data" : hasData
          ? `Last 7 days · ${formatK(data!.totalTokens)} tokens · est. ${formatCost(data!.totalCost)}`
          : "No session data yet"}
      </p>

      {/* Daily bar chart */}
      <div style={{ background: "#1A2332", border: "1px solid #1E293B", borderRadius: 10, padding: "20px 20px 16px", marginBottom: 28 }}>
        <div style={{ color: "#94A3B8", fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16 }}>Daily Activity</div>

        {!hasData && !loading ? (
          <div style={{ color: "#94A3B8", fontSize: 12, textAlign: "center", padding: "20px 0" }}>No data yet</div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
            {days.map((d, i) => {
              const barH = d.tokens > 0 ? Math.max(4, Math.round((d.tokens / maxTokens) * 80)) : 0;
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 4 }}>
                  <div style={{ fontSize: 9, color: "#94A3B8", minHeight: 12 }}>{d.tokens > 0 ? formatK(d.tokens) : ""}</div>
                  <div style={{
                    width: "100%",
                    height: barH || 2,
                    background: barH > 0 ? "linear-gradient(180deg, #60A5FA 0%, #3B82F6 100%)" : "#1E293B",
                    borderRadius: "3px 3px 0 0",
                  }} />
                  <div style={{ fontSize: 10, color: "#94A3B8" }}>{d.day}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* By model */}
      <div style={{ background: "#1A2332", border: "1px solid #1E293B", borderRadius: 10, padding: "20px", marginBottom: 28 }}>
        <div style={{ color: "#94A3B8", fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16 }}>By Model</div>
        {!hasData && !loading ? (
          <div style={{ color: "#94A3B8", fontSize: 12, textAlign: "center", padding: "8px 0" }}>No data yet</div>
        ) : (data?.modelBreakdown ?? []).map(m => {
          const color = MODEL_COLORS[m.label] ?? "#94A3B8";
          return (
            <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
              <span style={{ color: "#FFFFFF", fontSize: 12, width: 160, flexShrink: 0 }}>{m.label}</span>
              <HBar pct={m.pct} color={color} />
              <span style={{ color: "#94A3B8", fontSize: 11, width: 36, textAlign: "right", flexShrink: 0 }}>{m.pct}%</span>
            </div>
          );
        })}
      </div>

      {/* By agent */}
      <div style={{ background: "#1A2332", border: "1px solid #1E293B", borderRadius: 10, padding: "20px" }}>
        <div style={{ color: "#94A3B8", fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16 }}>Top Agents</div>
        {!hasData && !loading ? (
          <div style={{ color: "#94A3B8", fontSize: 12, textAlign: "center", padding: "8px 0" }}>No data yet</div>
        ) : (data?.agentBreakdown ?? []).map(a => (
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
