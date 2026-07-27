// Keeps stdout clean for the PHP bridge. Must stay the first import.
import './cli-guard';

import http from 'http';
import { AddressInfo } from 'net';
import { createApp } from './config/app';
import { env } from './config/env';
import { setupSocketIO } from './sockets/socket.server';
import { initializeJobs } from './jobs/index';

const startServer = async () => {
  const app = createApp();
  const server = http.createServer(app);

  setupSocketIO(server);
  initializeJobs();

  const port = Number(process.env.PORT || env.PORT || 3000);

  server.listen(port, '0.0.0.0', () => {
    console.log(`PASSAGE backend listening on port ${port}`);
  });
};

// Headers that describe a single hop and must not be copied between the PHP
// bridge and the internal loopback request.
const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
  'accept-encoding',
]);

interface CliRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: string;
}

const parseCliRequest = (args: string[]) => {
  const pathSegments = args.filter((arg) => Boolean(arg));
  const isBodyOnly = pathSegments.length > 0 && /^\s*(\{|\[|"|\d|true|false|null)/.test(pathSegments[pathSegments.length - 1]);
  const bodyArg = isBodyOnly ? pathSegments.pop() : undefined;
  const routePath = `/${pathSegments.join('/')}`.replace(/\/+/g, '/');

  return {
    method: bodyArg ? 'POST' : 'GET',
    path: routePath || '/',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: bodyArg,
  } as CliRequest;
};

const readStdin = async (): Promise<string> => {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
};

/**
 * Read a request envelope emitted by deploy/node.php on stdin.
 * Shape: { method, path, headers, body }
 */
const readEnvelopeRequest = async (): Promise<CliRequest> => {
  const raw = await readStdin();
  const parsed = JSON.parse(raw || '{}');

  const headers: Record<string, string> = {};
  for (const [name, value] of Object.entries(parsed.headers || {})) {
    if (value === undefined || value === null) continue;
    if (HOP_BY_HOP.has(name.toLowerCase())) continue;
    headers[name.toLowerCase()] = String(value);
  }
  if (!headers.accept) headers.accept = 'application/json';

  return {
    method: String(parsed.method || 'GET').toUpperCase(),
    path: String(parsed.path || '/') || '/',
    headers,
    body: typeof parsed.body === 'string' && parsed.body.length > 0 ? parsed.body : undefined,
  };
};

/**
 * Serve exactly one request without occupying a fixed port. Shared hosting
 * refuses binds on 0.0.0.0, so the app is bound to an ephemeral loopback port,
 * queried once, and closed. Never call setupSocketIO/initializeJobs here: this
 * process is torn down as soon as PHP has its response.
 */
const runCliRequest = async (envelopeMode: boolean) => {
  process.env.CLI_MODE = '1';
  const app = createApp();
  const request = envelopeMode ? await readEnvelopeRequest() : parseCliRequest(process.argv.slice(2));

  const server = http.createServer(app);
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve());
  });

  try {
    const address = server.address() as AddressInfo;
    const url = new URL(request.path, `http://127.0.0.1:${address.port}`);
    const response = await fetch(url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });

    const text = await response.text();

    if (!envelopeMode) {
      process.stdout.write(text);
      return;
    }

    const headers: Record<string, string> = {};
    response.headers.forEach((value, name) => {
      if (HOP_BY_HOP.has(name.toLowerCase())) return;
      headers[name] = value;
    });

    process.stdout.write(
      JSON.stringify({
        status: response.status,
        headers,
        body: text,
      }),
    );
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
};

const main = async () => {
  const argv = process.argv.slice(2);
  const envelopeMode = argv.includes('--cli-json');

  try {
    if (envelopeMode || argv.length > 0) {
      await runCliRequest(envelopeMode);
      return;
    }

    await startServer();
  } catch (error) {
    // In envelope mode the bridge expects JSON on stdout even for a hard
    // failure, otherwise PHP can only report an opaque 502.
    if (envelopeMode) {
      process.stdout.write(
        JSON.stringify({
          status: 500,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            success: false,
            message: 'Backend failed to handle the request.',
            error: error instanceof Error ? error.message : String(error),
          }),
        }),
      );
      process.exit(1);
    }

    console.error('Failed to start backend:', error);
    process.exit(1);
  }
};

void main();
