import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { SystemSetting } from '../models';

// In-memory cache for dynamic rate limit config (refreshed every 60s)
let cachedConfig: { api: { windowMs: number; max: number }; auth: { windowMs: number; max: number } } | null = null;
let lastConfigFetch = 0;
const CONFIG_TTL = 60 * 1000; // 60 seconds

const DEFAULT_CONFIG = {
  api: { windowMs: 15 * 60 * 1000, max: 100 },
  auth: { windowMs: 15 * 60 * 1000, max: 10 },
};

/**
 * Fetch dynamic rate limit config from DB with in-memory caching.
 * Falls back to defaults if DB is unavailable.
 */
const getDynamicConfig = async () => {
  const now = Date.now();
  if (cachedConfig && now - lastConfigFetch < CONFIG_TTL) {
    return cachedConfig;
  }

  try {
    const settings = await SystemSetting.findAll({
      where: {
        key: ['rate_limit_window_ms', 'rate_limit_max', 'auth_rate_limit_window_ms', 'auth_rate_limit_max'],
      },
    });

    const map: Record<string, string> = {};
    settings.forEach((s: any) => { map[s.key] = s.value; });

    cachedConfig = {
      api: {
        windowMs: parseInt(map['rate_limit_window_ms']) || DEFAULT_CONFIG.api.windowMs,
        max: parseInt(map['rate_limit_max']) || DEFAULT_CONFIG.api.max,
      },
      auth: {
        windowMs: parseInt(map['auth_rate_limit_window_ms']) || DEFAULT_CONFIG.auth.windowMs,
        max: parseInt(map['auth_rate_limit_max']) || DEFAULT_CONFIG.auth.max,
      },
    };
    lastConfigFetch = now;
    return cachedConfig;
  } catch {
    // DB not ready yet (e.g., during startup) — use defaults
    return DEFAULT_CONFIG;
  }
};

// General API rate limiter — reads dynamic config on each request cycle
export const apiLimiter = rateLimit({
  windowMs: DEFAULT_CONFIG.api.windowMs,
  max: async (req: Request) => {
    const config = await getDynamicConfig();
    return config.api.max;
  },
  message: {
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: DEFAULT_CONFIG.auth.windowMs,
  max: async (req: Request) => {
    const config = await getDynamicConfig();
    return config.auth.max;
  },
  message: {
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Very strict limiter for password reset (stays hardcoded — too risky to make dynamic)
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    message: 'Too many password reset attempts, please try again in an hour.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
