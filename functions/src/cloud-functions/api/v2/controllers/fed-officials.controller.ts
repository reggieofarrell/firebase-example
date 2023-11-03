import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../../common/exceptions/HttpException';
import { FedOfficialsService } from '../services/fed-officials.service';
import { logData, logInfo } from '@/lib/utils/log';

export class FedOfficialsController {
  public fedOfficialsService = new FedOfficialsService();

  public getFedOfficial = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.params.id) {
        throw new HttpException(400, 'id is required');
      }

      const resp = await this.fedOfficialsService.getById(String(req.params.id));
      res.status(200).json(resp);
    } catch (error) {
      next(error);
    }
  };

  public dynamoToFirestore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logData('[GET] dynamoToFirestore', req.params.id);
      if (!req.params.id) {
        throw new HttpException(400, 'id is required');
      }

      const firestoreId = await this.fedOfficialsService.dynamoToFirestore(String(req.params.id));
      res.status(200).send({ newFirestoreId: firestoreId, dynamoId: req.params.id });
    } catch (error) {
      next(error);
    }
  };
}
