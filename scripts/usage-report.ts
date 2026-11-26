// AI cost report from the local dev log (.data/ai_usage.log). Production: `select * from ai_cost_daily`.
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const file = path.resolve(process.env.DATA_DIR ?? '.data', 'ai_usage.log');
if (!existsSync(file)) {
  console.log('No AI calls logged yet (offline mode writes nothing: no model was called).');
  process.exit(0);
}

type Row = { at: string; userId: string; provider: string; model: string; purpose: string; inputTokens: number; outputTokens: number; costUsd: number; latencyMs: number; ok: boolean };
const rows: Row[] = readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));

const groups = new Map<string, Row[]>();
for (const r of rows) {
  const key = [r.at.slice(0, 10), r.provider, r.model, r.purpose].join(' | ');
  groups.set(key, [...(groups.get(key) ?? []), r]);
}
console.log('day        | provider | model | purpose  calls  fail  tokens(in/out)  cost$   avg ms  players');
for (const [key, list] of [...groups].sort()) {
  const sum = (f: (r: Row) => number) => list.reduce((n, r) => n + f(r), 0);
  console.log(
    `${key}  ${String(list.length).padStart(5)}  ${String(list.filter((r) => !r.ok).length).padStart(4)}  ` +
    `${sum((r) => r.inputTokens)}/${sum((r) => r.outputTokens)}  ${sum((r) => r.costUsd).toFixed(4)}  ` +
    `${Math.round(sum((r) => r.latencyMs) / list.length)}  ${new Set(list.map((r) => r.userId)).size}`,
  );
}
const total = rows.reduce((n, r) => n + r.costUsd, 0);
const questions = rows.filter((r) => r.purpose === 'render').length;
console.log(`\ntotal $${total.toFixed(4)} over ${rows.length} calls · ≈ $${(total / Math.max(1, questions)).toFixed(5)} per question`);
