"use client";

import React from "react";

interface TopBarProps {
  workModeActive: boolean;
  onSwitchToWork: () => void;
  onSwitchToOffice: () => void;
}

export function TopBar({ workModeActive, onSwitchToWork, onSwitchToOffice }: TopBarProps) {
  const zen = {
    background: "#0F1724",
    borderBottom: "1px solid #1E293B",
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingX: 16,
    fontFamily: '"Segoe UI Semilight", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  } as const;

  const brandStyle = {
    fontFamily: '"Segoe UI Semilight", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 13,
    color: "#FFFFFF",
    letterSpacing: "0.02em",
    userSelect: "none" as const,
  };

  const pillBase = {
    padding: "4px 14px",
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    transition: "all 0.2s ease",
    letterSpacing: "0.03em",
  };

  const pillInactive = {
    ...pillBase,
    background: "transparent",
    border: "1px solid #1E293B",
    color: "#94A3B8",
  };

  const pillActive = {
    ...pillBase,
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "#FFFFFF",
  };

  const statusStyle = {
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  const statusDot = {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#34D399",
    boxShadow: "0 0 5px rgba(52, 211, 153, 0.5)",
    flexShrink: 0,
  };

  const statusText = {
    color: "#94A3B8",
    fontSize: 10,
    letterSpacing: "0.05em",
    userSelect: "none" as const,
  };

  return (
    <div style={zen}>
      {/* Spacer */}
      <div style={{ width: 80 }} />

      {/* Mode toggle pills */}
      <div style={{ display: "flex", gap: 4 }}>
        <button
          style={workModeActive ? pillActive : pillInactive}
          onClick={onSwitchToWork}
        >
          ⚡ Work
        </button>
        <button
          style={!workModeActive ? pillActive : pillInactive}
          onClick={onSwitchToOffice}
        >
          🏢 Office
        </button>
      </div>

      {/* Status */}
      <div style={statusStyle}>
        <div style={statusDot} />
        <span style={statusText}>Systems Online</span>
      </div>
    </div>
  );
}
