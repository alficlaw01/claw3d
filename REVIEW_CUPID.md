# 💘 Cupid QA Review — Claw3D Gateway Connection

**Reviewer:** Cupid (QA)  
**Date:** 2026-03-23  
**Scope:** End-to-end gateway WebSocket connection flow

---

## Summary

The connection is broken by **three independent issues** that all need fixing. Even if one is resolved, the others will keep the connection dead.

---

## Issue 1: `GatewayClient` Never Passes `password` to `GatewayBrowserClient`

**Priority: 🔴 HIGH — This alone blocks all connections when gateway uses password auth**

### Root Cause

The gateway auth mode was changed from `token` to `password`. The low-level `GatewayBrowserClient` already supports a `password` option (line 372) and correctly sends `{ token, password }` in the `auth` payload of the `connect` request (lines 490-493).

However, the **wrapper** `GatewayClient` (used by the actual UI) has a `GatewayConnectOptions` type that only includes `token` — no `password` field:

```typescript
// src/lib/gateway/GatewayClient.ts:123-129
export type GatewayConnectOptions = {
  gatewayUrl: string;
  token?: string;          // ← exists
  // password?: string;    // ← MISSING
  authScopeKey?: string;
  clientName?: string;
  disableDeviceAuth?: boolean;
};
```

When `new GatewayBrowserClient()` is constructed (line 184), `password` is never passed:

```typescript
const nextClient = new GatewayBrowserClient({
  url: options.gatewayUrl,
  token: options.token,
  // password: options.password,  ← NEVER SET
  ...
});
```

The `useGatewayConnection` hook (line 515+) manages only `gatewayUrl` and `token` state. There is no `password` state, no password input field, and no password persistence. The UI prompt checks `!token.trim()` to decide whether to show the connect prompt — but with password auth, a token isn't needed.

### Fix Required

1. Add `password?: string` to `GatewayConnectOptions`
2. Pass `password: options.password` when constructing `GatewayBrowserClient`
3. Add `password` state to `useGatewayConnection` hook
4. Add password input field to the connection UI (Settings panel / connect prompt)
5. Persist password in settings alongside `gateway.url` and `gateway.token`
6. Update `shouldPromptForConnect` logic: prompt when neither token nor password is set

---

## Issue 2: Relay Upstream URL Points to Port 18789 (Tailscale Funnel HTTP/2 Issue)

**Priority: 🔴 HIGH — Relay cannot establish upstream WebSocket**

### Root Cause

The relay at `gateway-relay-production.up.railway.app` is hardcoded to connect upstream to:

```javascript
// claw3d-relay/index.js:4
const UPSTREAM = 'wss://alfis-mac-mini.taila833af.ts.net:18789';
```

From within the Tailscale network (e.g., this Mac Mini), port 18789 returns `HTTP/1.1 101 Switching Protocols` — WebSocket upgrade works fine. **But the relay runs on Railway (external internet)**, which means it goes through **Tailscale Funnel**.

Tailscale Funnel on port 18789 uses **HTTP/2**, which does not support the `101 Switching Protocols` upgrade needed for WebSocket. The connection is refused/closed immediately, causing error codes 1011/1012.

Port **8443** and **10000** are confirmed to work for WebSocket via Funnel (tested: `HTTP/1.1 101` on port 10000).

### Fix Required

Change the relay upstream URL to a Funnel-compatible port:

```javascript
// claw3d-relay/index.js:4
const UPSTREAM = 'wss://alfis-mac-mini.taila833af.ts.net:10000';
// OR use an env var:
const UPSTREAM = process.env.UPSTREAM_URL || 'wss://alfis-mac-mini.taila833af.ts.net:10000';
```

Redeploy the relay on Railway after this change.

---

## Issue 3: `NEXT_PUBLIC_GATEWAY_URL` Defaults to `ws://localhost:18789` in Production

**Priority: 🟡 MEDIUM — Affects deployed Claw3D, not local dev**

### Root Cause

```
# .env
NEXT_PUBLIC_GATEWAY_URL=ws://localhost:18789

# .env.local
NEXT_PUBLIC_GATEWAY_URL=ws://127.0.0.1:18789
```

The fallback in code:
```typescript
const DEFAULT_UPSTREAM_GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL || "ws://localhost:18789";
```

On the Railway deployment (`claw3d-production.up.railway.app`), if `NEXT_PUBLIC_GATEWAY_URL` isn't set in Railway's env vars, the app tries to connect to `ws://localhost:18789` — which is Railway's own container, not the OpenClaw gateway. This silently fails.

### Fix Required

Set `NEXT_PUBLIC_GATEWAY_URL` in Railway environment variables to:
```
wss://gateway-relay-production.up.railway.app/ws
```

Or if connecting directly (once Funnel ports are sorted):
```
wss://alfis-mac-mini.taila833af.ts.net:10000
```

---

## Issue 4: Relay Doesn't Forward Auth (Minor — Auth Goes In-Band)

**Priority: 🟢 LOW — Not actually blocking, but worth noting**

### Analysis

The relay forwards HTTP headers (`authorization`, `cookie`, `token`, `x-auth-token`, `x-*`) from the initial WebSocket handshake. However, the `GatewayBrowserClient` sends auth **in-band** as part of the JSON `connect` request frame *after* the WebSocket is open — not in HTTP headers.

This means the relay's header-forwarding code is harmless but irrelevant. Auth will pass through correctly because the relay transparently proxies all WebSocket messages bidirectionally. **No fix needed**, but the header-forwarding code is dead weight.

---

## Fix Execution Plan (Priority Order)

| # | Fix | Files | Effort |
|---|-----|-------|--------|
| 1 | Add `password` to `GatewayConnectOptions` + pass through to `GatewayBrowserClient` | `src/lib/gateway/GatewayClient.ts` | 10 min |
| 2 | Add password state + UI input to connection hook/settings | `src/lib/gateway/GatewayClient.ts` + settings UI | 30 min |
| 3 | Change relay upstream to port 10000 | `claw3d-relay/index.js` | 2 min |
| 4 | Set `NEXT_PUBLIC_GATEWAY_URL` in Railway env | Railway dashboard | 2 min |
| 5 | Redeploy both relay and Claw3D | Railway | 5 min |

**After all fixes:** Claw3D on Railway → connects via WebSocket to relay → relay connects to gateway on port 10000 (Funnel-compatible) → auth is sent in-band with password → connection established. ✅

---

*Cupid out. 💘*
