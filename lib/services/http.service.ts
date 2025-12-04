import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { ErrorLoggerService } from './logger';

export interface IHttpRequestConfig extends AxiosRequestConfig {
  identifier?: string;
}

export class HttpService {
  private client: AxiosInstance;
  private errorLogger: ErrorLoggerService;

  constructor(baseURL?: string) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    this.errorLogger = new ErrorLoggerService();
  }

  /**
   * Performs a GET request
   * @param url The endpoint URL
   * @param config Optional axios configuration
   * @returns The response data
   */
  public async get<TResponse = unknown>(
    url: string,
    config?: IHttpRequestConfig
  ): Promise<TResponse> {
    try {
      const response: AxiosResponse<TResponse> = await this.client.get(url, config);
      this.checkStatus(response, config?.identifier);
      return response.data;
    } catch (error) {
      await this.handleError(error, { url, method: 'GET', config });
      throw error;
    }
  }

  /**
   * Performs a POST request
   * @param url The endpoint URL
   * @param data The request body
   * @param config Optional axios configuration
   * @returns The response data
   */
  public async post<TRequest = unknown, TResponse = unknown>(
    url: string,
    data: TRequest,
    config?: IHttpRequestConfig
  ): Promise<TResponse> {
    try {
      const response: AxiosResponse<TResponse> = await this.client.post(url, data, config);
      this.checkStatus(response, config?.identifier);
      return response.data;
    } catch (error) {
      await this.handleError(error, { url, method: 'POST', data, config });
      throw error;
    }
  }

  /**
   * Checks HTTP status and logs warnings for non-success codes
   */
  private checkStatus(response: AxiosResponse, identifier?: string): void {
    if (response.status >= 200 && response.status < 300) {
      console.log(`Success: ${response.status} ${response.statusText}`);
      return;
    }

    if (response.status >= 300 && response.status < 400) {
      console.warn(`Redirect: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Handles errors and logs them using ErrorLoggerService
   */
  private async handleError(error: unknown, context: {
    url: string;
    method: string;
    data?: unknown;
    config?: IHttpRequestConfig;
  }): Promise<void> {
    const identifier = context.config?.identifier || context.url;

    if (axios.isAxiosError(error)) {
      console.error(`HTTP Error [${context.method}] ${context.url}:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message
      });

      await this.errorLogger.logError({
        url: context.url,
        method: context.method,
        requestData: context.data,
        responseStatus: error.response?.status,
        responseData: error.response?.data
      }, error, { identifier });
    } else {
      console.error(`Unexpected error [${context.method}] ${context.url}:`, error);

      await this.errorLogger.logError({
        url: context.url,
        method: context.method,
        requestData: context.data
      }, error, { identifier });
    }
  }

  /**
   * Sets a default header for all requests
   */
  public setHeader(key: string, value: string): void {
    this.client.defaults.headers.common[key] = value;
  }
}
