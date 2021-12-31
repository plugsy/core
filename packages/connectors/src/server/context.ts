import { Logger } from "winston";
import { ConnectionPool } from "./connection-pool";
import { ItemServer } from "./item-server";

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
    itemServer,
    connectionPool,
  };
};

export type ConnectorContext = ReturnType<typeof initConnectorContext>;
