import prisma from '../../../config/db.js';
import { HttpError } from '../../../middlewares/HttpError.js';

//카드 상세페이지-구매자

//판매 등록된 카드 정보 불러오기
async function getSale(saleId) {
  return await prisma.saleListing.findUnique({
    where: {
      id: saleId,
    },
    select: {
      id: true,
      sellerId: true,
      price: true,
      remainQuantity: true,
      quantity: true,
      exchangeGrade: true,
      exchangeGenre: true,
      exchangeDescription: true,
      photoCard: {
        select: {
          template: {
            select: {
              title: true,
              imageUrl: true,
              grade: true,
              genre: true,
              description: true,
              creator: {
                select: {
                  nickname: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

// 구매하기
async function postPurchase(saleId, purchaseQuantity, buyerId) {
  return await prisma.$transaction(async (tx) => {
    //1. 판매 등록 조회
    const sale = await tx.saleListing.findUnique({
      where: { id: saleId },
      include: {
        photoCard: true,
      },
    });

    // 2. 상태 체크 검증
    if (!sale) {
      throw new HttpError(404, '판매글을 찾을 수 없습니다.');
    }

    if (sale.status !== 'SELLING') {
      throw new HttpError(400, '판매 중인 카드가 아닙니다.');
    }

    // 3. 판매글이 본인 판매글인지

    //userId는 이미 로그인한 id
    if (sale.sellerId === buyerId) {
      throw new HttpError(400, '본인 카드를 본인이 구매할 수 없습니다.');
    }

    // 4. 판매수량이 정상인지 확인(판매 등록에서 조회한 판매수량이 0인지 아닌지 확인)
    //    구매수량>0 인지 확인
    if (purchaseQuantity <= 0) {
      throw new HttpError(400, '구매 수량은 1개 이상이어야 합니다.');
    }

    // 5. 구매자 포인트 조회(구매자 포인트가 살 수 있을 정도로 가지고 있는지)
    const buyerPoint = await tx.point.findUnique({
      where: { userId: buyerId },
    });

    if (!buyerPoint) {
      throw new HttpError(400, '구매자의 포인트 row가 없습니다.');
    }

    const totalPurchasingPrice = sale.price * purchaseQuantity;

    //UX용(에러) => 밑에 조건부 update로 검증함(Line 157-175)
    // if (totalPurchasingPrice > buyerPoint.balance) {
    //   throw new HttpError(400, '포인트 부족으로 구매할 수 없습니다.');
    // }

    // 6. 판매자의 Remain 판매수량 감소(조건부 Update): 판매수량 >=구매수량 검증
    const updatedSale = await tx.saleListing.updateMany({
      where: {
        id: saleId,
        remainQuantity: {
          gte: purchaseQuantity,
        },
        status: 'SELLING',
      },
      data: {
        remainQuantity: {
          decrement: purchaseQuantity,
        },
      },
    });

    if (updatedSale.count === 0) {
      throw new HttpError(400, '판매 카드의 재고가 부족합니다.');
    }

    //판매글 상태 변경(수량 감소 후의 값 기준)
    const changedStatus = await tx.saleListing.findUnique({
      where: { id: saleId },
    });

    if (changedStatus.remainQuantity === 0) {
      await tx.saleListing.update({
        where: { id: saleId },
        data: {
          status: 'SOLD',
        },
      });

      //photocard 상태 변경
      await tx.photoCard.update({
        where: { id: changedStatus.photoCardId },
        data: {
          status: 'SOLD_OUT',
        },
      });
    }

    //7. 구매자의 구매수량 증가시키기(구매한 숫자만큼)
    // 구매자가 이미 그 카드를 가지고 있으면 기존 카드 수량 + 구매수량 (update)
    // 처음 구매하는 카드면 새 row 생성(create)

    const templateId = sale.photoCard.templateId;

    //구매자 구매 수량 증가
    const buyerPhotoCard = await tx.photoCard.upsert({
      where: {
        templateId_ownerId: {
          templateId,
          ownerId: buyerId,
        },
      },
      update: {
        quantity: { increment: purchaseQuantity },
      },
      create: {
        templateId,
        ownerId: buyerId,
        quantity: purchaseQuantity,
        status: 'OWNED',
      },
    });

    //판매자의 포토카드 수량 감소
    await tx.photoCard.update({
      where: {
        templateId_ownerId: {
          templateId,
          ownerId: sale.sellerId,
        },
      },
      data: {
        quantity: { decrement: purchaseQuantity },
      },
    });

    //8. 구매처리
    const purchases = await tx.purchase.create({
      data: {
        buyer: { connect: { id: buyerId } },
        seller: { connect: { id: sale.sellerId } },
        photoCard: { connect: { id: buyerPhotoCard.id } },
        saleListing: { connect: { id: saleId } },
        quantity: purchaseQuantity,
        price: sale.price,
      },
    });

    //9. 포인트

    // buyer.point 감소
    const buyerTotalPoint = await tx.point.updateMany({
      where: {
        userId: buyerId,
        balance: {
          gte: totalPurchasingPrice,
        },
      },
      data: {
        balance: {
          decrement: totalPurchasingPrice,
        },
      },
    });

    if (buyerTotalPoint.count === 0) {
      throw new HttpError(
        400,
        '동시에 결제 시도가 이루어져 포인트 결제에 실패하였습니다.'
      );
    }

    //판매자 포인트 증가
    await tx.point.update({
      where: {
        userId: sale.sellerId,
      },
      data: {
        balance: { increment: totalPurchasingPrice },
      },
    });

    //구매자 포인트 히스토리 생성
    await tx.pointHistory.create({
      data: {
        userId: buyerId,
        purchaseId: purchases.id,
        type: 'PURCHASE',
        amount: -totalPurchasingPrice,
      },
    });

    //판매자 포인트 히스토리 생성
    await tx.pointHistory.create({
      data: {
        userId: sale.sellerId,
        purchaseId: purchases.id,
        type: 'SALE',
        amount: totalPurchasingPrice,
      },
    });

    return purchases;
  });
}

//카드 상세페이지-판매자

//판매글 수정
async function updateSale(saleId, data, sellerId) {
  return await prisma.$transaction(async (tx) => {
    try {
      const sale = await tx.saleListing.findUnique({
        where: { id: saleId },
      });

      if (!sale) {
        throw new HttpError(404, '판매글이 존재하지 않습니다.');
      }

      if (sale.sellerId !== sellerId) {
        throw new HttpError(403, '본인 카드만 수정할 수 있습니다.');
      }

      const updateData = { ...data };

      if (data.quantity !== undefined) {
        const soldQuantity = sale.quantity - sale.remainQuantity;

        if (soldQuantity > data.quantity) {
          throw new HttpError(
            400,
            '이미 팔린 카드 수량보다 더 적게 할 수 없습니다.'
          );
        }

        updateData.remainQuantity = data.quantity - soldQuantity;

        updateData.status =
          updateData.remainQuantity === 0 ? 'SOLD' : 'SELLING';
      }

      const patchedSale = await tx.saleListing.update({
        where: { id: saleId },
        data: updateData,
      });

      await tx.photoCard.update({
        where: { id: sale.photoCardId },
        data: {
          status: patchedSale.remainQuantity === 0 ? 'SOLD_OUT' : 'ON_SALE',
        },
      });

      return patchedSale;
    } catch (error) {
      throw error;
    }
  });
}

//판매글 취소
async function deleteSale(saleId, sellerId) {
  return await prisma.$transaction(async (tx) => {
    const sale = await tx.saleListing.findUnique({
      where: { id: saleId },
    });

    if (!sale) {
      throw new HttpError(404, '판매글이 존재하지 않습니다.');
    }

    if (sale.sellerId !== sellerId) {
      throw new HttpError(403, '본인 카드의 판매글만 취소할 수 있습니다.');
    }

    if (sale.status !== 'SELLING') {
      throw new HttpError(400, '판매 중인 게시글만 취소할 수 있습니다.');
    }

    const cancel = await tx.saleListing.delete({
      where: { id: saleId },
    });

    //포토카드 status = owned
    if (cancel.status === 'CANCELLED') {
      await tx.photoCard.update({
        where: { id: sale.photoCardId },
        data: { status: 'OWNED' },
      });
    }

    return cancel;
  });
}

export default {
  getSale,
  postPurchase,
  updateSale,
  deleteSale,
};
