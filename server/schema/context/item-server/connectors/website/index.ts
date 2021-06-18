import { timer, of, combineLatest } from "rxjs";
import { Axios } from "axios-observable";
import { catchError, exhaustMap, map, switchMap } from "rxjs/operators";
import { ConnectionData, Item } from "../model";
import { AxiosRequestConfig } from "axios";

const CONNECTOR_TYPE = "website";
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
  interval?: number;
}

export interface WebsiteConnectionConfig {
  id?: string;
  sites: SiteConfig[];
}

export const websiteConnection = ({
  id = "website",
  sites = [],
}: WebsiteConnectionConfig) => {
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
        interval = 30000,
        requiredStatusCode,
        requiredBodyRegex,
        display: { name, category, icon, link, parents },
        request,
      }) =>
        timer(0, Math.max(interval, 1000)).pipe(
          switchMap((i) => {
            return of(i).pipe(
              exhaustMap(() => {
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
                    responseType: "text",
                  });
                return Axios.request({
                  ...request,
                  validateStatus,
                  responseType: "text",
                });
              }),
              map((response) => {
                if (requiredBodyRegex) {
                  const body = response.data as string;
                  if (!requiredBodyRegex.test(body)) {
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
                console.error(error.message);
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
        )
    );
  return combineLatest(requests).pipe(
    map((items) => {
      return {
        connected: items.some((item) => item.state === "GREEN"),
        lastUpdated: null,
        items,
        error: null,
        id,
      } as ConnectionData;
    })
  );
};
