import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { routes } from './routes/index.js';
import { swaggerServe, swaggerSetup } from './config/swagger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  const defaultAllowedOrigins = [
    // Local dev
    'http://localhost:3000',
    'http://localhost:3001',
    // Saturn prod (mini-zapier-platform)
    'https://mini-zapier-platform-i15h4d.saturn.ac',
  ];

  // Optional env overrides:
  // - FRONTEND_URL: single origin to allow (e.g. https://your-frontend.example.com)
  // - CORS_ALLOWED_ORIGINS: comma-separated list of origins
  const envSingle = process.env.FRONTEND_URL;
  const envList = process.env.CORS_ALLOWED_ORIGINS;
  const envOrigins = [
    ...(envSingle ? [envSingle] : []),
    ...(envList
      ? envList
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []),
  ];

  const allowedOrigins = new Set<string>([...defaultAllowedOrigins, ...envOrigins]);

  app.use(
    cors({
      origin(origin, cb) {
        // Allow requests without Origin header (e.g. mobile apps, curl, same-origin)
        if (!origin) return cb(null, true);
        if (allowedOrigins.has(origin)) return cb(null, true);
        return cb(null, false);
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      optionsSuccessStatus: 204,
      // Keep false unless you explicitly use cookies/credentials in fetch/axios.
      credentials: false,
    })
  );
  app.use(express.json());

  app.use('/api', routes);
  app.use('/api-docs', swaggerServe, swaggerSetup);

  if (process.env.NODE_ENV !== 'test') {
    app.use(express.static(join(__dirname, '../../frontend/dist')));
    app.get('*', (_req, res) => {
      res.sendFile(join(__dirname, '../../frontend/dist/index.html'));
    });
  }

  return app;
}
