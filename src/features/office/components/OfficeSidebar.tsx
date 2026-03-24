"use client";

import React, { useState } from "react";

export type OfficeView = "office" | "fleet" | "tasks" | "usage";

interface NavItem {
  id: OfficeView;
  emoji: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "office", emoji: "🏢", label: "3D Office" },
  { id: "fleet",  emoji: "👥", label: "Fleet"     },
  { id: "tasks",  emoji: "📋", label: "Tasks"     },
  { id: "usage",  emoji: "📊", label: "Usage"     },
];

interface OfficeSidebarProps {
  activeView: OfficeView;
  onViewChange: (view: OfficeView) => void;
}

export function OfficeSidebar({ activeView, onViewChange }: OfficeSidebarProps) {
  const [tooltip, setTooltip] = useState<OfficeView | null>(null);

  return (
    <div style={{
      width: 48,
      flexShrink: 0,
      background: "#0F1724",
      borderLeft: "1px solid #1E293B",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: 16,
      gap: 4,
      position: "relative",
    }}>
      {NAV_ITEMS.map(item => {
        const isActive = activeView === item.id;
        return (
          <div key={item.id} style={{ position: "relative" }}>
            <button
              onClick={() => onViewChange(item.id)}
              onMouseEnter={() => setTooltip(item.id)}
              onMouseLeave={() => setTooltip(null)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: isActive ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent",
                background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                opacity: isActive ? 1 : 0.55,
                transition: "all 0.15s ease",
                padding: 0,
              }}
              aria-label={item.label}
            >
              <span style={{ lineHeight: 1 }}>{item.emoji}</span>
            </button>

            {/* Tooltip */}
            {tooltip === item.id && (
              <div style={{
                position: "absolute",
                right: "calc(100% + 8px)",
                top: "50%",
                transform: "translateY(-50%)",
                background: "#1A2332",
                border: "1px solid #1E293B",
                color: "#FFFFFF",
                fontSize: 11,
                fontFamily: '"Segoe UI Semilight", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
                padding: "4px 10px",
                borderRadius: 6,
                whiteSpace: "nowrap",
                pointerEvents: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                zIndex: 1000,
              }}>
                {item.label}
                {/* Arrow */}
                <div style={{
                  position: "absolute",
                  right: -5,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 0,
                  height: 0,
                  borderTop: "4px solid transparent",
                  borderBottom: "4px solid transparent",
                  borderLeft: "5px solid #1E293B",
                }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
