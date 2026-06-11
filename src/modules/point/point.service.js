import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getPoint(id) {
  const point = await prisma.point.findUnique({
    where: { userId: id },
    select: { balance: true },
  });
  if (!point) {
    const error = new Error('존재하지 않는 유저입니다.');
    error.code = 404;
    throw error;
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
  const result = await prisma.$transaction(async (tx) => {
    const lastEventTime = await tx.point.findUnique({
      where: { userId: id },
      select: { lastEventAt: true },
    });

    if (!lastEventTime) {
      const error = new Error('존재하지 않는 유저입니다.');
      error.code = 404;
      throw error;
    }

    const now = new Date();
    if (lastEventTime.lastEventAt) {
      const timeResult = now - lastEventTime.lastEventAt;
      const oneHour = 60 * 60 * 1000;
      if (timeResult < oneHour) {
        const error = new Error('아직 1시간이 지나지 않았습니다.');
        error.code = 400;
        throw error;
      }
    }

    const point = getRandomPoint();

    const updatedPoint = await tx.point.update({
      where: { userId: id },
      data: { balance: { increment: point }, lastEventAt: now },
    });

    const history = await tx.pointHistory.create({
      data: { userId: id, amount: point, type: 'RANDOM_BOX' },
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
