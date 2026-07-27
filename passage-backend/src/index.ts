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

const parseCliRequest = (args: string[]) => {
  const pathSegments = args.filter((arg) => Boolean(arg));
  const isBodyOnly = pathSegments.length > 0 && /^\s*(\{|\[|"|\d|true|false|null)/.test(pathSegments[pathSegments.length - 1]);
  const bodyArg = isBodyOnly ? pathSegments.pop() : undefined;
  const routePath = `/${pathSegments.join('/')}`.replace(/\/+/g, '/');

  return {
    method: bodyArg ? 'POST' : 'GET',
    path: routePath || '/',
    body: bodyArg,
  };
};

const runCliRequest = async () => {
  process.env.CLI_MODE = '1';
  const app = createApp();
  const request = parseCliRequest(process.argv.slice(2));

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
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: request.body ? request.body : undefined,
    });

    const text = await response.text();
    process.stdout.write(text);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
};

const main = async () => {
  try {
    if (process.argv.length > 2) {
      await runCliRequest();
      return;
    }

    await startServer();
  } catch (error) {
    console.error('Failed to start backend:', error);
    process.exit(1);
  }
};

void main();
