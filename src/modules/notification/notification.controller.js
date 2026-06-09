import express from 'express';
import notificationService from './notification.service.js';

async function getNotifications(req, res, next) {
  try {
    const notifications = await notificationService.getNotifications(
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

    const notification = await notificationService.updateNotification(id);

    res.status(200).json(notification);
  } catch (error) {
    next(error);
  }
}

async function readAllNotifications(req, res, next) {
  try {
    const notifications = await notificationService.readAllNotifications(
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
