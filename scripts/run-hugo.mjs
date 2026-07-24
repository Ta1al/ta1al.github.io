import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const requestedArguments = process.argv.slice(2);
const argumentsWithCache = [
  ...requestedArguments,
  "--cacheDir",
  resolve(".hugo_cache"),
];
const result = spawnSync("hugo", argumentsWithCache, {
  shell: process.platform === "win32",
  stdio: "inherit",
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
