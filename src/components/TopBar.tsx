"use client";

import React from "react";

interface TopBarProps {
  workModeActive: boolean;
  onSwitchToWork: () => void;
  onSwitchToOffice: () => void;
}

export function TopBar({ workModeActive, onSwitchToWork, onSwitchToOffice }: TopBarProps) {
  const zen = {
    background: "#1A1A18",
    borderBottom: "1px solid #3A3A36",
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingX: 16,
    fontFamily: '"Segoe UI Semilight", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  } as const;

  const brandStyle = {
    fontFamily: '"Noto Serif JP", Georgia, serif',
    fontSize: 13,
    color: "#B8A07E",
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
    border: "1px solid #3A3A36",
    color: "#7A7A72",
  };

  const pillActive = {
    ...pillBase,
    background: "rgba(184, 160, 126, 0.12)",
    border: "1px solid rgba(184, 160, 126, 0.35)",
    color: "#B8A07E",
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
    background: "#7D8C6C",
    boxShadow: "0 0 5px rgba(125, 140, 108, 0.5)",
    flexShrink: 0,
  };

  const statusText = {
    color: "#7A7A72",
    fontSize: 10,
    letterSpacing: "0.05em",
    userSelect: "none" as const,
  };

  return (
    <div style={zen}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={brandStyle}>hq</span>
      </div>

      {/* Mode toggle pills */}
      <div style={{ display: "flex", gap: 4 }}>
        <button
          style={workModeActive ? pillActive : pillInactive}
          onClick={onSwitchToWork}
        >
          ⚡ work
        </button>
        <button
          style={!workModeActive ? pillActive : pillInactive}
          onClick={onSwitchToOffice}
        >
          🏢 office
        </button>
      </div>

      {/* Status */}
      <div style={statusStyle}>
        <div style={statusDot} />
        <span style={statusText}>systems online</span>
      </div>
    </div>
  );
}
