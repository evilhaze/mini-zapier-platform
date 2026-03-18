import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isProduction = nodeEnv === 'production';

export const config = {
  nodeEnv,
  port: Number(process.env.PORT) || 3001,
  redis: {
    /**
     * Priority:
     * 1) REDIS_URL
     * 2) REDIS_HOST + REDIS_PORT
     *
     * In production: no localhost fallback. If Redis isn't configured, it's considered disabled.
     */
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST ?? (isProduction ? undefined : 'localhost'),
    port: process.env.REDIS_PORT
      ? Number(process.env.REDIS_PORT)
      : isProduction
        ? process.env.REDIS_HOST
          ? 6379
          : undefined
        : 6379,
    enabled: Boolean(process.env.REDIS_URL || !isProduction || process.env.REDIS_HOST),
  },
} as const;
