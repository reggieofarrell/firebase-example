import { RestApiClient, IRestApiClientOptions } from '../utils/rest-api-client';
import { PRO_PUBLICA_API_BASE, PRO_PUBLICA_TOKEN } from '@/config/pro-publica';

export class ProPublicaApiClient extends RestApiClient {
  constructor(config: Partial<IRestApiClientOptions> = {}) {
    super({
      axiosConfig: {
        headers: {
          'X-API-Key': PRO_PUBLICA_TOKEN,
        },
        baseURL: PRO_PUBLICA_API_BASE,
      },
      name: `ProPublica API Client`,
      // customErrorHandler: _customErrorHandler,
      ...config,
    });
  }
}

/**
 * Currently leaving some code commented out here for
 * reference on how to override the default error handler
 */

// function _customErrorHandler(error: any, reqType: RequestType, url: string) {
//   if (error.response) {
//     // The request was made and the server responded with a status code
//     // that falls out of the range of 2xx
//     if (this.debug && this.debugLevel === 'verbose') {
//       if (this.debugLevel === 'verbose') {
//         logData(
//           `[${this.name}] ${reqType} ${url} : error.response`,
//           error.response,
//         )
//       } else {
//         logData(
//           `[${this.name}] ${reqType} ${url} : error.response.data`,
//           error.response.data,
//         )
//       }
//     }

//     if (
//       error.response.data &&
//       error.response.status &&
//       error.response.data.message
//     ) {
//       throw new Error(
//         `[${this.name}] ${reqType} ${url} : [${error.response.status}] ${error.response.data.message}`,
//         {cause: error},
//       )
//     } else if (
//       error.response &&
//       error.response.status &&
//       !error.repsonse.data.message
//     ) {
//       throw new Error(
//         `[${this.name}] ${reqType} ${url} : [${error.response.status}]`,
//         {cause: error},
//       )
//     } else {
//       throw new Error(error)
//     }
//   } else if (error.request) {
//     // The request was made but no response was received
//     // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
//     // http.ClientRequest in node.js
//     if (this.debug) {
//       if (this.debugLevel === 'verbose') {
//         logData(`${this.name}] ${reqType} ${url}: error.config`, error.config)
//       }
//       logData(`[${this.name}] ${reqType} ${url} : error.request`, error.request)
//     }

//     throw new Error(`[${this.name}] ${reqType} ${url} : no response`)
//   } else {
//     // Something happened in setting up the request that triggered an Error
//     if (this.debug) {
//       if (this.debugLevel === 'verbose') {
//         logData(`[${this.name}] ${reqType} ${url} : error`, error)
//       } else {
//         logInfo(
//           `[${this.name}] ${reqType} ${url} error.message : ${error.message}`,
//         )
//       }
//     }

//     if (error.message) {
//       throw new Error(`[${this.name}] ${reqType} ${url} : ${error.message}`, {
//         cause: error,
//       })
//     } else {
//       throw new Error(error)
//     }
//   }
// }
