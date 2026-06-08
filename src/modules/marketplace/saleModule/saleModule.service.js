import prisma from '../../../config/db.js';

//나의 포토카드 판매하기
async function getMySale(ownerId) {
  return await prisma.$transaction(async (tx) => {
    const getMyCard = await tx.photoCard.findMany({
      where: { ownerId: ownerId, status: 'OWNED' },
      include: {
        template: {
          include: {
            creator: true,
          },
        },
      },
    });

    console.log(getMyCard);

    if (getMyCard.length === 0) {
      throw new Error('나의 포토카드 데이터를 가져오는데 실패하였습니다.');
    }

    return getMyCard;
  });
}

export default getMySale;
