import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRouter from './modules/auth/auth.router.js';
import userRouter from './modules/user/user.router.js';
import tradeRouter from './modules/trade/trade.router.js';
import detailRouter from './modules/marketplace/detail/detail.router.js';
import myCardRouter from './modules/marketplace/saleModule/saleModule.router.js';
import photocardRouter from './modules/photocard/photocard.router.js';
import notificationRouter from './modules/notification/notification.router.js';

import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

// 라우터 등록
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/market', tradeRouter);
app.use('/market', detailRouter);
app.use('/market', photocardRouter);
app.use('/market', myCardRouter);
app.use('/notifications', notificationRouter);

app.get('/', (req, res) => {
  res.json({ message: '안녕하세요' });
});

app.use(errorMiddleware);

export default app;
