import { BehaviorSubject, combineLatest } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import type { Connection, Item } from "./connectors/model";

export function initialiseConnectionPool() {
  const connections$ = new BehaviorSubject<Connection[]>([]);

  const setConnections = (connection: Connection[]) =>
    connections$.next(connection);

  const connectionData$ = connections$.pipe(
    switchMap((connections) => combineLatest(connections))
  );
  const items$ = connectionData$.pipe(
    map((connectionData) =>
      connectionData.reduce<Item[]>(
        (items, data) => [...items, ...data.items],
        []
      )
    )
  );

  return {
    setConnections,
    items$,
    connections$,
    connectionData$,
  };
}
