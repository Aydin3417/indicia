// Copies server/ and shared/ into supabase/functions/_shared so the Edge Function bundle is self-contained.
import { cpSync, rmSync } from 'node:fs';

const out = 'supabase/functions/_shared';
rmSync(out, { recursive: true, force: true });
cpSync('server', `${out}/server`, { recursive: true, filter: (p) => !/(\.test\.ts|dev\.ts|fileStore\.ts)$/.test(p) });
cpSync('shared', `${out}/shared`, { recursive: true });
console.log(`synced server/ and shared/ → ${out}`);
