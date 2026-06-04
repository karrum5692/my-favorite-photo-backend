import * as photocardService from './photocard.service.js';

const ALLOWED_GRADES = new Set(['COMMON', 'RARE', 'SUPER_RARE', 'LEGENDARY']);
const ALLOWED_GENRES = new Set([
  'ALBUM',
  'SPECIAL',
  'FAN_SIGN',
  'SEASON_GREETING',
  'FAN_MEETING',
  'CONCERT',
  'MD',
  'COLLABORATION',
  'FAN_CLUB',
  'OTHER',
]);
const ALLOWED_STATUS = new Set(['SELLING', 'SOLD']);
const ALLOWED_ORDER_BY = new Set([
  'latest',
  'oldest',
  'price_asc',
  'price_desc',
]);

export const getMarketCards = async (req, res, next) => {
  try {
    const {
      search,
      grade,
      genre,
      status,
      orderBy,
      page = 1,
      limit = 10,
    } = req.query;

    // 1. 도메인 유효성 검증
    if (grade && !ALLOWED_GRADES.has(grade)) {
      return res.status(400).json({
        message: `입력값 검증 실패: 유효하지 않은 등급(${grade})입니다.`,
      });
    }
    if (genre && !ALLOWED_GENRES.has(genre)) {
      return res.status(400).json({
        message: `입력값 검증 실패: 유효하지 않은 장르(${genre})입니다.`,
      });
    }
    if (status && !ALLOWED_STATUS.has(status)) {
      return res.status(400).json({
        message: `입력값 검증 실패: 유효하지 않은 상태(${status})입니다.`,
      });
    }
    if (orderBy && !ALLOWED_ORDER_BY.has(orderBy)) {
      return res.status(400).json({
        message: `입력값 검증 실패: 유효하지 않은 정렬 기준(${orderBy})입니다.`,
      });
    }

    //필터는 한번에 하나만 선택
    const activeFilters = [grade, genre, status].filter(Boolean).length;
    if (activeFilters > 1) {
      return res.status(400).json({
        message:
          '입력값 검증 실패: 필터는 등급, 장르, 매진 여부 중 한 번에 하나만 선택 가능합니다.',
      });
    }

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    const safePage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    const safeLimit = isNaN(parsedLimit) || parsedLimit < 1 ? 10 : parsedLimit;

    const result = await photocardService.findMarketCards({
      search,
      grade,
      genre,
      status,
      orderBy,
      page: Number(page),
      limit: Number(limit),
    });

    // 200 OK 응답 구조
    return res.status(200).json({
      success: true,
      data: result.list,
      meta: {
        totalCount: result.totalCount,
        page: Number(page),
        limit: Number(limit),
        hasNextPage: result.hasNextPage,
      },
    });
  } catch (error) {
    next(error);
  }
};
