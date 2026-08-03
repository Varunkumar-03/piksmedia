import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';

export const generateToken = (userId: string, role: string, email?: string): string => {
  return jwt.sign({ id: userId, role, email }, JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};
