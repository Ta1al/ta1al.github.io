import assert from 'node:assert/strict';
import test from 'node:test';
import { iconTierForRank, parseRankText } from './fetch-valorant-status.mjs';

const timestamp = '2026-07-21T10:53:25.000Z';

test('parses a rank loss and shields', () => {
  const result = parseRankText('Diamond 1, RR: 0 (-18)  (🛡️ 2)', timestamp);
  assert.deepEqual(result, {
    accountName: 'PerryThePlatypus', tag: '257', region: 'EU', rank: 'Diamond 1',
    rr: 0, lastMatchRr: -18, shields: 2, iconTier: 18, updatedAt: timestamp
  });
});

test('parses a positive match result', () => {
  assert.equal(parseRankText('Ascendant 2, RR: 74 (+21) (🛡️ 0)', timestamp).lastMatchRr, 21);
});

test('maps current ranks and falls back for unknown ranks', () => {
  assert.equal(iconTierForRank('Radiant'), 27);
  assert.equal(iconTierForRank('Mystery 9'), 0);
});

test('rejects malformed or incomplete responses', () => {
  assert.throws(() => parseRankText('Diamond 1 — 20 RR', timestamp), /Unexpected Valorant rank response/);
  assert.throws(() => parseRankText('', timestamp), /Unexpected Valorant rank response/);
});
