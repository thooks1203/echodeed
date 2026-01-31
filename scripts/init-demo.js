/*
Call POST /api/admin/init-demo-data to populate demo data. No auth required in demo mode.
Run: NODE_ENV=production node scripts/init-demo.js
*/

const fetch = globalThis.fetch || (await import('node-fetch')).default;
const base = process.env.BASE_URL || `http://127.0.0.1:${process.env.PORT || 5000}`;
const url = `${base}/api/admin/init-demo-data`;

console.log('POST', url);
try {
  const res = await fetch(url, { method: 'POST' });
  const json = await res.json().catch(() => null);
  console.log('Status:', res.status);
  console.log('Body:', json);
} catch (e) {
  console.error('Request failed:', e.message || e);
  process.exitCode = 1;
}
