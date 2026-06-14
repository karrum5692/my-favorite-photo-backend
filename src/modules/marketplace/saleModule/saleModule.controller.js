import saleModuleService from './saleModule.service.js';
import { Grade, Genre } from '@prisma/client';

async function getMyCard(req, res, next) {
  try {
    const ownerId = req.auth.userId;

    const cards = await saleModuleService.getMySale(ownerId);

    return res.status(200).json({
      success: true,
      message: '나의 포토카드 가져오기 성공',
      data: cards,
    });
  } catch (error) {
    return next(error);
  }
}

async function postSale(req, res, next) {
  try {
    const photoCardId = Number(req.params.id);
    const ownerId = req.auth.userId;

    if (Number.isNaN(photoCardId) || photoCardId <= 0) {
      throw new Error('포토카드의 id가 유효하지 않습니다.');
    }

    const {
      quantity,
      price,
      exchangeGrade,
      exchangeGenre,
      exchangeDescription,
    } = req.body;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('판매 수량의 값이 유효하지 않습니다. ');
    }

    if (!Number.isInteger(price) || price < 0) {
      throw new Error('판매 가격의 값이 유효하지 않습니다.');
    }

    if (!Object.keys(Grade).includes(exchangeGrade)) {
      throw new Error('카드 등급의 값이 유효하지 않습니다.');
    }

    if (!Object.keys(Genre).includes(exchangeGenre)) {
      throw new Error('카드 장르의 값이 유효하지 않습니다.');
    }

    if (!exchangeDescription || !exchangeDescription.trim()) {
      throw new Error('설명을 작성해야 합니다.');
    }

    const postedSale = await saleModuleService.createSale(
      ownerId,
      photoCardId,
      {
        quantity,
        price,
        exchangeGrade,
        exchangeGenre,
        exchangeDescription,
      }
    );

    return res
      .status(201)
      .json({ success: true, message: '판매하기 저장 완료', data: postedSale });
  } catch (error) {
    return next(error);
  }
}

export default { getMyCard, postSale };
