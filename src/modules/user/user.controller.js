import { Router } from 'express';
import userService from './user.service.js';

const getProfile = async function (req, res, next) {
  try {
    const id = '임시-유저-uuid-문자열';
    const user = await userService.getProfile(id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export default { getProfile };
