"use client";
import { Suspense, useEffect } from "react";
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

  return (
    <AgentStoreProvider>
      <div style={{ height: "100vh", position: "relative", flexShrink: 0 }}>
        <Suspense fallback={null}>
          <OfficeScreen showOpenClawConsole={showOpenClawConsole} />
        </Suspense>

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
