import detailService from './detail.service.js';

async function getDetailCard(req, res, next) {
  try {
    const saleId = Number(req.params.id);

    if (Number.isNaN(saleId) || saleId <= 0) {
      throw new Error('판매글의 id가 유효하지 않습니다.');
    }

    const detailCard = await detailService.getSale(saleId);

    return res.status(200).json({
      success: true,
      message: '상세카드 정보 가져오기 성공',
      data: detailCard,
    });
  } catch (error) {
    return next(error);
  }
}

async function purchaseCard(req, res, next) {
  try {
    const saleId = Number(req.params.id);
    const quantity = Number(req.body.quantity);
    const buyerId = req.auth.userId;

    if (Number.isNaN(saleId) || saleId <= 0) {
      throw new Error('판매글의 id가 유효하지 않습니다.');
    }

    //정수 검증
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('구매 수량의 값이 유효하지 않습니다.');
    }

    const purchase = await detailService.postPurchase(
      saleId,
      quantity,
      buyerId
    );

    return res
      .status(201)
      .json({ success: true, message: '구매하기 성공', data: purchase });
  } catch (error) {
    return next(error);
  }
}

async function patchedCard(req, res, next) {
  try {
    const saleId = Number(req.params.id);
    const sellerId = req.auth.userId;
    const {
      quantity,
      price,
      exchangeGrade,
      exchangeGenre,
      exchangeDescription,
    } = req.body;

    if (Number.isNaN(saleId) || saleId <= 0) {
      throw new Error('판매글의 id가 유효하지 않습니다.');
    }

    const updateData = {};
    if (quantity != null) {
      if (!Number.isInteger(quantity) || quantity < 0) {
        throw new Error('판매 중인 총 카드 수량이 0 이상 정수여야 합니다.');
      }
      updateData.quantity = quantity;
    }
    if (price != null) {
      updateData.price = price;
    }
    if (exchangeGrade != null) {
      updateData.exchangeGrade = exchangeGrade;
    }
    if (exchangeGenre != null) {
      updateData.exchangeGenre = exchangeGenre;
    }
    if (exchangeDescription != null) {
      updateData.exchangeDescription = exchangeDescription;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('수정된 데이터가 없습니다.');
    }

    const editCard = await detailService.updateSale(
      saleId,
      updateData,
      sellerId
    );
    return res
      .status(200)
      .json({ success: true, message: '판매 수정하기 성공', data: editCard });
  } catch (error) {
    return next(error);
  }
}

async function cancelledCard(req, res, next) {
  try {
    const saleId = Number(req.params.id);
    const sellerId = req.auth.userId;

    if (Number.isNaN(saleId) || saleId <= 0) {
      throw new Error('판매글의 id가 유효하지 않습니다.');
    }

    const cancelCard = await detailService.deleteSale(saleId, sellerId);

    return res
      .status(200)
      .json({ success: true, message: '판매글 취소 완료', data: cancelCard });
  } catch (error) {
    return next(error);
  }
}

export default {
  getDetailCard,
  purchaseCard,
  patchedCard,
  cancelledCard,
};
