import { logData } from '@/lib/utils/log';
import { NextFunction, Response, Request } from 'express';

/**
 * Middleware to cache the response on the CDN. Only works on GET or HEAD requests.
 * @param expiration - number of seconds to cache the response on the CDN
 *
 * @link https://firebase.google.com/docs/hosting/manage-cache
 */
export const cdnCacheMiddleware = (expiration = '60') => {
  return (req: Request, res: Response, next: NextFunction) => {
    logData('cdnCacheMiddleware', { expiration });
    /**
     * We must add custom headers to the response to tell the CDN use them
     * as part of the cache key. This way if the key changes the cache will be busted.
     */
    res.set('Vary', 'Accept-Encoding, X-Api-Key, X-Admin-Api-Key, cache-control');

    if (!(req.headers['cache-control'] && req.headers['cache-control'].includes('no-cache'))) {
      res.set('Cache-Control', `public, maxage=${expiration} s-maxage=${expiration}`);
    }

    next();
  };
};
