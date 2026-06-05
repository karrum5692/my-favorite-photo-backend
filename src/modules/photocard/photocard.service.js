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
  const templateFilter = {};

  // 1. 텍스트 검색 조건
  if (search) {
    templateFilter.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // 2. 단일 필터 조건 반영
  if (grade) {
    templateFilter.grade = grade;
  }
  if (genre) {
    templateFilter.genre = genre;
  }

  if (Object.keys(templateFilter).length > 0) {
    whereCondition.photoCard = {
      template: templateFilter,
    };
  }

  // 매진 여부 필터
  if (status) {
    whereCondition.status = status; // 'SELLING' 또는 'SOLD'가 그대로 매칭됨
  }

  // 3. 정렬 조건 설정
  let orderCondition = [{ createdAt: 'desc' }, { id: 'asc' }]; // 최신순 (기본값 fallback)

  if (orderBy === 'latest') {
    orderCondition = [{ createdAt: 'desc' }, { id: 'asc' }];
  }
  if (orderBy === 'oldest') {
    orderCondition = [{ createdAt: 'asc' }, { id: 'asc' }];
  }
  if (orderBy === 'price_asc') {
    orderCondition = [{ price: 'asc' }, { id: 'asc' }];
  }
  if (orderBy === 'price_desc') {
    orderCondition = [{ price: 'desc' }, { id: 'asc' }];
  }

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
    return {
      id: item.id,
      title: item.photoCard.template.title,
      price: item.price,
      grade: item.photoCard.template.grade,
      genre: item.photoCard.template.genre,
      sellerNickname: item.seller.nickname,
      status: item.status, // SELLING 또는 SOLD 그대로 유지하여 도메인 일관성 보장
    };
  });

  const hasNextPage = skip + safeLimit < totalCount;

  return {
    list: formattedList,
    totalCount,
    hasNextPage,
  };
};
