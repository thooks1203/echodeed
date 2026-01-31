// Load .env manually (only if it exists locally)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');

console.log('[server-wrapper] Checking for .env file at:', envPath);
if (fs.existsSync(envPath)) {
  console.log('[server-wrapper] Loading .env file');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key) {
        // Only set if not already set by Railway/environment
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    }
  });
} else {
  console.log('[server-wrapper] No .env file found, using Railway environment variables');
}

// Ensure PORT is set (Railway provides this, but fallback to 5000 if not)
if (!process.env.PORT) {
  console.log('[server-wrapper] PORT not set in environment, defaulting to 5000');
  process.env.PORT = '5000';
}

console.log('[server-wrapper] Starting server with PORT:', process.env.PORT);

// Now import and run the server
await import('./dist/index.js');
