import { Router } from 'express';
import userService from './user.service.js';

const getProfile = async function (req, res, next) {
  try {
    const id = '00ffbece-9ef9-4c88-9c7c-7de69678cc5e';
    const user = await userService.getProfile(id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export default { getProfile };
