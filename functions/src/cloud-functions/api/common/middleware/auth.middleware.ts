import { NextFunction, Response, Request } from 'express';
import { HttpException } from '../../common/exceptions/HttpException';
import { getAuth } from 'firebase-admin/auth';
import { logData } from '@/lib/utils/log';
import { GS_API_KEY, GS_API_SECRET } from '@/config/govside-api';

const auth = getAuth();

const getAuthToken = (req: Request) => {
  if (req.headers['authorization'] && req.headers['authorization'].split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
};

const checkApiKey = (req: Request) => {
  return req.apiKey && req.apiKey === GS_API_KEY;
};

const checkApiSecret = (req: Request) => {
  return req.apiSecret && req.apiSecret === GS_API_SECRET;
};

export const tokenAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  req.tokenClaims = undefined;

  logData('tokenAuthMiddleware', req.route);

  try {
    const authToken = getAuthToken(req);

    if (authToken) {
      req.tokenClaims = await auth.verifyIdToken(authToken);
      req.userId = req.tokenClaims.uid;
    } else if (checkApiKey(req) && checkApiSecret(req)) {
      // allow user impersonation with api key and secret for testing
      req.userId = req.headers['x-user-id'] as string;
    } else {
      next(new HttpException(401, 'missing auth token'));
    }

    return next();
  } catch (e) {
    next(new HttpException(401, 'not authorized'));
  }
};

export const loadApiKeysMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers['x-api-key']) {
    req.apiKey = req.headers['x-api-key'] as string;
  }

  if (req.headers['x-api-secret']) {
    req.apiSecret = req.headers['x-api-secret'] as string;
  }

  next();
};

export const apiKeyAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!checkApiKey(req)) {
    return next(new HttpException(403, 'invalid api key'));
  }

  return next();
};

export const apiSecretAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!checkApiSecret(req)) {
    return next(new HttpException(403, 'invalid api secret'));
  }

  return next();
};
