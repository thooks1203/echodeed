import fs from 'fs';
import crypto from 'crypto';
import fetch from 'node-fetch';

const env = fs.readFileSync('.env', 'utf8');
const m = env.match(/^RESEND_WEBHOOK_SECRET=(.*)$/m);
if (!m) {
  console.error('RESEND_WEBHOOK_SECRET not found in .env');
  process.exit(1);
}
const secret = m[1].trim();
const payload = { event: 'message.delivered', message: { id: 'test-msg-123' } };
const body = JSON.stringify(payload);
const hmac = crypto.createHmac('sha256', secret).update(body).digest('hex');
(async () => {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/webhooks/resend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Resend-Signature': hmac
      },
      body
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text.slice(0, 200));
  } catch (e) {
    console.error('Error sending webhook:', e);
  }
})();
