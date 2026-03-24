"use client";

import React from "react";

type Status = "online" | "standby" | "offline";

interface Agent {
  id: string;
  emoji: string;
  name: string;
  role: string;
  model: string;
  status: Status;
}

const statusColor: Record<Status, string> = {
  online:  "#34D399",
  standby: "#FBBF24",
  offline: "#94A3B8",
};

const modelColor: Record<string, string> = {
  "Opus 4.6":   "#818CF8",
  "Sonnet 4.6": "#60A5FA",
  "MiniMax":    "#34D399",
  "Human":      "#F87171",
};

function modelLabel(model: string) {
  if (model.includes("Opus"))    return "Opus";
  if (model.includes("Sonnet"))  return "Sonnet";
  if (model.includes("MiniMax")) return "Mini";
  return model;
}

function AgentNode({ agent, size = "md" }: { agent: Agent; size?: "lg" | "md" | "sm" }) {
  const isLg = size === "lg";
  const isSm = size === "sm";
  const badge = model_badge(agent.model);

  return (
    <div style={{
      background: "#1A2332",
      border: "1px solid #1E293B",
      borderRadius: isLg ? 12 : 8,
      padding: isLg ? "14px 16px" : isSm ? "8px 10px" : "10px 12px",
      display: "flex",
      alignItems: "center",
      gap: isLg ? 12 : 8,
      minWidth: isLg ? 160 : isSm ? 110 : 140,
      maxWidth: isLg ? 200 : isSm ? 140 : 170,
      position: "relative",
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    }}>
      <span style={{ fontSize: isLg ? 24 : isSm ? 16 : 20 }}>{agent.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "nowrap" }}>
          <span style={{ color: "#FFFFFF", fontSize: isLg ? 14 : isSm ? 11 : 13, fontWeight: 500, whiteSpace: "nowrap" }}>{agent.name}</span>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: statusColor[agent.status],
            boxShadow: `0 0 4px ${statusColor[agent.status]}`,
            flexShrink: 0,
          }} />
        </div>
        {!isSm && (
          <div style={{ color: "#94A3B8", fontSize: 9, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{agent.role}</div>
        )}
        <div style={{
          display: "inline-block",
          marginTop: 4,
          padding: "1px 6px",
          borderRadius: 4,
          background: badge.bg,
          color: badge.color,
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: "0.03em",
        }}>{badge.label}</div>
      </div>
    </div>
  );
}

function model_badge(model: string) {
  if (model.includes("Opus"))    return { label: "Opus",   bg: "#2D2660", color: "#818CF8" };
  if (model.includes("Sonnet"))  return { label: "Sonnet", bg: "#1A2C47", color: "#60A5FA" };
  if (model.includes("MiniMax")) return { label: "Mini",   bg: "#1A3530", color: "#34D399" };
  return { label: model, bg: "#1E293B", color: "#94A3B8" };
}

// Connector line components
function VLine({ height = 24 }: { height?: number }) {
  return <div style={{ width: 1, height, background: "#1E293B", alignSelf: "center" }} />;
}

function HLine({ width }: { width: number }) {
  return <div style={{ width, height: 1, background: "#1E293B" }} />;
}

// A node group: node with children below
interface OrgGroupProps {
  parent: Agent;
  parentSize?: "lg" | "md" | "sm";
  children?: Agent[];
  childSize?: "sm" | "md";
}

function OrgGroup({ parent, parentSize = "md", children = [], childSize = "sm" }: OrgGroupProps) {
  const hasChildren = children.length > 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <AgentNode agent={parent} size={parentSize} />
      {hasChildren && (
        <>
          <VLine height={20} />
          {/* Horizontal bar across children */}
          <div style={{ position: "relative", display: "flex", alignItems: "flex-start" }}>
            {/* Top horizontal line spanning all children */}
            <div style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              height: 1,
              background: "#1E293B",
            }} />
            <div style={{ display: "flex", gap: 8, paddingTop: 0 }}>
              {children.map((child) => (
                <div key={child.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <VLine height={20} />
                  <AgentNode agent={child} size={childSize} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// --- Agent definitions ---

const JASON: Agent = { id: "jason", emoji: "👤", name: "Jason", role: "CEO", model: "Human", status: "online" };
const ALFI: Agent  = { id: "alfi",  emoji: "🤝", name: "Alfi",  role: "CTO / Orchestrator", model: "Opus 4.6", status: "online" };
const SCOUT: Agent = { id: "scout", emoji: "🔍", name: "Scout", role: "Commercial Intelligence", model: "Opus 4.6", status: "standby" };

const NOVA: Agent  = { id: "nova",  emoji: "🌸", name: "Nova",  role: "Project Lead — Hana",  model: "Sonnet 4.6", status: "standby" };
const NOVA_CHILDREN: Agent[] = [
  { id: "benito", emoji: "🐇", name: "Benito", role: "Backend",  model: "MiniMax M2.7", status: "standby" },
  { id: "bloom",  emoji: "🌺", name: "Bloom",  role: "Frontend", model: "MiniMax M2.7", status: "standby" },
  { id: "pulse",  emoji: "💓", name: "Pulse",  role: "Matching", model: "MiniMax M2.7", status: "standby" },
  { id: "cupid",  emoji: "💘", name: "Cupid",  role: "QA",       model: "Opus 4.6",    status: "standby" },
];

const ATLAS: Agent = { id: "atlas", emoji: "🗺️", name: "Atlas", role: "Project Lead — Flow", model: "Sonnet 4.6", status: "standby" };
const ATLAS_CHILDREN: Agent[] = [
  { id: "pixel", emoji: "🎨", name: "Pixel", role: "Frontend", model: "MiniMax M2.7", status: "online"  },
  { id: "judge", emoji: "⚖️", name: "Judge", role: "QA",       model: "Opus 4.6",    status: "standby" },
];

const FORGE: Agent = { id: "forge", emoji: "🔨", name: "Forge", role: "Bootstrap Lead", model: "Sonnet 4.6", status: "standby" };
const FORGE_CHILDREN: Agent[] = [
  { id: "quill", emoji: "✍️", name: "Quill", role: "Content", model: "MiniMax M2.7", status: "standby" },
  { id: "chip",  emoji: "📈", name: "Chip",  role: "Trading", model: "MiniMax M2.7", status: "standby" },
  { id: "mint",  emoji: "🪙", name: "Mint",  role: "Monetise",model: "MiniMax M2.7", status: "standby" },
];

export function FleetView() {
  const ff: React.CSSProperties = {
    fontFamily: '"Segoe UI Semilight", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  };

  return (
    <div style={{
      ...ff,
      height: "100%",
      overflowY: "auto",
      overflowX: "auto",
      background: "#0F1724",
      padding: "24px 32px",
    }}>
      <h2 style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 400, marginBottom: 4, marginTop: 0 }}>Fleet</h2>
      <p style={{ color: "#94A3B8", fontSize: 12, marginBottom: 32, marginTop: 0 }}>Agent org chart</p>

      {/* Full tree */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, minWidth: 680 }}>

        {/* Jason */}
        <AgentNode agent={JASON} size="lg" />
        <VLine height={24} />

        {/* Alfi */}
        <AgentNode agent={ALFI} size="lg" />
        <VLine height={24} />

        {/* Horizontal connector for Alfi's reports */}
        <div style={{ position: "relative", width: "100%" }}>
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

        {/* Level 2: Scout, Nova, Atlas, Forge */}
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", paddingTop: 0 }}>
          {/* Scout — no children */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <VLine height={24} />
            <AgentNode agent={SCOUT} size="md" />
          </div>

          {/* Nova + her team */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <VLine height={24} />
            <OrgGroup parent={NOVA} parentSize="md" children={NOVA_CHILDREN} childSize="sm" />
          </div>

          {/* Atlas + his team */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <VLine height={24} />
            <OrgGroup parent={ATLAS} parentSize="md" children={ATLAS_CHILDREN} childSize="sm" />
          </div>

          {/* Forge + bootstrap squad */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <VLine height={24} />
            <OrgGroup parent={FORGE} parentSize="md" children={FORGE_CHILDREN} childSize="sm" />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ marginTop: 48, padding: "16px", background: "#1A2332", borderRadius: 8, border: "1px solid #1E293B", display: "flex", gap: 40 }}>
        <div>
          <div style={{ color: "#94A3B8", fontSize: 10, marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>Status</div>
          <div style={{ display: "flex", gap: 20 }}>
            {(["online", "standby", "offline"] as Status[]).map(s => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor[s] }} />
                <span style={{ color: "#94A3B8", fontSize: 11 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ color: "#94A3B8", fontSize: 10, marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>Model</div>
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { label: "Opus",   bg: "#2D2660", color: "#818CF8" },
              { label: "Sonnet", bg: "#1A2C47", color: "#60A5FA" },
              { label: "Mini",   bg: "#1A3530", color: "#34D399" },
            ].map(m => (
              <div key={m.label} style={{
                padding: "2px 8px",
                borderRadius: 4,
                background: m.bg,
                color: m.color,
                fontSize: 10,
                fontWeight: 600,
              }}>{m.label}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
