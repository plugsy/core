import { ApolloServer } from "apollo-server-express";
import { Express } from "express";
import { map } from "rxjs";
import { EMPTY } from "rxjs";
import { startWith } from "rxjs";
import { switchMap } from "rxjs";
import { pairwise } from "rxjs";
import { catchError } from "rxjs";
import { Observable } from "rxjs";
import { Logger } from "winston";
import { plugsyApolloServerConfig$ } from "./apollo-config";
import { PluginMap, PlugsyConfig } from "./types";
import http from "http";

interface CreatePluginServerOptions {
  logger: Logger;
  httpServer: http.Server;
  expressServer: Express;
  config$: Observable<PlugsyConfig>;
  plugins: PluginMap;
}

export const createPluginServer = ({
  logger,
  expressServer,
  httpServer,
  config$,
  plugins,
}: CreatePluginServerOptions) => {
  return plugsyApolloServerConfig$(
    logger.child({ component: "plugsyApolloServerConfig$" }),
    config$,
    plugins
  )
    .pipe(
      catchError((err) => {
        logger.error(err);
        return EMPTY;
      }),
      map((options) => {
        logger.verbose("createApolloServer");
        const apolloServer = new ApolloServer({
          tracing: true,
          subscriptions: {
            path: "/graphql",
            keepAlive: 9000,
          },
          playground: {
            subscriptionEndpoint: "/graphql",
          },
          ...options,
        });
        return { server: apolloServer, options };
      }),
      startWith(null),
      pairwise(),
      switchMap(async ([previous, next]) => {
        if (previous && next) {
          logger.info("stopPreviousApolloServer");
          await previous.server.stop();
        }
        if (next) {
          logger.info("startNewApolloServer");
          next.server.applyMiddleware({ app: expressServer, path: "/graphql" });
          next.server.installSubscriptionHandlers(httpServer);
        }
      })
    )
    .subscribe();
};

export * from "./plugin-loader";
export * from "./plugin-manager";
export * from "./types";
