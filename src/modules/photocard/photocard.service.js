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
  const safePage = page >= 1 ? page : 1;
  const safeLimit = limit > 100 ? 100 : limit >= 1 ? limit : 10;

  const skip = (safePage - 1) * safeLimit;
  const whereCondition = {};

  // 📌 2. photoCard.template 내부 필터 조각들을 하나로 병합할 객체 선언 (덮어쓰기 방지)
  const templateFilter = {};

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

  if (Object.keys(templateFilter).length > 0) {
    whereCondition.photoCard = {
      template: templateFilter,
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
      take: safeLimit,
      include: {
        photoCard: { include: { template: true } },
        seller: { select: { nickname: true } },
      },
    }),
  ]);

  // 5. SOLD OUT 데이터 포맷팅 가공
  const formattedList = listings.map((item) => {
    const isSoldOut = item.remainQuantity === 0 || item.status === 'SOLD';
    return {
      id: item.id,
      title: item.photoCard.template.title,
      price: item.price,
      grade: item.photoCard.template.grade,
      genre: item.photoCard.template.genre,
      sellerNickname: item.seller.nickname,
      status: isSoldOut ? 'SOLD_OUT' : 'SELLING',
    };
  });

  const hasNextPage = skip + limit < totalCount;

  return {
    list: formattedList,
    totalCount,
    hasNextPage,
  };
};
