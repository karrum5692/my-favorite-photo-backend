import { Router } from 'express';
import userController from './user.controller.js';
import auth from '../../middlewares/auth.middleware.js';
import { upload } from '../../utils/cloudinary.js';

const router = Router();

router.get('/me', auth.verifyAccessToken, userController.getProfile);
router.patch(
  '/me',
  auth.verifyAccessToken,
  (req, res, next) => {
    console.log('Content-Type:', req.headers['content-type']); // ← 추가
    next();
  },
  upload.single('image'),
  userController.patchProfile
);
router.post(
  '/gallery/cards',
  auth.verifyAccessToken,
  upload.single('image'),
  userController.createPhoto
);
router.get('/me/cards', auth.verifyAccessToken, userController.getMyCards);
router.get('/sales', auth.verifyAccessToken, userController.getMySalesCard);

export default router;
