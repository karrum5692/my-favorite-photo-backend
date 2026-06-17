import { Router } from 'express';
import saleModuleController from './saleModule.controller.js';
import auth from '../../../middlewares/auth.middleware.js';

const router = Router();

router.get(
  '/mycard/owned',
  auth.verifyAccessToken,
  saleModuleController.getMyOwnedCard
);

router.post(
  '/mycard/:id',
  auth.verifyAccessToken,
  saleModuleController.postSale
);

export default router;
