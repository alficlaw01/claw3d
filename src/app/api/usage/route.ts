import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Anthropic published rates (per million tokens) — March 2026
const PRICING: Record<string, { input: number; output: number; cacheRead: number }> = {
  'claude-opus-4-6':   { input: 5.00,  output: 25.00, cacheRead: 0.50 },
  'claude-sonnet-4-6': { input: 3.00,  output: 15.00, cacheRead: 0.30 },
  'MiniMax-M2.7':      { input: 0.30,  output: 1.20,  cacheRead: 0.03 },
  'MiniMax-M2.7-highspeed': { input: 0.30, output: 1.20, cacheRead: 0.03 },
}

function calculateCost(model: string, inputTokens: number, outputTokens: number, cacheReadTokens: number): number {
  const rates = PRICING[model] || PRICING['claude-sonnet-4-6'] // default to Sonnet if unknown
  return (
    (inputTokens / 1_000_000) * rates.input +
    (outputTokens / 1_000_000) * rates.output +
    (cacheReadTokens / 1_000_000) * rates.cacheRead
  )
}

interface UsageRecord {
  date: string
  agent: string
  model: string
  provider: string
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  totalTokens: number
  cost: number
}

interface SubagentUsage {
  agent: string
  model: string
  runs: number
  totalDurationMs: number
  lastRunAt: string
  lastLabel: string
  outcome: {
    completed: number
    timed_out: number
    error: number
  }
}

// Extract agent name: first hyphen-delimited segment
// "pixel-setup-tab" → "pixel", "judge-mc-v2" → "judge", "benito-hana-backend" → "benito"
function extractAgentName(label: string): string {
  return label.split('-')[0] ?? label
}

function readRunsJson(): Array<{label: string; model: string; startedAt: number; endedAt: number | null; outcome: {status: string} | null}> {
  const runsPath = path.join(os.homedir(), '.openclaw', 'subagents', 'runs.json')
  try {
    const content = fs.readFileSync(runsPath, 'utf8')
    const data = JSON.parse(content)
    const runs = data.runs as Record<string, unknown> | undefined
    if (!runs || typeof runs !== 'object') return []
    return Object.values(runs).map((r) => {
      const run = r as Record<string, unknown>
      return {
        label: String(run.label ?? ''),
        model: String(run.model ?? ''),
        startedAt: typeof run.startedAt === 'number' ? run.startedAt : 0,
        endedAt: typeof run.endedAt === 'number' ? run.endedAt : null,
        outcome: run.outcome as {status: string} | null,
      }
    })
  } catch {
    return []
  }
}

function parseJsonlFile(filePath: string, agentName: string): UsageRecord[] {
  const records: UsageRecord[] = []
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n').filter(l => l.trim())
    for (const line of lines) {
      try {
        const obj = JSON.parse(line)
        if (obj.type === 'message' && obj.message?.usage) {
          const usage = obj.message.usage
          const date = obj.timestamp
            ? new Date(obj.timestamp).toISOString().split('T')[0]
            : new Date(parseInt(obj.id || '0', 16) || Date.now()).toISOString().split('T')[0]
          records.push({
            date,
            agent: agentName,
            model: obj.message.model || 'unknown',
            provider: obj.message.provider || 'unknown',
            inputTokens: usage.input || 0,
            outputTokens: usage.output || 0,
            cacheReadTokens: usage.cacheRead || 0,
            cacheWriteTokens: usage.cacheWrite || 0,
            totalTokens: usage.totalTokens || (usage.input || 0) + (usage.output || 0),
            cost: calculateCost(
              obj.message.model || 'unknown',
              usage.input || 0,
              usage.output || 0,
              usage.cacheRead || 0,
            ),
          })
        }
      } catch {
        // skip malformed lines
      }
    }
  } catch {
    // skip unreadable files
  }
  return records
}

function getLast7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export async function GET() {
  const agentsDir = path.join(os.homedir(), '.openclaw', 'agents')
  const allRecords: UsageRecord[] = []

  try {
    const agents = fs.readdirSync(agentsDir).filter(a => {
      try {
        return fs.statSync(path.join(agentsDir, a)).isDirectory()
      } catch { return false }
    })

    for (const agent of agents) {
      const sessionsDir = path.join(agentsDir, agent, 'sessions')
      try {
        const files = fs.readdirSync(sessionsDir).filter(f => f.endsWith('.jsonl'))
        for (const file of files) {
          const records = parseJsonlFile(path.join(sessionsDir, file), agent)
          allRecords.push(...records)
        }
      } catch {
        // no sessions dir
      }
    }
  } catch {
    // no agents dir
  }

  const last7Days = getLast7Days()

  // Daily breakdown
  const dailyMap: Record<string, { inputTokens: number; outputTokens: number; cost: number; totalTokens: number }> = {}
  for (const day of last7Days) {
    dailyMap[day] = { inputTokens: 0, outputTokens: 0, cost: 0, totalTokens: 0 }
  }
  for (const r of allRecords) {
    if (dailyMap[r.date]) {
      dailyMap[r.date].inputTokens += r.inputTokens
      dailyMap[r.date].outputTokens += r.outputTokens
      dailyMap[r.date].totalTokens += r.totalTokens
      dailyMap[r.date].cost += r.cost
    }
  }
  const daily = last7Days.map(date => ({ date, ...dailyMap[date] }))

  // Model breakdown
  const modelMap: Record<string, { tokens: number; cost: number; calls: number }> = {}
  for (const r of allRecords) {
    const key = r.model || 'unknown'
    if (!modelMap[key]) modelMap[key] = { tokens: 0, cost: 0, calls: 0 }
    modelMap[key].tokens += r.totalTokens
    modelMap[key].cost += r.cost
    modelMap[key].calls++
  }
  const byModel = Object.entries(modelMap)
    .map(([model, data]) => ({ model, ...data }))
    .sort((a, b) => b.tokens - a.tokens)

  // Agent breakdown
  const agentMap: Record<string, { tokens: number; cost: number; calls: number }> = {}
  for (const r of allRecords) {
    const key = r.agent || 'unknown'
    if (!agentMap[key]) agentMap[key] = { tokens: 0, cost: 0, calls: 0 }
    agentMap[key].tokens += r.totalTokens
    agentMap[key].cost += r.cost
    agentMap[key].calls++
  }
  const byAgent = Object.entries(agentMap)
    .map(([agent, data]) => ({ agent, ...data }))
    .sort((a, b) => b.tokens - a.tokens)

  // Totals
  const totalTokens = allRecords.reduce((s, r) => s + r.totalTokens, 0)
  const totalCost = allRecords.reduce((s, r) => s + r.cost, 0)
  const totalCalls = allRecords.length

  // ── Subagent attribution from runs.json ────────────────────────────────────
  const runs = readRunsJson()

  // Group by normalised agent name
  const subagentMap: Record<string, {
    agent: string
    model: string
    runs: number
    totalDurationMs: number
    lastRunMs: number
    lastLabel: string
    outcome: { completed: number; timed_out: number; error: number }
  }> = {}

  let totalSubagentRuns = 0
  let totalSubagentDurationMs = 0

  for (const run of runs) {
    const agent = extractAgentName(run.label) || 'unknown'
    const model = run.model || 'unknown'
    const durationMs = (run.endedAt && run.startedAt)
      ? run.endedAt - run.startedAt
      : 0

    if (!subagentMap[agent]) {
      subagentMap[agent] = {
        agent,
        model,
        runs: 0,
        totalDurationMs: 0,
        lastRunMs: 0,
        lastLabel: run.label,
        outcome: { completed: 0, timed_out: 0, error: 0 },
      }
    }

    // Update model if a later run used a different model (keep the most recent)
    subagentMap[agent].model = model
    subagentMap[agent].runs++
    subagentMap[agent].totalDurationMs += durationMs

    const runMs = run.startedAt || 0
    if (runMs > subagentMap[agent].lastRunMs) {
      subagentMap[agent].lastRunMs = runMs
      subagentMap[agent].lastLabel = run.label
    }

    // Categorise outcome
    const status = run.outcome?.status ?? 'unknown'
    if (status === 'ok' || status === 'completed') {
      subagentMap[agent].outcome.completed++
    } else if (status === 'timed_out') {
      subagentMap[agent].outcome.timed_out++
    } else if (status === 'error') {
      subagentMap[agent].outcome.error++
    }
  }

  totalSubagentRuns = Object.values(subagentMap).reduce((s, a) => s + a.runs, 0)
  totalSubagentDurationMs = Object.values(subagentMap).reduce((s, a) => s + a.totalDurationMs, 0)

  const bySubagent: SubagentUsage[] = Object.values(subagentMap)
    .map(a => ({
      agent: a.agent,
      model: a.model,
      runs: a.runs,
      totalDurationMs: a.totalDurationMs,
      lastRunAt: a.lastRunMs ? new Date(a.lastRunMs).toISOString() : '',
      lastLabel: a.lastLabel,
      outcome: a.outcome,
    }))
    .sort((a, b) => b.runs - a.runs)

  return NextResponse.json({
    daily,
    byModel,
    byAgent,
    bySubagent,
    totals: { tokens: totalTokens, cost: totalCost, calls: totalCalls, subagentRuns: totalSubagentRuns, subagentDurationMs: totalSubagentDurationMs },
  })
}
