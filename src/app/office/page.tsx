"use client";
import { Suspense } from "react";
import { AgentStoreProvider } from "@/features/agents/state/store";
import { OfficeScreen } from "@/features/office/screens/OfficeScreen";
import { MissionControlPanel } from "@/features/mission-control/MissionControlPanel";

const ENABLED_RE = /^(1|true|yes|on)$/i;

const readDebugFlag = (value: string | undefined): boolean => {
  const normalized = (value ?? "").trim();
  if (!normalized) return true;
  return ENABLED_RE.test(normalized);
};

export default function OfficePage() {
  const showOpenClawConsole = readDebugFlag(process.env.DEBUG);

  return (
    <AgentStoreProvider>
      <div
        style={{ height: "100vh", position: "relative", flexShrink: 0 }}
        onWheel={(e) => {
          if (e.deltaY > 0) {
            document.getElementById("mission-control")?.scrollIntoView({ behavior: "smooth" });
          }
        }}
      >
        <Suspense fallback={null}>
          <OfficeScreen showOpenClawConsole={showOpenClawConsole} />
        </Suspense>
        {/* Scroll to Mission Control button */}
        <a
          href="#mission-control"
          style={{
            position: "absolute",
            bottom: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            background: "rgba(201,168,76,0.15)",
            border: "1px solid rgba(201,168,76,0.4)",
            color: "#C9A84C",
            padding: "8px 20px",
            borderRadius: "20px",
            fontFamily: "monospace",
            fontSize: "11px",
            textDecoration: "none",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            backdropFilter: "blur(4px)",
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
