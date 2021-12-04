import { ConnectorConfig, getConnector } from "./connectors";
import { ConnectorContext, initConnectorContext } from "./context";
import * as resolvers from "./resolvers";
import { PluginFn } from "@plugsy/schema";
import { createConnectionPool } from "./connection-pool";
import { createItemServer } from "./item-server";
import { agent, AgentConfig } from "./agent";
import { map, tap } from "rxjs";
import path from "path";

export interface ConnectorPluginConfig {
  connectors: ConnectorConfig | ConnectorConfig[];
  agent?: AgentConfig;
}

export const DEFAULT_CONNECTOR_PLUGIN_CONFIG: ConnectorPluginConfig = {
  connectors: [
    {
      type: "DOCKER",
      config: {},
    },
  ],
};

export const ConnectorPlugin: PluginFn<
  ConnectorPluginConfig,
  ConnectorContext
> = async (logger, config$) => {
  const connectorConfig$ = config$.pipe(map(({ connectors }) => connectors));
  logger.verbose("createConnectionPool");
  const connectionPool = createConnectionPool(logger);

  logger.verbose("createItemServer");
  const itemServer = createItemServer(connectionPool.connections$, logger);

  logger.verbose("subscribeInternalConnections");
  const connectorSubscription = connectorConfig$
    .pipe(
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
    )
    .subscribe(connectionPool.setInternalConnections);

  const agentConfig$ = config$.pipe(map(({ agent }) => agent));
  const agentSubscription = agent(
    agentConfig$,
    itemServer.connectionData$,
    logger
  ).subscribe();

  return {
    resolvers,
    schemas: [
      path.join(__dirname, "schema/index.core.graphql"),
      path.join(__dirname, "schema/agent.core.graphql"),
    ],
    onTeardown: () => {
      connectorSubscription.unsubscribe();
      agentSubscription.unsubscribe();
    },
    getContext: () =>
      initConnectorContext({ itemServer, connectionPool, logger }),
  };
};
