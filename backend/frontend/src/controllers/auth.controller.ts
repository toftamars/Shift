import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email ve şifre gereklidir' });
      }

      const result = await AuthService.login(email, password);

      return res.json(result);
    } catch (error: any) {
      return res.status(401).json({ error: error.message || 'Giriş başarısız' });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { email, password, fullName } = req.body;

      if (!email || !password || !fullName) {
        return res.status(400).json({ error: 'Tüm alanlar gereklidir' });
      }

      const result = await AuthService.register(email, password, fullName);

      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Kayıt başarısız' });
    }
  }

  static async logout(req: Request, res: Response) {
    return res.json({ message: 'Başarıyla çıkış yapıldı' });
  }
}
