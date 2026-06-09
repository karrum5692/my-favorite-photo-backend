import express from 'express';
import notificationController from './notification.controller.js';
import auth from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get(
  '/notifications',
  auth.verifyAccessToken,
  notificationController.getNotifications
);
router.patch(
  '/notifications/:id',
  auth.verifyAccessToken,
  notificationController.getNotifications
);
router.patch(
  '/notifications/read-all',
  auth.verifyAccessToken,
  notificationController.readAllNotifications
);

export default router;
