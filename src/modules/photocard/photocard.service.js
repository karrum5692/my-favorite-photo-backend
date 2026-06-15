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

  // 🎯 [수정] 참조 무결성을 위해 검색 조건과 목록 조회 조건을 완전히 분리 정의
  const baseTemplateFilter = {};
  if (search) {
    baseTemplateFilter.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // 1. 검색어만 반영된 통계용 독립 조건 생성
  const baseWhereCondition = search
    ? { photoCard: { template: { ...baseTemplateFilter } } }
    : {};

  // 2. 실제 목록 및 totalCount 조회용 필터 조건 생성
  const listTemplateFilter = { ...baseTemplateFilter };
  if (grade) listTemplateFilter.grade = grade;
  if (genre) listTemplateFilter.genre = genre;

  const whereCondition = {};
  if (Object.keys(listTemplateFilter).length > 0) {
    whereCondition.photoCard = { template: listTemplateFilter };
  }
  if (status) {
    whereCondition.status = status;
  }

  // 3. 정렬 조건 설정
  let orderCondition;
  switch (orderBy) {
    case 'oldest':
      orderCondition = [{ createdAt: 'asc' }, { id: 'asc' }];
      break;
    case 'price_asc':
      orderCondition = [{ price: 'asc' }, { id: 'asc' }];
      break;
    case 'price_desc':
      orderCondition = [{ price: 'desc' }, { id: 'asc' }];
      break;
    case 'latest':
    default:
      orderCondition = [{ createdAt: 'desc' }, { id: 'asc' }];
      break;
  }

  // 4. DB 병렬 쿼리 수행
  const [totalCount, listings, allListingsForStats] = await Promise.all([
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

    prisma.saleListing.findMany({
      where: baseWhereCondition,
      include: {
        photoCard: { include: { template: true } },
      },
    }),
  ]);

  // 5. 필터 탭별 카운트 추출
  const filterCounts = {
    grade: { COMMON: 0, RARE: 0, SUPER_RARE: 0, LEGENDARY: 0 },
    genre: {
      ALBUM: 0,
      SPECIAL: 0,
      FAN_SIGN: 0,
      SEASON_GREETING: 0,
      FAN_MEETING: 0,
      CONCERT: 0,
      MD: 0,
      COLLABORATION: 0,
      FAN_CLUB: 0,
      OTHER: 0,
    },
    status: { SELLING: 0, SOLD: 0 },
  };

  allListingsForStats.forEach((item) => {
    const itemGrade = item.photoCard?.template?.grade;
    const itemGenre = item.photoCard?.template?.genre;
    const itemStatus = item.status;

    if (filterCounts.grade[itemGrade] !== undefined)
      filterCounts.grade[itemGrade]++;
    if (filterCounts.genre[itemGenre] !== undefined)
      filterCounts.genre[itemGenre]++;
    if (filterCounts.status[itemStatus] !== undefined)
      filterCounts.status[itemStatus]++;
  });

  // 6. 매핑
  const formattedList = listings.map((item) => ({
    id: item.id,
    title: item.photoCard?.template?.title || '',
    imageUrl: item.photoCard?.template?.imageUrl || '',
    grade: item.photoCard?.template?.grade || 'COMMON',
    genre: item.photoCard?.template?.genre || 'OTHER',
    sellerNickname: item.seller?.nickname || '익명',
    price: item.price,
    remainQuantity: item.remainQuantity,
    totalQuantity: item.quantity,
    status: item.status,
  }));

  // 🎯 지난번에 교정한 정확한 무한 스크롤 다음 페이지 판별식
  const hasNextPage = skip + listings.length < totalCount;

  return {
    list: formattedList,
    totalCount,
    hasNextPage,
    filterCounts,
  };
};
