import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { UserModel, User } from '../models/User.model';

export class AuthService {
  static generateToken(user: User): string {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN }
    );
  }

  static async login(email: string, password: string) {
    const user = await UserModel.findByEmail(email);

    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }

    if (!user.is_active) {
      throw new Error('Hesap aktif değil');
    }

    const isValid = await UserModel.validatePassword(user, password);

    if (!isValid) {
      throw new Error('Geçersiz şifre');
    }

    await UserModel.updateLastLogin(user.id);

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    };
  }

  static async register(email: string, password: string, fullName: string) {
    const existing = await UserModel.findByEmail(email);

    if (existing) {
      throw new Error('Bu email adresi zaten kayıtlı');
    }

    const user = await UserModel.create(email, password, fullName, 'EMPLOYEE');
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    };
  }
}
