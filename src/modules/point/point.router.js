import { Router } from 'express';
import auth from '../../middlewares/auth.middleware.js';
import pointController from './point.controller.js';

const router = Router();

router.get('/me', auth.verifyAccessToken, pointController.getPoint);
router.get(
  '/me/history',
  auth.verifyAccessToken,
  pointController.getPointHistory
);
router.post('/random-box', auth.verifyAccessToken, pointController.randomPoint);

export default router;
