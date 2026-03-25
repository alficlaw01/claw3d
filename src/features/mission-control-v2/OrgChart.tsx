'use client'

import React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = 'active' | 'standby' | 'tbd'

interface NodeDef {
  emoji: string
  name: string
  role: string
  model: string
  status: Status
  cx: number   // horizontal center
  y: number    // top edge
  compact?: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_W = 160
const CARD_H = 110
const COMPACT_W = 100
const COMPACT_H = 100
const CANVAS_W = 1200
const CANVAS_H = 860

const MODEL_SHORT: Record<string, string> = {
  'claude-opus-4-6': 'Opus 4.6',
  'claude-sonnet-4-6': 'Sonnet 4.6',
  'MiniMax-M2.7': 'MiniMax M2.7',
}

const STATUS_COLORS: Record<Status, string> = {
  active:  '#10B981',
  standby: '#F59E0B',
  tbd:     '#475569',
}

// ─── Node positions ───────────────────────────────────────────────────────────
//
//  Layer 0 (y=0):   Jason
//  Layer 1 (y=180): Alfi
//  Layer 2 (y=360): Scout ──────── Judge   ← QA Gate (both review everything)
//                      ╲   ╳   ╱
//  Layer 3 (y=540): Nova         Forge     ← Pod leads
//  Layer 4 (y=720): Hana builders  Bootstrap builders

const NODES: Record<string, NodeDef> = {
  jason:  { cx: 650,  y: 0,   emoji: '👔', name: 'Jason',  role: 'CEO',                  model: 'human',             status: 'active'  },
  alfi:   { cx: 650,  y: 180, emoji: '🤝', name: 'Alfi',   role: 'CTO / Orchestrator',   model: 'claude-opus-4-6',   status: 'active'  },
  scout:  { cx: 350,  y: 360, emoji: '🔍', name: 'Scout',  role: 'QA Gate',              model: 'claude-opus-4-6',   status: 'standby' },
  judge:  { cx: 950,  y: 360, emoji: '⚖️', name: 'Judge',  role: 'QA Gate',              model: 'claude-opus-4-6',   status: 'standby' },
  nova:   { cx: 350,  y: 540, emoji: '🌸', name: 'Nova',   role: 'Project Lead — Hana',  model: 'claude-sonnet-4-6', status: 'standby' },
  forge:  { cx: 950,  y: 540, emoji: '🔨', name: 'Forge',  role: 'Bootstrap Squad Lead', model: 'claude-opus-4-6',   status: 'standby' },
  // Hana builders — centred under Nova (cx=350), 5 × 100px + 4 × 16px gap = 564px
  benito: { cx: 118,  y: 720, emoji: '🐇', name: 'Benito', role: 'Backend',              model: 'MiniMax-M2.7', status: 'standby', compact: true },
  bloom:  { cx: 234,  y: 720, emoji: '🌺', name: 'Bloom',  role: 'Mobile',               model: 'MiniMax-M2.7', status: 'tbd',     compact: true },
  pixel:  { cx: 350,  y: 720, emoji: '🎨', name: 'Pixel',  role: 'Frontend',             model: 'MiniMax-M2.7', status: 'standby', compact: true },
  pulse:  { cx: 466,  y: 720, emoji: '💓', name: 'Pulse',  role: 'Matching',             model: 'MiniMax-M2.7', status: 'tbd',     compact: true },
  cupid:  { cx: 582,  y: 720, emoji: '💘', name: 'Cupid',  role: 'Engineer',             model: 'MiniMax-M2.7', status: 'tbd',     compact: true },
  // Bootstrap builders — centred under Forge (cx=950), 3 × 100px + 2 × 16px gap = 332px
  quill:  { cx: 834,  y: 720, emoji: '✍️', name: 'Quill',  role: 'Content',              model: 'MiniMax-M2.7', status: 'standby', compact: true },
  chip:   { cx: 950,  y: 720, emoji: '📈', name: 'Chip',   role: 'Trading',              model: 'MiniMax-M2.7', status: 'standby', compact: true },
  mint:   { cx: 1066, y: 720, emoji: '🪙', name: 'Mint',   role: 'Monetisation',         model: 'MiniMax-M2.7', status: 'standby', compact: true },
}

// ─── Edges (parent → child, top-down) ────────────────────────────────────────
// Scout and Judge both review ALL work — cross-connections create the X pattern.

const EDGES: [string, string][] = [
  ['jason',  'alfi'],
  ['alfi',   'scout'],
  ['alfi',   'judge'],
  ['scout',  'nova'],   // straight down
  ['scout',  'forge'],  // diagonal ╲
  ['judge',  'nova'],   // diagonal ╱
  ['judge',  'forge'],  // straight down
  ['nova',   'benito'],
  ['nova',   'bloom'],
  ['nova',   'pixel'],
  ['nova',   'pulse'],
  ['nova',   'cupid'],
  ['forge',  'quill'],
  ['forge',  'chip'],
  ['forge',  'mint'],
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function w(n: NodeDef) { return n.compact ? COMPACT_W : CARD_W }
function h(n: NodeDef) { return n.compact ? COMPACT_H : CARD_H }

// ─── AgentCard ────────────────────────────────────────────────────────────────

function AgentCard({ node }: { node: NodeDef }) {
  const modelShort = MODEL_SHORT[node.model] || node.model
  const statusColor = STATUS_COLORS[node.status]
  const compact = !!node.compact

  return (
    <div style={{
      position: 'absolute',
      left: node.cx - w(node) / 2,
      top: node.y,
      width: w(node),
      height: h(node),
      background: '#1A2332',
      border: '1px solid #1E293B',
      borderRadius: 10,
      padding: compact ? '8px 10px' : '12px 16px',
      textAlign: 'center',
      boxSizing: 'border-box',
    }}>
      {/* Status dot */}
      <div style={{
        position: 'absolute', top: 8, right: 8,
        width: 6, height: 6, borderRadius: '50%',
        background: statusColor,
        boxShadow: `0 0 6px ${statusColor}`,
      }} />
      <div style={{ fontSize: compact ? 22 : 30, marginBottom: compact ? 3 : 6 }}>{node.emoji}</div>
      <div style={{ fontSize: compact ? 13 : 17, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{node.name}</div>
      <div style={{ fontSize: compact ? 10 : 13, color: '#64748B', lineHeight: 1.3, marginBottom: compact ? 3 : 4 }}>{node.role}</div>
      {node.model !== 'human' && (
        <div style={{
          display: 'inline-block', fontSize: 11, padding: '3px 9px',
          borderRadius: 4, background: '#0F1724', color: '#94A3B8',
          border: '1px solid #1E293B',
        }}>
          {modelShort}
        </div>
      )}
    </div>
  )
}

// ─── OrgChart ─────────────────────────────────────────────────────────────────

export default function OrgChart() {
  return (
    <div style={{ padding: 24, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: '#fff', marginBottom: 4 }}>👥 Org Chart</h1>
        <p style={{ fontSize: 15, color: '#64748B' }}>Agent task force — updated 2026-03-25</p>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 28 }}>
        {(Object.entries(STATUS_COLORS) as [Status, string][]).map(([status, color]) => (
          <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#64748B' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        ))}
      </div>

      {/* Chart canvas */}
      <div style={{ overflowX: 'auto', paddingBottom: 24 }}>
        <div style={{ position: 'relative', width: CANVAS_W, height: CANVAS_H }}>

          {/* SVG connector lines */}
          <svg
            width={CANVAS_W}
            height={CANVAS_H}
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}
          >
            {EDGES.map(([fromId, toId]) => {
              const from = NODES[fromId]
              const to   = NODES[toId]
              return (
                <line
                  key={`${fromId}→${toId}`}
                  x1={from.cx}       y1={from.y + h(from)}
                  x2={to.cx}         y2={to.y}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth={1.5}
                />
              )
            })}
          </svg>

          {/* Agent cards */}
          {Object.values(NODES).map(node => (
            <AgentCard key={node.name} node={node} />
          ))}

        </div>
      </div>
    </div>
  )
}
