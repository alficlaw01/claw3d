"use client";
import { Suspense, useEffect, useState } from "react";
import { AgentStoreProvider } from "@/features/agents/state/store";
import { OfficeScreen } from "@/features/office/screens/OfficeScreen";
import { MissionControlPanel } from "@/features/mission-control/MissionControlPanel";
import { WorkModePanel } from "@/features/work-mode/WorkModePanel";

const ENABLED_RE = /^(1|true|yes|on)$/i;

const readDebugFlag = (value: string | undefined): boolean => {
  const normalized = (value ?? "").trim();
  if (!normalized) return true;
  return ENABLED_RE.test(normalized);
};

const DEFAULT_PANELS = ["alfi", "scout", "benito", "pixel", "forge"];

export default function OfficePage() {
  const showOpenClawConsole = readDebugFlag(process.env.DEBUG);

  // Work mode state: default to true (Work Mode), persisted in localStorage
  const [workMode, setWorkMode] = useState(true);
  const [panelAgents, setPanelAgents] = useState<string[]>(DEFAULT_PANELS);
  const [topHeight, setTopHeight] = useState(60);
  const [hydrated, setHydrated] = useState(false);

  // Restore mode from localStorage after mount
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

  // Avoid flash of wrong mode before hydration
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
      <div style={{ height: "100vh", position: "relative", flexShrink: 0 }}>
        <Suspense fallback={null}>
          <OfficeScreen showOpenClawConsole={showOpenClawConsole} />
        </Suspense>

        {/* Work Mode toggle — floating top-right */}
        <button
          onClick={switchToWork}
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 9999,
            background: "rgba(13, 24, 41, 0.85)",
            border: "1px solid #C9A84C",
            color: "#C9A84C",
            padding: "8px 18px",
            borderRadius: 20,
            fontFamily: "Inter, sans-serif",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            backdropFilter: "blur(8px)",
            boxShadow: "0 0 16px rgba(201,168,76,0.2)",
          }}
        >
          ⚡ Work Mode
        </button>

        {/* Scroll to Mission Control button */}
        <a
          href="#mission-control"
          style={{
            position: "absolute",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            background: "rgba(201,168,76,0.25)",
            border: "1px solid rgba(201,168,76,0.6)",
            color: "#C9A84C",
            padding: "12px 28px",
            borderRadius: "24px",
            fontFamily: "monospace",
            fontSize: "12px",
            textDecoration: "none",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            backdropFilter: "blur(8px)",
            boxShadow: "0 0 20px rgba(201,168,76,0.2)",
            animation: "pulse 2s infinite",
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
              background: "rgba(201,168,76,0.15)",
              border: "1px solid rgba(201,168,76,0.4)",
              color: "#C9A84C",
              padding: "8px 20px",
              borderRadius: "20px",
              fontFamily: "monospace",
              fontSize: "11px",
              cursor: "pointer",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            ▲ Back to Office
          </button>
        </div>
      </div>
    </AgentStoreProvider>
  );
}
