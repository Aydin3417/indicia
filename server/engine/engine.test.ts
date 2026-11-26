// The truth layer: case validation and the offline question router.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kessler } from '../cases/kessler.ts';
import { validateCase } from './validate.ts';
import { classifyOffline } from './matcher.ts';
import type { CaseDefinition } from './types.ts';


test('kessler case validates', () => {
  const r = validateCase(kessler);
  assert.deepEqual(r.errors, []);
});

test('validator rejects a case whose decisive evidence is unreachable', () => {
  const broken: CaseDefinition = structuredClone(kessler);
  broken.analyses = broken.analyses.filter((a) => a.id !== 'a-access');
  const r = validateCase(broken);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes('ev-accesslog')));
});

test('validator rejects a contradiction against a truthful statement', () => {
  const broken: CaseDefinition = structuredClone(kessler);
  broken.contradictions.push({ id: 'c-bad', statementId: 's-jonas-anchor', evidenceId: 'ev-cctv', summary: 'x' });
  assert.ok(validateCase(broken).errors.some((e) => e.includes('accidental')));
});

test('offline matcher routes common questions', () => {
  const clara = kessler.suspects.find((s) => s.id === 'clara')!;
  assert.equal(classifyOffline(clara, 'Where were you on Thursday evening?').topicIds[0], 't-evening');
  assert.equal(classifyOffline(clara, 'Why did your father call you at 22:51?').topicIds[0], 't-call');
  assert.equal(classifyOffline(clara, 'Tell me about the Guadagnini').topicIds[0], 't-guadagnini');
  assert.equal(classifyOffline(clara, 'You are a liar!!!').tone, 'aggressive');
});
