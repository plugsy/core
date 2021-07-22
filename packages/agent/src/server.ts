import { createLogger, loadConfig } from "@plugsy/common";
import {
  ConnectorConfig,
  createConnectionPool,
  createItemServer,
  getConnector,
} from "@plugsy/connectors";
import { filter, map, ReplaySubject, share, tap } from "rxjs";
import { Logger } from "winston";
import { agent, AgentConfig } from "./";
import schema from "./config-schema.json";
import { environment } from "./environment";

export interface Config {
  loggingLevel?: string;
  connectors: ConnectorConfig[] | ConnectorConfig;
  agent?: AgentConfig;
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
  const config$ = loadConfig<Config>(
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
        name: "AgentConfig",
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
  return {
    loggingLevel$,
    connectors$,
    agentConfig$,
  };
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

  async function closeServer() {
    logger.info("Stopping Server");
    await tryQuietly(connectorSubscription.unsubscribe);
    await tryQuietly(agentSubscription.unsubscribe);
    await tryQuietly(loggingLevelSubscription.unsubscribe);
    logger.info("Server Stopped");
    process.exit(0);
  }

  process.on("SIGTERM", closeServer);
  process.on("SIGINT", closeServer);
  logger.info(`> Agent Started`);
}

startServer();
