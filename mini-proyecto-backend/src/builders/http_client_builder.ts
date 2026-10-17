// src/builders/http_client_builder.ts - Patrón Builder para clientes HTTP (Capítulo 11)
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export class HttpClientBuilder {
  private baseUrl: string = '';
  private timeoutMs: number = 5000;
  private headers: Record<string, string> = {};
  private retries: number = 0;

  public setBaseUrl(url: string): this {
    this.baseUrl = url;
    return this;
  }

  public setTimeout(ms: number): this {
    this.timeoutMs = ms;
    return this;
  }

  public addHeader(key: string, value: string): this {
    this.headers[key] = value;
    return this;
  }

  public setBearerToken(token: string): this {
    this.headers['Authorization'] = `Bearer ${token}`;
    return this;
  }

  public setRetries(count: number): this {
    this.retries = count;
    return this;
  }

  public build(): AxiosInstance {
    if (!this.baseUrl) {
      throw new Error('No se puede construir el cliente HTTP sin una URL base válida');
    }

    const config: AxiosRequestConfig = {
      baseURL: this.baseUrl,
      timeout: this.timeoutMs,
      headers: this.headers
    };

    const instance = axios.create(config);

    if (this.retries > 0) {
      this.attachRetryInterceptor(instance, this.retries);
    }

    return instance;
  }

  private attachRetryInterceptor(instance: AxiosInstance, maxRetries: number): void {
    instance.interceptors.response.use(undefined, async (error) => {
      const config = error.config;
      config.__retryCount = config.__retryCount || 0;
      if (config.__retryCount < maxRetries) {
        config.__retryCount += 1;
        return instance(config);
      }
      return Promise.reject(error);
    });
  }
}
