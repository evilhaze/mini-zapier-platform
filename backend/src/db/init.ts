import { initDb } from './index.js';

initDb().then(() => {
  console.log('DB initialized');
});
