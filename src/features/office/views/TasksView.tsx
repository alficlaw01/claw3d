"use client";

import React from "react";

type Status = "done" | "in-progress" | "todo";

interface Task {
  id: string;
  description: string;
  status: Status;
}

interface Project {
  id: string;
  name: string;
  emoji: string;
  tasks: Task[];
}

const statusStyle: Record<Status, { bg: string; color: string; label: string }> = {
  done:        { bg: "rgba(52, 211, 153, 0.15)",  color: "#34D399", label: "done" },
  "in-progress": { bg: "rgba(251, 191, 36, 0.15)",  color: "#FBBF24", label: "in progress" },
  todo:        { bg: "rgba(148, 163, 184, 0.12)", color: "#94A3B8", label: "todo" },
};

const PROJECTS: Project[] = [
  {
    id: "hana",
    name: "Hana",
    emoji: "🌸",
    tasks: [
      { id: "h1",  description: "Define agent matching algorithm spec",               status: "done" },
      { id: "h2",  description: "Set up Supabase schema (users, matches, sessions)",   status: "done" },
      { id: "h3",  description: "Implement Pulse scoring engine v1",                   status: "done" },
      { id: "h4",  description: "Build onboarding flow (React Native, Expo)",          status: "in-progress" },
      { id: "h5",  description: "Match presentation screen",                            status: "in-progress" },
      { id: "h6",  description: "Integrate Claude API for agent personas",              status: "todo" },
      { id: "h7",  description: "Auth (Supabase Auth + social login)",                 status: "todo" },
      { id: "h8",  description: "Stripe subscription integration",                     status: "todo" },
      { id: "h9",  description: "Cupid QA pass — onboarding + match flow",             status: "todo" },
      { id: "h10", description: "Beta TestFlight build",                               status: "todo" },
    ],
  },
  {
    id: "bootstrap",
    name: "Bootstrap Squad",
    emoji: "🔨",
    tasks: [
      { id: "b1", description: "Define Bootstrap Squad structure + agent roster",       status: "done" },
      { id: "b2", description: "Quill: research first niche content site topic",        status: "in-progress" },
      { id: "b3", description: "Chip: design 90-day paper trading competition",        status: "todo" },
      { id: "b4", description: "Mint: identify Gumroad product candidates",            status: "todo" },
      { id: "b5", description: "Forge: set up P&L tracking spreadsheet",              status: "todo" },
      { id: "b6", description: "Quill: build and publish first niche site",            status: "todo" },
    ],
  },
  {
    id: "claw3d",
    name: "Claw3D",
    emoji: "🏢",
    tasks: [
      { id: "c1", description: "3D office environment (OfficeScreen)",                status: "done" },
      { id: "c2", description: "Work Mode — 5-panel agent chat + ttyd terminal",      status: "done" },
      { id: "c3", description: "TopBar with mode toggle (hq/work/office)",            status: "done" },
      { id: "c4", description: "Office sidebar (Fleet, Tasks, Usage views)",          status: "in-progress" },
      { id: "c5", description: "Wire real agent API calls into chat panels",          status: "todo" },
      { id: "c6", description: "Wire real token usage data into UsageView",           status: "todo" },
      { id: "c7", description: "Mobile responsive layout",                            status: "todo" },
    ],
  },
];

function TaskRow({ task }: { task: Task }) {
  const s = statusStyle[task.status];
  const done = task.status === "done";
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 0",
      borderBottom: "1px solid #1E293B",
    }}>
      {/* Checkbox */}
      <div style={{
        width: 16,
        height: 16,
        borderRadius: 4,
        border: done ? "none" : "1px solid #1E293B",
        background: done ? "#34D399" : "transparent",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {done && <span style={{ color: "#0F1724", fontSize: 10, fontWeight: 700 }}>✓</span>}
      </div>

      {/* Description */}
      <span style={{
        flex: 1,
        color: done ? "#94A3B8" : "#FFFFFF",
        fontSize: 13,
        textDecoration: done ? "line-through" : "none",
        opacity: done ? 0.7 : 1,
      }}>
        {task.description}
      </span>

      {/* Badge */}
      <span style={{
        background: s.bg,
        color: s.color,
        fontSize: 10,
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: 10,
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
      }}>
        {s.label}
      </span>
    </div>
  );
}

export function TasksView() {
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
      <h2 style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 400, marginBottom: 4, marginTop: 0 }}>Tasks</h2>
      <p style={{ color: "#94A3B8", fontSize: 12, marginBottom: 32, marginTop: 0 }}>Grouped by project</p>

      {PROJECTS.map(project => {
        const done = project.tasks.filter(t => t.status === "done").length;
        const total = project.tasks.length;
        const pct = Math.round((done / total) * 100);

        return (
          <div key={project.id} style={{ marginBottom: 36 }}>
            {/* Project header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>{project.emoji}</span>
                <span style={{ color: "#FFFFFF", fontSize: 15, fontWeight: 500 }}>{project.name}</span>
              </div>
              <span style={{ color: "#94A3B8", fontSize: 11 }}>{done}/{total} · {pct}%</span>
            </div>

            {/* Progress bar */}
            <div style={{ background: "#1A2332", borderRadius: 4, height: 4, marginBottom: 12, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: "#34D399", borderRadius: 4, transition: "width 0.3s ease" }} />
            </div>

            {/* Tasks */}
            <div style={{ background: "#1A2332", borderRadius: 8, border: "1px solid #1E293B", padding: "4px 16px" }}>
              {project.tasks.map(task => <TaskRow key={task.id} task={task} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
