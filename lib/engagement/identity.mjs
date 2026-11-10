import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

function sign(value, secret) {
  if (typeof secret !== 'string' || secret.length < 32) throw new Error('Engagement configuration missing');
  return createHmac('sha256', secret).update(value).digest('base64url');
}
export function hashKey(value, secret) { return sign(value, secret); }
export function issueIdentity(secret) {
  const id = randomUUID();
  return `${id}.${sign(id, secret)}`;
}
export function verifyIdentity(value, secret) {
  if (typeof value !== 'string' || !/^[\da-f-]{36}\.[\w-]{43}$/.test(value)) return null;
  const [id, signature] = value.split('.');
  const expected = sign(id, secret);
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) ? id : null;
}
