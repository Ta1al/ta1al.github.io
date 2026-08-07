import { readdir, stat } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";

const outputRoot = resolve(process.argv[2] ?? "public");
// Calibrated against the August 2026 production bundles with modest growth room.
const CSS_BUDGET_BYTES = 45_000;
const JAVASCRIPT_BUDGET_BYTES = 5_600;

const filesIn = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => join(directory, entry.name));
};

const cssFiles = (await filesIn(join(outputRoot, "css"))).filter(
  (path) => extname(path) === ".css",
);
const jsFiles = (await filesIn(join(outputRoot, "js"))).filter(
  (path) => extname(path) === ".js",
);
const failures = [];

for (const path of cssFiles) {
  const bytes = (await stat(path)).size;
  if (bytes > CSS_BUDGET_BYTES) {
    failures.push(
      `${basename(path)} is ${bytes} bytes; CSS budget is ${CSS_BUDGET_BYTES}`,
    );
  }
}
for (const path of jsFiles) {
  const bytes = (await stat(path)).size;
  if (bytes > JAVASCRIPT_BUDGET_BYTES) {
    failures.push(
      `${basename(path)} is ${bytes} bytes; JavaScript budget is ${JAVASCRIPT_BUDGET_BYTES}`,
    );
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Asset budgets pass for ${cssFiles.length} CSS and ${jsFiles.length} JavaScript bundles.`,
  );
}
