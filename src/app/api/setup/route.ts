import { NextResponse } from 'next/server'
import fs from 'fs'

const FILES = [
  {
    id: 'soul',
    label: 'SOUL.md',
    emoji: '🧠',
    description: 'Core identity, values, ground rules',
    path: '/Users/alficlaw/.openclaw/workspace/SOUL.md',
  },
  {
    id: 'agents',
    label: 'AGENTS.md',
    emoji: '🤖',
    description: 'Agent team structure, operating rules, model allocation',
    path: '/Users/alficlaw/.openclaw/workspace/AGENTS.md',
  },
  {
    id: 'memory',
    label: 'MEMORY.md',
    emoji: '💾',
    description: 'Long-term memory — how Alfi operates, active projects, infrastructure',
    path: '/Users/alficlaw/.openclaw/workspace/MEMORY.md',
  },
  {
    id: 'user',
    label: 'USER.md',
    emoji: '👤',
    description: 'About Jason — context, preferences, observed patterns',
    path: '/Users/alficlaw/.openclaw/workspace/USER.md',
  },
  {
    id: 'identity',
    label: 'IDENTITY.md',
    emoji: '🪪',
    description: "Alfi's identity, name, accounts, communication style",
    path: '/Users/alficlaw/.openclaw/workspace/IDENTITY.md',
  },
  {
    id: 'heartbeat',
    label: 'HEARTBEAT.md',
    emoji: '💓',
    description: 'Active background tasks and periodic check-ins',
    path: '/Users/alficlaw/.openclaw/workspace/HEARTBEAT.md',
  },
  {
    id: 'tools',
    label: 'TOOLS.md',
    emoji: '🛠️',
    description: 'Local setup notes — WhatsApp groups, device names, SSH hosts',
    path: '/Users/alficlaw/.openclaw/workspace/TOOLS.md',
  },
]

export async function GET() {
  const result = FILES.map((file) => {
    let content = '(file not found)'
    let lastModified: string | null = null

    try {
      const stats = fs.statSync(file.path)
      lastModified = stats.mtime.toISOString()
    } catch {
      // file doesn't exist
    }

    try {
      content = fs.readFileSync(file.path, 'utf-8')
    } catch {
      // already set to '(file not found)'
    }

    return {
      id: file.id,
      label: file.label,
      emoji: file.emoji,
      description: file.description,
      content,
      lastModified,
    }
  })

  return NextResponse.json(result)
}
