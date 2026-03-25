'use client'

import { Suspense, useState, useEffect } from 'react'
import { AgentStoreProvider } from '@/features/agents/state/store'
import { OfficeScreen } from '@/features/office/screens/OfficeScreen'
import dynamic from 'next/dynamic'

const MissionControlShell = dynamic(
  () => import('@/features/mission-control-v2/MissionControlShell'),
  { ssr: false }
)

type ActiveView = 'office' | 'mission-control'

const STORAGE_KEY = 'office-active-view'

function OfficeLoadingFallback() {
  return (
    <div
      className="flex h-full w-full items-center justify-center bg-background"
      aria-label="Loading office"
      role="status"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        <p className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground">
          Loading…
        </p>
      </div>
    </div>
  )
}

// Event console disabled — set to false to hide the OpenClaw event bar
const SHOW_CONSOLE = false

export default function OfficePage() {
  const [activeView, setActiveView] = useState<ActiveView>('mission-control')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'office' || stored === 'office') {
      setActiveView(stored)
    }
    setMounted(true)
  }, [])

  const handleToggle = (view: ActiveView) => {
    setActiveView(view)
    localStorage.setItem(STORAGE_KEY, view)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#0F1724',
        fontFamily: '"Segoe UI", "Segoe UI Semilight", sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          background: '#0F1724',
          borderBottom: '1px solid #1E293B',
          flexShrink: 0,
          height: 48,
        }}
      >
        {/* Toggle pills */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            background: '#1A2332',
            borderRadius: 8,
            padding: 3,
          }}
        >
          <button
            onClick={() => handleToggle('mission-control')}
            style={{
              padding: '5px 14px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: '"Segoe UI", "Segoe UI Semilight", sans-serif',
              fontWeight: activeView === 'mission-control' ? 500 : 400,
              background: activeView === 'mission-control' ? '#2D3F55' : 'transparent',
              color: activeView === 'mission-control' ? '#ffffff' : '#94A3B8',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            📊 Mission Control
          </button>
          <button
            onClick={() => handleToggle('office')}
            style={{
              padding: '5px 14px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: '"Segoe UI", "Segoe UI Semilight", sans-serif',
              fontWeight: activeView === 'office' ? 500 : 400,
              background: activeView === 'office' ? '#2D3F55' : 'transparent',
              color: activeView === 'office' ? '#ffffff' : '#94A3B8',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            🏢 Office
          </button>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Status dot */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: '#64748B',
            fontFamily: '"Segoe UI", "Segoe UI Semilight", sans-serif',
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#10B981',
              boxShadow: '0 0 6px #10B981',
            }}
          />
          Systems Online
        </div>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Office view */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: activeView === 'office' ? 'block' : 'none',
          }}
        >
          <AgentStoreProvider>
            <Suspense fallback={<OfficeLoadingFallback />}>
              <OfficeScreen showOpenClawConsole={SHOW_CONSOLE} />
            </Suspense>
          </AgentStoreProvider>
        </div>

        {/* Mission Control view */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: activeView === 'mission-control' ? 'block' : 'none',
          }}
        >
          {mounted && <MissionControlShell />}
        </div>
      </div>
    </div>
  )
}
