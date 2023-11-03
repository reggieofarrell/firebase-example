import { DecodedIdToken } from 'firebase-admin/auth';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      tokenClaims?: DecodedIdToken;
      authToken?: string;
      apiKey?: string;
      apiSecret?: string;
      adminApiKey?: string;
    }
  }
}
