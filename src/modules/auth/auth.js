import { expressjwt } from 'express-jwt';

const verifyRefreshToken = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  getToken: (req) => req.cookies?.refreshToken,
  credentialsRequired: true,
});

export default { verifyRefreshToken };
