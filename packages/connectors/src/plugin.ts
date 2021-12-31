import { ConnectorConfig, getConnector } from "./server/connectors";
import { ConnectorContext, initConnectorContext } from "./server/context";
import * as resolvers from "./server/resolvers";
import { ServerPluginFn } from "@plugsy/schema/server";
import { createConnectionPool } from "./server/connection-pool";
import { createItemServer } from "./server/item-server";
import { agent, AgentConfig } from "./server/agent";
import { map, tap } from "rxjs";
import path from "path";
export interface ConnectorPluginConfig {
  theme$?: any;
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

const schemaPaths = [path.join(__dirname, "schema/index.core.graphql")];

export const ConnectorPlugin: ServerPluginFn<
  ConnectorPluginConfig,
  ConnectorContext
> = async (logger, _, config$) => {
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
    schemaPaths,
    onTeardown: () => {
      connectorSubscription.unsubscribe();
      agentSubscription.unsubscribe();
    },
    getContext: (logger) =>
      initConnectorContext({ itemServer, connectionPool, logger }),
  };
};
