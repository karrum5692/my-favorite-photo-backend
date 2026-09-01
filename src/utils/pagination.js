export const formatPaginatedResponse = (list, totalCount, limit) => {
  const safeLimit = limit >= 1 ? limit : 10;
  // totalPages 계산: totalCount가 0인 경우에도 최소 1페이지는 존재하도록 처리
  const totalPages = Math.ceil(totalCount / safeLimit) || 1;

  return {
    list,
    totalCount,
    totalPages,
  };
};
