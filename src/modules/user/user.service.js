import 'dotenv/config';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getProfile(id) {
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

function filteredPassword(user) {
  const { password, ...rest } = user;
  return rest;
}

async function createPhotoCard(creatorId, cardData) {
  const newTemplate = await prisma.cardTemplate.create({
    data: {
      title: cardData.title,
      grade: cardData.grade,
      genre: cardData.genre,
      price: cardData.price,
      totalIssued: cardData.totalIssued,
      imageUrl: cardData.imageUrl,
      description: cardData.description,
      creatorId,
    },
  });
  await prisma.photoCard.create({
    data: {},
  });
}

export default {
  getProfile,
};
