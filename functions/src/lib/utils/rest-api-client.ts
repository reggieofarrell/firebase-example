import { logData, logInfo } from '@/lib/utils/log';
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  // AxiosError,
} from 'axios';
import axiosRetry from 'axios-retry';

// @ts-ignore - no types available
import { HttpsAgent } from 'keepaliveagent';

/**
 * Keep alive agent for https requests
 * https://cloud.google.com/functions/docs/bestpractices/networking
 */
const Agent = new HttpsAgent();

export enum RequestType {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export interface IRestApiClientOptions {
  /**
   * Configuration for the underlying axios instance
   */
  axiosConfig: AxiosRequestConfig;
  /**
   * Number of retries to attempt
   */
  retries: number;
  /**
   * Retry delay in seconds. Default is 1 second
   */
  retryDelay: number;
  /**
   * Whether to use exponential backoff for retry delay
   */
  withExpBackoff: boolean;
  /**
   * Whether to log request and response details
   */
  debug: boolean;
  /**
   * Debug level. 'normal' will log request and response data. 'verbose' will
   * log all axios properties for the request and response
   */
  debugLevel: 'normal' | 'verbose';
  /**
   * Name of the client. Used for logging
   */
  name: string;
  /**
   * Custom error handler callback. Axios will throw an error for any response
   * above 2xx. This handler will be called with the error object which is typically
   * not a standard error object. See the link below for more details
   * @param error the error to handle
   * @param reqType the request type
   * @param url the url of the request
   * @returns
   * @link https://axios-http.com/docs/handling_errors
   */
  customErrorHandler: (error: any, reqType: RequestType, url: string) => void;
}

export class RestApiClient {
  axios: AxiosInstance;
  retryDelay: number;
  debug: IRestApiClientOptions['debug'];
  debugLevel: IRestApiClientOptions['debugLevel'];
  name: IRestApiClientOptions['name'];
  customErrorHandler?: any = undefined;

  constructor(config: Partial<IRestApiClientOptions> = {}) {
    const configOptions = {
      axiosConfig: {},
      retries: 0,
      retryDelay: 1,
      withExpBackoff: false,
      debug: false,
      debugLevel: 'normal',
      name: 'RestApiClient',
      ...config,
    } as IRestApiClientOptions;

    this.retryDelay = configOptions.retryDelay;
    this.debug = configOptions.debug;
    this.debugLevel = configOptions.debugLevel;
    this.name = configOptions.name;

    /**
     * Keep alive agent for network requests
     * https://cloud.google.com/functions/docs/bestpractices/networking
     */
    configOptions.axiosConfig['httpsAgent'] = Agent;

    if (configOptions.customErrorHandler) {
      this.customErrorHandler = configOptions.customErrorHandler.bind(this);
    }

    const client = axios.create(configOptions.axiosConfig);

    if (configOptions.retries && configOptions.retries > 0) {
      axiosRetry(client, {
        retries: configOptions.retries,
        retryDelay: configOptions.withExpBackoff ? this._exponentialBackoff : this._retryDelay,
      });
    }

    this.axios = client;
  }

  async get(url: string, config: AxiosRequestConfig = {}) {
    this._preRequestLogging(RequestType.GET, url, null, config);

    try {
      const req = await this.axios.get(url, config);
      this._postRequestLogging(RequestType.GET, url, req);
      return req.data;
    } catch (error) {
      if (this.customErrorHandler) {
        this._callCustomErrorHandler(error, RequestType.GET, url);
      } else {
        this._errorHandler(error, RequestType.GET, url);
      }
    }
  }

  async post(url: string, data?: any, config: AxiosRequestConfig = {}) {
    this._preRequestLogging(RequestType.POST, url, data, config);

    try {
      const req = await this.axios.post(url, data, config);
      this._postRequestLogging(RequestType.POST, url, req);
      return req.data;
    } catch (error) {
      if (this.customErrorHandler) {
        this._callCustomErrorHandler(error, RequestType.POST, url);
      } else {
        this._errorHandler(error, RequestType.POST, url);
      }
    }
  }

  async put(url: string, data?: any, config: AxiosRequestConfig = {}) {
    this._preRequestLogging(RequestType.PUT, url, data, config);

    try {
      const req = await this.axios.put(url, data, config);
      this._postRequestLogging(RequestType.PUT, url, req);
      return req.data;
    } catch (error) {
      if (this.customErrorHandler) {
        this._callCustomErrorHandler(error, RequestType.PUT, url);
      } else {
        this._errorHandler(error, RequestType.PUT, url);
      }
    }
  }

  async patch(url: string, data?: any, config: AxiosRequestConfig = {}) {
    this._preRequestLogging(RequestType.PATCH, url, data, config);

    try {
      const req = await this.axios.patch(url, data, config);
      this._postRequestLogging(RequestType.PATCH, url, req);
      return req.data;
    } catch (error) {
      if (this.customErrorHandler) {
        this._callCustomErrorHandler(error, RequestType.PATCH, url);
      } else {
        this._errorHandler(error, RequestType.PATCH, url);
      }
    }
  }

  async delete(url: string, config: AxiosRequestConfig = {}) {
    this._preRequestLogging(RequestType.DELETE, url, null, config);
    try {
      const req = await this.axios.delete(url, config);
      this._postRequestLogging(RequestType.DELETE, url, req);
      return req.data;
    } catch (error) {
      if (this.customErrorHandler) {
        this._callCustomErrorHandler(error, RequestType.DELETE, url);
      } else {
        this._errorHandler(error, RequestType.DELETE, url);
      }
    }
  }

  private _exponentialBackoff = (retryNumber: number) => {
    return Math.pow(this.retryDelay, retryNumber) * 1000;
  };

  private _retryDelay = () => this.retryDelay * 1000;

  private _preRequestLogging = (
    reqType: RequestType,
    url: string,
    data: any,
    config: AxiosRequestConfig,
  ) => {
    if (this.debug) {
      logInfo(`[${this.name}] ${reqType} ${url}`);

      if (data) {
        logData(`[${this.name}] ${reqType} ${url} body`, data);
      }

      if (this.debugLevel === 'verbose') {
        logData(`[${this.name}] ${reqType} ${url} config`, config);
      }
    }
  };

  private _postRequestLogging = (reqType: RequestType, url: string, req: AxiosResponse) => {
    if (this.debug) {
      if (this.debugLevel === 'normal') {
        logData(`[${this.name}] ${reqType} ${url} response`, req.data);
      } else {
        logData(`[${this.name}] ${reqType} ${url} raw axios request(response)`, req);
      }
    }
  };

  private _callCustomErrorHandler = (error: any, reqType: RequestType, url: string) => {
    this.customErrorHandler(error, reqType, url);
  };

  private _errorHandler = (error: any, reqType: RequestType, url: string) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (this.debug && this.debugLevel === 'verbose') {
        if (this.debugLevel === 'verbose') {
          logData(`[${this.name}] ${reqType} ${url} : error.response`, error.response);
        } else {
          logData(`[${this.name}] ${reqType} ${url} : error.response.data`, error.response.data);
        }
      }

      if (error.response.data && error.response.status && error.response.data.message) {
        throw new Error(
          `[${this.name}] ${reqType} ${url} : [${error.response.status}] ${error.response.data.message}`,
        );
      } else if (error.response && error.response.status && !error.repsonse.data.message) {
        throw new Error(`[${this.name}] ${reqType} ${url} : [${error.response.status}]`, {
          cause: error,
        });
      } else {
        throw new Error(error);
      }
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      if (this.debug) {
        if (this.debugLevel === 'verbose') {
          logData(`${this.name}] ${reqType} ${url}: error.config`, error.config);
        }
        logData(`[${this.name}] ${reqType} ${url} : error.request`, error.request);
      }

      throw new Error(`[${this.name}] ${reqType} ${url} : no response`);
    } else {
      // Something happened in setting up the request that triggered an Error
      if (this.debug) {
        if (this.debugLevel === 'verbose') {
          logData(`[${this.name}] ${reqType} ${url} : error`, error);
        } else {
          logInfo(`[${this.name}] ${reqType} ${url} error.message : ${error.message}`);
        }
      }

      if (error.message) {
        throw new Error(`[${this.name}] ${reqType} ${url} : ${error.message}`, {
          cause: error,
        });
      } else {
        throw new Error(error);
      }
    }
  };
}
