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
    console.log('req.body:', req.body); // ← 추가
    console.log('req.file:', req.file);
    const id = req.auth.userId;
    const { nickname } = req.body;
    let profileImageUrl = req.body.profileImageUrl;
    if (req.file) {
      profileImageUrl = req.file.path;
    }
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

    if (req.body.price) req.body.price = Number(req.body.price);
    if (req.body.totalIssued)
      req.body.totalIssued = Number(req.body.totalIssued);

    const { title, grade, genre, price, totalIssued, description } = req.body;

    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = req.file.path;
    }

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
    console.log('에러:', error);
    next(error);
  }
};

const getMyCards = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { search, grade, genre, page, limit } = req.query;

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const safePage =
      Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const safeLimit =
      Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : 9;

    const cards = await userService.getMyCards(userId, {
      search,
      grade,
      genre,
      page: safePage,
      limit: safeLimit,
    });

    res.status(200).json(cards);
  } catch (error) {
    next(error);
  }
};

const getMySalesCard = async (req, res, next) => {
  try {
    const id = req.auth.userId;
    const { search, grade, genre, soldOut, page, limit } = req.query;
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const safePage =
      Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const safeLimit =
      Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : 9;

    const salesCard = await userService.getMySalesCard(id, {
      search,
      grade,
      genre,
      soldOut,
      page: safePage,
      limit: safeLimit,
    });

    res.status(200).json(salesCard);
  } catch (error) {
    next(error);
  }
};

export default {
  getProfile,
  patchProfile,
  createPhoto,
  getMyCards,
  getMySalesCard,
};
