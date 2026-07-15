import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000), // 1 minute
  max: Number(process.env.RATE_LIMIT_MAX || 60), // limit each IP to 60 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

export default apiLimiter;
