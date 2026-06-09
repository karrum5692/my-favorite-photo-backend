import prisma from '../../../config/db.js';

//나의 포토카드 가져오기
async function getMySale(ownerId) {
  return await prisma.photoCard.findMany({
    where: { ownerId: ownerId, status: 'OWNED' },
    select: {
      id: true,
      quantity: true,
      template: {
        select: {
          title: true,
          imageUrl: true,
          grade: true,
          genre: true,
          creator: {
            select: {
              nickname: true,
            },
          },
        },
      },
    },
  });
}

//포토카드 판매하기 생성
async function createSale(ownerId, photoCardId, data) {
  return await prisma.$transaction(async (tx) => {
    const card = await tx.photoCard.findUnique({
      where: { id: photoCardId },
    });

    if (!card) {
      throw new Error('카드가 존재하지 않습니다.');
    }

    if (card.ownerId !== ownerId) {
      throw new Error('본인의 카드가 아닙니다.');
    }

    if (data.quantity !== card.quantity) {
      throw new Error('보유 수량 전체만 판매할 수 있습니다.');
    }

    const changedStatus = await tx.photoCard.updateMany({
      where: {
        id: photoCardId,
        status: 'OWNED',
      },
      data: {
        status: 'ON_SALE',
      },
    });

    if (changedStatus.count === 0) {
      throw new Error('이미 판매 중이거나 상태가 변경되었습니다.');
    }

    const sale = await tx.saleListing.create({
      data: {
        seller: { connect: { id: ownerId } },
        remainQuantity: data.quantity,
        photoCard: { connect: { id: photoCardId } },
        quantity: data.quantity,
        price: data.price,
        exchangeGrade: data.exchangeGrade,
        exchangeGenre: data.exchangeGenre,
        exchangeDescription: data.exchangeDescription,
      },
    });

    return sale;
  });
}

export default { getMySale, createSale };
