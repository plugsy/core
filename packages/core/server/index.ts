import next from "next";
import { createServer, Server } from "http";
import express, { Express } from "express";
import { Logger } from "winston";

import { ApolloServer, IResolvers } from "apollo-server-express";
import { loadConfig, createLogger } from "@plugsy/common";
import { filter, map, share, switchMap } from "rxjs/operators";
import { DEFAULT_CONNECTOR_PLUGIN_CONFIG } from "@plugsy/connectors";
import { environment } from "./environment";
import { ReplaySubject } from "rxjs";
import { ThemeConfig } from "../client/theme";
import schema from "./config-schema.json";
import { svgIconHandler } from "./icon-handler";
import { pluginManager$, PlugsyPluginsConfig } from "./plugin-manager";
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';

const { port, dev } = environment();

export interface ServerConfig {
  loggingLevel?: string;
  plugins: PlugsyPluginsConfig[];
  theme?: ThemeConfig;
}

async function tryQuietly(fn: () => any | Promise<any>) {
  return async () => {
    try {
      await fn();
    } catch {}
  };
}

function watchConfig(filePath: string, logger: Logger) {
  logger = logger.child({
    component: "watchConfig",
  });
  const config$ = loadConfig<ServerConfig>(
    filePath,
    logger,
    {
      plugins: [
        {
          type: "connectors",
          config: DEFAULT_CONNECTOR_PLUGIN_CONFIG,
        },
      ],
    },
    [
      {
        name: "Config",
        schema,
      },
    ]
  ).pipe(
    share({
      connector: () => new ReplaySubject(1),
      resetOnComplete: true,
      resetOnError: true,
      resetOnRefCountZero: true,
    })
  );

  const pluginConfigs$ = config$.pipe(map(({ plugins }) => plugins));
  const loggingLevel$ = config$.pipe(
    map((config) => config.loggingLevel),
    filter(Boolean)
  );
  const theme$ = config$.pipe(map((config) => config.theme));
  return {
    loggingLevel$,
    pluginConfigs$,
    theme$,
  };
}

async function startFrontend(expressServer: Express) {
  const nextApp = next({ dev });
  const nextHandle = nextApp.getRequestHandler();

  expressServer.all("*", (req, res) => nextHandle(req, res));
  await nextApp.prepare();
  return nextApp;
}

async function startServer() {
  const { localConfigFile, loggingLevel } = environment();
  const logger = createLogger(loggingLevel);
  logger.verbose("watchConfig");
  const { pluginConfigs$, loggingLevel$ } = watchConfig(
    localConfigFile,
    logger
  );

  const plugins$ = pluginManager$(
    logger.child({ component: "pluginManager" }),
    pluginConfigs$
  );

  const loggingLevelSubscription = loggingLevel$.subscribe(
    (level) => (logger.level = level)
  );

  const expressServer = express();

  expressServer.get("/icons/:iconPath(*)", svgIconHandler);

  const httpServer = createServer(expressServer);

  plugins$
    .pipe(
      switchMap(async ({ schemaPaths, ...rest }) => {



        return { ...rest };
      }),
      map(({ resolvers, context }) => {
        const apolloServer = new ApolloServer({
          tracing: true,
          subscriptions: {
            path: "/graphql",
            keepAlive: 9000,
          },
          playground: {
            subscriptionEndpoint: "/graphql",
          },
          resolvers,
        });

        apolloServer.applyMiddleware({ app: expressServer, path: "/graphql" });
        apolloServer.installSubscriptionHandlers(httpServer);
      })
    )
    .subscribe();

  logger.verbose("startAPI");

  return apolloServer;

  logger.verbose("startFrontend");
  const frontend = await startFrontend(expressServer);

  logger.verbose("listen");
  await new Promise<void>((resolve) => httpServer.listen(port, resolve));

  async function closeServer() {
    logger.info("Stopping Server");
    await tryQuietly(frontend.close);
    await tryQuietly(connectorSubscription.unsubscribe);
    await tryQuietly(agentSubscription.unsubscribe);
    await tryQuietly(loggingLevelSubscription.unsubscribe);
    await tryQuietly(api.stop);
    await tryQuietly(() =>
      httpServer.close(() => logger.info("HTTP Server Closed"))
    );
    logger.info("Server Stopped");
    process.exit(0);
  }

  process.on("SIGTERM", closeServer);
  process.on("SIGINT", closeServer);
  logger.info(
    `> Server listening at http://localhost:${port} as ${
      dev ? "development" : process.env.NODE_ENV
    }`
  );
}

startServer();
