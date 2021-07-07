import { Observable } from "rxjs";
import axios, {
  AxiosResponse,
  AxiosPromise,
  AxiosRequestConfig,
  CancelTokenSource,
  AxiosInterceptorManager,
  AxiosInstance,
} from "axios";

export interface AxiosObservable<T> extends Observable<AxiosResponse<T>> {}

export function createObservable<T>(
  promiseFactory: (...args: any[]) => AxiosPromise<T>,
  ...args: any[]
): AxiosObservable<T> {
  let config: AxiosRequestConfig = args[args.length - 1];
  config = config ? { ...config } : {};
  args[args.length - 1] = config;

  let cancelSource: CancelTokenSource;
  const hasCancelToken: boolean = !!config.cancelToken;
  if (hasCancelToken) {
    console.warn(
      `No need to use cancel token, just unsubscribe the subscription would cancel the http request automatically`
    );
  }

  const observable: AxiosObservable<T> = new Observable((subscriber) => {
    if (!hasCancelToken) {
      cancelSource = axios.CancelToken.source();
      config.cancelToken = cancelSource.token;
    }

    promiseFactory(...args)
      .then((response) => {
        subscriber.next(response);
        subscriber.complete();
      })
      .catch((error) => subscriber.error(error));
  });

  const _subscribe = observable.subscribe.bind(observable);

  observable.subscribe = (...args2: any[]) => {
    const subscription = _subscribe(...args2);

    const _unsubscribe = subscription.unsubscribe.bind(subscription);

    subscription.unsubscribe = () => {
      if (cancelSource) {
        cancelSource.cancel();
      }
      _unsubscribe();
    };
    return subscription;
  };

  return observable;
}

export class Axios {
  static defaults: AxiosRequestConfig = axios.defaults;
  static interceptors: {
    request: AxiosInterceptorManager<AxiosRequestConfig>;
    response: AxiosInterceptorManager<AxiosResponse>;
  } = axios.interceptors;

  constructor(private axiosInstance: AxiosInstance) {}

  get defaults() {
    return this.axiosInstance.defaults;
  }

  get interceptors() {
    return this.axiosInstance.interceptors;
  }

  static request<T = any>(config: AxiosRequestConfig): AxiosObservable<T> {
    return createObservable(axios.request, config);
  }

  static get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): AxiosObservable<T> {
    return createObservable<T>(axios.get, url, config);
  }

  static post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): AxiosObservable<T> {
    return createObservable<T>(axios.post, url, data, config);
  }

  static put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): AxiosObservable<T> {
    return createObservable<T>(axios.put, url, data, config);
  }

  static patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): AxiosObservable<T> {
    return createObservable<T>(axios.patch, url, data, config);
  }

  static delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): AxiosObservable<T> {
    return createObservable<T>(axios.delete, url, config);
  }

  static head<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): AxiosObservable<T> {
    return createObservable<T>(axios.head, url, config);
  }

  static create(config: AxiosRequestConfig): Axios {
    return new Axios(axios.create(config));
  }

  request<T = any>(config: AxiosRequestConfig): AxiosObservable<T> {
    return createObservable(this.axiosInstance.request, config);
  }

  get<T = any>(url: string, config?: AxiosRequestConfig): AxiosObservable<T> {
    return createObservable<T>(this.axiosInstance.get, url, config);
  }

  head<T = any>(url: string, config?: AxiosRequestConfig): AxiosObservable<T> {
    return createObservable<T>(this.axiosInstance.head, url, config);
  }

  post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): AxiosObservable<T> {
    return createObservable<T>(this.axiosInstance.post, url, data, config);
  }

  put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): AxiosObservable<T> {
    return createObservable<T>(this.axiosInstance.put, url, data, config);
  }

  patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): AxiosObservable<T> {
    return createObservable<T>(this.axiosInstance.patch, url, data, config);
  }

  delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): AxiosObservable<T> {
    return createObservable<T>(this.axiosInstance.delete, url, config);
  }
}
