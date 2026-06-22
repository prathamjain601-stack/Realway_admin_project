import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models';
import { AuthRequest } from './auth';

export const auditLogger = (entityType: string, action?: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Store original json method to intercept response
    const originalJson = res.json.bind(res);
    const startTime = Date.now();

    res.json = function (body: any) {
      // Only log successful mutations
      const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
      const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);

      if (isSuccess && isMutation) {
        const logAction = action || `${req.method} ${entityType}`;
        const entityId = req.params?.id ? parseInt(req.params.id as string, 10) : body?.id || null;

        AuditLog.create({
          userId: req.user?.id || null,
          action: logAction,
          entityType,
          entityId,
          changes: {
            method: req.method,
            path: req.originalUrl,
            body: sanitizeBody(req.body),
            responseTime: Date.now() - startTime,
          },
          ipAddress: req.ip || req.socket?.remoteAddress || null,
          userAgent: req.headers['user-agent'] || null,
        }).catch((err: Error) => {
          console.error('Audit log creation failed:', err.message);
        });
      }

      return originalJson(body);
    } as typeof res.json;

    next();
  };
};

// Remove sensitive fields from logged request bodies
const sanitizeBody = (body: any): any => {
  if (!body) return null;
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'passwordHash', 'token', 'secret', 'key'];
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }
  return sanitized;
};
