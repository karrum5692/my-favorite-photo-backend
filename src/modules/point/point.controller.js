import pointService from './point.service.js';

const getPoint = async function (req, res, next) {
  try {
    const id = req.auth.userId;
    const point = await pointService.getPoint(id);
    res.status(200).json(point);
  } catch (error) {
    next(error);
  }
};

const getPointhistory = async function (req, res, next) {
  try {
    const id = req.auth.userId;
    const pointHistory = await pointService.getPointhistory(id);
    res.status(200).json(pointHistory);
  } catch (error) {
    next(error);
  }
};

export default { getPoint, getPointhistory };
