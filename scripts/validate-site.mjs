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
    failures.push(`${relative(outputRoot, file)} contains duplicate IDs`);
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

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Validated ${htmlFiles.length} HTML files and ${internalReferences.length} internal references.`,
  );
}
