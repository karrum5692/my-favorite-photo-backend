import * as photocardService from './photocard.service.js';

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

    //필터는 한번에 하나만 선택
    const activeFilters = [grade, genre, status].filter(Boolean).length;
    if (activeFilters > 1) {
      return res.status(400).json({
        message:
          '입력값 검증 실패: 필터는 등급, 장르, 매진 여부 중 한 번에 하나만 선택 가능합니다.',
      });
    }

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
