'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CronJob } from '@/app/api/crons/route'

interface SetupFile {
  id: string
  label: string
  emoji: string
  description: string
  content: string
  lastModified: string | null
}

const CRONS_SENTINEL = '__crons__'

function formatRelativeTime(ms: number | undefined): string {
  if (!ms) return 'never'
  const diffMs = Date.now() - ms
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin === 1) return '1 min ago'
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr === 1) return '1 hr ago'
  if (diffHr < 24) return `${diffHr} hr ago`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
}

function formatFutureTime(ms: number | undefined): string {
  if (!ms) return 'not scheduled'
  const diffMs = ms - Date.now()
  if (diffMs < 0) return 'overdue'
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'in <1 min'
  if (diffMin === 1) return 'in 1 min'
  if (diffMin < 60) return `in ${diffMin} min`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr === 1) return 'in 1 hr'
  if (diffHr < 24) return `in ${diffHr} hr`
  const diffDay = Math.floor(diffHr / 24)
  return `in ${diffDay} day${diffDay > 1 ? 's' : ''}`
}

function formatSchedule(schedule: CronJob['schedule']): string {
  if (schedule.kind === 'every') {
    const totalMin = Math.round((schedule.everyMs ?? 0) / 60000)
    if (totalMin === 1) return 'Every 1 min'
    if (totalMin < 60) return `Every ${totalMin} min`
    const hr = Math.round(totalMin / 60)
    return hr === 1 ? 'Every 1 hr' : `Every ${hr} hr`
  }
  if (schedule.kind === 'cron') {
    const parts: string[] = []
    if (schedule.expr) parts.push(schedule.expr)
    if (schedule.tz) parts.push(`(${schedule.tz})`)
    return parts.join(' ')
  }
  if (schedule.kind === 'at') {
    if (!schedule.expr) return 'Once'
    try {
      const d = new Date(schedule.expr)
      return `Once at ${d.toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })}`
    } catch {
      return `Once at ${schedule.expr}`
    }
  }
  return schedule.kind
}

function formatLastRun(state: CronJob['state']): string {
  if (!state?.lastRunAtMs) return 'Last run: never'
  const time = formatRelativeTime(state.lastRunAtMs)
  const ms = state.lastDurationMs != null ? ` · ${state.lastDurationMs}ms` : ''
  const status = state.lastRunStatus === 'ok' || !state.lastRunStatus
    ? ' · ✅ ok'
    : state.lastRunStatus === 'error'
    ? ` · ❌ ${state.lastRunStatus}`
    : state.lastRunStatus
    ? ` · ${state.lastRunStatus}`
    : ''
  return `Last run: ${time}${ms}${status}`
}

export default function SetupDashboard() {
  const [files, setFiles] = useState<SetupFile[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const [crons, setCrons] = useState<CronJob[]>([])
  const [cronsLoading, setCronsLoading] = useState(false)
  const [cronsError, setCronsError] = useState<string | null>(null)

  const showCrons = activeId === CRONS_SENTINEL

  useEffect(() => {
    fetch('/api/setup')
      .then((r) => r.json())
      .then((data: SetupFile[]) => {
        setFiles(data)
        if (data.length > 0) {
          setActiveId(data[0].id)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const loadCrons = useCallback(async () => {
    setCronsLoading(true)
    setCronsError(null)
    try {
      const res = await fetch('/api/crons')
      const data = await res.json()
      if (data.error) {
        setCronsError(data.error)
        setCrons([])
      } else {
        setCrons(data.jobs ?? [])
      }
    } catch (err) {
      setCronsError(err instanceof Error ? err.message : 'Failed to load cron jobs')
      setCrons([])
    } finally {
      setCronsLoading(false)
    }
  }, [])

  const handleCronsClick = () => {
    setActiveId(CRONS_SENTINEL)
    if (crons.length === 0 && !cronsLoading) {
      loadCrons()
    }
  }

  const active = files.find((f) => f.id === activeId)

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      background: '#0F1724',
      overflow: 'hidden',
    }}>
      {/* Left panel — file list + Crons */}
      <div style={{
        width: 160,
        minWidth: 160,
        background: '#0a1020',
        borderRight: '1px solid #1E293B',
        overflowY: 'auto',
        padding: '12px 0',
      }}>
        {files.map((file) => {
          const isActive = file.id === activeId
          return (
            <button
              key={file.id}
              onClick={() => setActiveId(file.id)}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                marginBottom: 2,
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                background: isActive ? '#1A2332' : 'transparent',
                color: isActive ? '#ffffff' : '#94A3B8',
                fontFamily: '"Segoe UI", sans-serif',
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                textAlign: 'left',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <div style={{ marginBottom: 2 }}>
                {file.emoji} {file.label}
              </div>
              <div style={{
                fontSize: 10,
                color: isActive ? '#64748B' : '#475569',
                lineHeight: 1.4,
                paddingLeft: 2,
                whiteSpace: 'normal',
              }}>
                {file.description}
              </div>
            </button>
          )
        })}

        {/* Divider before Crons */}
        <div style={{
          borderTop: '1px solid #1E293B',
          margin: '10px 12px',
        }} />

        {/* Crons item */}
        <button
          onClick={handleCronsClick}
          style={{
            display: 'block',
            width: '100%',
            padding: '8px 12px',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            background: showCrons ? '#1A2332' : 'transparent',
            color: showCrons ? '#ffffff' : '#94A3B8',
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: 13,
            fontWeight: showCrons ? 500 : 400,
            textAlign: 'left',
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          <div style={{ marginBottom: 2 }}>⏱ Crons</div>
          <div style={{
            fontSize: 10,
            color: showCrons ? '#64748B' : '#475569',
            lineHeight: 1.4,
            paddingLeft: 2,
          }}>
            Scheduled jobs
          </div>
        </button>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 28px',
      }}>
        {showCrons ? (
          /* ===== CRONS VIEW ===== */
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#ffffff',
                fontFamily: '"Segoe UI", sans-serif',
                marginBottom: 4,
              }}>
                ⏱ Scheduled Jobs
              </div>
              <div style={{
                fontSize: 12,
                color: '#64748B',
                fontFamily: '"Segoe UI", sans-serif',
              }}>
                Active automations running on the gateway
              </div>
            </div>

            <div style={{ borderTop: '1px solid #1E293B', marginBottom: 20 }} />

            {cronsLoading ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 120,
                color: '#64748B',
                fontFamily: '"Segoe UI", sans-serif',
                fontSize: 14,
              }}>
                Loading cron jobs...
              </div>
            ) : cronsError ? (
              <div style={{
                padding: '16px',
                background: '#1a0f0f',
                border: '1px solid #7f1d1d',
                borderRadius: 8,
                color: '#fca5a5',
                fontFamily: '"Segoe UI", sans-serif',
                fontSize: 13,
              }}>
                Failed to load crons: {cronsError}
              </div>
            ) : crons.length === 0 ? (
              <div style={{
                color: '#475569',
                fontFamily: '"Segoe UI", sans-serif',
                fontSize: 14,
              }}>
                No cron jobs configured.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {crons.map((job) => (
                  <div
                    key={job.id}
                    style={{
                      background: '#0D1929',
                      border: '1px solid #1E293B',
                      borderLeft: `3px solid ${job.enabled ? '#10B981' : '#475569'}`,
                      borderRadius: 8,
                      padding: '16px',
                    }}
                  >
                    {/* Name + badge row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 8,
                    }}>
                      <span style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: '#ffffff',
                        fontFamily: '"Segoe UI", sans-serif',
                      }}>
                        {job.name}
                      </span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontFamily: '"Segoe UI", sans-serif',
                        fontWeight: 500,
                        background: job.enabled ? '#052e1644' : '#1e293b44',
                        color: job.enabled ? '#4ade80' : '#94a3b8',
                        border: `1px solid ${job.enabled ? '#10B98166' : '#47556966'}`,
                      }}>
                        {job.enabled ? 'enabled' : 'disabled'}
                      </span>
                    </div>

                    {/* Schedule */}
                    <div style={{
                      fontSize: 13,
                      color: '#94A3B8',
                      fontFamily: '"Segoe UI", sans-serif',
                      marginBottom: 6,
                    }}>
                      {formatSchedule(job.schedule)}
                    </div>

                    {/* Last run */}
                    <div style={{
                      fontSize: 12,
                      color: '#64748B',
                      fontFamily: '"Segoe UI", sans-serif',
                      marginBottom: 4,
                    }}>
                      {formatLastRun(job.state)}
                    </div>

                    {/* Next run */}
                    <div style={{
                      fontSize: 12,
                      color: '#64748B',
                      fontFamily: '"Segoe UI", sans-serif',
                      marginBottom: 8,
                    }}>
                      Next: {formatFutureTime(job.state?.nextRunAtMs)}
                    </div>

                    {/* What it does */}
                    {job.payload?.message ? (
                      <div style={{
                        fontSize: 12,
                        color: '#475569',
                        fontFamily: '"Segoe UI", sans-serif',
                        lineHeight: 1.5,
                      }}>
                        {job.payload.message.length > 120
                          ? job.payload.message.slice(0, 120) + '…'
                          : job.payload.message}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : active ? (
          /* ===== FILE VIEW ===== */
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#ffffff',
                fontFamily: '"Segoe UI", sans-serif',
                marginBottom: 4,
              }}>
                {active.emoji} {active.label}
              </div>
              <div style={{
                fontSize: 12,
                color: '#64748B',
                fontFamily: '"Segoe UI", sans-serif',
                marginBottom: active.lastModified ? 4 : 0,
              }}>
                {active.description}
              </div>
              {active.lastModified && (
                <div style={{
                  fontSize: 11,
                  color: '#475569',
                  fontFamily: '"Segoe UI", sans-serif',
                }}>
                  Last updated: {new Date(active.lastModified).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #1E293B', marginBottom: 20 }} />

            <pre style={{
              whiteSpace: 'pre-wrap',
              fontFamily: '"Segoe UI", sans-serif',
              fontSize: 13,
              color: '#CBD5E1',
              lineHeight: 1.7,
              margin: 0,
              wordBreak: 'break-word',
            }}>
              {active.content}
            </pre>
          </>
        ) : (
          <div style={{
            color: '#475569',
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: 14,
          }}>
            Select a file to view its contents.
          </div>
        )}
      </div>
    </div>
  )
}
