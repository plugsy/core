import { map, tap } from "rxjs/operators";
import { initialiseConnectionPool } from "./connection-pool";
import { getServerConfig } from "./config";
import { getConnector } from "./connectors";
import { categoriser } from "./categoriser";
import { Item } from "./connectors/model";
import {
  State as GQLState,
  ConnectorType as GQLConnectorType,
} from "../../typeDefs";

function toGQLItem({ state, connectorType, ...item }: Item) {
  const gqlState = (() => {
    switch (state) {
      case "GREEN":
        return GQLState.Green;
      case "GREY":
        return GQLState.Grey;
      case "RED":
        return GQLState.Red;
      case "YELLOW":
        return GQLState.Yellow;
    }
  })();
  const gqlConnectorType = (() => {
    switch (connectorType) {
      case "docker":
        return GQLConnectorType.Docker;
      case "raw":
        return GQLConnectorType.Raw;
      case "website":
        return GQLConnectorType.Website;
    }
  })();
  return {
    ...item,
    state: gqlState,
    connectorType: gqlConnectorType,
  };
}

function initialiseItemServer() {
  const { connectionData$, setConnections, items$ } =
    initialiseConnectionPool();

  getServerConfig()
    .pipe(
      map((config) => config.connectors),
      map((connectors) => {
        if (Array.isArray(connectors)) {
          return connectors.map(getConnector);
        }
        return [getConnector(connectors)];
      }),
      tap((connectors) =>
        console.log(`Loading ${connectors.length} connectors...`)
      )
    )
    .subscribe((connections) => setConnections(connections));
  const categories$ = categoriser(items$);
  return {
    categories$: categories$.pipe(
      map((categories) =>
        categories.map(({ name, items }) => ({
          name,
          items: items.map(toGQLItem),
        }))
      )
    ),
    items$: items$.pipe(map((items) => items.map(toGQLItem))),
    connectionData$: connectionData$.pipe(
      map((connections) =>
        connections.map(({ items, ...connection }) => ({
          ...connection,
          items: items.map(toGQLItem),
        }))
      )
    ),
  };
}

let itemServer: ReturnType<typeof initialiseItemServer> | null = null;

export const getItemServer = () =>
  itemServer ?? (itemServer = initialiseItemServer());
