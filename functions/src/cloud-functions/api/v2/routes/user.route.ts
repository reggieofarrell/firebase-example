import { Router } from 'express';
import { UserController } from '../controllers/users.controller';
// import { CreateUserDto, UpdateUserDto } from '../dtos/users.dto';
// import { ValidationMiddleware } from '../../common/middleware/validation.middleware';
import { tokenAuthMiddleware } from '../../common/middleware/auth.middleware';
import { Routes } from '@/types/routes';

export class UserRoute implements Routes {
  public path = '/user';
  public router = Router();
  public user = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', [tokenAuthMiddleware], this.user.getUser);
  }
}
