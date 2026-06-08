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

async function getPointhistory(id) {
  const pointHistory = await prisma.pointHistory.findMany({
    where: { userId: id },
    orderBy: { createdAt: 'desc' },
  });

  return pointHistory;
}

export default { getPoint, getPointhistory };
