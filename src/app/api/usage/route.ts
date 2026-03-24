import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import readline from "readline";
import os from "os";

interface UsageEntry {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  totalTokens: number;
  cost?: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
    total: number;
  };
}

interface DayBucket {
  tokens: number;
  cost: number;
}

interface ModelBucket {
  tokens: number;
  cost: number;
}

interface AgentBucket {
  tokens: number;
  cost: number;
}

// Map model IDs to friendly names
function mapModel(modelId: string): string {
  if (!modelId) return "Unknown";
  const m = modelId.toLowerCase();
  if (m.includes("opus")) return "Claude Opus 4.6";
  if (m.includes("sonnet")) return "Claude Sonnet 4.6";
  if (m.includes("minimax") || m.includes("m2.7") || m.includes("mini")) return "MiniMax M2.7";
  return modelId;
}

// Map agent session dir name to friendly name
function mapAgent(agentName: string): { name: string; emoji: string } {
  const map: Record<string, { name: string; emoji: string }> = {
    main:   { name: "Alfi",   emoji: "🤝" },
    benito: { name: "Benito", emoji: "🐇" },
    scout:  { name: "Scout",  emoji: "🔍" },
    nova:   { name: "Nova",   emoji: "🌸" },
    atlas:  { name: "Atlas",  emoji: "🗺️" },
    bloom:  { name: "Bloom",  emoji: "🌺" },
    pixel:  { name: "Pixel",  emoji: "🎨" },
    pulse:  { name: "Pulse",  emoji: "💓" },
    cupid:  { name: "Cupid",  emoji: "💘" },
    judge:  { name: "Judge",  emoji: "⚖️" },
    forge:  { name: "Forge",  emoji: "🔨" },
    quill:  { name: "Quill",  emoji: "✍️" },
    chip:   { name: "Chip",   emoji: "📈" },
    mint:   { name: "Mint",   emoji: "🪙" },
  };
  return map[agentName] ?? { name: agentName, emoji: "🤖" };
}

async function readJsonl(filePath: string): Promise<Record<string, unknown>[]> {
  const results: Record<string, unknown>[] = [];
  if (!fs.existsSync(filePath)) return results;
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      results.push(JSON.parse(line));
    } catch {
      // skip malformed lines
    }
  }
  return results;
}

export async function GET() {
  const agentsDir = path.join(os.homedir(), ".openclaw", "agents");

  // Last 7 days buckets
  const now = Date.now();
  const MS_PER_DAY = 86400000;
  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days: { label: string; date: Date; tokens: number; cost: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * MS_PER_DAY);
    days.push({ label: DAY_LABELS[d.getDay()], date: d, tokens: 0, cost: 0 });
  }

  const modelBuckets: Record<string, ModelBucket> = {};
  const agentBuckets: Record<string, AgentBucket & { emoji: string; name: string }> = {};
  let totalCost = 0;
  let totalTokens = 0;

  if (!fs.existsSync(agentsDir)) {
    return NextResponse.json({ days, modelBreakdown: [], agentBreakdown: [], totalCost: 0, totalTokens: 0 });
  }

  const agentNames = fs.readdirSync(agentsDir).filter(name => {
    const p = path.join(agentsDir, name);
    return fs.statSync(p).isDirectory();
  });

  for (const agentName of agentNames) {
    const sessionsDir = path.join(agentsDir, agentName, "sessions");
    if (!fs.existsSync(sessionsDir)) continue;

    const files = fs.readdirSync(sessionsDir).filter(f => f.endsWith(".jsonl"));
    const { name: friendlyName, emoji } = mapAgent(agentName);

    if (!agentBuckets[agentName]) {
      agentBuckets[agentName] = { tokens: 0, cost: 0, emoji, name: friendlyName };
    }

    for (const file of files) {
      const filePath = path.join(sessionsDir, file);
      const records = await readJsonl(filePath);

      for (const rec of records) {
        if (rec.type !== "message") continue;
        const msg = rec.message as { role?: string; usage?: UsageEntry; model?: string } | undefined;
        if (!msg || msg.role !== "assistant") continue;
        const usage = msg.usage;
        if (!usage || !usage.totalTokens) continue;

        const ts = typeof rec.timestamp === "string" ? new Date(rec.timestamp) : null;
        if (!ts) continue;
        const tsTime = ts.getTime();

        // Find which day bucket
        const dayIdx = days.findIndex((d, idx) => {
          const start = new Date(d.date).setHours(0, 0, 0, 0);
          const end = new Date(d.date).setHours(23, 59, 59, 999);
          return tsTime >= start && tsTime <= end;
        });

        const tokens = usage.totalTokens;
        const cost = usage.cost?.total ?? 0;

        if (dayIdx >= 0) {
          days[dayIdx].tokens += tokens;
          days[dayIdx].cost += cost;
        }

        // Model breakdown
        const modelKey = mapModel(msg.model ?? "");
        if (!modelBuckets[modelKey]) modelBuckets[modelKey] = { tokens: 0, cost: 0 };
        modelBuckets[modelKey].tokens += tokens;
        modelBuckets[modelKey].cost += cost;

        // Agent breakdown
        agentBuckets[agentName].tokens += tokens;
        agentBuckets[agentName].cost += cost;

        totalTokens += tokens;
        totalCost += cost;
      }
    }
  }

  // Build sorted model breakdown
  const modelBreakdown = Object.entries(modelBuckets)
    .map(([label, b]) => ({
      label,
      tokens: b.tokens,
      cost: b.cost,
      pct: totalTokens > 0 ? Math.round((b.tokens / totalTokens) * 100) : 0,
    }))
    .sort((a, b) => b.tokens - a.tokens);

  // Build sorted agent breakdown
  const agentBreakdown = Object.values(agentBuckets)
    .map(b => ({
      emoji: b.emoji,
      name: b.name,
      tokens: b.tokens,
      cost: b.cost,
      pct: totalTokens > 0 ? Math.round((b.tokens / totalTokens) * 100) : 0,
    }))
    .filter(a => a.tokens > 0)
    .sort((a, b) => b.tokens - a.tokens)
    .slice(0, 8);

  return NextResponse.json({
    days: days.map(d => ({ day: d.label, tokens: d.tokens, cost: d.cost })),
    modelBreakdown,
    agentBreakdown,
    totalCost,
    totalTokens,
  });
}
