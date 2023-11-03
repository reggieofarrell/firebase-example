// import 'reflect-metadata';
// import compression from 'compression';
// import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
// import helmet from 'helmet';
// import hpp from 'hpp';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { ErrorMiddleware } from '../common/middleware/error.middleware';
// import { loadApiKeysMiddleware, tokenAuthMiddleware } from '../common/middleware/auth.middleware';
import { cdnCacheMiddleware } from '../common/middleware/cache.middleware';
import { Routes } from '@/types/routes';

export class App {
  public app: express.Application;

  constructor(routes: Routes[]) {
    this.app = express();

    // this.initializeMiddlewares();
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    // this.app.use(loadApiKeysMiddleware)
    /**
     * Cache all GET responses on the CDN for 60 seconds
     * by default. This can be overridden on a per-route basis.
     * By using th cdnCache middleware on an individual route and
     * passing a number of seconds
     */
    // this.app.use(cdnCacheMiddleware('60'))
    // this.app.use(tokenAuthMiddleware)
    this.app.use(cors({ origin: 'http://127.0.0.1:8081' }));
    // this.app.use(hpp());
    // this.app.use(helmet());
    // this.app.use(compression());
    // this.app.use(express.urlencoded({ extended: true }));
  }

  // https://dev.to/kabartolo/how-to-document-an-express-api-with-swagger-ui-and-jsdoc-50do
  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'GovSide App REST API',
          version: '2.0.0',
          description: 'Example docs',
        },
      },
      apis: ['../v2/routes/*.ts'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/v2-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(ErrorMiddleware);
  }
}
