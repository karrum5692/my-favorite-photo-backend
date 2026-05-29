const errorMiddleware = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || '서버 내부 오류';

  res.status(status).json({
    success: false,
    message,
  });
};

export default errorMiddleware;
