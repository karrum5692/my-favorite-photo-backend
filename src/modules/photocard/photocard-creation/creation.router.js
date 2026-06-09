import { Router } from 'express';
import creationController from './creation.controller.js';
import authMiddleware from '../../../middlewares/auth.middleware.js';
import upload from '../../../middlewares/upload.middleware.js';

const router = Router();

router.post(
  '/cards',
  authMiddleware.verifyAccessToken,
  upload.single('image'),
  creationController.createCard
);

export default router;
