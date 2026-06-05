import { expressjwt } from 'express-jwt';
import userRepository from '../modules/auth/auth.repository.js';

const authMiddleware = async (req, res, next) => {
  // 추후 실제 JWT 검증으로 교체 필요
  req.user = {
    id: 'temp-user-id',
    email: 'test@test.com',
    nickname: '테스트유저',
  };
  next();
};

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

    if (!authHeader) {
      return null;
    }

    return authHeader.split(' ')[1];
  },
});

async function handleRefreshToken(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken;
    const { userId } = req.auth;

    const storedToken = await userRepository.findRefreshTokenByUserId(userId);

    if (!refreshToken || !storedToken) {
      const error = new Error('토큰이 존재하지 않습니다.');
      error.code = 404;
      throw error;
    }

    if (storedToken.token !== refreshToken) {
      const error = new Error('토큰이 일치하지 않습니다.');
      error.code = 401;
      throw error;
    }

    next();
  } catch (error) {
    next(error);
  }
}

export default {
  verifyRefreshToken,
  handleRefreshToken,
  authMiddleware,
  verifyAccessToken,
};
