"use client";

import React from "react";

interface Agent {
  id: string;
  emoji: string;
  name: string;
  role: string;
  model: string;
  status: "online" | "standby" | "offline";
}

const statusColor: Record<string, string> = {
  online: "#34D399",
  standby: "#FBBF24",
  offline: "#94A3B8",
};

const ALFI: Agent = {
  id: "alfi",
  emoji: "🤝",
  name: "Alfi",
  role: "CTO / Orchestrator",
  model: "Opus 4.6",
  status: "online",
};

const JASON: Agent = {
  id: "jason",
  emoji: "👤",
  name: "Jason",
  role: "CEO",
  model: "Human",
  status: "online",
};

const REPORTS: Agent[] = [
  { id: "scout",  emoji: "🔍", name: "Scout",  role: "Commercial Intelligence", model: "Opus 4.6",       status: "standby" },
  { id: "nova",   emoji: "🌸", name: "Nova",   role: "Project Lead — Hana",      model: "Sonnet 4.6",    status: "standby" },
  { id: "atlas",  emoji: "🗺️", name: "Atlas",  role: "Project Lead — Flow",      model: "Sonnet 4.6",    status: "standby" },
  { id: "benito", emoji: "🐇", name: "Benito", role: "Backend Engineer",          model: "MiniMax M2.7",  status: "standby" },
  { id: "bloom",  emoji: "🌺", name: "Bloom",  role: "Frontend / Mobile",         model: "MiniMax M2.7",  status: "standby" },
  { id: "pixel",  emoji: "🎨", name: "Pixel",  role: "Frontend Engineer",         model: "MiniMax M2.7",  status: "online"  },
  { id: "pulse",  emoji: "💓", name: "Pulse",  role: "Matching Engine",           model: "MiniMax M2.7",  status: "standby" },
  { id: "cupid",  emoji: "💘", name: "Cupid",  role: "QA Reviewer — Hana",        model: "Opus 4.6",      status: "standby" },
  { id: "judge",  emoji: "⚖️", name: "Judge",  role: "QA Reviewer — Flow",        model: "Opus 4.6",      status: "standby" },
  { id: "forge",  emoji: "🔨", name: "Forge",  role: "Bootstrap Squad Lead",      model: "Sonnet 4.6",    status: "standby" },
];

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div style={{
      background: "#1A2332",
      border: "1px solid #1E293B",
      borderRadius: 8,
      padding: "10px 12px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      minWidth: 180,
    }}>
      <span style={{ fontSize: 20 }}>{agent.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "#FFFFFF", fontSize: 13, fontWeight: 500 }}>{agent.name}</span>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: statusColor[agent.status],
            boxShadow: `0 0 4px ${statusColor[agent.status]}`,
            flexShrink: 0,
          }} />
        </div>
        <div style={{ color: "#94A3B8", fontSize: 10, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{agent.role}</div>
        <div style={{ color: "#94A3B8", fontSize: 9, marginTop: 1, opacity: 0.7 }}>{agent.model}</div>
      </div>
    </div>
  );
}

export function FleetView() {
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
      <h2 style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 400, marginBottom: 4, marginTop: 0 }}>Fleet</h2>
      <p style={{ color: "#94A3B8", fontSize: 12, marginBottom: 32, marginTop: 0 }}>Agent org chart</p>

      {/* Jason (CEO) */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        <AgentCard agent={JASON} />

        {/* Connector line down */}
        <div style={{ width: 1, height: 24, background: "#1E293B" }} />

        {/* Alfi (CTO) */}
        <AgentCard agent={ALFI} />

        {/* Connector line down */}
        <div style={{ width: 1, height: 24, background: "#1E293B" }} />

        {/* Horizontal spread line */}
        <div style={{ position: "relative", width: "100%", maxWidth: 900 }}>
          <div style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "90%",
            height: 1,
            background: "#1E293B",
          }} />
        </div>

        {/* Reports grid */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "center",
          paddingTop: 24,
          maxWidth: 900,
        }}>
          {REPORTS.map((agent) => (
            <div key={agent.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
              <div style={{ width: 1, height: 24, background: "#1E293B" }} />
              <AgentCard agent={agent} />
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ marginTop: 40, padding: "16px", background: "#1A2332", borderRadius: 8, border: "1px solid #1E293B" }}>
        <div style={{ color: "#94A3B8", fontSize: 10, marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>Status</div>
        <div style={{ display: "flex", gap: 20 }}>
          {(["online", "standby", "offline"] as const).map(s => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor[s] }} />
              <span style={{ color: "#94A3B8", fontSize: 11 }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
