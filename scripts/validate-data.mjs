import { access, readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { parse as parseToml } from "smol-toml";

const root = fileURLToPath(new URL("../", import.meta.url));
const readJson = async (path) =>
  JSON.parse(await readFile(join(root, path), "utf8"));

const schema = await readJson("schemas/content.schema.json");
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);

const validate = (name, schemaDefinition, value) => {
  const validator = ajv.compile({
    $defs: definitions,
    ...schemaDefinition,
  });
  if (validator(value)) return;
  const details = validator.errors
    .map((error) => `  ${error.instancePath || "/"} ${error.message}`)
    .join("\n");
  throw new Error(`${name} failed validation:\n${details}`);
};

const definitions = schema.$defs;
const dataFiles = [
  ["data/resume-soc.json", definitions.resume],
  ["data/resume-software.json", definitions.resume],
  ["data/valorant.json", definitions.valorant],
  ["data/integrations.json", definitions.integrations],
  ["data/achievements.json", { type: "array", items: definitions.achievement }],
  [
    "data/personal-achievements.json",
    { type: "array", items: definitions.personalAchievement },
  ],
];

for (const [path, definition] of dataFiles) {
  validate(path, definition, await readJson(path));
}

const achievements = await readJson("data/achievements.json");
for (const achievement of achievements) {
  const source = achievement.image?.src;
  if (!source?.startsWith("/images/achievements/")) continue;
  try {
    await access(join(root, "static", source));
  } catch {
    throw new Error(
      `data/achievements.json references missing local image ${source}`,
    );
  }
}

const assertArrayAt = (value, path, source) => {
  let current = value;
  for (const segment of path) current = current?.[segment];
  if (!Array.isArray(current)) {
    throw new Error(`${source} is missing required array ${path.join(".")}`);
  }
};

const vendorSnapshots = [
  [
    "data/credly-badges.json",
    ["data"],
    await readJson("data/credly-badges.json"),
  ],
  [
    "data/coursera-courses.json",
    [0, "data", "Certificate", "getMyCertificatesPaginated", "elements"],
    await readJson("data/coursera-courses.json"),
  ],
  [
    "data/coursera-specializations.json",
    [0, "data", "Certificate", "getMyCertificatesPaginated", "elements"],
    await readJson("data/coursera-specializations.json"),
  ],
  [
    "data/tryhackme-badges.json",
    ["data", "docs"],
    await readJson("data/tryhackme-badges.json"),
  ],
  [
    "data/tryhackme-certs.json",
    ["data", "docs"],
    await readJson("data/tryhackme-certs.json"),
  ],
];

for (const [source, path, value] of vendorSnapshots) {
  assertArrayAt(value, path, source);
}

const projectRoot = join(root, "content", "projects");
const projectEntries = await readdir(projectRoot, { withFileTypes: true });
for (const entry of projectEntries) {
  if (!entry.isDirectory()) continue;
  const sourcePath = join(projectRoot, entry.name, "index.md");
  const source = await readFile(sourcePath, "utf8");
  const match = source.match(/^\+\+\+\r?\n([\s\S]*?)\r?\n\+\+\+/);
  if (!match) {
    throw new Error(
      `${relative(root, sourcePath)} must begin with TOML front matter`,
    );
  }
  validate(
    relative(root, sourcePath),
    definitions.projectFrontmatter,
    parseToml(match[1]),
  );
}

const blogRoot = join(root, "content", "blog");
const blogEntries = (await readdir(blogRoot, { withFileTypes: true })).filter(
  (entry) => entry.isDirectory() && entry.name !== "topics",
);
for (const entry of blogEntries) {
  const sourcePath = join(blogRoot, entry.name, "index.md");
  const source = await readFile(sourcePath, "utf8");
  const match = source.match(/^\+\+\+\r?\n([\s\S]*?)\r?\n\+\+\+/);
  if (!match) {
    throw new Error(
      `${relative(root, sourcePath)} must begin with TOML front matter`,
    );
  }
  validate(
    relative(root, sourcePath),
    definitions.blogFrontmatter,
    parseToml(match[1]),
  );
}

console.log(
  `Validated ${dataFiles.length} maintained data files, ${vendorSnapshots.length} vendor snapshots, ${projectEntries.filter((entry) => entry.isDirectory()).length} project entries, and ${blogEntries.length} blog entries.`,
);
