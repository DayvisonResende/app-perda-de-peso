// Servidor estático de dist/ (http://localhost:5173). Com --watch, remonta o app a cada mudança.
//   node scripts/serve.mjs [--watch] [--port 5173]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'), DIST = join(ROOT, 'dist');
const argPort = process.argv.indexOf('--port'), PORT = Number(argPort > -1 ? process.argv[argPort + 1] : process.env.PORT || 5173);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

if (process.argv.includes('--watch')) spawn(process.execPath, [join(ROOT, 'scripts/build.mjs'), '--watch'], { stdio: 'inherit' });

createServer(async (req, res) => {
  try {
    let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    let file = join(DIST, p);
    if (!file.startsWith(DIST)) { res.writeHead(403).end(); return; }
    if ((await stat(file).catch(() => null))?.isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }).end(body);
  } catch { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('não encontrado'); }
}).listen(PORT, '127.0.0.1', () => console.log(`BioTrack em http://localhost:${PORT}`));
