import { ALL_CASES } from '../server/cases/index.ts';
import { validateCase } from '../server/engine/validate.ts';

let failed = false;
for (const def of ALL_CASES) {
  const r = validateCase(def);
  console.log(`\n■ ${def.id} v${def.version} — ${r.ok ? 'VALID' : 'INVALID'}`);
  console.log('  ' + Object.entries(r.stats).map(([k, v]) => `${k}=${v}`).join('  '));
  for (const e of r.errors) console.log(`  ✗ ${e}`);
  for (const w of r.warnings) console.log(`  ! ${w}`);
  if (!r.ok) failed = true;
}
process.exit(failed ? 1 : 0);
