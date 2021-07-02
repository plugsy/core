import { timer, of, combineLatest, ReplaySubject } from "rxjs";
import { Axios } from "axios-observable";
import {
  catchError,
  exhaustMap,
  map,
  share,
  tap,
} from "rxjs/operators";
import { ConnectionData, Item } from "../model";
import { AxiosRequestConfig } from "axios";
import { Logger } from "winston";
const CONNECTOR_TYPE = "WEBSITE";
export type WEBSITE_CONNECTOR_TYPE = typeof CONNECTOR_TYPE;

interface SiteRequest
  extends Omit<
    AxiosRequestConfig,
    | "transformRequest"
    | "transformResponse"
    | "paramsSerializer"
    | "adapter"
    | "responseType"
    | "onUploadProgress"
    | "onDownloadProgress"
    | "cancelToken"
    | "validateStatus"
  > {}

export interface SiteConfig {
  request: SiteRequest | string;
  display: {
    name: string;
    category?: string | null;
    icon?: string | null;
    link?: string | null;
    parents?: string[];
  };
  requiredStatusCode?: number | number[];
  requiredBodyRegex?: string;
}

export interface WebsiteConnectionConfig {
  id?: string;
  interval?: number;
  timeout?: number;
  sites: SiteConfig[];
}

export const websiteConnection = (
  {
    id = CONNECTOR_TYPE,
    sites = [],
    interval = 30000,
    timeout = 30000,
  }: WebsiteConnectionConfig,
  logger: Logger
) => {
  logger = logger.child({
    id,
    component: "websiteConnection",
  });
  logger.verbose("init");
  const requests = sites
    .map(({ requiredBodyRegex, ...config }) => {
      return {
        ...config,
        requiredBodyRegex: requiredBodyRegex
          ? new RegExp(requiredBodyRegex)
          : undefined,
      };
    })
    .map(
      ({
        requiredStatusCode,
        requiredBodyRegex,
        display: { name, category, icon, link, parents },
        request,
      }) => {
        logger.verbose("createTimer", { id, interval });
        return timer(0, Math.max(interval, 1000)).pipe(
          tap({
            complete: () => logger.verbose("complete"),
          }),
          exhaustMap((i) => {
            return of(i).pipe(
              exhaustMap(() => {
                logger.verbose("createRequest");
                const validateStatus = (status: number) => {
                  if (requiredStatusCode) {
                    const requiredStatuses = Array.isArray(requiredStatusCode)
                      ? requiredStatusCode
                      : [requiredStatusCode];
                    return requiredStatuses.some(
                      (requiredStatus) => requiredStatus === status
                    );
                  }
                  return status >= 200 && status < 300; // default
                };
                if (typeof request === "string")
                  return Axios.get(request, {
                    validateStatus,
                    timeout,
                    responseType: "text",
                  });
                return Axios.request({
                  timeout,
                  ...request,
                  validateStatus,
                  responseType: "text",
                });
              }),
              tap(() => logger.verbose("responseReceived")),
              map((response) => {
                if (requiredBodyRegex) {
                  const body = response.data as string;
                  if (!requiredBodyRegex.test(body)) {
                    logger.error("fail", {
                      error: `Could not match required body for website ${requiredBodyRegex.source}.`,
                    });
                    throw new Error(
                      `Could not match required body for website ${requiredBodyRegex.source}.`
                    );
                  }
                }
                const item: Item = {
                  name,
                  category: category ?? null,
                  icon: icon ?? null,
                  link: link ?? null,
                  parents: parents ?? [],
                  connectorType: CONNECTOR_TYPE,
                  status: "Up",
                  state: "GREEN",
                };
                return item;
              }),
              catchError((error) => {
                logger.error("fail", {
                  error: error?.message ?? error.toString(),
                });
                const item: Item = {
                  name,
                  category: category ?? null,
                  icon: icon ?? null,
                  link: link ?? null,
                  parents: parents ?? [],
                  connectorType: CONNECTOR_TYPE,
                  status: "Down",
                  state: "RED",
                };
                return of(item);
              })
            );
          })
        );
      }
    );
  return combineLatest(requests).pipe(
    map((items) => {
      logger.verbose("aggregateRequests", {
        id,
        count: items.length,
      });
      return {
        connected: items.some((item) => item.state === "GREEN"),
        lastUpdated: new Date(),
        items,
        error: null,
        id,
      } as ConnectionData;
    }),
    share({
      connector: () => new ReplaySubject(1),
      resetOnComplete: false,
      resetOnError: false,
      resetOnRefCountZero: true,
    })
  );
};
