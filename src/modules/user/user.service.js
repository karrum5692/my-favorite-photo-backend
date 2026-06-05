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

async function patchProfile(id, updateData) {
  const user = await prisma.user.update({
    where: { id },
    data: {
      nickname: updateData.nickname,
      profileImageUrl: updateData.profileImageUrl,
    },
  });

  return user;
}

async function createPhoto(creatorId, cardData) {
  const newPhoto = await prisma.CardTemplate.create({
    data: {
      creatorId,
      title: cardData.title,
      description: cardData.description,
      imageUrl: cardData.imageUrl,
      grade: cardData.grade,
      genre: cardData.genre,
      price: cardData.price,
      totalIssued: cardData.totalIssued,
    },
  });
  return newPhoto;
}

export default {
  getProfile,
  patchProfile,
  createPhoto,
};
