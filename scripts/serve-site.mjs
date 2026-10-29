// @ts-check
/**
 * Serve `_site` for the browser tests and for previewing a production build.
 * It mirrors a static host closely enough: directory indexes, `.html`
 * fallbacks, and the built 404 page.
 */

import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileCandidates } from './lib/site.mjs';

const MIME = Object.freeze({
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon'
});

/**
 * @typedef {{ port: number, host: string, root: string }} Options
 * @returns {Options}
 */
const readOptions = () => {
  /** @type {Options} */
  const options = { port: 4173, host: '127.0.0.1', root: '_site' };
  const args = process.argv.slice(2);
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index + 1];
    if (!value) continue;
    if (args[index] === '--port') options.port = Number(value);
    if (args[index] === '--host') options.host = value;
    if (args[index] === '--root') options.root = value;
  }
  return options;
};

const options = readOptions();
const root = resolve(options.root);

/**
 * @param {string} pathname
 * @returns {Promise<string | null>}
 */
const findFile = async (pathname) => {
  /** @type {string[]} */
  let candidates;
  try {
    candidates = fileCandidates(pathname);
  } catch {
    return null;
  }
  for (const candidate of candidates) {
    const file = resolve(root, candidate);
    if (file !== root && !file.startsWith(`${root}${sep}`)) return null;
    try {
      if ((await stat(file)).isFile()) return file;
    } catch {
      // Try the next candidate.
    }
  }
  return null;
};

/**
 * @param {string} file
 * @param {import('node:http').ServerResponse} response
 * @param {number} status
 */
const sendFile = async (file, response, status) => {
  const info = await stat(file);
  response.writeHead(status, {
    'Content-Type': MIME[/** @type {keyof typeof MIME} */ (extname(file))] ?? 'application/octet-stream',
    'Content-Length': info.size,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  if (response.req.method === 'HEAD') {
    response.end();
    return;
  }
  createReadStream(file).pipe(response);
};

const server = createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end();
    return;
  }

  try {
    const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
    const file = await findFile(pathname);
    if (file) {
      await sendFile(file, response, 200);
      return;
    }

    const notFound = await findFile('/404.html');
    if (notFound) {
      await sendFile(notFound, response, 404);
      return;
    }

    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  } catch {
    if (!response.headersSent) response.writeHead(500);
    response.end();
  }
});

server.listen(options.port, options.host, () => {
  console.log(`Preview: http://${options.host}:${options.port}/`);
  console.log(`Serving: ${root}`);
});
