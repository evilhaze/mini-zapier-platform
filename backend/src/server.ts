import { createApp } from './app.js';
import { config } from './config/index.js';
import { prisma } from './utils/prisma.js';

async function start() {
  const app = createApp();

  try {
    await prisma.$connect();
  } catch (e) {
    console.error('DB connect failed:', e);
    process.exit(1);
  }

  app.listen(config.port, () => {
    console.log(`Server http://localhost:${config.port}`);
    console.log(`Swagger http://localhost:${config.port}/api-docs`);
  });
}

start();
