import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { USER_ROLES } from '../config/constants';

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz bulunmamaktadır' });
    }

    next();
  };
};
