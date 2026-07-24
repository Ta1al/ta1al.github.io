import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { buildAchievements } from "./normalize-achievements.mjs";

const allowedHosts = new Set([
  "assets.tryhackme.com",
  "coursera-university-assets.s3.amazonaws.com",
  "images.credly.com",
  "tryhackme-certificates.s3-eu-west-1.amazonaws.com",
  "upload.wikimedia.org",
]);
const extensions = new Map([
  ["image/avif", ".avif"],
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/svg+xml", ".svg"],
  ["image/webp", ".webp"],
]);
const outputDirectory = resolve("static/images/achievements");
const manifestPath = resolve("data/achievement-images.json");
const achievements = await buildAchievements({ preferLocalImages: false });
const remoteImages = achievements.filter((item) =>
  item.image?.src?.startsWith("https://"),
);
const grouped = Map.groupBy(remoteImages, (item) => item.image.src);
const manifest = {};
const failures = [];

await mkdir(outputDirectory, { recursive: true });

async function cacheImage([source, items]) {
  const url = new URL(source);
  if (!allowedHosts.has(url.hostname)) {
    failures.push(`Unapproved achievement image host: ${url.hostname}`);
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const contentType = response.headers.get("content-type")?.split(";")[0];
    const extension =
      extensions.get(contentType) ||
      extname(url.pathname).toLowerCase() ||
      ".img";
    if (![...extensions.values()].includes(extension)) {
      throw new Error(`unsupported content type ${contentType ?? "unknown"}`);
    }
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > 5_000_000) {
      throw new Error(`image exceeds 5 MB (${bytes.byteLength} bytes)`);
    }
    const filename = `${createHash("sha256").update(source).digest("hex").slice(0, 16)}${extension}`;
    await writeFile(resolve(outputDirectory, filename), bytes);
    for (const item of items) {
      manifest[item.id] = `/images/achievements/${filename}`;
    }
  } catch (error) {
    failures.push(`${source}: ${error.message}`);
  } finally {
    clearTimeout(timeout);
  }
}

const entries = [...grouped.entries()];
for (let index = 0; index < entries.length; index += 6) {
  await Promise.all(entries.slice(index, index + 6).map(cacheImage));
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  await writeFile(
    manifestPath,
    `${JSON.stringify(
      Object.fromEntries(
        Object.entries(manifest).sort(([left], [right]) =>
          left.localeCompare(right),
        ),
      ),
      null,
      2,
    )}\n`,
    "utf8",
  );
  console.log(
    `Cached ${entries.length} unique achievement images for ${remoteImages.length} records.`,
  );
}
