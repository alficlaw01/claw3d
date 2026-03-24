'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

interface AgentConfig {
  id: string;
  name: string;
  emoji: string;
}

const ALL_AGENTS: AgentConfig[] = [
  { id: 'alfi',   name: 'Alfi',   emoji: '🤝' },
  { id: 'scout',  name: 'Scout',  emoji: '🔍' },
  { id: 'nova',   name: 'Nova',   emoji: '🌸' },
  { id: 'atlas',  name: 'Atlas',  emoji: '🗺️' },
  { id: 'benito', name: 'Benito', emoji: '🐇' },
  { id: 'bloom',  name: 'Bloom',  emoji: '🌺' },
  { id: 'pixel',  name: 'Pixel',  emoji: '🎨' },
  { id: 'pulse',  name: 'Pulse',  emoji: '💓' },
  { id: 'cupid',  name: 'Cupid',  emoji: '💘' },
  { id: 'judge',  name: 'Judge',  emoji: '⚖️' },
  { id: 'forge',  name: 'Forge',  emoji: '🔨' },
];

const DEFAULT_PANELS = ['alfi', 'scout', 'benito', 'pixel', 'forge'];

const AGENT_EMOJI: Record<string, string> = {
  alfi: '🤝', scout: '🔍', nova: '🌸', atlas: '🗺️',
  benito: '🐇', bloom: '🌺', pixel: '🎨', pulse: '💓',
  cupid: '💘', judge: '⚖️', forge: '🔨',
};

const AGENT_RESPONSES = [
  'Got it. On it — will update you shortly.',
  'Interesting. Let me think about that and get back to you.',
  'Roger that. Running the numbers now.',
  'Understood. I\'ll flag this for the next sprint.',
  'Acknowledged. Bringing the rest of the team up to speed.',
  'Copy that. Diving into it right now.',
  'Noted. Let me coordinate with the relevant parties.',
  'Sure thing. I\'ll have an update for you soon.',
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    background: '#0B1426',
    fontFamily: 'Inter, system-ui, sans-serif',
    overflow: 'hidden',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: 52,
    background: '#0D1829',
    borderBottom: '1px solid #1E2D4A',
    flexShrink: 0,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  brandIcon: {
    fontSize: 20,
  },
  brandTitle: {
    color: '#C9A84C',
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
  },
  modeToggle: {
    display: 'flex',
    background: '#111D32',
    borderRadius: 8,
    padding: 3,
    gap: 2,
  },
  modeBtn: (active: boolean) => ({
    padding: '6px 16px',
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    transition: 'all 0.2s ease',
    background: active ? '#1E2D4A' : 'transparent',
    color: active ? '#C9A84C' : '#5A7A9A',
  }),
  statusPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '5px 12px',
    background: '#111D32',
    borderRadius: 20,
    border: '1px solid #1E2D4A',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#4ade80',
    boxShadow: '0 0 6px #4ade8088',
  },
  statusText: {
    color: '#5A7A9A',
    fontSize: 11,
    fontFamily: 'IBM Plex Mono, monospace',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
  },
  splitContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  panelsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    height: '100%',
    gap: 1,
    background: '#0B1426',
  },
  chatPanel: {
    display: 'flex',
    flexDirection: 'column' as const,
    background: '#0F1E35',
    borderRight: '1px solid #1A2B47',
    overflow: 'hidden',
  },
  chatHeader: {
    padding: '10px 12px 8px',
    borderBottom: '1px solid #1A2B47',
    flexShrink: 0,
  },
  agentSelect: {
    width: '100%',
    padding: '6px 10px',
    background: '#162238',
    border: '1px solid #1E2D4A',
    borderRadius: 6,
    color: '#C9A84C',
    fontSize: 12,
    fontFamily: 'Inter, sans-serif',
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23C9A84C' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    paddingRight: 28,
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '12px 10px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  chatEmpty: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    color: '#3A5A7A',
    textAlign: 'center' as const,
    padding: 20,
  },
  chatEmptyIcon: {
    fontSize: 32,
    opacity: 0.5,
  },
  chatEmptySub: {
    fontSize: 10,
    color: '#2A4060',
    marginTop: 4,
    fontFamily: 'IBM Plex Mono, monospace',
  },
  bubbleUser: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  bubbleAgent: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 6,
  },
  bubbleUserInner: {
    maxWidth: '85%',
    padding: '8px 12px',
    background: '#4FA8C9',
    borderRadius: '12px 12px 4px 12px',
    color: '#fff',
    fontSize: 13,
    lineHeight: 1.45,
    wordBreak: 'break-word' as const,
  },
  bubbleAgentInner: {
    maxWidth: '85%',
    padding: '8px 12px',
    background: '#1E293B',
    borderRadius: '12px 12px 12px 4px',
    color: '#D1D5DB',
    fontSize: 13,
    lineHeight: 1.45,
    wordBreak: 'break-word' as const,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 6,
  },
  bubbleEmoji: {
    fontSize: 14,
    flexShrink: 0,
    marginTop: 1,
  },
  chatInputArea: {
    padding: '10px',
    borderTop: '1px solid #1A2B47',
    display: 'flex',
    gap: 8,
    flexShrink: 0,
    background: '#0D1829',
  },
  chatInput: {
    flex: 1,
    padding: '8px 12px',
    background: '#162238',
    border: '1px solid #1E2D4A',
    borderRadius: 8,
    color: '#D1D5DB',
    fontSize: 13,
    fontFamily: 'Inter, sans-serif',
    resize: 'none' as const,
    outline: 'none',
    lineHeight: 1.4,
  },
  chatSendBtn: (disabled: boolean) => ({
    padding: '8px 16px',
    background: disabled ? '#1A2B47' : '#C9A84C',
    border: 'none',
    borderRadius: 8,
    color: disabled ? '#3A5A7A' : '#0B1426',
    fontSize: 12,
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'Inter, sans-serif',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap' as const,
  }),
  divider: {
    height: 6,
    background: '#0D1829',
    borderTop: '1px solid #1A2B47',
    borderBottom: '1px solid #1A2B47',
    cursor: 'row-resize',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    userSelect: 'none' as const,
  },
  dividerHandle: {
    width: 48,
    height: 3,
    background: '#2A3D5A',
    borderRadius: 2,
  },
  terminalArea: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    background: '#060D18',
  },
  terminalTitlebar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 16px',
    background: '#0D1829',
    borderBottom: '1px solid #1A2B47',
    flexShrink: 0,
  },
  terminalTitle: {
    color: '#5A7A9A',
    fontSize: 11,
    fontFamily: 'IBM Plex Mono, monospace',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  },
  terminalUrl: {
    color: '#2A4060',
    fontSize: 10,
    fontFamily: 'IBM Plex Mono, monospace',
  },
  terminalIframe: {
    flex: 1,
    border: 'none',
    background: '#060D18',
    width: '100%',
  },
};

// ─── Chat Panel ───────────────────────────────────────────────────────────────

function ChatPanel({ selectedAgent }: { selectedAgent: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selected, setSelected] = useState(selectedAgent);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(selectedAgent);
    setMessages([]);
  }, [selectedAgent]);

  const emoji = AGENT_EMOJI[selected] ?? '🤖';
  const agentName = ALL_AGENTS.find(a => a.id === selected)?.name ?? selected;

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: `${Date.now()}-u`, role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    scrollToBottom();

    setTimeout(() => {
      const agentMsg: Message = {
        id: `${Date.now()}-a`,
        role: 'agent',
        text: AGENT_RESPONSES[Math.floor(Math.random() * AGENT_RESPONSES.length)],
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, agentMsg]);
      scrollToBottom();
    }, 600 + Math.random() * 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={styles.chatPanel}>
      <div style={styles.chatHeader}>
        <select
          style={styles.agentSelect}
          value={selected}
          onChange={e => {
            setSelected(e.target.value);
            setMessages([]);
          }}
        >
          {ALL_AGENTS.map(a => (
            <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>
          ))}
        </select>
      </div>

      <div style={styles.chatMessages}>
        {messages.length === 0 && (
          <div style={styles.chatEmpty}>
            <span style={styles.chatEmptyIcon}>{emoji}</span>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#4A6A8A' }}>Chat with {agentName}</p>
            <p style={styles.chatEmptySub}>Messages are local for now</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} style={msg.role === 'user' ? styles.bubbleUser : styles.bubbleAgent}>
            <div style={msg.role === 'user' ? styles.bubbleUserInner : styles.bubbleAgentInner}>
              {msg.role === 'agent' && <span style={styles.bubbleEmoji}>{emoji}</span>}
              <span>{msg.text}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={styles.chatInputArea}>
        <textarea
          style={styles.chatInput}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${agentName}…`}
          rows={2}
        />
        <button
          style={styles.chatSendBtn(!input.trim())}
          onClick={sendMessage}
          disabled={!input.trim()}
        >
          Send
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
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const vh = window.innerHeight - 52; // subtract topbar
      const fraction = ((ev.clientY - 52) / vh) * 100;
      setTopHeight(Math.min(80, Math.max(20, fraction)));
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [setTopHeight]);

  return (
    <div style={styles.splitContainer}>
      <div style={{ height: `${topHeight}%`, overflow: 'hidden' }}>
        {topContent}
      </div>
      <div style={styles.divider} onMouseDown={onMouseDown}>
        <div style={styles.dividerHandle} />
      </div>
      <div style={{ height: `${100 - topHeight}%`, overflow: 'hidden' }}>
        {bottomContent}
      </div>
    </div>
  );
}

// ─── WorkModePanel ───────────────────────────────────────────────────────────

export function WorkModePanel({
  panelAgents,
  onPanelAgentChange,
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
    <div style={styles.root}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.brand}>
          <span style={styles.brandIcon}>⚡</span>
          <span style={styles.brandTitle}>Work Mode</span>
        </div>

        <div style={styles.modeToggle}>
          <button
            style={styles.modeBtn(false)}
            onClick={onSwitchToOffice}
          >
            🏢 Office
          </button>
          <button style={styles.modeBtn(true)}>
            ⚡ Work
          </button>
        </div>

        <div style={styles.statusPill}>
          <div style={styles.statusDot} />
          <span style={styles.statusText}>Systems online</span>
        </div>
      </div>

      {/* Resizable split */}
      <ResizableSplit
        topHeight={topHeight}
        setTopHeight={setTopHeight}
        topContent={
          <div style={styles.panelsRow}>
            {panelAgents.map((agentId, i) => (
              <ChatPanel
                key={`${agentId}-${i}`}
                selectedAgent={agentId}
              />
            ))}
          </div>
        }
        bottomContent={
          <div style={styles.terminalArea}>
            <div style={styles.terminalTitlebar}>
              <span style={styles.terminalTitle}>Terminal</span>
              <span style={styles.terminalUrl}>https://ttyd.alficlaw.uk</span>
            </div>
            <iframe
              src="https://ttyd.alficlaw.uk"
              style={styles.terminalIframe}
              allow="clipboard-read; clipboard-write"
              title="Terminal"
            />
          </div>
        }
      />
    </div>
  );
}
