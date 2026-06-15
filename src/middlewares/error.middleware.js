import { Prisma } from '@prisma/client';
import { HttpError } from './HttpError.js';

const isProd = process.env.NODE_ENV === 'production';

function mapPrismaError(err) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const target = err.meta?.target;
        const field = Array.isArray(target) ? target[0] : target;
        return new HttpError(409, '이미 존재하는 값입니다.', field);
      }
      case 'P2025':
        return new HttpError(404, '대상을 찾을 수 없습니다.');
      case 'P2003':
        return new HttpError(400, '참조하는 데이터가 존재하지 않습니다.');
      default:
        return new HttpError(400, '잘못된 요청입니다.');
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return new HttpError(400, '요청 데이터 형식이 올바르지 않습니다.');
  }

  return null;
}

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof HttpError)) {
    const mapped = mapPrismaError(error);
    if (mapped) error = mapped;
  }

  const status = error.status || 500;

  if (status >= 500) {
    console.error(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
      err
    );
  }

  const message =
    status >= 500 && isProd
      ? '서버 내부 오류가 발생했습니다.'
      : error.message || '서버 내부 오류';

  const body = {
    success: false,
    message,
  };

  if (error.field) body.field = error.field;

  res.status(status).json(body);
};

export default errorMiddleware;
