import {
  BehaviorSubject,
  combineLatest,
  Observable,
  ReplaySubject,
} from "rxjs";
import { map, share, tap } from "rxjs/operators";
import type { ConnectionData } from "../connectors/model";
import { Logger } from "winston";

export function createConnectionPool(logger: Logger) {
  logger = logger.child({
    component: "connectionPool",
  });
  const internalConnections$ = new BehaviorSubject<
    Observable<ConnectionData>[]
  >([]);
  const externalConnections$ = new BehaviorSubject<
    Observable<ConnectionData>[]
  >([]);

  const setInternalConnections = (
    connections: Observable<ConnectionData>[]
  ) => {
    logger.info("setInternalConnections", {
      count: connections.length,
    });
    internalConnections$.next(connections);
  };

  const externalConnections: {
    [key: string]: BehaviorSubject<ConnectionData>;
  } = {};

  const updateExternalConnection = (connection: ConnectionData) => {
    let connectionToUpdate = externalConnections[connection.id];
    if (!connectionToUpdate) {
      logger.info("updateExternalConnection.added", {
        id: connection.id,
      });
      connectionToUpdate = externalConnections[connection.id] =
        new BehaviorSubject(connection);
      externalConnections$.next(Object.values(externalConnections));
    } else {
      logger.debug("updateExternalConnection.updated", {
        id: connection.id,
      });
      connectionToUpdate.next(connection);
    }
  };

  const connections$ = combineLatest([
    internalConnections$,
    externalConnections$,
  ]).pipe(
    map(([connections, externalConnections]) => [
      ...connections,
      ...externalConnections,
    ]),
    tap((connections) => {
      logger.debug("connections$.changed", {
        count: connections.length,
      });
    }),
    share({
      connector: () => new ReplaySubject(1),
      resetOnComplete: false,
      resetOnError: false,
      resetOnRefCountZero: false,
    })
  );

  return {
    setInternalConnections,
    updateExternalConnection,
    connections$,
  };
}

export type ConnectionPool = ReturnType<typeof createConnectionPool>;
