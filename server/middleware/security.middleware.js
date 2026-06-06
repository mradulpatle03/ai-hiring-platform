import helmet          from 'helmet'
import mongoSanitize   from 'express-mongo-sanitize'
import hpp             from 'hpp'

// ─── Helmet — sets secure HTTP headers ───────────────────────────────
export const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'"],
      styleSrc:    ["'self'", "'unsafe-inline'"],
      imgSrc:      ["'self'", 'data:', 'https:'],
      connectSrc:  ["'self'"],
      fontSrc:     ["'self'"],
      objectSrc:   ["'none'"],
      frameSrc:    ["'none'"],
    },
  },
  // Prevent clickjacking
  frameguard:         { action: 'deny' },
  // Force HTTPS in production
  hsts:               process.env.NODE_ENV === 'production'
    ? { maxAge: 31536000, includeSubDomains: true }
    : false,
  // Prevent MIME sniffing
  noSniff:            true,
  // Hide X-Powered-By: Express
  hidePoweredBy:      true,
  // XSS protection header
  xssFilter:          true,
})

// ─── Mongo sanitize — prevents NoSQL injection ────────────────────────
// Strips $ and . from req.body, req.params, req.query
// Prevents attacks like: { "email": { "$gt": "" } }
export const sanitizeConfig = mongoSanitize({
  replaceWith:    '_',
  onSanitize:     ({ req, key }) => {
    console.warn(`Sanitized suspicious input on key: ${key} from ${req.ip}`)
  },
})

// ─── HPP — HTTP Parameter Pollution protection ────────────────────────
// Prevents: ?sort=name&sort=email (picks last value for most fields)
export const hppConfig = hpp({
  whitelist: ['skills', 'status'],  // allow arrays for these query params
})