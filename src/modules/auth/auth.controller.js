import express from 'express';
import userService from './auth.service.js';
import auth from '../../middlewares/auth.middleware.js';
import prisma from '../../config/db.js';
import passport from '../../config/passport.js';

const userController = express.Router();

const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

userController.post('/signup', async (req, res, next) => {
  try {
    const { email, nickname, password, passwordConfirm } = req.body;

    const user = await userService.createUser({
      email,
      nickname,
      password,
      passwordConfirm,
    });
    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

userController.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userService.loginUser(email, password);

    const accessToken = userService.createToken(user);
    const refreshToken = userService.createToken(user, 'refresh');

    await userService.updateRefreshToken(user.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    return res.status(200).json({ ...user, accessToken });
  } catch (error) {
    next(error);
  }
});

userController.post(
  '/refresh',
  auth.verifyRefreshToken,
  async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      const { userId } = req.auth;

      const { newAccessToken, newRefreshToken } =
        await userService.refreshToken(userId, refreshToken);

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });

      return res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
      next(error);
    }
  }
);

userController.post('/logout', async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.sendStatus(204);
    }

    await userService.deleteRefreshToken(refreshToken);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    return res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

userController.get(
  '/oauth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

userController.get('/oauth/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, user) => {
    try {
      // 1. passport 실패
      if (err || !user) {
        return res.redirect(`${clientUrl}/login?error=oauth_failed`);
      }

      // 2. 토큰 생성
      const accessToken = userService.createToken(user);
      const refreshToken = userService.createToken(user, 'refresh');

      await userService.updateRefreshToken(user.id, refreshToken);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });

      return res.redirect(`${clientUrl}/oauth-success?token=${accessToken}`);
    } catch (error) {
      return res.redirect(`${clientUrl}/login?error=server_error`);
    }
  })(req, res, next);
});

export default userController;
