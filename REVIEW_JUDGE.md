# REVIEW_JUDGE.md — Mission Control Panel QA Review

**Reviewer:** Judge ⚖️  
**Date:** 2026-03-23  
**Files reviewed:**  
- `src/features/mission-control/MissionControlPanel.tsx`  
- `src/app/office/page.tsx`  
- `src/features/agents/state/store.tsx` (type surface)

**Build status:** ✅ `tsc --noEmit` clean | ✅ `npm run build` clean (static route `/office`)

---

## Issues Found

### 🔴 HIGH Priority

#### H1 — No error boundary for the office route

Neither `/office` nor `MissionControlPanel` has an error boundary. If `useAgentStore()` context is missing or the store throws, the **entire page** white-screens with an unhandled React error.

Next.js provides a file-convention for this: `app/office/error.tsx`. There is currently **no** `error.tsx` at any level.

**Fix:** Add `src/app/office/error.tsx`:

```tsx
"use client";

export default function OfficeError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-white/60 font-mono text-sm gap-4">
      <p>Something went wrong loading Mission Control.</p>
      <button
        onClick={reset}
        className="rounded border border-white/20 px-4 py-2 text-xs hover:bg-white/10"
      >
        Retry
      </button>
    </div>
  );
}
```

---

#### H2 — `MissionControlPanel` not wrapped in `Suspense`

In `page.tsx`, `OfficeScreen` is wrapped in `<Suspense fallback={null}>` but `MissionControlPanel` is **not**. If the component (or a future child) triggers a suspension, React will bubble up to the nearest boundary — which may not exist, causing a crash.

**Fix** in `page.tsx`:

```tsx
<AgentStoreProvider>
  <Suspense fallback={null}>
    <OfficeScreen showOpenClawConsole={showOpenClawConsole} />
  </Suspense>
  <Suspense fallback={null}>
    <MissionControlPanel />
  </Suspense>
</AgentStoreProvider>
```

---

### 🟡 MEDIUM Priority

#### M1 — `building` status dot has no animation — indistinguishable from static

The amber dot for `building` status is visually static. Users can't tell if an agent is actively building or just has a colored dot. Every other dashboard convention pulses the "in-progress" indicator.

**Fix:** Add `animate-pulse` to the building dot:

```tsx
const STATUS_DOT: Record<AgentStatus, string> = {
  active:   "bg-emerald-400",
  standby:  "bg-white/20",
  building: "bg-amber-400 animate-pulse",
};
```

---

#### M2 — Agent name matching is fragile (case-sensitive store names)

`liveByName` maps by `a.name.toLowerCase()`, then looks up with `agent.name.toLowerCase()`. This works only if `name` is always present and non-empty. The store's `AgentStoreSeed.name` is typed as `string` (not `string | undefined`), so it won't crash — but empty-string names would collide in the map.

**Severity:** Low risk today (names are always set), but worth a guard:

```tsx
if (a.name) map.set(a.name.toLowerCase(), a);
```

This guard is already present ✅ — no fix needed, just noting the dependency.

---

#### M3 — No visual separation between MissionControlPanel and OfficeScreen

`MissionControlPanel` renders as a plain `<section>` directly after `OfficeScreen` with no spacing, divider, or scroll containment. Depending on OfficeScreen's height, Mission Control may be invisible below the fold with no indication to scroll.

**Fix:** Add a top border or margin:

```tsx
<section
  className="w-full border-t border-white/10"
  style={{ backgroundColor: "#0a0a0a" }}
>
```

---

#### M4 — Hardcoded data with no "placeholder" indicator

`PROJECTS` and `TODOS` are completely static arrays. Users (Jason) may think these reflect real state. There should be a subtle label indicating this is placeholder data until wired up.

**Fix:** Add a temporary badge in the section headers:

```tsx
<span className="ml-2 text-[8px] text-white/20 uppercase">(demo)</span>
```

---

### 🟢 LOW Priority

#### L1 — Status dots rely solely on color (accessibility)

Color-only status indication fails WCAG 2.1 SC 1.4.1. Colorblind users can't distinguish active/standby/building.

**Fix:** The `title` attribute is present (good), but consider adding a text label or icon shape variant for full a11y compliance.

---

#### L2 — No `aria-label` or landmark role on the section

Screen readers won't identify Mission Control as a distinct region.

**Fix:**

```tsx
<section aria-label="Mission Control" role="region" className="w-full" ...>
```

---

#### L3 — TODO items are non-interactive

TODOs render as read-only text with no checkbox, click handler, or completion state. This is fine for v1 placeholder but sets a UX expectation that won't be met.

---

#### L4 — Inline style for background color instead of Tailwind class

`style={{ backgroundColor: "#0a0a0a" }}` could be `className="bg-[#0a0a0a]"` for consistency with the rest of the Tailwind-based styling.

**Fix:**

```tsx
<section className="w-full bg-[#0a0a0a]">
```

---

## What's Good ✅

- **Clean TypeScript** — no type errors, proper use of `Record`, discriminated unions, and generics
- **Smart live-status wiring** — `deriveAgentStatus()` logic is sensible (running + streamText → building, recent activity → active, else standby)
- **Prop/store fallback pattern** — accepting optional `agents` prop with store fallback is good for testing and flexibility
- **Memoization** — both `liveByName` and `resolvedAgents` are properly memoized with correct deps
- **Consistent design system** — monospace type scale, gold accent (#C9A84C), white-on-black opacity layers match the Claw3D aesthetic
- **Responsive grid** — `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` handles mobile to desktop well
- **Build passes** — zero TypeScript errors, zero build warnings

---

## Overall Quality Score

### 7.5 / 10

Solid first implementation. The code is clean, well-typed, and follows the project's conventions. The two HIGH issues (error boundary + Suspense wrapping) are real risks that should be fixed before this ships — a store hiccup will white-screen the page. The MEDIUM issues are polish items that would elevate it from "works" to "production-ready". Good work from Benito — needs a quick hardening pass.
