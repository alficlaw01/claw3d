"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAgentStore } from "@/features/agents/state/store";
import type { EventFrame } from "@/lib/gateway/GatewayClient";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  timestamp: number;
}

// ── localStorage helpers ──────────────────────────────────────────────────────

const MAX_HISTORY = 100;

const loadHistory = (agentId: string): ChatMessage[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`chat-history-${agentId}`);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as ChatMessage[];
  } catch {
    return [];
  }
};

const saveHistory = (agentId: string, messages: ChatMessage[]): void => {
  if (typeof window === "undefined") return;
  try {
    const capped = messages.slice(-MAX_HISTORY);
    localStorage.setItem(`chat-history-${agentId}`, JSON.stringify(capped));
  } catch {
    // localStorage quota or SSR — ignore
  }
};

// ── ChatEventPayload ──────────────────────────────────────────────────────────

type ChatEventPayload = {
  sessionKey?: string;
  state?: string;
  message?: Record<string, unknown>;
};

const extractTextFromMessage = (message: Record<string, unknown>): string => {
  const content = message.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((c): c is Record<string, unknown> => typeof c === "object" && c !== null)
      .filter((c) => c.type === "text" && typeof c.text === "string")
      .map((c) => c.text as string)
      .join("");
  }
  if (typeof message.text === "string") return message.text;
  return "";
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAgentChat(agentId: string) {
  const { gatewayClient, gatewayStatus } = useAgentStore();

  // Load initial history from localStorage
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadHistory(agentId));
  const [loading, setLoading] = useState(false);

  const agentIdRef = useRef(agentId);
  const messagesRef = useRef<ChatMessage[]>(messages);

  // Sync refs
  useEffect(() => {
    agentIdRef.current = agentId;
  }, [agentId]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Reset and reload history when agent changes
  useEffect(() => {
    const history = loadHistory(agentId);
    setMessages(history);
    setLoading(false);
  }, [agentId]);

  // Save to localStorage whenever messages change
  useEffect(() => {
    saveHistory(agentId, messages);
  }, [agentId, messages]);

  // Listen for gateway events from this agent
  useEffect(() => {
    if (!gatewayClient) return;

    const unsub = gatewayClient.onEvent((event: EventFrame) => {
      // EventFrame: { type: "event", event: "chat"|"agent", payload: {...} }
      if (event.event !== "chat" && event.event !== "agent") return;

      const payload = event.payload as ChatEventPayload | undefined;
      if (!payload) return;

      // Filter by sessionKey — must match agent:${agentId}:main
      const expectedSessionKey = `agent:${agentIdRef.current}:main`;
      const eventSessionKey = payload.sessionKey ?? "";
      if (eventSessionKey && eventSessionKey !== expectedSessionKey) return;

      if (event.event === "chat") {
        // chat events: state=delta|final|aborted|error, message={role, content}
        const state = payload.state ?? "";
        if (state !== "delta" && state !== "final") return;

        const message = payload.message;
        if (!message || typeof message !== "object") return;

        const role = message.role;
        if (role !== "assistant") return;

        const text = extractTextFromMessage(message).trim();
        if (!text) return;

        setMessages((prev) => {
          const next = [...prev, { role: "assistant" as const, text, timestamp: Date.now() }];
          return next;
        });
        if (state === "final") {
          setLoading(false);
        }
      } else if (event.event === "agent") {
        // agent events: stream="assistant", data={text}
        const agentPayload = event.payload as Record<string, unknown> | undefined;
        if (!agentPayload) return;

        const stream = agentPayload.stream;
        if (stream !== "assistant") return;

        const data = agentPayload.data as Record<string, unknown> | undefined;
        if (!data) return;

        const text = typeof data.text === "string" ? data.text.trim() : "";
        if (!text) return;

        setMessages((prev) => {
          const next = [...prev, { role: "assistant" as const, text, timestamp: Date.now() }];
          return next;
        });
        setLoading(false);
      }
    });

    return unsub;
  }, [gatewayClient]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      // Optimistically add user message
      setMessages((prev) => [
        ...prev,
        { role: "user", text, timestamp: Date.now() },
      ]);
      setLoading(true);

      if (!gatewayClient || gatewayStatus !== "connected") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "⚠️ Not connected to gateway. Try refreshing the page.",
            timestamp: Date.now(),
          },
        ]);
        setLoading(false);
        return;
      }

      const sessionKey = `agent:${agentIdRef.current}:main`;

      try {
        await gatewayClient.call("chat.send", {
          sessionKey,
          message: text,
          deliver: false,
        });
      } catch (err) {
        console.error("[useAgentChat] Send failed:", err);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: `⚠️ Failed to send: ${err instanceof Error ? err.message : "Unknown error"}`,
            timestamp: Date.now(),
          },
        ]);
        setLoading(false);
      }
    },
    [gatewayClient, gatewayStatus]
  );

  return { messages, sendMessage, loading, gatewayStatus };
}
