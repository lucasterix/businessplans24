import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-me';
const EXPIRES = '30d';

export interface JwtUser {
  sub: string;
  email: string;
  role: 'user' | 'admin';
}

export function signToken(user: JwtUser): string {
  return jwt.sign(user, SECRET, { expiresIn: EXPIRES });
}

export function verifyToken(token: string): JwtUser | null {
  try {
    return jwt.verify(token, SECRET) as JwtUser;
  } catch {
    return null;
  }
}
