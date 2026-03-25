import { NextResponse } from 'next/server'

export interface CronJob {
  id: string
  name: string
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
  }
  state?: {
    nextRunAtMs?: number
    lastRunAtMs?: number
    lastRunStatus?: string
    lastDurationMs?: number
  }
}

export interface CronsResponse {
  jobs: CronJob[]
  error?: string
}

export async function GET(): Promise<NextResponse<CronsResponse>> {
  try {
    const res = await fetch('http://localhost:18789/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'cron.list', params: { includeDisabled: true } }),
    })

    if (!res.ok) {
      return NextResponse.json({ jobs: [], error: `Gateway returned ${res.status}` }, { status: 200 })
    }

    const data = await res.json()

    if (!data.result?.jobs) {
      return NextResponse.json({ jobs: [], error: 'Unexpected response shape' }, { status: 200 })
    }

    return NextResponse.json({ jobs: data.result.jobs as CronJob[] })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ jobs: [], error: message }, { status: 200 })
  }
}
