# Judge QA Review — Crons Section in Setup Tab

Date: 2026-03-25
Verdict: **REJECTED**

## Summary

The Crons section UI is well-built — clean card design, proper loading/error/empty states, correct schedule formatting, relative timestamps, green/grey left borders. TypeScript compiles with zero new errors. The component code is solid.

**However, the API route is fundamentally broken.** The gateway at `localhost:18789` does **not** expose an HTTP `/rpc` endpoint. It returns 404 for all HTTP POST requests to `/rpc`. The gateway uses WebSocket-based RPC (as seen in `GatewayBrowserClient.ts`), not HTTP REST. This means the cron data can never be fetched — the feature is non-functional in production.

## Issues Found

### CRITICAL

**1. API route targets non-existent HTTP endpoint — crons will never load**
- **File:** `src/app/api/crons/route.ts`
- **Problem:** `fetch('http://localhost:18789/rpc', { method: 'POST', ... })` → gateway returns HTTP 404. The OpenClaw gateway does not expose `/rpc` as an HTTP endpoint.
- **Evidence:** `curl -s http://localhost:18789/rpc -X POST -H 'Content-Type: application/json' -d '{"method":"cron.list","params":{"includeDisabled":true}}'` → `Not Found` (HTTP 404)
- **Proof cron data exists:** `openclaw cron list --json` returns real jobs (at least `claude-code-memory-sync` and `daily-brief` confirmed running with healthy state)
- **Fix options (pick one):**
  - **Option A (recommended):** Shell out to `openclaw cron list --json` via `child_process.execSync` in the API route — simplest, guaranteed to work, same data
  - **Option B:** Use the WebSocket RPC protocol from `GatewayBrowserClient` (complex, server-side WS client needed)
- **Impact:** Feature is completely non-functional. Users see the error state: "Failed to load crons: Gateway returned 404"

### LOW

**2. Type assertion `as CronJob[]` instead of runtime validation**
- **File:** `src/app/api/crons/route.ts`, line: `return NextResponse.json({ jobs: data.result.jobs as CronJob[] })`
- **Problem:** If the gateway response shape doesn't match `CronJob`, the cast silently passes bad data. Not blocking but worth a runtime check or Zod schema.
- **Impact:** Low — defensive coding improvement, not a functional bug

**3. `formatRelativeTime` returns "just now" for future timestamps**
- **File:** `SetupDashboard.tsx`
- **Problem:** If `lastRunAtMs` is slightly in the future (clock skew), `diffMs` goes negative → `diffMin < 1` → shows "just now". Harmless edge case but worth noting.
- **Impact:** Cosmetic only

## What's Good

- ✅ **TypeScript:** `npx tsc --noEmit` — zero errors (clean)
- ✅ **Component quality:** Loading spinner, error banner (red), empty state — all present and styled correctly
- ✅ **Schedule formatting:** `every` (ms→min/hr), `cron` (expr + tz), `at` (Date → locale string) — all correct
- ✅ **Relative time display:** Both past (`formatRelativeTime`) and future (`formatFutureTime`) — human-readable, not raw timestamps
- ✅ **Left border colour:** `#10B981` (green) for enabled, `#475569` (grey) for disabled — correct
- ✅ **No `any` types** in either file (one `as` cast noted above, but not `any`)
- ✅ **No regressions:** `/api/setup` still returns all 7 files, file viewer unaffected, imports clean
- ✅ **Build committed:** `d42f340` is HEAD, `.next/BUILD_ID` present
- ✅ **Enabled/disabled badge:** Proper pill styling with semantic colours
- ✅ **Payload preview:** Truncated to 120 chars with ellipsis — sensible
- ✅ **Last run display:** Shows relative time + duration + status icon (✅/❌)
- ✅ **Left panel integration:** Divider separates crons from files, consistent button styling

## Verdict: REJECTED

**Reason:** The single critical issue (API route hitting a non-existent HTTP endpoint) means the feature is 100% non-functional. The UI will always show the error state. Fix the data fetching approach (recommend shelling out to `openclaw cron list --json`) and resubmit. Everything else is solid.
