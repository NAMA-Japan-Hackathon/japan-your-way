import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exportStatic } from "./export-static.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultOutDir = path.join(root, "out");

function ensureOutDir(dir) {
  if (!fs.existsSync(dir) || !fs.existsSync(path.join(dir, "index.html"))) {
    console.log("Static export out/ not found. Generating now...");
    exportStatic();
  }
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

export function createStaticServer({ outDir = defaultOutDir, port = 3333 } = {}) {
  ensureOutDir(outDir);
  const server = http.createServer((req, res) => {
    try {
      const parsedUrl = new URL(req.url, `http://${req.headers.host || "127.0.0.1"}`);
      let pathname = decodeURIComponent(parsedUrl.pathname);

      // Trailing slash redirect for directory-style routes without extensions
      if (!pathname.endsWith("/") && !path.extname(pathname)) {
        res.writeHead(301, {
          Location: pathname + "/" + (parsedUrl.search || ""),
        });
        res.end();
        return;
      }

      // Forward /api/travel to live Next dev server if running on 3000; otherwise fallback to static offline mode
      if (pathname.startsWith("/api/travel")) {
        const proxyReq = http.request(
          {
            hostname: "127.0.0.1",
            port: 3000,
            path: req.url,
            method: req.method,
            headers: {
              ...req.headers,
              host: "127.0.0.1:3000",
            },
            timeout: 5000,
          },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
          }
        );

        proxyReq.on("timeout", () => {
          proxyReq.destroy(new Error("Proxy timeout"));
        });

        proxyReq.on("error", () => {
          if (res.headersSent) return;
          if (req.method === "GET") {
            res.writeHead(200, {
              "Content-Type": "application/json; charset=utf-8",
              "Cache-Control": "no-store",
              "Set-Cookie":
                "jyw_travel=static-mode-session; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400",
            });
            res.end(
              JSON.stringify({
                connected: false,
                searchConnected: false,
                hotelConnected: false,
              })
            );
          } else {
            req.resume();
            res.writeHead(503, {
              "Content-Type": "application/json; charset=utf-8",
              "Cache-Control": "no-store",
            });
            res.end(
              JSON.stringify({
                error:
                  "The Japan assistant is offline in static export mode. Run npm run dev to enable live AI planning.",
              })
            );
          }
        });

        req.pipe(proxyReq);
        return;
      }

      let filePath = pathname.endsWith("/")
        ? path.join(outDir, pathname, "index.html")
        : path.join(outDir, pathname);

      // Prevent directory traversal
      if (!filePath.startsWith(outDir)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        const notFoundPath = path.join(outDir, "404.html");
        if (fs.existsSync(notFoundPath)) {
          res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
          fs.createReadStream(notFoundPath).pipe(res);
        } else {
          res.writeHead(404);
          res.end("404 Not Found");
        }
        return;
      }

      const stat = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";

      // Support byte ranges for video streaming
      const range = req.headers.range;
      if (range && stat.size > 0) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
        const chunkSize = end - start + 1;

        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${stat.size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize,
          "Content-Type": contentType,
        });

        fs.createReadStream(filePath, { start, end }).pipe(res);
      } else {
        res.writeHead(200, {
          "Content-Length": stat.size,
          "Content-Type": contentType,
          "Accept-Ranges": "bytes",
          "Cache-Control": "no-cache",
        });
        fs.createReadStream(filePath).pipe(res);
      }
    } catch (err) {
      res.writeHead(500);
      res.end(`Internal Server Error: ${err.message}`);
    }
  });

  return {
    server,
    listen: () =>
      new Promise((resolve, reject) => {
        server.listen(port, "127.0.0.1", () => {
          const addr = server.address();
          const actualPort = typeof addr === "object" && addr ? addr.port : port;
          resolve({ port: actualPort, server });
        });
        server.on("error", reject);
      }),
    close: () =>
      new Promise((resolve) => {
        server.close(resolve);
      }),
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const portArgIndex = process.argv.indexOf("--port");
  const port = portArgIndex !== -1 ? parseInt(process.argv[portArgIndex + 1], 10) : 3333;
  const { server, listen } = createStaticServer({ port });
  listen().then(({ port: actualPort }) => {
    console.log(`Static server running at http://127.0.0.1:${actualPort}/ (serving ${defaultOutDir})`);
  });
}
