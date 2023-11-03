import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../exceptions/HttpException';
import { logError } from '@/lib/utils/log';

export const ErrorMiddleware = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const status: number = error.status || 500;
    const message: string = error.message || 'Something went wrong';

    logError(error);
    res.status(status).json({ message });
  } catch (error) {
    next(error);
  }
};
