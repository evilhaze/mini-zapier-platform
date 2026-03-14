import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { routes } from './routes/index.js';
import { swaggerServe, swaggerSetup } from './config/swagger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  app.use(cors());
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
