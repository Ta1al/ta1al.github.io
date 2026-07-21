const allowedGuildId = '823790824646639617';

export function validateDiscordWidget(payload) {
  if (!payload || typeof payload !== 'object' || payload.code || payload.message) {
    throw new Error('Discord widget is unavailable');
  }
  if (payload.id !== allowedGuildId || typeof payload.name !== 'string' || !payload.name.trim()) {
    throw new Error('Discord widget identity is invalid');
  }
  if (!Number.isInteger(payload.presence_count) || payload.presence_count < 0) {
    throw new Error('Discord presence count is invalid');
  }
  const invite = new URL(payload.instant_invite);
  if (invite.protocol !== 'https:' || invite.hostname !== 'discord.com' || !invite.pathname.startsWith('/invite/')) {
    throw new Error('Discord invite is invalid');
  }
  return { name: payload.name, presenceCount: payload.presence_count, invite: invite.href };
}

export async function fetchDiscordWidget(endpoint, fetcher = fetch) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetcher(endpoint, { signal: controller.signal, credentials: 'omit' });
    if (!response.ok) throw new Error(`Discord widget request failed with HTTP ${response.status}`);
    return validateDiscordWidget(await response.json());
  } finally {
    clearTimeout(timeout);
  }
}

async function enhanceDiscordCard(card) {
  const presence = card.querySelector('[data-discord-presence]');
  const state = card.querySelector('[data-discord-state]');
  try {
    const widget = await fetchDiscordWidget(card.dataset.discordWidget);
    card.querySelector('[data-discord-name]').textContent = widget.name;
    card.querySelector('[data-discord-invite]').href = widget.invite;
    presence.textContent = `${widget.presenceCount} ${widget.presenceCount === 1 ? 'person' : 'people'} online now.`;
    state.textContent = 'Live';
    state.classList.add('is-live');
  } catch {
    presence.textContent = 'Live presence is unavailable — the server is still open.';
    state.textContent = 'Offline';
    state.classList.add('is-unavailable');
  }
}

if (typeof document !== 'undefined') {
  const card = document.querySelector('[data-discord-widget]');
  if (card) enhanceDiscordCard(card);
}
