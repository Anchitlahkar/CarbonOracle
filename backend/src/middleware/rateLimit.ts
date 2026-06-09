import rateLimit from 'express-rate-limit';

const userKeyGenerator = (req: any) => {
  return req.user?.id || req.ip || 'anonymous';
};

export const scannerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: userKeyGenerator,
  message: { data: null, error: 'Too many scan requests. Limit is 10 requests per hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const coachRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 20,
  keyGenerator: userKeyGenerator,
  message: { data: null, error: 'Daily conversation limit reached. Limit is 20 messages per day.' },
  standardHeaders: true,
  legacyHeaders: false,
});
