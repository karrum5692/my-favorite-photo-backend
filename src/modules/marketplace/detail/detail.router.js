import { Router } from 'express';
import detailController from './detail.controller.js';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';

const router = Router();

router.get('/cards/:id', detailController.getDetailCard);
router.post(
  '/cards/:id/purchase',
  authMiddleware,
  detailController.purchaseCard
);
router.patch('/cards/:id', authMiddleware, detailController.patchedCard);
router.delete('/cards/:id', authMiddleware, detailController.cancelledCard);

export default router;
