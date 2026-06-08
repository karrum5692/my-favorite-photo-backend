import getMySale from './saleModule.service.js';

async function getSaleCard(req, res, next) {
  try {
    const ownerId = req.auth.userId;

    const cards = await getMySale(ownerId);

    return res.status(200).json({
      success: true,
      message: '나의 포토카드 가져오기 성공',
      data: cards,
    });
  } catch (error) {
    return next(error);
  }
}

export default getSaleCard;
