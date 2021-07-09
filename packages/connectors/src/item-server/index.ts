import { map, share, switchMap, tap } from "rxjs/operators";
import { ConnectionData, Item } from "../connectors/model";
import { combineLatest, Observable, ReplaySubject } from "rxjs";
import { Logger } from "winston";

interface Category {
  name: string;
  items: Item[];
}

export function createItemServer(
  connections$: Observable<Observable<ConnectionData>[]>,
  logger: Logger
) {
  logger = logger.child({
    component: "itemServer",
  });
  const connectionData$ = connections$.pipe(
    switchMap((connections) => combineLatest(connections)),
    tap((connectionData) =>
      logger.verbose("connectionData$.changed", {
        count: connectionData.length,
      })
    ),
    share({
      connector: () => new ReplaySubject(1),
      resetOnComplete: false,
      resetOnError: false,
      resetOnRefCountZero: false,
    })
  );

  const items$ = connectionData$.pipe(
    map((connectionData) =>
      connectionData.reduce<Item[]>(
        (items, data) => [...items, ...data.items],
        []
      )
    ),
    tap((items) => {
      logger.verbose("items$.changed", {
        count: items.length,
      });
    }),
    share({
      connector: () => new ReplaySubject(1),
      resetOnComplete: false,
      resetOnError: false,
      resetOnRefCountZero: false,
    })
  );

  const categories$ = items$.pipe(
    map((items) =>
      items
        .reduce<Category[]>((categories, item) => {
          if (!item.category) return categories;
          const existingCategory = categories.find(
            (category) => category.name === item.category
          );
          if (existingCategory) {
            existingCategory.items = [...existingCategory.items, item];
            return categories;
          }
          return [...categories, { name: item.category, items: [item] }];
        }, [])
        .map(({ items, ...rest }) => ({
          ...rest,
          items: items.sort((a, b) => {
            if (!a.name) return 1;
            if (!b.name) return -1;
            if (a.name < b.name) {
              return -1;
            }
            if (a.name > b.name) {
              return 1;
            }
            return 0;
          }),
        }))
        .sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        })
    ),
    tap((items) => {
      logger.verbose("categories$.changed", {
        count: items.length,
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
    connectionData$,
    items$,
    categories$,
  };
}

export type ItemServer = ReturnType<typeof createItemServer>;
