import prisma from '../../config/db.js';
import { HttpError } from '../../middlewares/HttpError.js';

async function getPoint(id) {
  const point = await prisma.point.findUnique({
    where: { userId: id },
    select: { balance: true, lastEventAt: true },
  });
  if (!point) {
    throw new HttpError(404, '존재하지 않는 유저입니다.');
  }
  return point;
}

async function getPointHistory(id) {
  const pointHistory = await prisma.pointHistory.findMany({
    where: { userId: id },
    orderBy: { createdAt: 'desc' },
  });

  return pointHistory;
}

async function randomPoint(id) {
  const amount = getRandomPoint();
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.point.updateMany({
      where: {
        userId: id,
        OR: [{ lastEventAt: null }, { lastEventAt: { lte: oneHourAgo } }],
      },
      data: {
        balance: { increment: amount },
        lastEventAt: now,
      },
    });

    if (updated.count === 0) {
      const exists = await tx.point.findUnique({
        where: { userId: id },
        select: { userId: true },
      });

      if (!exists) {
        throw new HttpError(404, '존재하지 않는 유저입니다.');
      }

      throw new HttpError(400, '아직 1시간이 지나지 않았습니다.');
    }

    const updatedPoint = await tx.point.findUnique({
      where: { userId: id },
    });

    const history = await tx.pointHistory.create({
      data: { userId: id, amount, type: 'RANDOM_BOX' },
    });

    return [updatedPoint, history];
  });

  return result;
}

function getRandomPoint() {
  const random = Math.random();

  if (random < 0.8) {
    return 10;
  } else if (random < 0.9) {
    return 30;
  } else if (random < 0.98) {
    return 50;
  } else {
    return 100;
  }
}

export default { getPoint, getPointHistory, randomPoint };
