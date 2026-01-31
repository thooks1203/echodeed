import fs from 'fs';
import crypto from 'crypto';

// Load .env and extract RESEND_WEBHOOK_SECRET
const env = fs.readFileSync('.env', 'utf8');
const m = env.match(/^RESEND_WEBHOOK_SECRET=(.*)$/m);
if (!m) {
  console.error('RESEND_WEBHOOK_SECRET not found in .env');
  process.exit(2);
}
const secret = m[1].trim();

// Example payload to sign (same shape sent to webhook)
const payload = { event: 'message.delivered', message: { id: 'test-msg-123' } };
const body = JSON.stringify(payload);

// Compute HMAC (hex)
const computedHex = crypto.createHmac('sha256', secret).update(body).digest('hex');
console.log('Computed HMAC (hex):', computedHex);

// Simulate incoming header value variations commonly used
const headerVariants = [computedHex, `v1=${computedHex}`, `t=123456,v1=${computedHex}`];

// Verification function using timingSafeEqual on buffers
function verifyHeader(headerValue, rawBody) {
  if (!headerValue) return false;
  // extract hex token from header (find first 64-hex substring)
  const hexMatch = headerValue.match(/([a-f0-9]{64})/i);
  if (!hexMatch) return false;
  const sigHex = hexMatch[1];
  const sigBuf = Buffer.from(sigHex, 'hex');
  const expectedBuf = Buffer.from(crypto.createHmac('sha256', secret).update(rawBody).digest('hex'), 'hex');
  if (sigBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expectedBuf);
}

for (const hv of headerVariants) {
  const ok = verifyHeader(hv, body);
  console.log(`Header: "${hv}" -> verified: ${ok}`);
}

// Also test mismatch
const badHeader = 'v1=' + '0'.repeat(64);
console.log(`Bad header verified: ${verifyHeader(badHeader, body)}`);
