import { Router } from 'express';
import userController from './user.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/me', authMiddleware, userController.getProfile);
router.patch('/me', authMiddleware, userController.patchProfile);
router.post('/gallery/cards', authMiddleware, userController.createPhoto);

export default router;
