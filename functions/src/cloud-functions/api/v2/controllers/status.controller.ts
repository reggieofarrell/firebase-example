import { NextFunction, Request, Response } from 'express';

export class StatusController {
  public getStatus = (req: Request, res: Response, next: NextFunction) => {
    console.log('process.env', process.env);
    try {
      return res.status(200).json({ status: 'ok' });
    } catch (error) {
      return next(error);
    }
  };
}
