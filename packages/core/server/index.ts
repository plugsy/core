import next from "next";
import { createServer, Server } from "http";
import express, { Express } from "express";
import { Logger } from "winston";

import { ApolloServer } from "apollo-server-express";
import { ContextDependencies, serverOptions } from "./schema";
import { loadConfig, createLogger } from "@plugsy/common";
import { filter, map, share, tap } from "rxjs/operators";
import {
  getConnector,
  createConnectionPool,
  createItemServer,
} from "@plugsy/connectors";
import { environment } from "./environment";
import { ReplaySubject } from "rxjs";
import { AgentConfig, agent } from "@plugsy/agent";
import { ConnectorConfig } from "@plugsy/connectors";
import { ThemeConfig } from "../client/theme";
import schema from "./config-schema.json";
import { svgIconHandler } from "./icon-handler";

const { port, dev } = environment();

export interface ServerConfig {
  loggingLevel?: string;
  agent?: AgentConfig;
  connectors: ConnectorConfig[] | ConnectorConfig;
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
      connectors: [
        {
          type: "DOCKER",
          config: {},
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
  const theme$ = config$.pipe(map((config) => config.theme));
  return {
    loggingLevel$,
    connectors$,
    agentConfig$,
    theme$,
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
  const { connectors$, agentConfig$, loggingLevel$, theme$ } = watchConfig(
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

  expressServer.get('/icons/:iconPath(*)', svgIconHandler)

  const httpServer = createServer(expressServer);
  
  logger.verbose("startAPI");
  const api = await startAPI(httpServer, expressServer, {
    connectionPool,
    itemServer,
    logger,
    theme$,
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
