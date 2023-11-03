import { onRequest } from 'firebase-functions/v2/https';
import { App } from './app';

const app = new App([]);

export const v2docs = onRequest(
  {
    concurrency: 100,
    memory: '256MiB',
  },
  app.getServer(),
);
