import { Request, Response, NextFunction } from 'express';
import { ErrorLog } from '../models';

/**
 * Response-level error logger middleware.
 *
 * Intercepts `res.json()` to automatically capture any response with
 * HTTP status >= 400 into the ErrorLog table.  This works for errors
 * caught inside controller try/catch blocks — which the global Express
 * error handler cannot see.
 *
 * Skips logging when `req._errorLogged` is already set (i.e. the global
 * error handler already persisted a richer log entry with the stack trace).
 *
 * The DB write is fire-and-forget so it never delays the HTTP response.
 */
export const errorLogger = (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;

    res.json = function (this: Response, body?: any): Response {
        // Skip if the global error handler already logged this error
        if (res.statusCode >= 400 && !(req as any)._errorLogged) {
            const level: 'warn' | 'error' | 'critical' =
                res.statusCode >= 500 ? 'error' : 'warn';

            const message =
                (body && typeof body === 'object' && body.message) ||
                `HTTP ${res.statusCode} on ${req.method} ${req.originalUrl}`;

            // Fire-and-forget — never blocks or delays the response
            ErrorLog.create({
                level,
                message,
                stack: null,
                endpoint: req.originalUrl,
                method: req.method,
                statusCode: res.statusCode,
                userId: (req as any).user?.id || null,
            }).catch((logErr) => {
                console.error('[ErrorLogger] Failed to persist error log:', logErr);
            });
        }

        return originalJson.call(this, body);
    };

    next();
};
