import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const findMarketCards = async ({
  search,
  grade,
  genre,
  status,
  orderBy,
  page,
  limit,
}) => {
  const skip = (page - 1) * limit;
  const whereCondition = {};

  // 1. 텍스트 검색 조건
  if (search) {
    whereCondition.photoCard = {
      template: {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      },
    };
  }

  // 2. 단일 필터 조건 반영
  if (grade) {
    whereCondition.photoCard = {
      template: { grade: grade }, // COMMON, RARE, SUPER_RARE, LEGENDARY
    };
  }

  if (genre) {
    whereCondition.photoCard = {
      template: { genre: genre }, // ALBUM, SPECIAL, CONCERT 등
    };
  }

  // 매진 여부 필터 (SELLING: 판매중 / SOLD: 판매완료)
  if (status) {
    if (status === 'SELLING') {
      whereCondition.status = 'SELLING';
      whereCondition.remainQuantity = { gt: 0 };
    } else if (status === 'SOLD') {
      whereCondition.OR = [{ status: 'SOLD' }, { remainQuantity: 0 }];
    }
  }

  // 3. 정렬 조건 설정
  let orderCondition = { createdAt: 'desc' }; // 최신순 (기본값)
  if (orderBy === 'oldest') orderCondition = { createdAt: 'asc' };
  if (orderBy === 'price_asc') orderCondition = { price: 'asc' };
  if (orderBy === 'price_desc') orderCondition = { price: 'desc' };

  // 4. DB 병렬 쿼리 수행
  const [totalCount, listings] = await Promise.all([
    prisma.saleListing.count({ where: whereCondition }),
    prisma.saleListing.findMany({
      where: whereCondition,
      orderBy: orderCondition,
      skip: skip,
      take: limit,
      include: {
        photoCard: {
          include: {
            template: true,
          },
        },
        seller: {
          select: { nickname: true },
        },
      },
    }),
  ]);

  // 5. SOLD OUT 데이터 포맷팅 가공
  const formattedList = listings.map((item) => {
    // 남은 수량이 없거나 상태가 SOLD면 무조건 SOLD_OUT 문자열로 노출
    const isSoldOut = item.remainQuantity === 0 || item.status === 'SOLD';

    return {
      saleListingId: item.id,
      seller: item.seller,
      price: item.price,
      quantity: item.quantity,
      remainQuantity: item.remainQuantity,
      status: isSoldOut ? 'SOLD_OUT' : item.status,
      cardInfo: {
        title: item.photoCard.template.title,
        description: item.photoCard.template.description,
        imageUrl: item.photoCard.template.imageUrl,
        grade: item.photoCard.template.grade,
        genre: item.photoCard.template.genre,
      },
      exchangeInfo: {
        exchangeGrade: item.exchangeGrade,
        exchangeGenre: item.exchangeGenre,
        exchangeDescription: item.exchangeDescription,
      },
      createdAt: item.createdAt,
    };
  });

  const hasNextPage = skip + limit < totalCount;

  return {
    list: formattedList,
    totalCount,
    hasNextPage,
  };
};
