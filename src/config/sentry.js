import * as Sentry from '@sentry/node';

const isProd = process.env.NODE_ENV === 'production';

export function initSentry() {
  // 운영 환경 + DSN이 설정된 경우에만 활성화
  if (!isProd || !process.env.SENTRY_DSN) return;
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
}

export { Sentry };
