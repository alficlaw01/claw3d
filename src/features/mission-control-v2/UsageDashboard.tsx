'use client'

import { useEffect, useState } from 'react'

interface DailyData {
  date: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  cost: number
}

interface ModelData {
  model: string
  tokens: number
  cost: number
  calls: number
}

interface AgentData {
  agent: string
  tokens: number
  cost: number
  calls: number
}

interface UsageResponse {
  daily: DailyData[]
  byModel: ModelData[]
  byAgent: AgentData[]
  totals: { tokens: number; cost: number; calls: number }
}

const AGENT_EMOJIS: Record<string, string> = {
  alfi: '🤝',
  main: '🤝',
  scout: '🔍',
  nova: '🌸',
  atlas: '🗺️',
  benito: '🐇',
  bloom: '🌺',
  pulse: '💓',
  cupid: '💘',
  pixel: '🎨',
  judge: '⚖️',
  forge: '🔨',
  quill: '✍️',
  chip: '📈',
  mint: '🪙',
  'claude-code': '🤖',
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toFixed(0)
}

function fmtCost(n: number) {
  if (n < 0.01) return '<$0.01'
  return '$' + n.toFixed(2)
}

function shortDate(s: string) {
  const d = new Date(s + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function UsageDashboard() {
  const [data, setData] = useState<UsageResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/usage')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ padding: 24, color: '#64748B' }}>Loading usage data…</div>
  )

  if (!data) return (
    <div style={{ padding: 24, color: '#EF4444' }}>Failed to load usage data.</div>
  )

  const maxDailyTokens = Math.max(...data.daily.map(d => d.totalTokens), 1)
  const maxModelTokens = Math.max(...data.byModel.map(m => m.tokens), 1)
  const maxAgentTokens = Math.max(...data.byAgent.map(a => a.tokens), 1)

  return (
    <div style={{ padding: 24, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 4 }}>📊 Usage</h1>
        <p style={{ fontSize: 13, color: '#64748B' }}>Token consumption across all agents</p>
      </div>

      {/* Totals row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Tokens', value: fmt(data.totals.tokens), sub: 'all time' },
          { label: 'Total Cost', value: fmtCost(data.totals.cost), sub: 'estimated' },
          { label: 'API Calls', value: data.totals.calls.toLocaleString(), sub: 'messages' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#1A2332',
            border: '1px solid #1E293B',
            borderRadius: 10,
            padding: '16px 20px',
          }}>
            <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 11, color: '#475569' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Daily bar chart */}
      <div style={{
        background: '#1A2332',
        border: '1px solid #1E293B',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#CBD5E1', marginBottom: 16 }}>
          Daily Tokens — Last 7 Days
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
          {data.daily.map(day => {
            const pct = day.totalTokens / maxDailyTokens
            return (
              <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 10, color: '#475569' }}>{fmt(day.totalTokens)}</div>
                <div style={{ width: '100%', position: 'relative', height: 80 }}>
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: `${Math.max(pct * 100, pct > 0 ? 4 : 0)}%`,
                    background: 'linear-gradient(180deg, #3B82F6, #1D4ED8)',
                    borderRadius: '4px 4px 0 0',
                  }} />
                  {day.totalTokens === 0 && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: '#1E293B',
                      borderRadius: 1,
                    }} />
                  )}
                </div>
                <div style={{ fontSize: 10, color: '#64748B', textAlign: 'center' }}>
                  {shortDate(day.date).split(' ').slice(0, 2).join(' ')}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Model breakdown */}
        <div style={{
          background: '#1A2332',
          border: '1px solid #1E293B',
          borderRadius: 10,
          padding: 20,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#CBD5E1', marginBottom: 16 }}>
            By Model
          </div>
          {data.byModel.length === 0 ? (
            <p style={{ fontSize: 13, color: '#475569' }}>No data</p>
          ) : data.byModel.map((m, i) => {
            const pct = (m.tokens / maxModelTokens) * 100
            const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4']
            const color = colors[i % colors.length]
            const shortModel = m.model.split('/').pop() || m.model
            return (
              <div key={m.model} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                  <span style={{ color: '#E2E8F0', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shortModel}</span>
                  <span style={{ color: '#94A3B8' }}>{fmt(m.tokens)} · {fmtCost(m.cost)}</span>
                </div>
                <div style={{ height: 6, background: '#0F1724', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Agent breakdown */}
        <div style={{
          background: '#1A2332',
          border: '1px solid #1E293B',
          borderRadius: 10,
          padding: 20,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#CBD5E1', marginBottom: 16 }}>
            By Agent
          </div>
          {data.byAgent.length === 0 ? (
            <p style={{ fontSize: 13, color: '#475569' }}>No data</p>
          ) : data.byAgent.map((a, i) => {
            const pct = (a.tokens / maxAgentTokens) * 100
            const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']
            const color = colors[i % colors.length]
            const emoji = AGENT_EMOJIS[a.agent.toLowerCase()] || '🤖'
            return (
              <div key={a.agent} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                  <span style={{ color: '#E2E8F0' }}>{emoji} {a.agent}</span>
                  <span style={{ color: '#94A3B8' }}>{fmt(a.tokens)} · {fmtCost(a.cost)}</span>
                </div>
                <div style={{ height: 6, background: '#0F1724', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
