import next from "next";
import { createServer, Server } from "http";
import express, { Express } from "express";
import { Logger } from "winston";

import { ApolloServer } from "apollo-server-express";
import { ContextDependencies, serverOptions } from "./schema";
import { getServerConfig } from "./config";
import { filter, map, share, tap } from "rxjs/operators";
import { getConnector } from "./connectors";
import { createConnectionPool } from "./connection-pool";
import { createItemServer } from "./item-server";
import { environment } from "./environment";
import { agent } from "./agent";
import { ReplaySubject } from "rxjs";
import { createLogger } from "./logger";

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
  const loggingLevel$ = config$.pipe(
    map((config) => config.loggingLevel),
    filter(Boolean)
  );
  return {
    loggingLevel$,
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
  const logger = createLogger(loggingLevel);
  logger.verbose("watchConfig");
  const { connectors$, agentConfig$, loggingLevel$ } = watchConfig(
    localConfigFile,
    logger
  );

  const loggingLevelSubscription = loggingLevel$.subscribe(
    (level) => (logger.level = level)
  );

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
