import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { query } from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

interface SupabaseJwtPayload {
  sub: string;
  email?: string;
  user_metadata?: { full_name?: string; role?: string };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token bulunamadı' });
    }
    if (!ENV.SUPABASE_JWT_SECRET) {
      return res.status(500).json({ error: 'Supabase JWT secret yapılandırılmamış' });
    }
    const decoded = jwt.verify(token, ENV.SUPABASE_JWT_SECRET) as SupabaseJwtPayload;
    const id = decoded.sub;
    const email = decoded.email ?? '';
    const fullName = decoded.user_metadata?.full_name ?? email;
    const role = decoded.user_metadata?.role ?? 'EMPLOYEE';
    req.user = { id, email, role };

    // public.users ile senkron tut (Supabase Auth kullanıcısı için satır olsun)
    await query(
      `INSERT INTO users (id, email, full_name, role) VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, updated_at = CURRENT_TIMESTAMP`,
      [id, email, fullName, role]
    ).catch(() => {});

    return next();
  } catch {
    return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token' });
  }
};
