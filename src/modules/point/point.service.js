import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getPoint(id) {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    const error = new Error('존재하지 않는 유저입니다.');
    error.code = 404;
    throw error;
  }
  return filteredPassword(user);
}
