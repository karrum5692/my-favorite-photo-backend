import userService from './user.service.js';

const getProfile = async function (req, res, next) {
  try {
    const id = req.auth.userId;
    const user = await userService.getProfile(id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const patchProfile = async function (req, res, next) {
  try {
    const id = req.auth.userId;
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
    const id = req.auth.userId;
    const { title, grade, genre, price, totalIssued, imageUrl, description } =
      req.body;
    const photo = await userService.createPhoto(id, {
      title,
      grade,
      genre,
      price,
      totalIssued,
      imageUrl,
      description,
    });
    res.status(201).json(photo);
  } catch (error) {
    next(error);
  }
};

const getMyCards = async (req, res, next) => {
  try {
    const userId = req.auth.userId;

    const cards = await userService.getMyCards(userId);

    res.status(200).json(cards);
  } catch (error) {
    next(error);
  }
};

export default { getProfile, patchProfile, createPhoto, getMyCards };
