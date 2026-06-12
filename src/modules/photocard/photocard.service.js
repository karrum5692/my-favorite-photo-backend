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

  // 1. 텍스트 검색 조건 설정
  if (search) {
    templateFilter.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // 검색어만 반영된 공통 기준 (통계 수치 산정용 기본 베이스)
  const baseWhereCondition =
    Object.keys(templateFilter).length > 0
      ? { photoCard: { template: { ...templateFilter } } }
      : {};

  // 2. 실제 목록 조회용 개별 필터 조건 반영
  if (grade) {
    templateFilter.grade = grade;
  }
  if (genre) {
    templateFilter.genre = genre;
  }

  if (Object.keys(templateFilter).length > 0) {
    whereCondition.photoCard = { template: templateFilter };
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

  // 4. DB 병렬 쿼리 수행 (현재 필터링된 결과 개수 & 목록 데이터 가져오기)
  const [totalCount, listings, allListingsForStats] = await Promise.all([
    // 현재 조건에 부합하는 총 개수
    prisma.saleListing.count({ where: whereCondition }),

    // 현재 조건에 부합하는 페이지네이션 목록 데이터
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

    // 수십번의 카운트 쿼리 대신 검색어가 적용된 전체 대상 데이터를 하나로 가져와 메모리 집계
    prisma.saleListing.findMany({
      where: baseWhereCondition,
      include: {
        photoCard: { include: { template: true } },
      },
    }),
  ]);

  // 5. 고성능 자바스크립트 연산으로 필터 탭별 카운트 추출
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

  // 6. 프론트엔드 컴포넌트(PhotoCardItem 등) 규격에 완벽히 매핑
  const formattedList = listings.map((item) => ({
    id: item.id,
    title: item.photoCard?.template?.title || '',
    imageUrl: item.photoCard?.template?.imageUrl || '',
    grade: item.photoCard?.template?.grade || 'COMMON',
    genre: item.photoCard?.template?.genre || 'OTHER',
    sellerNickname: item.seller?.nickname || '익명',
    price: item.price,
    remainQuantity: item.remainQuantity,
    totalQuantity: item.quantity, // 원래 전체 수량
    status: item.status,
  }));

  const hasNextPage = skip + safeLimit < totalCount;

  return {
    list: formattedList,
    totalCount,
    hasNextPage,
    filterCounts, // 모바일 및 필터 헤더에 완벽히 바인딩될 연산 통계 객체
  };
};
