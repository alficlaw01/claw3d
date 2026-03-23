"use client";

type AgentStatus = "active" | "standby" | "building";

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

const AGENTS: Agent[] = [
  { name: "Alfi",   emoji: "🤝", role: "CTO / Orchestrator",       model: "Sonnet→Opus",   status: "active"  },
  { name: "Scout",  emoji: "🔍", role: "Commercial Intelligence",   model: "Opus",          status: "standby" },
  { name: "Nova",   emoji: "🌸", role: "Project Lead — Hana",       model: "Sonnet",        status: "standby" },
  { name: "Atlas",  emoji: "🗺️", role: "Project Lead — Flow",       model: "Sonnet",        status: "standby" },
  { name: "Benito", emoji: "🐇", role: "Backend Engineer",          model: "MiniMax M2.7",  status: "standby" },
  { name: "Bloom",  emoji: "🌺", role: "Frontend / Mobile",         model: "MiniMax M2.7",  status: "standby" },
  { name: "Pixel",  emoji: "🎨", role: "Frontend Engineer",         model: "MiniMax M2.7",  status: "standby" },
  { name: "Pulse",  emoji: "💓", role: "Matching Engine",           model: "MiniMax M2.7",  status: "standby" },
  { name: "Cupid",  emoji: "💘", role: "QA Reviewer — Hana",        model: "Sonnet",        status: "standby" },
  { name: "Judge",  emoji: "⚖️", role: "QA Reviewer — Flow",        model: "Sonnet",        status: "standby" },
  { name: "Forge",  emoji: "🔨", role: "Bootstrap Squad Lead",      model: "Sonnet→Opus",   status: "standby" },
];

const PROJECTS: Project[] = [
  { name: "Hana",            emoji: "🌸", status: "Planning"   },
  { name: "Flow",            emoji: "🏢", status: "Planning"   },
  { name: "Vinyl",           emoji: "🎵", status: "Live"       },
  { name: "Claw3D",          emoji: "🏢", status: "Deploying"  },
  { name: "Bootstrap Squad", emoji: "🔧", status: "Standby"    },
];

const TODOS: Todo[] = [
  { id: "1", text: "Wire up live agent status from OpenClaw gateway" },
  { id: "2", text: "Connect project status to Claw3D project store"  },
  { id: "3", text: "Add real-time TODO sync from workspace files"     },
  { id: "4", text: "Implement agent activity sparklines"              },
  { id: "5", text: "Add project progress bars and milestone tracking" },
];

const STATUS_DOT: Record<AgentStatus, string> = {
  active:   "bg-emerald-400",
  standby:  "bg-white/20",
  building: "bg-amber-400",
};

const STATUS_LABEL: Record<AgentStatus, string> = {
  active:   "active",
  standby:  "standby",
  building: "building",
};

const PROJECT_BADGE: Record<string, string> = {
  Live:       "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  Deploying:  "border-amber-500/40  bg-amber-500/10  text-amber-300",
  Planning:   "border-cyan-500/40   bg-cyan-500/10   text-cyan-300",
  Standby:    "border-white/10      bg-white/5       text-white/40",
};

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div
      className="rounded border border-white/8 bg-white/[0.025] px-3 py-3 transition-colors hover:border-[#C9A84C]/30 hover:bg-[#C9A84C]/[0.04]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-base leading-none">{agent.emoji}</span>
        <span
          className={`h-2 w-2 flex-shrink-0 rounded-full ${STATUS_DOT[agent.status]}`}
          title={STATUS_LABEL[agent.status]}
        />
      </div>
      <div className="mt-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90">
        {agent.name}
      </div>
      <div className="mt-1 font-mono text-[10px] leading-snug text-white/45">{agent.role}</div>
      <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#C9A84C]/70">
        {agent.model}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const badgeClass =
    PROJECT_BADGE[project.status] ?? "border-white/10 bg-white/5 text-white/40";

  return (
    <div className="flex items-center justify-between rounded border border-white/8 bg-white/[0.025] px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className="text-sm leading-none">{project.emoji}</span>
        <span className="font-mono text-[11px] text-white/85">{project.name}</span>
      </div>
      <span
        className={`rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] ${badgeClass}`}
      >
        {project.status}
      </span>
    </div>
  );
}

export function MissionControlPanel() {
  return (
    <section
      className="w-full"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      {/* Header */}
      <div className="border-b border-[#C9A84C]/15 px-6 py-5">
        <div className="flex items-baseline gap-3">
          <h2
            className="font-mono text-xs uppercase tracking-[0.3em] text-[#C9A84C]"
          >
            Mission Control
          </h2>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/25">
            HQ · Claw3D
          </span>
        </div>
        <p className="mt-1 font-mono text-[10px] text-white/30">
          Agent fleet status, active projects, and open work items.
        </p>
      </div>

      <div className="px-6 py-6 space-y-8">

        {/* Agent Fleet */}
        <div>
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
            Agent Fleet
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {AGENTS.map((agent) => (
              <AgentCard key={agent.name} agent={agent} />
            ))}
          </div>
        </div>

        {/* Active Projects */}
        <div>
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
            Active Projects
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {PROJECTS.map((project) => (
              <ProjectCard key={project.name} project={project} />
            ))}
          </div>
        </div>

        {/* Open TODOs */}
        <div>
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
            Open TODOs
          </div>
          <div className="space-y-1.5">
            {TODOS.map((todo) => (
              <div
                key={todo.id}
                className="flex items-start gap-3 rounded border border-white/6 bg-white/[0.02] px-3 py-2"
              >
                <span className="mt-px font-mono text-[10px] text-[#C9A84C]/50">
                  [{todo.id}]
                </span>
                <span className="font-mono text-[11px] text-white/60">{todo.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
