const authMiddleware = async (req, res, next) => {
  // 추후 실제 JWT 검증으로 교체 필요
  req.user = {
    id: 'temp-user-id',
    email: 'test@test.com',
    nickname: '테스트유저',
  };
  next();
};

export default authMiddleware;
