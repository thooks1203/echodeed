/*
Check key API endpoints for status and JSON response. Uses BASE_URL if set, otherwise localhost and PORT.
Run: NODE_ENV=production node scripts/check-api.js
*/

const fetch = globalThis.fetch || (await import('node-fetch')).default;

const base = process.env.BASE_URL || `http://127.0.0.1:${process.env.PORT || 5000}`;
const endpoints = [
  '/api/auth/user',
  '/api/school/teachers',
  '/api/schools',
  '/api/rewards/offers/all/all',
  '/api/student-goals',
  '/api/student-notifications/preferences',
  '/api/surprise-giveaways/campaigns'
];

console.log('Using base URL:', base);

for (const ep of endpoints) {
  const url = `${base}${ep}`;
  try {
    const res = await fetch(url, { method: 'GET' });
    const text = await res.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = text.length > 500 ? text.slice(0,500)+'...' : text; }
    console.log(`\n[${res.status}] ${ep}:`, parsed);
  } catch (e) {
    console.error(`\nError fetching ${ep}:`, e.message || e);
  }
}
