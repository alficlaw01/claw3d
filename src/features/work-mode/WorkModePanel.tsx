"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { useAgentChat } from "@/features/work-mode/useAgentChat";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AgentConfig {
  id: string;
  name: string;
  emoji: string;
}

const ALL_AGENTS: AgentConfig[] = [
  { id: "alfi",   name: "Alfi",   emoji: "🤝" },
  { id: "scout",  name: "Scout",  emoji: "🔍" },
  { id: "nova",   name: "Nova",   emoji: "🌸" },
  { id: "atlas",  name: "Atlas",  emoji: "🗺️" },
  { id: "benito", name: "Benito", emoji: "🐇" },
  { id: "bloom",  name: "Bloom",  emoji: "🌺" },
  { id: "pixel",  name: "Pixel",  emoji: "🎨" },
  { id: "pulse",  name: "Pulse",  emoji: "💓" },
  { id: "cupid",  name: "Cupid",  emoji: "💘" },
  { id: "judge",  name: "Judge",  emoji: "⚖️" },
  { id: "forge",  name: "Forge",  emoji: "🔨" },
];

const AGENT_EMOJI: Record<string, string> = {
  alfi: "🤝", scout: "🔍", nova: "🌸", atlas: "🗺️",
  benito: "🐇", bloom: "🌺", pixel: "🎨", pulse: "💓",
  cupid: "💘", judge: "⚖️", forge: "🔨",
};

// ─── Zen palette ─────────────────────────────────────────────────────────────

const Z = {
  sumi:       "#F0E6D3",
  charcoal:   "#E5D9C3",
  wabiGold:   "#2D4A3E",
  matcha:     "#3A6B55",
  clay:       "#8B6F4E",
  ricePaper:  "#2C2416",
  stone:      "#7A6F5E",
  bamboo:     "#D4C4A8",
  bambooLight:"#DDD0B8",
} as const;

// ─── Chat Panel ───────────────────────────────────────────────────────────────

function ChatPanel({ selectedAgent }: { selectedAgent: string }) {
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState(selectedAgent);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage: sendToAgent, loading } = useAgentChat(selected);

  useEffect(() => {
    setSelected(selectedAgent);
  }, [selectedAgent]);

  const emoji = AGENT_EMOJI[selected] ?? "🤖";
  const agentName = ALL_AGENTS.find(a => a.id === selected)?.name ?? selected;

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    void sendToAgent(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: Z.charcoal,
      borderRight: `1px solid ${Z.bamboo}`,
      overflow: "hidden",
    }}>
      {/* Header / Agent selector */}
      <div style={{
        padding: "10px 12px 8px",
        borderBottom: `1px solid ${Z.bamboo}`,
        flexShrink: 0,
      }}>
        <select
          value={selected}
          onChange={e => {
            setSelected(e.target.value);
          }}
          style={{
            width: "100%",
            padding: "6px 28px 6px 10px",
            background: Z.sumi,
            border: `1px solid ${Z.bamboo}`,
            borderRadius: 6,
            color: Z.wabiGold,
            fontSize: 12,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            cursor: "pointer",
            outline: "none",
            appearance: "none",
            WebkitAppearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23B8A07E' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
          }}
        >
          {ALL_AGENTS.map(a => (
            <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "12px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}>
        {messages.length === 0 && (
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            color: Z.stone,
            textAlign: "center",
            padding: 20,
          }}>
            <span style={{ fontSize: 32, opacity: 0.4 }}>{emoji}</span>
            <p style={{ fontSize: 12, fontWeight: 600, color: Z.stone }}>Chat with {agentName}</p>
            <p style={{ fontSize: 10, color: Z.bamboo, fontFamily: "IBM Plex Mono, monospace" }}>
              Connected via gateway
            </p>
          </div>
        )}
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div style={{
              maxWidth: "85%",
              padding: "8px 12px",
              borderRadius: msg.role === "user"
                ? "12px 12px 4px 12px"
                : "12px 12px 12px 4px",
              background: msg.role === "user" ? Z.clay : Z.charcoal,
              border: msg.role === "agent" ? `1px solid ${Z.bamboo}` : "none",
              color: msg.role === "user" ? "#fff" : Z.ricePaper,
              fontSize: 13,
              lineHeight: 1.45,
              wordBreak: "break-word",
              display: "flex",
              alignItems: "flex-start",
              gap: 6,
            }}>
              {msg.role === "agent" && (
                <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{emoji}</span>
              )}
              <span>{msg.text}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{
        padding: "10px",
        borderTop: `1px solid ${Z.bamboo}`,
        display: "flex",
        gap: 8,
        flexShrink: 0,
        background: Z.sumi,
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${agentName}…`}
          rows={2}
          style={{
            flex: 1,
            padding: "8px 12px",
            background: Z.charcoal,
            border: `1px solid ${Z.bamboo}`,
            borderRadius: 8,
            color: Z.ricePaper,
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            resize: "none",
            outline: "none",
            lineHeight: 1.4,
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          style={{
            padding: "8px 16px",
            background: (!input.trim() || loading) ? Z.bamboo : Z.wabiGold,
            border: "none",
            borderRadius: 8,
            color: (!input.trim() || loading) ? Z.stone : Z.sumi,
            fontSize: 12,
            fontWeight: 700,
            cursor: (!input.trim() || loading) ? "not-allowed" : "pointer",
            fontFamily: "Inter, sans-serif",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}

// ─── Resizable Split ─────────────────────────────────────────────────────────

function ResizableSplit({
  topHeight,
  setTopHeight,
  topContent,
  bottomContent,
}: {
  topHeight: number;
  setTopHeight: (h: number) => void;
  topContent: React.ReactNode;
  bottomContent: React.ReactNode;
}) {
  const isDragging = useRef(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const vh = window.innerHeight - 40; // subtract topbar height
      const fraction = ((ev.clientY - 40) / vh) * 100;
      setTopHeight(Math.min(80, Math.max(20, fraction)));
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [setTopHeight]);

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      <div style={{ height: `${topHeight}%`, overflow: "hidden" }}>
        {topContent}
      </div>
      <div
        onMouseDown={onMouseDown}
        style={{
          height: 6,
          background: Z.sumi,
          borderTop: `1px solid ${Z.bamboo}`,
          borderBottom: `1px solid ${Z.bamboo}`,
          cursor: "row-resize",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          userSelect: "none",
        }}
      >
        <div style={{
          width: 48,
          height: 3,
          background: Z.bamboo,
          borderRadius: 2,
        }} />
      </div>
      <div style={{ height: `${100 - topHeight}%`, overflow: "hidden" }}>
        {bottomContent}
      </div>
    </div>
  );
}

// ─── WorkModePanel ───────────────────────────────────────────────────────────

export function WorkModePanel({
  panelAgents,
  onPanelAgentChange: _onPanelAgentChange,
  topHeight,
  setTopHeight,
  onSwitchToOffice,
}: {
  panelAgents: string[];
  onPanelAgentChange: (index: number) => (id: string) => void;
  topHeight: number;
  setTopHeight: (h: number) => void;
  onSwitchToOffice: () => void;
}) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: Z.sumi,
      fontFamily: '"Segoe UI Semilight", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
      overflow: "hidden",
    }}>
      {/* Consistent Zen top bar — shared with Office Mode */}
      <TopBar
        workModeActive={true}
        onSwitchToWork={() => {}}
        onSwitchToOffice={onSwitchToOffice}
      />

      {/* Resizable split: chat panels + terminal */}
      <ResizableSplit
        topHeight={topHeight}
        setTopHeight={setTopHeight}
        topContent={
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            height: "100%",
            background: Z.sumi,
          }}>
            {panelAgents.map((agentId, i) => (
              <ChatPanel
                key={`${agentId}-${i}`}
                selectedAgent={agentId}
              />
            ))}
          </div>
        }
        bottomContent={
          <div style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            background: "#111110",
          }}>
            {/* Terminal titlebar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 16px",
              background: Z.sumi,
              borderTop: `1px solid ${Z.bamboo}`,
              flexShrink: 0,
            }}>
              <span style={{
                color: Z.stone,
                fontSize: 11,
                fontFamily: "IBM Plex Mono, monospace",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}>
                Terminal
              </span>
              <span style={{
                color: Z.bamboo,
                fontSize: 10,
                fontFamily: "IBM Plex Mono, monospace",
              }}>
                https://ttyd.alficlaw.uk
              </span>
            </div>
            {/* Terminal iframe */}
            <iframe
              src="https://ttyd.alficlaw.uk"
              style={{
                flex: 1,
                border: "none",
                background: "#111110",
                width: "100%",
              }}
              allow="clipboard-read; clipboard-write"
              title="Terminal"
            />
          </div>
        }
      />
    </div>
  );
}
