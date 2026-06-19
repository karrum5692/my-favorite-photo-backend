import 'dotenv/config';
import { HttpError } from '../../middlewares/HttpError.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getProfile(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      nickname: true,
      profileImageUrl: true,
      point: { select: { balance: true } },
    },
  });
  if (!user) {
    throw new HttpError(404, '존재하지 않는 유저입니다.');
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
    throw new HttpError(404, '존재하지 않는 유저입니다.');
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
  const newPhoto = await prisma.cardTemplate.create({
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

async function getMyCards(userId, filters = {}) {
  const { search, grade, genre, page = 1, limit = 9 } = filters;

  const allCards = await prisma.photoCard.findMany({
    where: {
      ownerId: userId,
      quantity: {
        gt: 0,
      },
    },
    include: { template: { select: { grade: true } } },
  });

  const allCounts = allCards.length;
  const gradeCount = { COMMON: 0, RARE: 0, SUPER_RARE: 0, LEGENDARY: 0 };
  allCards.forEach((card) => {
    gradeCount[card.template.grade] += 1;
  });

  const whereCondition = {
    ownerId: userId,
    quantity: {
      gt: 0,
    },
  };

  const templateFilter = {};
  if (search) templateFilter.title = { contains: search, mode: 'insensitive' };
  if (grade) templateFilter.grade = grade;
  if (genre) templateFilter.genre = genre;

  if (Object.keys(templateFilter).length > 0) {
    whereCondition.template = templateFilter;
  }

  const cards = await prisma.photoCard.findMany({
    where: whereCondition,
    skip: (page - 1) * limit,
    take: limit,
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

  const cardList = cards.map((card) => ({
    id: card.id,
    nickname: card.owner.nickname,
    quantity: card.quantity,
    title: card.template.title,
    imageUrl: card.template.imageUrl,
    grade: card.template.grade,
    genre: card.template.genre,
    price: card.template.price,
  }));

  const filteredCount = await prisma.photoCard.count({
    where: whereCondition,
  });
  const totalPages = Math.ceil(filteredCount / limit) || 1;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { nickname: true },
  });

  return {
    allCounts,
    gradeCount,
    card: cardList,
    totalPages,
    nickname: user?.nickname || '',
  };
}

async function getMySalesCard(id, filters = {}) {
  const { search, grade, genre, soldOut, page = 1, limit = 9 } = filters;

  const salesBaseWhere = {
    sellerId: id,
    status: { in: ['SELLING', 'SOLD'] },
  };

  const allSalesCards = await prisma.saleListing.findMany({
    where: salesBaseWhere,
    select: {
      photoCard: {
        select: {
          template: {
            select: { grade: true },
          },
        },
      },
    },
  });

  const allCounts = allSalesCards.length;
  const gradeCount = { COMMON: 0, RARE: 0, SUPER_RARE: 0, LEGENDARY: 0 };
  allSalesCards.forEach((card) => {
    gradeCount[card.photoCard.template.grade] += 1;
  });

  const whereCondition = { sellerId: id, status: { in: ['SELLING', 'SOLD'] } };

  const templateFilter = {};
  if (search) templateFilter.title = { contains: search, mode: 'insensitive' };
  if (grade) templateFilter.grade = grade;
  if (genre) templateFilter.genre = genre;

  if (Object.keys(templateFilter).length > 0) {
    whereCondition.photoCard = { template: templateFilter };
  }
  // 3. 매진 여부(soldOut) 필터 조건 설정
  if (soldOut === 'SELLING') {
    whereCondition.status = 'SELLING';
    whereCondition.exchangeGrade = null; // 순수 판매 목적 글만 타겟팅

    // 탭에서만 교환 신청이 들어와서 '대기중(PENDING)'인 건을 제외합니다.
    whereCondition.tradeProposals = {
      none: {
        status: 'PENDING',
      },
    };
  }

  if (soldOut === 'SOLD') {
    whereCondition.status = 'SOLD';
    whereCondition.exchangeGrade = null; // 순수 판매 완료 글만 타겟팅

    // 판매완료 상태에서는 교환 대기중(PENDING)인 제안이 엮여 있더라도
    // 리스트에 정상적으로 노출되어야 하므로 tradeProposals 조건을 걸지 않고 비워둡니다.
  }

  const salesCard = await prisma.saleListing.findMany({
    where: whereCondition,
    skip: (page - 1) * limit,
    take: limit,
    select: {
      price: true,
      remainQuantity: true,
      status: true,
      exchangeGrade: true,
      photoCard: {
        select: {
          template: {
            select: {
              title: true,
              imageUrl: true,
              grade: true,
              genre: true,
            },
          },
        },
      },
      seller: {
        select: {
          nickname: true,
        },
      },
    },
  });

  const filteredCount = await prisma.saleListing.count({
    where: whereCondition,
  });
  const totalPages = Math.ceil(filteredCount / limit) || 1;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { nickname: true },
  });

  return {
    allCounts,
    gradeCount,
    salesCard,
    totalPages,
    nickname: user?.nickname || '',
  };
}

export default {
  getProfile,
  patchProfile,
  createPhoto,
  getMyCards,
  getMySalesCard,
};
