import express from 'express';
import notificationController from './notification.controller.js';
import auth from '../../middlewares/auth.middleware.js';
import notificationRepository from './notification.repository.js';

const router = express.Router();

router.get(
  '/',
  auth.verifyAccessToken,
  notificationController.getNotifications
);

router.patch(
  '/read-all',
  auth.verifyAccessToken,
  notificationController.readAllNotifications
);

router.patch(
  '/:id',
  auth.verifyAccessToken,
  notificationController.updateNotification
);

export default router;
