export function validateTryHackMeProfile(payload) {
  const data = payload?.status === 'success' ? payload.data : null;
  const numericFields = ['level', 'badgesNumber', 'completedRoomsNumber', 'streak', 'rank', 'topPercentage'];
  if (!data || numericFields.some((field) => !Number.isFinite(data[field]) || data[field] < 0)) {
    throw new Error('TryHackMe profile response is invalid');
  }
  if (!data.capabilityScore || !Number.isFinite(data.capabilityScore.value) || typeof data.capabilityScore.pov !== 'string') {
    throw new Error('TryHackMe capability score is invalid');
  }
  return {
    level: data.level,
    badgesNumber: data.badgesNumber,
    completedRoomsNumber: data.completedRoomsNumber,
    streak: data.streak,
    rank: data.rank,
    topPercentage: data.topPercentage,
    capabilityScore: { value: data.capabilityScore.value, pov: data.capabilityScore.pov }
  };
}

export async function fetchTryHackMeProfile(endpoint, fetcher = fetch, timeoutMs = 7000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetcher(endpoint, { signal: controller.signal, credentials: 'omit', headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error(`TryHackMe profile request failed with HTTP ${response.status}`);
    return validateTryHackMeProfile(await response.json());
  } finally {
    clearTimeout(timeout);
  }
}

function setText(card, selector, value) {
  const element = card.querySelector(selector);
  if (element) element.textContent = value;
}

async function enhanceTryHackMeCard(card) {
  const state = card.querySelector('[data-thm-state]');
  try {
    const profile = await fetchTryHackMeProfile(card.dataset.thmProfile);
    setText(card, '[data-thm-level]', profile.level);
    setText(card, '[data-thm-badges]', profile.badgesNumber);
    setText(card, '[data-thm-rooms]', profile.completedRoomsNumber);
    setText(card, '[data-thm-streak]', profile.streak.toLocaleString());
    setText(card, '[data-thm-rank]', profile.rank.toLocaleString());
    setText(card, '[data-thm-top]', profile.topPercentage);
    setText(card, '[data-thm-capability]', profile.capabilityScore.value);
    setText(card, '[data-thm-pov]', profile.capabilityScore.pov);
    state.textContent = 'Live';
    state.classList.add('is-live');
  } catch {
    state.textContent = 'Cached';
    state.classList.add('is-cached');
  }
}

if (typeof document !== 'undefined') {
  const card = document.querySelector('[data-thm-profile]');
  if (card) enhanceTryHackMeCard(card);
}
