# Judge QA Review — Subagent Attribution in Usage Dashboard

**Date:** 2026-03-25  
**Reviewer:** Judge ⚖️  
**Built by:** Pixel 🎨  
**Project:** ~/Projects/Claw3D/ (office.alficlaw.uk)

## Summary

New per-subagent attribution feature in the Usage dashboard. API reads `~/.openclaw/subagents/runs.json`, extracts agent names from labels (split on first hyphen), aggregates runs/duration/outcomes, and returns a `bySubagent` array. Frontend renders a new "🤖 Agent Runs" section with per-agent cards showing emoji, model badge, run count, duration, relative time, and outcome dots with a stacked bar.

## Checks

| # | Check | Result |
|---|-------|--------|
| 1 | `npx tsc --noEmit` — zero errors | ✅ PASS |
| 2 | API returns `bySubagent` with real data | ✅ PASS — 2 agents (pixel: 3 runs, judge: 3 runs) |
| 3 | `extractAgentName()` correct | ✅ PASS — `pixel-setup-tab`→`pixel`, `judge-crons-tab`→`judge` |
| 4 | Reads `runs.json`, handles missing file | ✅ PASS — try/catch returns `[]` on failure |
| 5 | Outcome mapping handles `status === "ok"` | ✅ PASS — code checks `'ok' \|\| 'completed'` |
| 6 | No regressions — existing panels render | ✅ PASS — daily, byModel, byAgent all present in API response |
| 7 | `/office` loads (200) | ✅ PASS |

## Issues Found

### LOW

1. **Duplicate emoji maps** — `AGENT_EMOJIS` and `AGENT_EMOJI_MAP` in `UsageDashboard.tsx` are identical objects. One is used for "By Agent" section, the other via `agentEmoji()` for subagent cards. Should consolidate into a single constant. Non-blocking, cosmetic.

2. **In-progress runs silently uncounted** — When `outcome` is `null` (run still in progress), it falls through all outcome categorisation branches. The run is counted in `runs` total but not in any outcome bucket. Consider adding an `in_progress` category or counting nulls as pending. Non-blocking — numbers still add up for completed runs.

## Verdict: APPROVED ✅

Clean implementation. TypeScript compiles with zero errors. API returns correct data from real `runs.json`. Agent name extraction works as intended. Missing file handled gracefully. Outcome mapping correctly handles the actual `"ok"` status values. No regressions to existing Usage panels. Live site loads. Two LOW-priority nits (duplicate map, in-progress uncounted) are non-blocking.
