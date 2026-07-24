import { readdir, stat } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";

const outputRoot = resolve(process.argv[2] ?? "public");
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
  if (bytes > 41_000) {
    failures.push(`${basename(path)} is ${bytes} bytes; CSS budget is 41000`);
  }
}
for (const path of jsFiles) {
  const bytes = (await stat(path)).size;
  if (bytes > 5_000) {
    failures.push(
      `${basename(path)} is ${bytes} bytes; JavaScript budget is 5000`,
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
