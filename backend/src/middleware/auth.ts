import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, ApiKey } from '../models';

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  // ── Strategy 1: API Key via x-api-key header ──
  const apiKeyHeader = req.header('x-api-key');

  if (apiKeyHeader) {
    try {
      const apiKeyRecord = await ApiKey.findOne({
        where: { key: apiKeyHeader, isRevoked: false },
        include: [{ model: User }],
      });

      if (!apiKeyRecord) {
        return res.status(401).json({ message: 'Invalid or revoked API key' });
      }

      // The included User comes from the default association (no alias)
      const user = (apiKeyRecord as any).User as User | undefined;

      if (!user) {
        return res.status(401).json({ message: 'API key owner not found' });
      }

      req.user = user;
      return next();
    } catch (err) {
      return res.status(401).json({ message: 'API key authentication failed' });
    }
  }

  // ── Strategy 2: JWT via Authorization Bearer header ──
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_for_development_change_in_prod');
    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): any => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
    next();
  };
};
