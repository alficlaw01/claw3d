import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import os from 'os'

export interface CronJob {
  id: string
  name: string
  description?: string
  enabled: boolean
  schedule: {
    kind: string
    expr?: string
    everyMs?: number
    tz?: string
  }
  payload: {
    kind: string
    message: string
  }
  delivery?: {
    mode: string
    channel?: string
    to?: string
  }
  state?: {
    nextRunAtMs?: number
    lastRunAtMs?: number
    lastRunStatus?: string
    lastStatus?: string
    lastDurationMs?: number
    consecutiveErrors?: number
  }
}

export interface CronsResponse {
  jobs: CronJob[]
  error?: string
}

export async function GET(): Promise<NextResponse<CronsResponse>> {
  try {
    const jobsPath = path.join(os.homedir(), '.openclaw', 'cron', 'jobs.json')

    if (!fs.existsSync(jobsPath)) {
      return NextResponse.json({ jobs: [], error: 'No cron jobs file found' })
    }

    const raw = fs.readFileSync(jobsPath, 'utf-8')
    const data = JSON.parse(raw)

    // Handle both array and { version, jobs } shapes
    const jobs: CronJob[] = Array.isArray(data) ? data : (data.jobs ?? [])

    return NextResponse.json({ jobs })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ jobs: [], error: message }, { status: 200 })
  }
}
