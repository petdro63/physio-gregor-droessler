import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { rateLimit } from 'express-rate-limit';

// An internet demo explicitly opts in and authenticates before sessions, APIs,
// media, or the frontend are reached. It never uses the practice data directory.
export function createHostedDemoAccess({ username, passwordHash, origin }) {
  if (!/^[A-Za-z0-9._-]{1,64}$/.test(username || '') ||
      !/^\$2[aby]\$(1[0-5])\$[./A-Za-z0-9]{53}$/.test(passwordHash || '')) {
    throw new Error('HOSTED_DEMO erfordert DEMO_ACCESS_USER und einen bcrypt-Hash (Kosten 10–15) in DEMO_ACCESS_PASSWORD_HASH.');
  }
  let url;
  try { url = new URL(origin); } catch { /* validated below */ }
  if (!url || url.protocol !== 'https:' || url.origin !== origin) {
    throw new Error('HOSTED_DEMO erfordert APP_ORIGIN als vollständigen HTTPS-Origin ohne abschließenden Schrägstrich.');
  }
  const cacheKey = randomBytes(32);
  let acceptedDigest;
  const challenge = res => res.set('WWW-Authenticate', 'Basic realm="Trainingsdemo", charset="UTF-8"');
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, res) => challenge(res).status(429).send('Zu viele Anmeldeversuche. Bitte später erneut versuchen.'),
  });
  return function hostedDemoAccess(req, res, next) {
    res.set('Cache-Control', 'private, no-store');
    res.vary('Authorization');
    const header = req.get('Authorization') || '';
    const digest = createHmac('sha256', cacheKey).update(header).digest();
    if (acceptedDigest && timingSafeEqual(digest, acceptedDigest)) return next();
    return limiter(req, res, () => {
      const match = /^Basic ([A-Za-z0-9+/]+={0,2})$/i.exec(header);
      const decoded = match && header.length <= 1024 ? Buffer.from(match[1], 'base64').toString('utf8') : '';
      const colon = decoded.indexOf(':');
      const password = decoded.slice(colon + 1);
      if (colon < 1 || decoded.slice(0, colon) !== username || Buffer.byteLength(password) > 72) {
        return challenge(res).status(401).send('Zugangsdaten erforderlich.');
      }
      bcrypt.compare(password, passwordHash).then(valid => {
        if (!valid) return challenge(res).status(401).send('Zugangsdaten erforderlich.');
        acceptedDigest = digest;
        next();
      }).catch(next);
    });
  };
}
