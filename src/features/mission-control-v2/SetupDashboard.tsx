'use client'

import { useState, useEffect } from 'react'

interface SetupFile {
  id: string
  label: string
  emoji: string
  description: string
  content: string
  lastModified: string | null
}

export default function SetupDashboard() {
  const [files, setFiles] = useState<SetupFile[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [loading, setLoading] = useState(true)

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

  const active = files.find((f) => f.id === activeId)

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#64748B',
        fontFamily: '"Segoe UI", sans-serif',
        fontSize: 14,
      }}>
        Loading setup files...
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      background: '#0F1724',
      overflow: 'hidden',
    }}>
      {/* Left panel — file list */}
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
      </div>

      {/* Right panel — content viewer */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 28px',
      }}>
        {active ? (
          <>
            {/* File header */}
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

            {/* Divider */}
            <div style={{
              borderTop: '1px solid #1E293B',
              marginBottom: 20,
            }} />

            {/* Markdown content */}
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
