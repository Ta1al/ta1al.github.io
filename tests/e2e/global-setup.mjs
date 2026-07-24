import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const host = "127.0.0.1";
const port = 4173;
const publicRoot = resolve("public");
const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".pdf", "application/pdf"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".xml", "application/xml; charset=utf-8"],
]);

async function fileFor(requestPath) {
  const decoded = decodeURIComponent(requestPath);
  const relative = decoded.replace(/^[/\\]+/, "");
  let candidate = resolve(publicRoot, relative);
  if (
    candidate !== publicRoot &&
    !candidate.startsWith(`${publicRoot}${sep}`)
  ) {
    return null;
  }
  if ((await stat(candidate).catch(() => null))?.isDirectory()) {
    candidate = resolve(candidate, "index.html");
  }
  return candidate;
}

export default async function setup() {
  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? "/", `http://${host}:${port}`);
      const path = await fileFor(requestUrl.pathname);
      if (!path) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      const body = await readFile(path);
      response.writeHead(200, {
        "Content-Type":
          contentTypes.get(extname(path)) ?? "application/octet-stream",
      });
      response.end(body);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });

  await new Promise((resolvePromise, reject) => {
    server.once("error", reject);
    server.listen(port, host, resolvePromise);
  });

  return async () => {
    await new Promise((resolvePromise, reject) => {
      server.close((error) => (error ? reject(error) : resolvePromise()));
    });
  };
}
