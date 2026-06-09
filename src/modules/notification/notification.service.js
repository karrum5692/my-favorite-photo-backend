import prisma from '../../config/db.js';

async function getNotifications(userId) {
  return await prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async function updateNotification(id) {
  return await prisma.notification.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      isRead: true,
    },
  });
}

async function readAllNotification(userId) {
  return await prisma.notification.updateMany({
    where: {
      userId,
    },
    data: {
      isRead: true,
    },
  });
}

export default {
  getNotifications,
  updateNotification,
  readAllNotification,
};
