import express from 'express';
import userService from './auth.service.js';
import auth from '../../middlewares/auth.middleware.js';
import prisma from '../../config/db.js';
import passport from '../../config/passport.js';

const userController = express.Router();

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
  auth.handleRefreshToken,
  async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      const { userId } = req.auth;

      const { newAccessToken, newRefreshToken } =
        await userService.refreshToken(userId);

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

userController.get(
  '/oauth/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res, next) => {
    try {
      const accessToken = userService.createToken(req.user);
      const refreshToken = userService.createToken(req.user, 'refresh');

      await userService.updateRefreshToken(req.user.userId, refreshToken);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });

      return res.redirect(process.env.CLIENT_URL || 'http://localhost:3000/');
    } catch (error) {
      next(error);
    }
  }
);

export default userController;
