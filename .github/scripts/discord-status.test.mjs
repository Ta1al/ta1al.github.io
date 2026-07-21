import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchDiscordWidget, validateDiscordWidget } from '../../assets/js/discord-status.mjs';

const valid = {
  id: '823790824646639617', name: '✨House of Talal✨', presence_count: 3,
  instant_invite: 'https://discord.com/invite/EqbAQHrB', members: [{ username: 'must not leak' }]
};

test('returns only safe public server fields', () => {
  assert.deepEqual(validateDiscordWidget(valid), {
    name: '✨House of Talal✨', presenceCount: 3, invite: 'https://discord.com/invite/EqbAQHrB'
  });
});

test('rejects disabled and malformed widgets', () => {
  assert.throws(() => validateDiscordWidget({ message: 'Widget Disabled', code: 50004 }), /unavailable/);
  assert.throws(() => validateDiscordWidget({ ...valid, presence_count: -1 }), /presence count/);
  assert.throws(() => validateDiscordWidget({ ...valid, instant_invite: 'https://example.com/invite/nope' }), /invite/);
});

test('rejects failed responses and network failures', async () => {
  await assert.rejects(fetchDiscordWidget('test', async () => ({ ok: false, status: 503 })), /HTTP 503/);
  await assert.rejects(fetchDiscordWidget('test', async () => { throw new Error('network down'); }), /network down/);
});
