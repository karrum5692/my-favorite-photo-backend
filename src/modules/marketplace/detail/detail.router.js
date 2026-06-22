import { Router } from 'express';
import detailController from './detail.controller.js';
import auth from '../../../middlewares/auth.middleware.js';

const router = Router();

router.get(
  '/cards/:id',
  auth.verifyAccessToken,
  detailController.getDetailCard
);
router.post(
  '/cards/:id/purchase',
  auth.verifyAccessToken,
  detailController.purchaseCard
);
router.patch(
  '/cards/:id',
  auth.verifyAccessToken,
  detailController.patchedCard
);
router.patch(
  '/cards/cancel/:id',
  auth.verifyAccessToken,
  detailController.cancelledCard
);

export default router;
