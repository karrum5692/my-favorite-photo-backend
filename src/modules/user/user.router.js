import { Router } from 'express';
import multer from 'multer';
import userController from './user.controller.js';
import auth from '../../middlewares/auth.middleware.js';

const router = Router();
const upload = multer();
router.get('/me', auth.verifyAccessToken, userController.getProfile);
router.patch('/me', auth.verifyAccessToken, userController.patchProfile);
router.post(
  '/gallery/cards',
  auth.verifyAccessToken,
  upload.single('image'),
  userController.createPhoto
);
router.get('/me/cards', auth.verifyAccessToken, userController.getMyCards);
router.get('/sales', auth.verifyAccessToken, userController.getMySalesCard);

export default router;
