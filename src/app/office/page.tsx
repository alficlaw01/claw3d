"use client";
import { Suspense, useEffect, useState } from "react";
import { AgentStoreProvider } from "@/features/agents/state/store";
import { OfficeScreen } from "@/features/office/screens/OfficeScreen";
import { WorkModePanel } from "@/features/work-mode/WorkModePanel";
import { TopBar } from "@/components/TopBar";
import { OfficeSidebar, OfficeView } from "@/features/office/components/OfficeSidebar";
import { FleetView } from "@/features/office/views/FleetView";
import { TasksView } from "@/features/office/views/TasksView";
import { UsageView } from "@/features/office/views/UsageView";

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
  const [officeView, setOfficeView] = useState<OfficeView>("office");

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
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0F1724", overflow: "hidden" }}>
        {/* Top Bar */}
        <TopBar
          workModeActive={false}
          onSwitchToWork={switchToWork}
          onSwitchToOffice={switchToOffice}
        />

        {/* Body: content + sidebar */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Main content area */}
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            {officeView === "office" && (
              <Suspense fallback={null}>
                <OfficeScreen showOpenClawConsole={false} />
              </Suspense>
            )}
            {officeView === "fleet" && <FleetView />}
            {officeView === "tasks" && <TasksView />}
            {officeView === "usage" && <UsageView />}
          </div>

          {/* Right sidebar */}
          <OfficeSidebar activeView={officeView} onViewChange={setOfficeView} />
        </div>
      </div>
    </AgentStoreProvider>
  );
}
