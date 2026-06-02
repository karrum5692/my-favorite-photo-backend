import express from 'express';
import cors from 'cors';
import tradeRouter from './modules/trade/trade.router.js';
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/market', tradeRouter);

app.get('/', (req, res) => {
  res.json({ message: '안녕하세요' });
});

app.use(errorMiddleware);

export default app;
