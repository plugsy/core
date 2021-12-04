import type { ItemServer, ConnectionPool } from "@plugsy/connectors";
import { Logger } from "winston";

export interface ContextDependencies {
  itemServer: ItemServer;
  connectionPool: ConnectionPool;
  logger: Logger;
}

export const initConnectorContext = ({
  logger,
  itemServer,
  connectionPool,
}: ContextDependencies) => {
  logger = logger.child({ component: "initContext" });
  logger.verbose("Initialising connector context");
  return {
    statusConnectors: {
      itemServer,
      connectionPool,
    },
  };
};

export type ConnectorContext = ReturnType<typeof initConnectorContext>;
