import { Router } from 'express';
// import { tokenAuthMiddleware } from '../../common/middleware/auth.middleware';
import { Routes } from '@/types/routes';
import { StatusController } from '../controllers/status.controller';

export class StatusRoute implements Routes {
  public path = '/status';
  public router = Router();
  public status = new StatusController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', this.status.getStatus);
  }
}
