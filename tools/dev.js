// Локален сървър за преглед: `npm run dev` → http://localhost:3000
// Работи като Vercel: /about отваря about.html, /blog отваря blog/index.html.
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "public");
const PORT = Number(process.env.PORT) || 3000;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json", ".xml": "application/xml; charset=utf-8", ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon",
};

function resolve(urlPath) {
  const clean = path.normalize(decodeURIComponent(urlPath)).replace(/^([\\/])+/, "");
  const base = path.join(ROOT, clean);
  if (!base.startsWith(ROOT)) return null;
  for (const f of [base, base + ".html", path.join(base, "index.html")]) {
    try { if (fs.statSync(f).isFile()) return f; } catch {}
  }
  return null;
}

http.createServer((req, res) => {
  const file = resolve(req.url.split("?")[0]);
  const target = file || path.join(ROOT, "404.html");
  res.writeHead(file ? 200 : 404, { "Content-Type": TYPES[path.extname(target)] || "application/octet-stream" });
  fs.createReadStream(target).pipe(res);
}).listen(PORT, () => console.log(`Сайтът е на http://localhost:${PORT}`));
