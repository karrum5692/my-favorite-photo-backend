import { Router } from 'express';
import auth from '../../middlewares/auth.middleware.js';
import pointController from './point.controller.js';

const router = Router();

router.get('/me', auth.verifyAccessToken, pointController.getPoint);
router.get(
  '/me/history',
  auth.verifyAccessToken,
  pointController.getPointhistory
);
router.post('/random-box');

export default router;
