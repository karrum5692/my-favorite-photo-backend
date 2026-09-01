import { expressjwt } from 'express-jwt';
import userRepository from '../modules/auth/auth.repository.js';

const verifyRefreshToken = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  getToken: (req) => req.cookies?.refreshToken,
  credentialsRequired: true,
});

const verifyAccessToken = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  credentialsRequired: true,
  getToken: (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    return authHeader.split(' ')[1];
  },
});

export default {
  verifyRefreshToken,
  verifyAccessToken,
};
