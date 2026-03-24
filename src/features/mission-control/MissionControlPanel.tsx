"use client";

import { useMemo } from "react";
import { useAgentStore, type AgentState } from "@/features/agents/state/store";

type AgentStatus = "active" | "standby" | "building";

function deriveAgentStatus(liveAgent: AgentState): AgentStatus {
  if (liveAgent.status === "running") {
    return liveAgent.streamText !== null ? "building" : "active";
  }
  if (liveAgent.lastActivityAt !== null) {
    const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
    if (liveAgent.lastActivityAt > fifteenMinutesAgo) {
      return "active";
    }
  }
  return "standby";
}

interface Agent {
  name: string;
  emoji: string;
  role: string;
  model: string;
  status: AgentStatus;
}

interface Project {
  name: string;
  emoji: string;
  status: string;
}

interface Todo {
  id: string;
  text: string;
}

const Z = {
  sumi:       "#1A1A18",
  charcoal:   "#242422",
  wabiGold:   "#B8A07E",
  matcha:     "#7D8C6C",
  clay:       "#A67C5B",
  ricePaper:  "#E8E0D4",
  stone:      "#7A7A72",
  bamboo:     "#3A3A36",
  bambooLight:"#4A4A46",
  sectionBg:  "#1E1E1C",
} as const;

const FONT = '"Segoe UI Semilight", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif';

const FONT_MONO = '"IBM Plex Mono", "Menlo", monospace';

const AGENTS: Agent[] = [
  { name: "Alfi",   emoji: "🤝", role: "CTO / Orchestrator",       model: "Sonnet→Opus",   status: "active"  },
  { name: "Scout",  emoji: "🔍", role: "Commercial Intelligence",   model: "Opus",          status: "standby" },
  { name: "Nova",   emoji: "🌸", role: "Project Lead — Hana",       model: "Sonnet",        status: "standby" },
  { name: "Atlas",  emoji: "🗺️", role: "Project Lead — Flow",      model: "Sonnet",        status: "standby" },
  { name: "Benito", emoji: "🐇", role: "Backend Engineer",          model: "MiniMax M2.7",  status: "standby" },
  { name: "Bloom",  emoji: "🌺", role: "Frontend / Mobile",         model: "MiniMax M2.7",  status: "standby" },
  { name: "Pixel",  emoji: "🎨", role: "Frontend Engineer",         model: "MiniMax M2.7",  status: "standby" },
  { name: "Pulse",  emoji: "💓", role: "Matching Engine",           model: "MiniMax M2.7",  status: "standby" },
  { name: "Cupid",  emoji: "💘", role: "QA Reviewer — Hana",       model: "Sonnet",        status: "standby" },
  { name: "Judge",  emoji: "⚖️", role: "QA Reviewer — Flow",        model: "Sonnet",        status: "standby" },
  { name: "Forge",  emoji: "🔨", role: "Bootstrap Squad Lead",      model: "Sonnet→Opus",  status: "standby" },
];

const PROJECTS: Project[] = [
  { name: "Hana",            emoji: "🌸", status: "Live"       },
  { name: "Flow",            emoji: "🏢", status: "Planning"   },
  { name: "Vinyl",           emoji: "🎵", status: "Live"       },
  { name: "Claw3D",          emoji: "🏢", status: "Building"    },
  { name: "Bootstrap Squad", emoji: "🔧", status: "Standby"    },
];

const TODOS: Todo[] = [
  { id: "1", text: "Wire up live agent status from OpenClaw gateway" },
  { id: "2", text: "Connect project status to Claw3D project store"  },
  { id: "3", text: "Add real-time TODO sync from workspace files"     },
  { id: "4", text: "Implement agent activity sparklines"              },
  { id: "5", text: "Add project progress bars and milestone tracking" },
];

const STATUS_DOT: Record<AgentStatus, { bg: string; glow: string }> = {
  active:   { bg: Z.matcha,  glow: "0 0 5px rgba(125,140,108,0.5)" },
  standby:  { bg: Z.stone,  glow: "none" },
  building: { bg: Z.clay,   glow: "0 0 5px rgba(166,124,91,0.5)" },
};

const PROJECT_STATUS_BADGE: Record<string, { bg: string; border: string; text: string }> = {
  Live:     { bg: "rgba(125,140,108,0.1)",  border: "rgba(125,140,108,0.3)",  text: Z.matcha  },
  Building: { bg: "rgba(166,124,91,0.1)",  border: "rgba(166,124,91,0.3)",  text: Z.clay    },
  Planning: { bg: "rgba(184,160,126,0.1)", border: "rgba(184,160,126,0.3)", text: Z.wabiGold},
  Standby:  { bg: "rgba(122,122,114,0.08)",border: "rgba(122,122,114,0.2)", text: Z.stone   },
};

// ─── Section header ──────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{
      fontFamily: FONT_MONO,
      fontSize: 10,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color: Z.stone,
      marginBottom: 12,
    }}>
      {label}
    </div>
  );
}

// ─── Agent card ──────────────────────────────────────────────────────────────

function AgentCard({ agent }: { agent: Agent }) {
  const dot = STATUS_DOT[agent.status];

  return (
    <div style={{
      background: Z.charcoal,
      border: `1px solid ${Z.bamboo}`,
      borderRadius: 6,
      padding: "10px 12px",
      transition: "border-color 0.2s ease",
      cursor: "default",
    }}
    onMouseEnter={e => (e.currentTarget.style.borderColor = Z.bambooLight)}
    onMouseLeave={e => (e.currentTarget.style.borderColor = Z.bamboo)}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>{agent.emoji}</span>
        <div style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: dot.bg,
          boxShadow: dot.glow,
          flexShrink: 0,
        }} />
      </div>
      <div style={{
        fontFamily: FONT,
        fontSize: 12,
        fontWeight: 600,
        color: Z.ricePaper,
        letterSpacing: "0.03em",
        marginBottom: 3,
      }}>
        {agent.name}
      </div>
      <div style={{
        fontFamily: FONT,
        fontSize: 10,
        color: Z.stone,
        lineHeight: 1.4,
        marginBottom: 8,
      }}>
        {agent.role}
      </div>
      <div style={{
        fontFamily: FONT_MONO,
        fontSize: 9,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: Z.wabiGold,
        opacity: 0.75,
      }}>
        {agent.model}
      </div>
    </div>
  );
}

// ─── Project card ────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: Project }) {
  const badge = PROJECT_STATUS_BADGE[project.status] ?? PROJECT_STATUS_BADGE.Standby;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: Z.charcoal,
      border: `1px solid ${Z.bamboo}`,
      borderRadius: 6,
      padding: "10px 12px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14, lineHeight: 1 }}>{project.emoji}</span>
        <span style={{
          fontFamily: FONT,
          fontSize: 12,
          color: Z.ricePaper,
        }}>
          {project.name}
        </span>
      </div>
      <span style={{
        fontFamily: FONT_MONO,
        fontSize: 9,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        padding: "3px 8px",
        borderRadius: 4,
        background: badge.bg,
        border: `1px solid ${badge.border}`,
        color: badge.text,
      }}>
        {project.status}
      </span>
    </div>
  );
}

// ─── Todo row ────────────────────────────────────────────────────────────────

function TodoRow({ todo }: { todo: Todo }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      background: Z.charcoal,
      border: `1px solid ${Z.bamboo}`,
      borderRadius: 6,
      padding: "9px 12px",
    }}>
      <span style={{
        fontFamily: FONT_MONO,
        fontSize: 10,
        color: Z.wabiGold,
        opacity: 0.5,
        flexShrink: 0,
        marginTop: 1,
      }}>
        [{todo.id}]
      </span>
      <span style={{
        fontFamily: FONT,
        fontSize: 12,
        color: Z.ricePaper,
        opacity: 0.7,
        lineHeight: 1.5,
      }}>
        {todo.text}
      </span>
    </div>
  );
}

// ─── MissionControlPanel ─────────────────────────────────────────────────────

export function MissionControlPanel({ agents }: { agents?: Map<string, AgentState> }) {
  const { state } = useAgentStore();

  const liveByName = useMemo<Map<string, AgentState>>(() => {
    if (agents) return agents;
    const map = new Map<string, AgentState>();
    for (const a of state.agents) {
      if (a.name) map.set(a.name.toLowerCase(), a);
    }
    return map;
  }, [agents, state.agents]);

  const resolvedAgents = useMemo(() =>
    AGENTS.map((agent) => {
      const live = liveByName.get(agent.name.toLowerCase());
      return live ? { ...agent, status: deriveAgentStatus(live) } : agent;
    }),
  [liveByName]);

  return (
    <section style={{
      width: "100%",
      background: Z.sumi,
    }}>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${Z.bamboo}`,
        padding: "20px 24px 16px",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{
            fontFamily: FONT,
            fontSize: 11,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: Z.wabiGold,
          }}>
            Mission Control
          </span>
          <span style={{
            fontFamily: FONT_MONO,
            fontSize: 9,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: Z.stone,
            opacity: 0.5,
          }}>
            hq · Claw3D
          </span>
        </div>
        <p style={{
          fontFamily: FONT,
          fontSize: 11,
          color: Z.stone,
          margin: "4px 0 0",
          opacity: 0.6,
        }}>
          Agent fleet status, active projects, and open work items.
        </p>
      </div>

      <div style={{ padding: "24px" }}>

        {/* Agent Fleet */}
        <div style={{ marginBottom: 32 }}>
          <SectionHeader label="Agent Fleet" />
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 8,
          }}>
            {resolvedAgents.map((agent) => (
              <AgentCard key={agent.name} agent={agent} />
            ))}
          </div>
        </div>

        {/* Active Projects */}
        <div style={{ marginBottom: 32 }}>
          <SectionHeader label="Active Projects" />
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 6,
          }}>
            {PROJECTS.map((project) => (
              <ProjectCard key={project.name} project={project} />
            ))}
          </div>
        </div>

        {/* Open TODOs */}
        <div>
          <SectionHeader label="Open TODOs" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {TODOS.map((todo) => (
              <TodoRow key={todo.id} todo={todo} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
