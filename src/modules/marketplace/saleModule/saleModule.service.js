import prisma from '../../../config/db.js';

//나의 포토카드 판매하기
async function getMySale(ownerId) {
  const getMyCard = await prisma.photoCard.findMany({
    where: { ownerId: ownerId, status: 'OWNED' },
    include: {
      template: {
        include: {
          creator: true,
        },
      },
    },
  });

  return getMyCard;
}

export default getMySale;
