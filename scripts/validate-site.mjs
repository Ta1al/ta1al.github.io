import { access, readFile, readdir } from "node:fs/promises";
import { extname, join, normalize, relative, resolve } from "node:path";
import { HtmlValidate } from "html-validate";

const [outputArgument = "public"] = process.argv.slice(2);
const outputRoot = resolve(outputArgument);

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
};

const htmlFiles = (await walk(outputRoot)).filter(
  (path) => extname(path) === ".html",
);
const valueOf = (tag, name) => {
  const match = tag.match(
    new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
  );
  return match?.[1] ?? match?.[2] ?? match?.[3];
};
const tagsNamed = (html, name) =>
  [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map(
    (match) => match[0],
  );
const tagsWith = (html, name, attribute, value) =>
  tagsNamed(html, name).filter(
    (tag) => valueOf(tag, attribute)?.toLowerCase() === value.toLowerCase(),
  );
const structuredDataIn = (html) =>
  [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(
      ([, attributes]) =>
        valueOf(`<script ${attributes}>`, "type") === "application/ld+json",
    )
    .map(([, , json]) => JSON.parse(json));
const includesSchemaType = (value, type) => {
  if (Array.isArray(value)) {
    return value.some((entry) => includesSchemaType(entry, type));
  }
  if (!value || typeof value !== "object") return false;
  if (value["@type"] === type) return true;
  return Object.values(value).some((entry) => includesSchemaType(entry, type));
};
const HTTPS_SITE = "https://ta1al.com/";
const topicSlugs = [
  "tryhackme",
  "osint",
  "cloud-security",
  "digital-forensics",
  "cybersecurity-learning",
];
const retiredPaths = new Set([
  "/blog/2025/first-post/",
  "/blog/2025/completing-thm-soc-path/",
  "/blog/2025/cyber-espionage-incident-2022/",
  "/blog/2025/what-is-cybersecurity/",
  "/blog/2025/basic-linux-commands/",
  "/blog/2025/networking-fundamentals/",
  "/blog/2025/day-01-htb/",
  "/blog/2025/day-02-htb/",
  "/blog/2025/day-03-htb/",
  "/blog/2025/day-04-htb/",
  "/blog/2025/day-05-htb/",
  "/blog/category/general/",
  "/blog/category/bug-bounty-journey/",
]);
const validator = new HtmlValidate({
  extends: ["html-validate:recommended"],
  rules: {
    "attr-quotes": "off",
    "aria-label-misuse": "off",
    "doctype-style": "off",
    "element-required-attributes": "off",
    "element-required-content": "off",
    "long-title": "off",
    "no-raw-characters": "off",
    "no-inline-style": "off",
    "prefer-native-element": "off",
    "tel-non-breaking": "off",
    "unique-landmark": "off",
    "valid-id": "off",
    "wcag/h30": "off",
    "wcag/h37": "off",
  },
});

const failures = [];
const internalReferences = [];

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const outputPath = relative(outputRoot, file);
  const is404 = outputPath === "404.html";
  const isAlias = tagsWith(html, "meta", "http-equiv", "refresh").length > 0;
  const report = await validator.validateString(html, file);
  if (!report.valid) {
    for (const result of report.results) {
      for (const message of result.messages) {
        failures.push(
          `${relative(outputRoot, file)}:${message.line}:${message.column} ${message.message} (${message.ruleId})`,
        );
      }
    }
  }

  const ids = new Set(
    [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]),
  );
  if (ids.size !== [...html.matchAll(/\sid="([^"]+)"/g)].length) {
    failures.push(`${outputPath} contains duplicate IDs`);
  }

  if (tagsWith(html, "meta", "name", "keywords").length > 0) {
    failures.push(`${outputPath} must not contain a meta-keywords tag`);
  }

  const canonicals = tagsWith(html, "link", "rel", "canonical");
  if (is404) {
    if (canonicals.length > 0) {
      failures.push("404.html must not contain a canonical link");
    }
    const robots = tagsWith(html, "meta", "name", "robots").map((tag) =>
      valueOf(tag, "content"),
    );
    if (!robots.includes("noindex, follow")) {
      failures.push("404.html must contain noindex, follow");
    }
    if (structuredDataIn(html).length > 0) {
      failures.push("404.html must not contain structured data");
    }
  } else {
    if (canonicals.length !== 1) {
      failures.push(
        `${outputPath} must contain exactly one canonical link; found ${canonicals.length}`,
      );
    } else {
      const canonical = valueOf(canonicals[0], "href");
      if (!canonical.startsWith(HTTPS_SITE)) {
        failures.push(`${outputPath} has non-HTTPS canonical ${canonical}`);
      }

      if (!isAlias) {
        const openGraphURLs = tagsWith(html, "meta", "property", "og:url").map(
          (tag) => valueOf(tag, "content"),
        );
        if (openGraphURLs.length !== 1 || openGraphURLs[0] !== canonical) {
          failures.push(
            `${outputPath} Open Graph URL must match its canonical URL`,
          );
        }
      }
    }
  }

  let structuredData = [];
  try {
    structuredData = structuredDataIn(html);
  } catch (error) {
    failures.push(`${outputPath} contains invalid JSON-LD: ${error.message}`);
  }
  if (JSON.stringify(structuredData).includes('"http://ta1al.com')) {
    failures.push(`${outputPath} contains an HTTP URL in structured data`);
  }

  if (
    /^blog\/[^/]+\/index\.html$/.test(outputPath) &&
    outputPath !== "blog/topics/index.html"
  ) {
    if (
      !structuredData.some((item) => includesSchemaType(item, "BlogPosting"))
    ) {
      failures.push(`${outputPath} must contain BlogPosting structured data`);
    }
    const authorLinks = tagsWith(html, "a", "rel", "author");
    if (
      authorLinks.length !== 1 ||
      valueOf(authorLinks[0], "href") !== "/about/"
    ) {
      failures.push(`${outputPath} must contain one linked author byline`);
    }
  }

  if (outputPath === "index.html") {
    for (const type of ["WebSite", "Person"]) {
      if (!structuredData.some((item) => includesSchemaType(item, type))) {
        failures.push(`index.html must contain ${type} structured data`);
      }
    }
  }

  for (const match of html.matchAll(
    /\s(?:href|src)=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/g,
  )) {
    const reference = (match[1] ?? match[2] ?? match[3]).replaceAll(
      "&amp;",
      "&",
    );
    if (
      reference.startsWith("http:") ||
      reference.startsWith("https:") ||
      reference.startsWith("mailto:") ||
      reference.startsWith("data:")
    ) {
      continue;
    }
    const [pathPart] = reference.split(/[?#]/);
    if (retiredPaths.has(pathPart)) {
      failures.push(`${outputPath} links to retired URL ${pathPart}`);
    }
    internalReferences.push([file, reference]);
  }
}

for (const [source, reference] of internalReferences) {
  const [pathPart] = reference.split(/[?#]/);
  if (!pathPart) continue;
  const decoded = decodeURIComponent(pathPart);
  const target = decoded.startsWith("/")
    ? join(outputRoot, decoded)
    : resolve(source, "..", decoded);
  const candidates = [
    target,
    join(target, "index.html"),
    normalize(`${target}.html`),
  ];
  let found = false;
  for (const candidate of candidates) {
    try {
      await access(candidate);
      found = true;
      break;
    } catch {
      // Try the next Hugo output shape.
    }
  }
  if (!found) {
    failures.push(
      `${relative(outputRoot, source)} references missing ${reference}`,
    );
  }
}

for (const slug of topicSlugs) {
  const path = join(outputRoot, "blog", "topics", slug, "index.html");
  const html = await readFile(path, "utf8");
  const entries = tagsNamed(html, "article").filter((tag) =>
    valueOf(tag, "class")?.split(/\s+/).includes("post-card"),
  );
  if (entries.length < 2) {
    failures.push(
      `blog/topics/${slug}/ must contain at least two entries; found ${entries.length}`,
    );
  }
}

const sitemap = await readFile(join(outputRoot, "sitemap.xml"), "utf8");
const sitemapURLs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (match) => match[1],
);
if (
  sitemapURLs.length === 0 ||
  sitemapURLs.some((url) => !url.startsWith(HTTPS_SITE))
) {
  failures.push("sitemap.xml must contain only HTTPS site URLs");
}
for (const slug of topicSlugs) {
  const expected = `${HTTPS_SITE}blog/topics/${slug}/`;
  if (!sitemapURLs.includes(expected)) {
    failures.push(`sitemap.xml is missing ${expected}`);
  }
}

const rss = await readFile(join(outputRoot, "blog", "index.xml"), "utf8");
const rssURLs = [
  ...rss.matchAll(/<(?:link|guid)(?:\s[^>]*)?>([^<]+)<\/(?:link|guid)>/g),
].map((match) => match[1]);
if (
  rssURLs.length === 0 ||
  rssURLs.some((url) => !url.startsWith(HTTPS_SITE))
) {
  failures.push("blog/index.xml must contain only HTTPS site URLs");
}

const robots = await readFile(join(outputRoot, "robots.txt"), "utf8");
if (!robots.includes(`Sitemap: ${HTTPS_SITE}sitemap.xml`)) {
  failures.push("robots.txt must advertise the HTTPS sitemap");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Validated ${htmlFiles.length} HTML files and ${internalReferences.length} internal references.`,
  );
}
