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

// 기존 라우터들 아래에 추가
router.post('/test', auth.verifyAccessToken, async (req, res) => {
  try {
    const notification = await notificationRepository.createNotification({
      userId: req.auth.userId,
      type: req.body.type,
      message: req.body.message,
    });
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
