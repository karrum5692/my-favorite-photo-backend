import notificationRepository from './notification.repository.js';

async function getNotifications(req, res, next) {
  try {
    const notifications = await notificationRepository.getNotification(
      req.auth.userId
    );
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
}

async function updateNotification(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'id가 유효하지 않습니다.' });
    }

    const notification = await notificationRepository.updateNotification(
      id,
      req.auth.userId
    );

    res.status(200).json(notification);
  } catch (error) {
    next(error);
  }
}

async function readAllNotifications(req, res, next) {
  try {
    const notifications = await notificationRepository.readAllNotification(
      req.auth.userId
    );
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
}

export default {
  getNotifications,
  updateNotification,
  readAllNotifications,
};
