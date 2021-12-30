import type { ItemServer, ConnectionPool } from "@plugsy/connectors";
import { Observable } from "rxjs";
import { Logger } from "winston";

export interface ContextDependencies {
  theme$: Observable<any>;
  itemServer: ItemServer;
  connectionPool: ConnectionPool;
  logger: Logger;
}

export const initConnectorContext = ({
  logger,
  itemServer,
  connectionPool,
  theme$
}: ContextDependencies) => {
  logger = logger.child({ component: "initContext" });
  logger.verbose("Initialising connector context");
  return {
    statusConnectors: {
      itemServer,
      connectionPool,
      theme$
    },
  };
};

export type ConnectorContext = ReturnType<typeof initConnectorContext>;
