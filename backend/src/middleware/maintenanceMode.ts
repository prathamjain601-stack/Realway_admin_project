import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { SystemSetting } from '../models';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_development_change_in_prod';

// Cache maintenance mode status to avoid hitting DB on every request
let cachedMaintenanceMode: boolean = false;
let lastCheck: number = 0;
const CACHE_TTL = 10_000; // Re-check every 10 seconds

/**
 * Maintenance Mode Middleware
 * 
 * When maintenance mode is enabled in System Settings:
 * - Admin users can still access everything (so they can fix things and turn it off)
 * - All /api/admin/* routes are allowed (they have their own auth + role protection)
 * - All /api/auth/* routes are allowed (so users/admins can log in)
 * - The health endpoint is always accessible
 * - All other requests from non-admin users get a 503 Service Unavailable
 */
export const maintenanceMode = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    // Refresh cache if stale
    const now = Date.now();
    if (now - lastCheck > CACHE_TTL) {
      const setting = await SystemSetting.findOne({ where: { key: 'maintenanceMode' } });
      cachedMaintenanceMode = setting ? (setting as any).value === 'true' : false;
      lastCheck = now;
    }

    // If maintenance mode is OFF, let everything through
    if (!cachedMaintenanceMode) {
      return next();
    }

    // ──────────────────────────────────────────────────────────
    // ALWAYS ALLOW these paths through, regardless of who is calling.
    // These routes have their own authentication & role checks built in,
    // so maintenance mode does not need to guard them.
    // ──────────────────────────────────────────────────────────
    const alwaysAllowedPrefixes = [
      '/api/admin/',       // All admin routes — already protected by authenticate + authorizeRoles('Admin')
      '/api/auth/',        // Login, register, refresh-token — needed for admins to log in
      '/api/health',       // Health check endpoint
      '/api-docs',         // Swagger documentation
    ];

    // Also allow exact match on /api/admin (without trailing slash)
    if (req.path === '/api/admin' || alwaysAllowedPrefixes.some(prefix => req.path.startsWith(prefix))) {
      return next();
    }

    // ──────────────────────────────────────────────────────────
    // For all OTHER routes (users, content, metrics, chat, etc.):
    // Check if the caller is an Admin — Admins bypass maintenance mode.
    // ──────────────────────────────────────────────────────────
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        // Use ignoreExpiration so that even if the token is expired,
        // we still recognise the admin role. The downstream auth middleware
        // will handle the actual expiration and trigger a token refresh.
        const decoded: any = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
        if (decoded.role === 'Admin') {
          return next();
        }
      } catch {
        // Token completely invalid (corrupted / wrong secret) — treat as non-admin
      }
    }

    // ──────────────────────────────────────────────────────────
    // Block everyone else with 503 Service Unavailable
    // ──────────────────────────────────────────────────────────
    return res.status(503).json({
      message: 'The system is currently undergoing maintenance. Please try again later.',
      maintenanceMode: true,
    });
  } catch (error) {
    // If the middleware itself errors, don't block the request
    return next();
  }
};
