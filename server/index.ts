import next from "next";
import { createServer, Server } from "http";
import express, { Express } from "express";
import { consoleFormat } from "winston-console-format";

import { ApolloServer } from "apollo-server-express";
import { Logger, createLogger, transports, format } from "winston";
import { ContextDependencies, serverOptions } from "./schema";
import { getServerConfig } from "./config";
import { map, share, tap } from "rxjs/operators";
import { getConnector } from "./connectors";
import { createConnectionPool } from "./connection-pool";
import { createItemServer } from "./item-server";
import { environment } from "./environment";
import { agent } from "./agent";
import { ReplaySubject } from "rxjs";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";

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
  const config$ = getServerConfig(filePath, logger).pipe(
    share({
      connector: () => new ReplaySubject(1),
      resetOnComplete: true,
      resetOnError: true,
      resetOnRefCountZero: true,
    })
  );
  const connectors$ = config$.pipe(
    map((config) => config.connectors),
    map((connectors) => {
      if (Array.isArray(connectors)) {
        return connectors.map((connector) => getConnector(connector, logger));
      }
      return [getConnector(connectors, logger)];
    }),
    tap((connectors) =>
      logger.info(`loadConnectors`, {
        count: connectors.length,
      })
    )
  );
  const agentConfig$ = config$.pipe(map((config) => config.agent));
  return {
    connectors$,
    agentConfig$,
  };
}

async function startAPI(
  httpServer: Server,
  expressServer: Express,
  dependencies: ContextDependencies
) {
  const apolloServer = new ApolloServer({
    ...serverOptions(dependencies),
    tracing: true,
    subscriptions: {
      path: "/graphql",
      keepAlive: 9000,
    },
    playground: {
      subscriptionEndpoint: "/graphql",
    },
  });

  apolloServer.applyMiddleware({ app: expressServer, path: "/graphql" });
  apolloServer.installSubscriptionHandlers(httpServer);

  return apolloServer;
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
  const logger = createLogger({
    level: loggingLevel,
    format: format.combine(
      format.timestamp(),
      format.ms(),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
    ),
    defaultMeta: { service: "Test", component: "startServer" },
    transports: [
      new transports.Console({
        format: format.combine(
          format.colorize({ all: true }),
          format.padLevels(),
          consoleFormat({
            showMeta: true,
            metaStrip: ["timestamp", "service"],
            inspectOptions: {
              depth: Infinity,
              colors: true,
              maxArrayLength: Infinity,
              breakLength: 120,
              compact: Infinity,
            },
          })
        ),
      }),
    ],
  });
  logger.verbose("watchConfig");
  const { connectors$, agentConfig$ } = watchConfig(localConfigFile, logger);

  logger.verbose("createConnectionPool");
  const connectionPool = createConnectionPool(logger);

  logger.verbose("createItemServer");
  const itemServer = createItemServer(connectionPool.connections$, logger);

  logger.verbose("subscribeInternalConnections");
  const connectorSubscription = connectors$.subscribe(
    connectionPool.setInternalConnections
  );

  logger.verbose("initAgent");
  const agentSubscription = agent(
    agentConfig$,
    itemServer.connectionData$,
    logger
  ).subscribe();

  const expressServer = express();
  const httpServer = createServer(expressServer);

  logger.verbose("startAPI");
  const api = await startAPI(httpServer, expressServer, {
    connectionPool,
    itemServer,
    logger,
  });
  logger.verbose("startFrontend");
  const frontend = await startFrontend(expressServer);

  logger.verbose("listen");
  await new Promise<void>((resolve) => httpServer.listen(port, resolve));

  async function closeServer() {
    logger.crit("Stopping Server");
    tryQuietly(frontend.close);
    tryQuietly(connectorSubscription.unsubscribe);
    tryQuietly(agentSubscription.unsubscribe);
    tryQuietly(api.stop);
    tryQuietly(() => httpServer.close(() => logger.info("HTTP Server Closed")));
    logger.crit("Server Stopped");
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
