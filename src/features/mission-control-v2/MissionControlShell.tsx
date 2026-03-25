'use client'

import { useState } from 'react'
import KanbanBoard from './KanbanBoard'
import UsageDashboard from './UsageDashboard'
import OrgChart from './OrgChart'

type MCView = 'tasks' | 'usage' | 'org'

const NAV_ITEMS: { id: MCView; icon: string; label: string }[] = [
  { id: 'tasks', icon: '📋', label: 'Tasks' },
  { id: 'usage', icon: '📊', label: 'Usage' },
  { id: 'org', icon: '👥', label: 'Org Chart' },
]

export default function MissionControlShell() {
  const [activeView, setActiveView] = useState<MCView>('tasks')

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      background: '#0F1724',
      overflow: 'hidden',
    }}>
      {/* Sidebar */}
      <nav style={{
        width: 200,
        minWidth: 200,
        background: '#0a1020',
        borderRight: '1px solid #1E293B',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 0',
        gap: 4,
      }}>
        {/* Logo */}
        <div style={{
          padding: '8px 16px 20px',
          fontSize: 13,
          fontWeight: 600,
          color: '#94A3B8',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontFamily: '"Segoe UI", sans-serif',
        }}>
          Mission Control
        </div>

        {NAV_ITEMS.map((item) => {
          const active = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 16px',
                marginInline: 8,
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                background: active ? '#1A2332' : 'transparent',
                color: active ? '#ffffff' : '#94A3B8',
                fontSize: 14,
                fontFamily: '"Segoe UI", sans-serif',
                fontWeight: active ? 500 : 400,
                transition: 'background 0.15s, color 0.15s',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}

        {/* Bottom branding */}
        <div style={{
          marginTop: 'auto',
          padding: '16px',
          fontSize: 11,
          color: '#475569',
          fontFamily: '"Segoe UI", sans-serif',
        }}>
          alficlaw.uk
        </div>
      </nav>

      {/* Main content */}
      <main style={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        background: '#0F1724',
      }}>
        {activeView === 'tasks' && <KanbanBoard />}
        {activeView === 'usage' && <UsageDashboard />}
        {activeView === 'org' && <OrgChart />}
      </main>
    </div>
  )
}
