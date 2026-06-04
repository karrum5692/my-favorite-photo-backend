import { Router } from 'express';
import userService from './user.service';

const userController = Router();

userController.get('/me', async function (req, res, next) {
  try {
    const id = 1;
    const user = await userService.getProfile(id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

export default userController;
