import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import integrations from "../../data/integrations.json" with { type: "json" };

export const RANK_ENDPOINT = integrations.valorant.endpoint;

const rankTiers = new Map([
  ["unranked", 0],
  ["iron 1", 3],
  ["iron 2", 4],
  ["iron 3", 5],
  ["bronze 1", 6],
  ["bronze 2", 7],
  ["bronze 3", 8],
  ["silver 1", 9],
  ["silver 2", 10],
  ["silver 3", 11],
  ["gold 1", 12],
  ["gold 2", 13],
  ["gold 3", 14],
  ["platinum 1", 15],
  ["platinum 2", 16],
  ["platinum 3", 17],
  ["diamond 1", 18],
  ["diamond 2", 19],
  ["diamond 3", 20],
  ["ascendant 1", 21],
  ["ascendant 2", 22],
  ["ascendant 3", 23],
  ["immortal 1", 24],
  ["immortal 2", 25],
  ["immortal 3", 26],
  ["radiant", 27],
]);

export function iconTierForRank(rank) {
  return rankTiers.get(rank.trim().toLowerCase()) ?? 0;
}

export function parseRankText(text, updatedAt = new Date().toISOString()) {
  const match = text.match(
    /^\s*([A-Za-z]+(?:\s+[123])?),\s*RR:\s*(-?\d+)\s*\(\s*([+-]?\d+)\s*\)\s*\(\s*🛡️\s*(\d+)\s*\)\s*$/u,
  );
  if (!match)
    throw new Error(
      `Unexpected Valorant rank response: ${JSON.stringify(text)}`,
    );
  const [, rank, rr, lastMatchRr, shields] = match;
  return {
    accountName: integrations.valorant.accountName,
    tag: integrations.valorant.tag,
    region: integrations.valorant.region,
    rank,
    rr: Number(rr),
    lastMatchRr: Number(lastMatchRr),
    shields: Number(shields),
    iconTier: iconTierForRank(rank),
    updatedAt,
  };
}

export async function refreshRank({
  endpoint = RANK_ENDPOINT,
  output = "data/valorant.json",
  fetcher = fetch,
  timeoutMs = 10_000,
} = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () =>
      controller.abort(
        new DOMException("Rank request timed out", "TimeoutError"),
      ),
    timeoutMs,
  );
  try {
    const response = await fetcher(endpoint, { signal: controller.signal });
    if (!response.ok)
      throw new Error(
        `Valorant rank request failed with HTTP ${response.status}`,
      );
    const status = parseRankText(await response.text());
    const target = resolve(output);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, `${JSON.stringify(status, null, 2)}\n`, "utf8");
    return status;
  } finally {
    clearTimeout(timeout);
  }
}

const isMain =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  refreshRank()
    .then((status) =>
      console.log(`Valorant status updated: ${status.rank}, ${status.rr} RR`),
    )
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
