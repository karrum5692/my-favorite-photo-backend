import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import logger from './config/logger.js';

import authRouter from './modules/auth/auth.router.js';
import userRouter from './modules/user/user.router.js';
import tradeRouter from './modules/trade/trade.router.js';
import detailRouter from './modules/marketplace/detail/detail.router.js';
import myCardRouter from './modules/marketplace/saleModule/saleModule.router.js';
import photocardRouter from './modules/photocard/photocard.router.js';
import notificationRouter from './modules/notification/notification.router.js';
import pointRouter from './modules/point/point.router.js';

import errorMiddleware from './middlewares/error.middleware.js';
import { HttpError } from './middlewares/HttpError.js';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// HTTP 요청 로그를 Winston으로 전달
const morganFormat =
  process.env.NODE_ENV === 'production' ? 'combined' : 'tiny';
app.use(
  morgan(morganFormat, {
    stream: { write: (message) => logger.http(message.trim()) },
  })
);

// 라우터 등록
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/market', tradeRouter);
app.use('/market', detailRouter);
app.use('/market', photocardRouter);
app.use('/market', myCardRouter);
app.use('/notifications', notificationRouter);
app.use('/points', pointRouter);

app.get('/', (req, res) => {
  res.json({ message: '안녕하세요' });
});

app.use((req, res, next) => {
  next(new HttpError(404, '요청하신 경로를 찾을 수 없습니다.'));
});

app.use(errorMiddleware);

export default app;
