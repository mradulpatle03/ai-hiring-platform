import rateLimit from 'express-rate-limit'

// ─── Helper to create clean error response ────────────────────────────
const handler = (message) => (req, res) => {
  res.status(429).json({
    success: false,
    message,
    retryAfter: Math.ceil(req.rateLimit.resetTime / 1000 - Date.now() / 1000),
  })
}

// ─── Auth routes — strictest ──────────────────────────────────────────
// Max 10 attempts per 15 minutes per IP
// Prevents brute-force password attacks
export const authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              10,
  standardHeaders:  true,
  legacyHeaders:    false,
  handler:          handler('Too many login attempts. Please try again in 15 minutes.'),
  skipSuccessfulRequests: true,  // only count failed attempts
})

// ─── Register — slightly looser ───────────────────────────────────────
// Max 5 accounts per hour per IP
// Prevents mass account creation
export const registerLimiter = rateLimit({
  windowMs:         60 * 60 * 1000,
  max:              5,
  standardHeaders:  true,
  legacyHeaders:    false,
  handler:          handler('Too many accounts created from this IP. Try again in an hour.'),
})

// ─── AI screening routes — protect Groq API costs ────────────────────
// Max 20 applications per hour per IP
export const applyLimiter = rateLimit({
  windowMs:         60 * 60 * 1000,
  max:              20,
  standardHeaders:  true,
  legacyHeaders:    false,
  handler:          handler('Too many applications submitted. Please wait before applying again.'),
})

// ─── General API — global fallback ───────────────────────────────────
// Max 200 requests per 15 minutes per IP
export const globalLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              200,
  standardHeaders:  true,
  legacyHeaders:    false,
  handler:          handler('Too many requests. Please slow down.'),
  skip: (req) => req.path.startsWith('/api/auth/me'),  // never limit session checks
})

// ─── File upload limiter ──────────────────────────────────────────────
// Max 10 uploads per hour per IP
export const uploadLimiter = rateLimit({
  windowMs:         60 * 60 * 1000,
  max:              10,
  standardHeaders:  true,
  legacyHeaders:    false,
  handler:          handler('Too many file uploads. Please wait before uploading again.'),
})