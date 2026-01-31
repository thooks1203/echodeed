/*
Simple TCP connectivity check to the DB host and port parsed from DATABASE_URL.
Run: NODE_ENV=production node scripts/test-db-tcp.js
*/

import net from 'net';
import { URL } from 'url';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set in environment');
  process.exit(2);
}

let url;
try {
  url = new URL(databaseUrl);
} catch (e) {
  console.error('Failed to parse DATABASE_URL:', e.message);
  process.exit(2);
}

const host = url.hostname;
const port = url.port || (url.protocol === 'postgres:' ? 5432 : undefined);

console.log(`Testing TCP connection to ${host}:${port} ...`);

const socket = new net.Socket();
let connected = false;
const timeoutMs = 5000;

const onError = (err) => {
  console.error('Connection failed:', err && err.message ? err.message : err);
  process.exitCode = 1;
  socket.destroy();
};

socket.setTimeout(timeoutMs, () => {
  console.error('Connection timed out');
  socket.destroy();
  process.exitCode = 1;
});

socket.connect(port, host, () => {
  connected = true;
  console.log('TCP connection successful');
  socket.end();
  process.exit(0);
});

socket.on('error', onError);
