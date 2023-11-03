import { onRequest } from 'firebase-functions/v2/https';
import { defineString } from 'firebase-functions/params';
import { App } from './app';
import { UserRoute } from './routes/user.route';
import { StatusRoute } from './routes/status.route';
import { FedOfficialsRoute } from './routes/fed-officials.route';

const app = new App([new UserRoute(), new StatusRoute(), new FedOfficialsRoute()]);

/**
 * This file is the entry point for all   API requests.
 * It is configured in firebase.json to direct all requests that start with /v1 here
 * https://firebase.google.com/docs/hosting/functions#direct-requests-to-function
 */

const runtimeEnv = defineString('RUNTIME_ENV');

export const v2 = onRequest(
  {
    // keep 1 instance running in production (no cold starts)
    minInstances: runtimeEnv.equals('production').thenElse(1, 0),
    // max 12 instances running in production, 1 otherwise
    maxInstances: runtimeEnv.equals('production').thenElse(12, 1),
    // max 1000 concurrent requests per instance in production, 80 otherwise
    concurrency: runtimeEnv.equals('production').thenElse(1000, 80),
    // 2GB of memory per instance in production, 256MB otherwise
    memory: runtimeEnv.equals('production').thenElse(2048, 256),
  },
  app.getServer(),
);
