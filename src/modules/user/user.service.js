import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

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
  const existUser = await prisma.user.findUnique({
    where: { id },
  });
  if (!existUser) {
    const error = new Error('존재하지 않는 유저입니다.');
    error.code = 404;
    throw error;
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      nickname: updateData.nickname,
      profileImageUrl: updateData.profileImageUrl,
    },
  });

  return filteredPassword(user);
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

async function getMyCards(userId) {
  const cards = await prisma.photoCard.findMany({
    where: {
      ownerId: userId,
      quantity: {
        gt: 0,
      },
    },
    include: {
      owner: {
        select: {
          nickname: true,
        },
      },
      template: {
        select: {
          title: true,
          imageUrl: true,
          grade: true,
          genre: true,
          price: true,
        },
      },
    },
  });

  return cards.map((card) => ({
    id: card.id,
    nickname: card.owner.nickname,
    quantity: card.quantity,
    title: card.template.title,
    imageUrl: card.template.imageUrl,
    grade: card.template.grade,
    genre: card.template.genre,
    price: card.template.price,
  }));
}

export default {
  getProfile,
  patchProfile,
  createPhoto,
  getMyCards,
};
