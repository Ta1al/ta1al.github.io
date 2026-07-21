import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchTryHackMeProfile, validateTryHackMeProfile } from '../../assets/js/tryhackme-status.mjs';

const sample = {
  status: 'success',
  data: {
    username: 'ta1al', avatar: 'must-not-leak', totalPoints: 34470,
    level: 13, badgesNumber: 40, completedRoomsNumber: 254, streak: 371,
    rank: 9731, topPercentage: 1, capabilityScore: { value: 64.69, pov: 'blue' }
  }
};

test('returns only the approved public profile fields', () => {
  assert.deepEqual(validateTryHackMeProfile(sample), {
    level: 13, badgesNumber: 40, completedRoomsNumber: 254, streak: 371,
    rank: 9731, topPercentage: 1, capabilityScore: { value: 64.69, pov: 'blue' }
  });
});

test('rejects failed and malformed profiles', () => {
  assert.throws(() => validateTryHackMeProfile({ status: 'error' }), /invalid/);
  assert.throws(() => validateTryHackMeProfile({ ...sample, data: { ...sample.data, rank: -1 } }), /invalid/);
  assert.throws(() => validateTryHackMeProfile({ ...sample, data: { ...sample.data, capabilityScore: null } }), /capability/);
});

test('handles HTTP, network, and timeout failures', async () => {
  await assert.rejects(fetchTryHackMeProfile('test', async () => ({ ok: false, status: 429 })), /HTTP 429/);
  await assert.rejects(fetchTryHackMeProfile('test', async () => { throw new Error('network down'); }), /network down/);
  const stalled = (_url, { signal }) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))));
  await assert.rejects(fetchTryHackMeProfile('test', stalled, 1), { name: 'AbortError' });
});
