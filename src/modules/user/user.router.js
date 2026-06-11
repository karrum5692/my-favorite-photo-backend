import { Router } from 'express';
import userController from './user.controller.js';
import auth from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/me', auth.verifyAccessToken, userController.getProfile);
router.patch('/me', auth.verifyAccessToken, userController.patchProfile);
router.post(
  '/gallery/cards',
  auth.verifyAccessToken,
  userController.createPhoto
);
router.get('/me/cards', auth.verifyAccessToken, userController.getMyCards);
router.get('/sales', auth.verifyAccessToken, userController.getMySalesCard);

export default router;
