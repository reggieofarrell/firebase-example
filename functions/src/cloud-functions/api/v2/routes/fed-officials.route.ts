import { Router } from 'express';
import { Routes } from '@/types/routes';
import { FedOfficialsController } from '../controllers/fed-officials.controller';
import { uuidRegexString } from '../../common/utils/regex-strings';
import { tokenAuthMiddleware } from '../../common/middleware/auth.middleware';

export class FedOfficialsRoute implements Routes {
  public path = '/fed-officials';
  public router = Router();
  public fedOfficials = new FedOfficialsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `/:id(${uuidRegexString})/to-firestore`,
      [tokenAuthMiddleware],
      this.fedOfficials.dynamoToFirestore,
    );
    this.router.get(
      `/:id(${uuidRegexString})`,
      [tokenAuthMiddleware],
      this.fedOfficials.getFedOfficial,
    );
  }
}
