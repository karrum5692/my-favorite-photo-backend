import { Router } from 'express';
import userService from './user.service.js';

const getProfile = async function (req, res, next) {
  try {
    const id = req.user.id;
    const user = await userService.getProfile(id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const patchProfile = async function (req, res, next) {
  try {
    const id = req.user.id;
    const { nickname, profileImageUrl } = req.body;
    const user = await userService.patchProfile(id, {
      nickname,
      profileImageUrl,
    });
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const createPhoto = async function (req, res, next) {
  try {
    const id = req.user.id;
    const { title, grade, genre, price, totalIssued, imageUrl, description } =
      req.body;
    const user = await userService.createPhoto(id, {
      title,
      grade,
      genre,
      price,
      totalIssued,
      imageUrl,
      description,
    });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export default { getProfile, patchProfile, createPhoto };
