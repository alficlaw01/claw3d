"use client";
import { Suspense, useEffect, useState } from "react";
import { AgentStoreProvider } from "@/features/agents/state/store";
import { OfficeScreen } from "@/features/office/screens/OfficeScreen";
import { MissionControlPanel } from "@/features/mission-control/MissionControlPanel";
import { WorkModePanel } from "@/features/work-mode/WorkModePanel";
import { TopBar } from "@/components/TopBar";

const ENABLED_RE = /^(1|true|yes|on)$/i;

const readDebugFlag = (value: string | undefined): boolean => {
  const normalized = (value ?? "").trim();
  if (!normalized) return true;
  return ENABLED_RE.test(normalized);
};

const DEFAULT_PANELS = ["alfi", "scout", "benito", "pixel", "forge"];

export default function OfficePage() {
  const showOpenClawConsole = readDebugFlag(process.env.DEBUG);

  const [workMode, setWorkMode] = useState(true);
  const [panelAgents, setPanelAgents] = useState<string[]>(DEFAULT_PANELS);
  const [topHeight, setTopHeight] = useState(60);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("claw3d-view-mode");
    if (stored === "office") setWorkMode(false);
    setHydrated(true);
  }, []);

  const switchToOffice = () => {
    setWorkMode(false);
    localStorage.setItem("claw3d-view-mode", "office");
  };

  const switchToWork = () => {
    setWorkMode(true);
    localStorage.setItem("claw3d-view-mode", "work");
  };

  const handleAgentChange = (panelIndex: number) => (newAgentId: string) => {
    setPanelAgents(prev => {
      const next = [...prev];
      next[panelIndex] = newAgentId;
      return next;
    });
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "m" || e.key === "M") {
        document.getElementById("mission-control")?.scrollIntoView({ behavior: "auto" });
      }
      if (e.key === "o" || e.key === "O") {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (!hydrated) return null;

  // ── Work Mode ───────────────────────────────────────────────────────────────
  if (workMode) {
    return (
      <AgentStoreProvider>
        <WorkModePanel
          panelAgents={panelAgents}
          onPanelAgentChange={handleAgentChange}
          topHeight={topHeight}
          setTopHeight={setTopHeight}
          onSwitchToOffice={switchToOffice}
        />
      </AgentStoreProvider>
    );
  }

  // ── Office Mode ─────────────────────────────────────────────────────────────
  return (
    <AgentStoreProvider>
      {/* Shared Zen top bar — identical to Work Mode */}
      <TopBar
        workModeActive={false}
        onSwitchToWork={switchToWork}
        onSwitchToOffice={switchToOffice}
      />

      <div style={{ height: "100vh", position: "relative", flexShrink: 0, paddingTop: 40 }}>
        <Suspense fallback={null}>
          <OfficeScreen showOpenClawConsole={showOpenClawConsole} />
        </Suspense>

        {/* Scroll to Mission Control */}
        <a
          href="#mission-control"
          style={{
            position: "absolute",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            background: "rgba(184, 160, 126, 0.15)",
            border: "1px solid rgba(184, 160, 126, 0.4)",
            color: "#B8A07E",
            padding: "10px 24px",
            borderRadius: "20px",
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
            fontWeight: 600,
            textDecoration: "none",
            letterSpacing: "0.08em",
            backdropFilter: "blur(8px)",
            boxShadow: "0 0 20px rgba(184, 160, 126, 0.12)",
          }}
        >
          ▼ Mission Control
        </a>
      </div>

      <div id="mission-control">
        <MissionControlPanel />
        <div style={{ textAlign: "center", padding: "16px" }}>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{
              background: "rgba(184, 160, 126, 0.1)",
              border: "1px solid rgba(184, 160, 126, 0.3)",
              color: "#B8A07E",
              padding: "8px 20px",
              borderRadius: "20px",
              fontFamily: "Inter, sans-serif",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: "0.08em",
            }}
          >
            ▲ Back to Office
          </button>
        </div>
      </div>
    </AgentStoreProvider>
  );
}
