// Load .env manually (only if it exists locally)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
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
}

// Ensure PORT is set (Railway provides this, but fallback to 5000 if not)
if (!process.env.PORT) {
  process.env.PORT = '5000';
}

// Now import and run the server
await import('./dist/index.js');
