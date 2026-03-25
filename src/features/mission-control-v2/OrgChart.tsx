'use client'

interface Agent {
  emoji: string
  name: string
  role: string
  model: string
  status: 'active' | 'standby' | 'tbd'
  children?: Agent[]
}

const MODEL_SHORT: Record<string, string> = {
  'claude-opus-4-6': 'Opus 4.6',
  'claude-sonnet-4-6': 'Sonnet 4.6',
  'MiniMax-M2.7': 'MiniMax',
}

const STATUS_COLORS: Record<string, string> = {
  active: '#10B981',
  standby: '#F59E0B',
  tbd: '#475569',
}

const CARD_WIDTH = 160
const CARD_HEIGHT = 110
const H_GAP = 20
const V_GAP = 60

const ORG: Agent = {
  emoji: '👔',
  name: 'Jason',
  role: 'CEO',
  model: 'human',
  status: 'active',
  children: [
    {
      emoji: '🤝',
      name: 'Alfi',
      role: 'CTO / Orchestrator',
      model: 'claude-opus-4-6',
      status: 'active',
      children: [
        {
          emoji: '🔍',
          name: 'Scout',
          role: 'Commercial Intelligence',
          model: 'claude-opus-4-6',
          status: 'standby',
        },
        {
          emoji: '🌸',
          name: 'Nova',
          role: 'Project Lead — Hana',
          model: 'claude-sonnet-4-6',
          status: 'standby',
          children: [
            { emoji: '🐇', name: 'Benito', role: 'Backend Engineer', model: 'MiniMax-M2.7', status: 'standby' },
            { emoji: '🌺', name: 'Bloom', role: 'Frontend / Mobile Engineer', model: 'MiniMax-M2.7', status: 'tbd' },
            { emoji: '💓', name: 'Pulse', role: 'Matching Engine', model: 'MiniMax-M2.7', status: 'tbd' },
            { emoji: '💘', name: 'Cupid', role: 'QA Reviewer', model: 'claude-opus-4-6', status: 'tbd' },
          ],
        },
        {
          emoji: '🗺️',
          name: 'Atlas',
          role: 'Project Lead — Flow',
          model: 'claude-sonnet-4-6',
          status: 'standby',
          children: [
            { emoji: '🐇', name: 'Benito', role: 'Backend Engineer', model: 'MiniMax-M2.7', status: 'standby' },
            { emoji: '🎨', name: 'Pixel', role: 'Frontend Engineer', model: 'MiniMax-M2.7', status: 'active' },
            { emoji: '⚖️', name: 'Judge', role: 'QA Reviewer', model: 'claude-opus-4-6', status: 'tbd' },
          ],
        },
        {
          emoji: '🔨',
          name: 'Forge',
          role: 'Bootstrap Squad Lead',
          model: 'claude-sonnet-4-6',
          status: 'standby',
          children: [
            { emoji: '✍️', name: 'Quill', role: 'Content Agent', model: 'MiniMax-M2.7', status: 'standby' },
            { emoji: '📈', name: 'Chip', role: 'Paper Trader', model: 'MiniMax-M2.7', status: 'standby' },
            { emoji: '🪙', name: 'Mint', role: 'Monetisation', model: 'MiniMax-M2.7', status: 'standby' },
          ],
        },
      ],
    },
  ],
}

type LayoutNode = {
  agent: Agent
  x: number
  y: number
  width: number
  height: number
  children: LayoutNode[]
}

function calcSubtreeWidth(agent: Agent): number {
  if (!agent.children || agent.children.length === 0) return CARD_WIDTH
  const childWidths = agent.children.map(calcSubtreeWidth)
  const totalChildWidth = childWidths.reduce((a, b) => a + b, 0)
  const totalGap = (agent.children.length - 1) * H_GAP
  return Math.max(CARD_WIDTH, totalChildWidth + totalGap)
}

function calcSubtreeHeight(agent: Agent): number {
  if (!agent.children || agent.children.length === 0) return CARD_HEIGHT
  const maxChildH = Math.max(...agent.children.map(c => calcSubtreeHeight(c)))
  return CARD_HEIGHT + V_GAP + maxChildH
}

function layoutTree(agent: Agent, x: number, y: number): LayoutNode {
  const width = calcSubtreeWidth(agent)
  const height = calcSubtreeHeight(agent)

  if (!agent.children || agent.children.length === 0) {
    return { agent, x: x + width / 2, y, width, height, children: [] }
  }

  const childNodes: LayoutNode[] = []
  const childY = y + CARD_HEIGHT + V_GAP
  const totalChildWidth = agent.children.reduce((_, c) => calcSubtreeWidth(c), 0) + (agent.children.length - 1) * H_GAP
  let curX = x + (width - totalChildWidth) / 2

  for (const child of agent.children) {
    const cw = calcSubtreeWidth(child)
    childNodes.push(layoutTree(child, curX, childY))
    curX += cw + H_GAP
  }

  return { agent, x: x + width / 2, y, width, height, children: childNodes }
}

function renderConnectors(node: LayoutNode, childNodes: LayoutNode[]): React.ReactNode[] {
  if (!node.children || node.children.length === 0) return []

  const lines: React.ReactNode[] = []
  const parentCX = node.x
  const parentCY = node.y + CARD_HEIGHT
  const childTopCY = node.y + CARD_HEIGHT + V_GAP

  // Draw vertical stem from parent bottom to elbow
  lines.push(
    <line
      key={`${node.agent.name}-v`}
      x1={parentCX} y1={parentCY}
      x2={parentCX} y2={childTopCY}
      stroke="#1E293B" strokeWidth={1}
    />
  )

  if (node.children.length > 1) {
    // Horizontal bar across all children
    const minCX = Math.min(...node.children.map(c => c.x))
    const maxCX = Math.max(...node.children.map(c => c.x))
    lines.push(
      <line
        key={`${node.agent.name}-h`}
        x1={minCX} y1={childTopCY}
        x2={maxCX} y2={childTopCY}
        stroke="#1E293B" strokeWidth={1}
      />
    )
  }

  // Vertical drops to each child
  for (const child of node.children) {
    lines.push(
      <line
        key={`${node.agent.name}-c-${child.agent.name}`}
        x1={child.x} y1={childTopCY}
        x2={child.x} y2={child.y}
        stroke="#1E293B" strokeWidth={1}
      />
    )
  }

  for (const child of node.children) {
    lines.push(...renderConnectors(child, node.children))
  }

  return lines
}

function AgentCard({ agent }: { agent: Agent }) {
  const modelShort = MODEL_SHORT[agent.model] || agent.model
  const statusColor = STATUS_COLORS[agent.status]

  return (
    <div style={{
      position: 'absolute',
      width: CARD_WIDTH,
      background: '#1A2332',
      border: '1px solid #1E293B',
      borderRadius: 10,
      padding: '12px 16px',
      textAlign: 'center',
    }}>
      <div style={{
        position: 'absolute',
        top: 10, right: 10,
        width: 7, height: 7,
        borderRadius: '50%',
        background: statusColor,
        boxShadow: `0 0 6px ${statusColor}`,
      }} />
      <div style={{ fontSize: 24, marginBottom: 6 }}>{agent.emoji}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>
        {agent.name}
      </div>
      <div style={{ fontSize: 10, color: '#64748B', marginBottom: 6, lineHeight: 1.3 }}>
        {agent.role}
      </div>
      {agent.model !== 'human' && (
        <div style={{
          display: 'inline-block',
          fontSize: 9,
          padding: '2px 7px',
          borderRadius: 4,
          background: '#0F1724',
          color: '#94A3B8',
          border: '1px solid #1E293B',
        }}>
          {modelShort}
        </div>
      )}
    </div>
  )
}

export default function OrgChart() {
  const root = layoutTree(ORG, 0, 0)
  const svgWidth = root.width + 80
  const svgHeight = root.height + 40

  const connectors = renderConnectors(root, [])

  return (
    <div style={{ padding: 24, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 4 }}>👥 Org Chart</h1>
        <p style={{ fontSize: 13, color: '#64748B' }}>Agent task force hierarchy</p>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748B' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        ))}
      </div>

      {/* Tree */}
      <div style={{ overflowX: 'auto', paddingBottom: 24 }}>
        <div style={{ position: 'relative', width: svgWidth, height: svgHeight, margin: '0 auto' }}>
          {/* SVG connector lines */}
          <svg
            width={svgWidth}
            height={svgHeight}
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}
          >
            {connectors}
          </svg>

          {/* Agent cards — positioned absolutely */}
          {function renderCards(node: LayoutNode): React.ReactNode {
            return (
              <>
                <div style={{
                  position: 'absolute',
                  left: node.x - CARD_WIDTH / 2,
                  top: node.y,
                }}>
                  <AgentCard agent={node.agent} />
                </div>
                {node.children.map(child => renderCards(child))}
              </>
            )
          }(root)}
        </div>
      </div>
    </div>
  )
}
