"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GatewayClient } from "@/lib/gateway/GatewayClient";
import { resolveStudioProxyGatewayUrl } from "@/lib/gateway/proxy-url";
import { extractText } from "@/lib/text/message-extract";

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  timestamp: Date;
}

const DEFAULT_GATEWAY_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_GATEWAY_URL) ||
  "ws://localhost:18789";

// Shared gateway client singleton for Work Mode panels
let sharedClient: GatewayClient | null = null;
let sharedConnectPromise: Promise<void> | null = null;

const getSharedClient = (): { client: GatewayClient; connectPromise: Promise<void> } => {
  if (!sharedClient) {
    sharedClient = new GatewayClient();
    sharedConnectPromise = (async () => {
      try {
        // Try proxy first (same-origin), fall back to direct
        let gatewayUrl: string;
        try {
          gatewayUrl = resolveStudioProxyGatewayUrl();
        } catch {
          gatewayUrl = DEFAULT_GATEWAY_URL;
        }
        await sharedClient!.connect({
          gatewayUrl,
          clientName: "claw3d-work-mode",
        });
      } catch {
        // Proxy failed — try direct gateway URL
        try {
          sharedClient = new GatewayClient();
          await sharedClient!.connect({
            gatewayUrl: DEFAULT_GATEWAY_URL,
            clientName: "claw3d-work-mode",
          });
        } catch (err2) {
          console.warn("[useAgentChat] Could not connect to gateway:", err2);
          sharedClient = null;
          sharedConnectPromise = null;
        }
      }
    })();
  }
  return { client: sharedClient!, connectPromise: sharedConnectPromise! };
};

export function useAgentChat(agentId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const clientRef = useRef<GatewayClient | null>(null);
  const sessionKey = `agent:${agentId}:main`;
  const pendingRunIdRef = useRef<string | null>(null);
  const streamBufferRef = useRef<string>("");
  const streamMsgIdRef = useRef<string | null>(null);

  // Reset when agentId changes
  useEffect(() => {
    setMessages([]);
    setLoading(false);
    pendingRunIdRef.current = null;
    streamBufferRef.current = "";
    streamMsgIdRef.current = null;
  }, [agentId]);

  // Connect and attach event listener
  useEffect(() => {
    const { client, connectPromise } = getSharedClient();
    clientRef.current = client;

    const cleanup = client.onEvent((event) => {
      const payload = event.payload as Record<string, unknown> | null | undefined;
      if (!payload) return;

      const eventSessionKey =
        typeof payload.sessionKey === "string" ? payload.sessionKey : null;
      if (eventSessionKey && eventSessionKey !== sessionKey) return;

      // chat event — assistant turn delta / final
      if (event.event === "chat") {
        const state =
          typeof payload.state === "string" ? payload.state : null;
        const runId =
          typeof payload.runId === "string" ? payload.runId : null;

        if (runId && pendingRunIdRef.current && runId !== pendingRunIdRef.current) return;

        if (state === "delta") {
          const message = payload.message;
          const raw =
            typeof message === "string"
              ? message
              : typeof message === "object" && message !== null && "content" in message
                ? String((message as { content: unknown }).content)
                : null;
          if (raw) {
            const text = extractText(raw) || raw;
            streamBufferRef.current += text;

            setMessages((prev) => {
              if (streamMsgIdRef.current) {
                return prev.map((m) =>
                  m.id === streamMsgIdRef.current
                    ? { ...m, text: streamBufferRef.current }
                    : m
                );
              } else {
                const msgId = `${Date.now()}-stream`;
                streamMsgIdRef.current = msgId;
                return [
                  ...prev,
                  {
                    id: msgId,
                    role: "agent",
                    text: streamBufferRef.current,
                    timestamp: new Date(),
                  },
                ];
              }
            });
          }
        } else if (state === "final" || state === "aborted" || state === "error") {
          // Finalise the stream message
          const message = payload.message;
          const raw =
            typeof message === "string"
              ? message
              : typeof message === "object" && message !== null && "content" in message
                ? String((message as { content: unknown }).content)
                : null;

          if (raw) {
            const finalText = extractText(raw) || raw;
            setMessages((prev) => {
              if (streamMsgIdRef.current) {
                return prev.map((m) =>
                  m.id === streamMsgIdRef.current
                    ? { ...m, text: finalText }
                    : m
                );
              }
              return [
                ...prev,
                {
                  id: `${Date.now()}-final`,
                  role: "agent",
                  text: finalText,
                  timestamp: new Date(),
                },
              ];
            });
          }

          // Reset stream state
          streamBufferRef.current = "";
          streamMsgIdRef.current = null;
          pendingRunIdRef.current = null;
          setLoading(false);
        }
      }

      // agent event — streaming assistant text
      if (event.event === "agent") {
        const stream = typeof payload.stream === "string" ? payload.stream : null;
        const data = payload.data as Record<string, unknown> | null | undefined;
        const runId =
          typeof payload.runId === "string" ? payload.runId : null;

        if (runId && pendingRunIdRef.current && runId !== pendingRunIdRef.current) return;
        if (stream !== "assistant") return;

        const text =
          data && typeof data.text === "string"
            ? data.text
            : null;

        if (text) {
          streamBufferRef.current = text; // agent stream gives full accumulated text
          setMessages((prev) => {
            if (streamMsgIdRef.current) {
              return prev.map((m) =>
                m.id === streamMsgIdRef.current
                  ? { ...m, text: streamBufferRef.current }
                  : m
              );
            } else {
              const msgId = `${Date.now()}-agent-stream`;
              streamMsgIdRef.current = msgId;
              return [
                ...prev,
                {
                  id: msgId,
                  role: "agent",
                  text: streamBufferRef.current,
                  timestamp: new Date(),
                },
              ];
            }
          });
        }
      }
    });

    // Ensure connected
    connectPromise?.catch(() => {});

    return cleanup;
  }, [sessionKey]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      // Optimistically add user message
      const userMsg: ChatMessage = {
        id: `${Date.now()}-u`,
        role: "user",
        text: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      // Reset stream state
      streamBufferRef.current = "";
      streamMsgIdRef.current = null;

      const client = clientRef.current;
      if (!client) {
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-err`,
            role: "agent",
            text: "⚠️ Gateway not connected. Check your connection settings.",
            timestamp: new Date(),
          },
        ]);
        setLoading(false);
        return;
      }

      try {
        const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        pendingRunIdRef.current = runId;

        const result = await client.call("chat.send", {
          sessionKey,
          message: trimmed,
          deliver: false,
          idempotencyKey: runId,
        });

        // If gateway returns immediately (no streaming), show result
        const res = result as Record<string, unknown> | null | undefined;
        const status = res && typeof res.status === "string" ? res.status : null;
        if (status !== "started" && status !== "in_flight") {
          // Terminal immediate — no streaming expected
          pendingRunIdRef.current = null;
          setLoading(false);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Gateway error";
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-err`,
            role: "agent",
            text: `⚠️ ${msg}`,
            timestamp: new Date(),
          },
        ]);
        pendingRunIdRef.current = null;
        setLoading(false);
      }
    },
    [loading, sessionKey]
  );

  return { messages, sendMessage, loading };
}
