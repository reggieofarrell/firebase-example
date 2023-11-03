import express from 'express';
import { ErrorMiddleware } from '../common/middleware/error.middleware';
import { loadApiKeysMiddleware } from '../common/middleware/auth.middleware';
import { cdnCacheMiddleware } from '../common/middleware/cache.middleware';
import { Routes } from '@/types/routes';

export class App {
  public app: express.Application;

  constructor(routes: Routes[]) {
    this.app = express();

    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(loadApiKeysMiddleware);
    /**
     * Cache all GET responses on the CDN for 60 seconds
     * by default. This can be overridden on a per-route basis.
     * By using th cdnCache middleware on an individual route and
     * passing a number of seconds
     */
    this.app.use(cdnCacheMiddleware('60'));
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use(`/v2${route.path}`, route.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use(ErrorMiddleware);
  }
}
