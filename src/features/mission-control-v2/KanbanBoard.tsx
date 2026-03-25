'use client'

import { useState } from 'react'
import tasksData from '@/data/tasks.json'

type Task = {
  id: string
  title: string
  project: string
  projectEmoji: string
  agent: string
  agentEmoji: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'working' | 'done'
  week: number
}

type Status = 'pending' | 'working' | 'done'

const COLUMNS: { id: Status; label: string; color: string }[] = [
  { id: 'pending', label: 'Pending', color: '#F59E0B' },
  { id: 'working', label: 'Working', color: '#3B82F6' },
  { id: 'done', label: 'Done', color: '#10B981' },
]

const PRIORITY_COLORS: Record<string, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#6B7280',
}

const PROJECTS = ['Hana', 'Bootstrap Squad', 'Dashboard', 'Flow', 'Claw3D']
const PROJECT_EMOJIS: Record<string, string> = {
  'Hana': '🌸',
  'Bootstrap Squad': '🔨',
  'Dashboard': '📊',
  'Flow': '🏢',
  'Claw3D': '🏛️',
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>(tasksData as Task[])
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const moveTask = (id: string, newStatus: Status) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))
  }

  const handleDragStart = (id: string) => setDraggedId(id)
  const handleDragEnd = () => setDraggedId(null)

  const handleDrop = (status: Status) => {
    if (draggedId) {
      moveTask(draggedId, status)
      setDraggedId(null)
    }
  }

  const tasksByProjectAndStatus = (project: string, status: Status) =>
    tasks.filter(t => t.project === project && t.status === status)

  const allByStatus = (status: Status) =>
    tasks.filter(t => t.status === status)

  return (
    <div style={{ padding: 24, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 4 }}>📋 Tasks</h1>
        <p style={{ fontSize: 13, color: '#64748B' }}>
          {tasks.filter(t => t.status === 'done').length} done · {tasks.filter(t => t.status === 'working').length} in progress · {tasks.filter(t => t.status === 'pending').length} pending
        </p>
      </div>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 12 }}>
        {COLUMNS.map(col => (
          <div key={col.id} style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8, borderBottom: `2px solid ${col.color}` }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {col.label}
            </span>
            <span style={{ fontSize: 11, color: '#475569', marginLeft: 2 }}>
              {allByStatus(col.id).length}
            </span>
          </div>
        ))}
      </div>

      {/* Project groups */}
      {PROJECTS.map(project => {
        const projectTasks = tasks.filter(t => t.project === project)
        if (projectTasks.length === 0) return null
        return (
          <div key={project} style={{ marginBottom: 24 }}>
            {/* Project label */}
            <div style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 8,
              padding: '2px 0',
            }}>
              {PROJECT_EMOJIS[project]} {project}
            </div>

            {/* Kanban row for this project */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              {COLUMNS.map(col => {
                const colTasks = tasksByProjectAndStatus(project, col.id)
                return (
                  <div
                    key={col.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(col.id)}
                    style={{
                      minHeight: 60,
                      borderRadius: 8,
                      padding: colTasks.length > 0 ? '4px 0' : 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    {colTasks.length === 0 ? (
                      <div style={{
                        height: 40,
                        border: '1px dashed #1E293B',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        color: '#334155',
                      }}>
                        empty
                      </div>
                    ) : colTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onMove={moveTask}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        isDragging={draggedId === task.id}
                      />
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TaskCard({
  task,
  onMove,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  task: Task
  onMove: (id: string, status: Status) => void
  onDragStart: (id: string) => void
  onDragEnd: () => void
  isDragging: boolean
}) {
  const [showMenu, setShowMenu] = useState(false)

  const statuses: Status[] = ['pending', 'working', 'done']
  const currentIdx = statuses.indexOf(task.status)

  return (
    <div
      draggable
      onDragStart={() => onDragStart(task.id)}
      onDragEnd={onDragEnd}
      style={{
        background: isDragging ? '#243447' : '#1A2332',
        border: '1px solid #1E293B',
        borderRadius: 8,
        padding: '10px 12px',
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        position: 'relative',
      }}
    >
      <div style={{ fontSize: 13, color: '#E2E8F0', lineHeight: 1.4, marginBottom: 8 }}>
        {task.title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Agent */}
          <span style={{ fontSize: 11, color: '#94A3B8' }}>
            {task.agentEmoji} {task.agent}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Priority badge */}
          <span style={{
            fontSize: 10,
            padding: '1px 6px',
            borderRadius: 4,
            background: PRIORITY_COLORS[task.priority] + '22',
            color: PRIORITY_COLORS[task.priority],
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            {task.priority}
          </span>
          {/* Move button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{
                background: 'none',
                border: 'none',
                color: '#475569',
                cursor: 'pointer',
                fontSize: 12,
                padding: '0 2px',
              }}
            >
              ↕
            </button>
            {showMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                background: '#1A2332',
                border: '1px solid #1E293B',
                borderRadius: 6,
                overflow: 'hidden',
                zIndex: 10,
                minWidth: 100,
              }}>
                {statuses.filter(s => s !== task.status).map(s => (
                  <button
                    key={s}
                    onClick={() => { onMove(task.id, s); setShowMenu(false) }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '6px 12px',
                      background: 'none',
                      border: 'none',
                      color: '#CBD5E1',
                      fontSize: 12,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    → {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
