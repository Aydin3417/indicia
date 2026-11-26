// Fails if any client file (app/, src/, shared/) imports server code. The truth must never be bundled.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const roots = ['app', 'src', 'shared'];
const bad = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx|js|jsx)$/.test(name)) {
      const src = readFileSync(p, 'utf8');
      for (const m of src.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)) {
        const spec = m[1];
        if (spec.startsWith('.')) {
          const target = path.relative(process.cwd(), path.resolve(path.dirname(p), spec)).replace(/\\/g, '/');
          if (target === 'server' || target.startsWith('server/')) bad.push(`${p} → ${spec}`);
        }
        if (/^(hono|@hono\/|zod)/.test(spec)) bad.push(`${p} → ${spec} (server-only package)`);
      }
    }
  }
};
roots.forEach(walk);
if (bad.length) {
  console.error('Client code imports server code:\n  ' + bad.join('\n  '));
  process.exit(1);
}
console.log(`boundary ok — ${roots.join(', ')} import nothing from server/`);
