import { GraphQLClient } from "graphql-request";
import { RequestInit } from "graphql-request/dist/types.dom";
import { EMPTY, from, Observable, of, timer } from "rxjs";
import {
  catchError,
  combineLatestWith,
  debounce,
  map,
  switchMap,
  tap,
} from "rxjs/operators";
import { Logger } from "winston";
import { ConnectionData } from '@plugsy/connectors'
import { getSdk } from "./agent.generated.graphql";

export interface AgentConfig {
  endpoint?: string;
  clientConfig?: Pick<RequestInit, "credentials" | "headers">;
  debounceTime?: number;
}

export const agent = (
  agentConfig$: Observable<AgentConfig | undefined>,
  connectionData$: Observable<ConnectionData[]>,
  logger: Logger
) => {
  logger = logger.child({ component: "agent" });
  return agentConfig$.pipe(
    switchMap((agentConfig) => {
      if (!agentConfig?.endpoint) {
        logger.info("notConfigured", {
          message: "No agent configured, will not publish connection results",
        });
        return EMPTY;
      }
      const { endpoint, clientConfig, debounceTime } = agentConfig;
      const client = new GraphQLClient(endpoint, {
        ...clientConfig,
      });
      logger.verbose("configured", {
        endpoint,
      });
      return of({ debounceTime, sdk: getSdk(client) });
    }),
    combineLatestWith(connectionData$),
    debounce(([{ debounceTime }]) => timer(debounceTime ?? 1000)),
    map(([{ sdk }, connectionData]) => ({ sdk, connectionData })),
    switchMap(({ sdk, connectionData }) => {
      logger.verbose("updating", {
        count: connectionData.length,
      });
      return from(
        sdk.agentUpdate({
          localTime: new Date(),
          connectionData,
        })
      ).pipe(
        catchError((err) => {
          logger.error("fail", {
            error: err?.message ?? err.toString(),
          });
          return EMPTY;
        })
      );
    }),
    tap(({ status }) => {
      logger.verbose("updated", {
        status,
      });
    })
  );
};
