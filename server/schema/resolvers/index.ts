import {
  QueryResolvers,
  MutationResolvers,
  SubscriptionResolvers,
  ItemResolvers,
  Item as GQLItem,
} from "../typeDefs";
import { firstValueFrom, timer } from "rxjs";
import { latestValueFrom as toAsyncIterable } from "rxjs-for-await";
import {
  Category as GQLCategory,
  Connection as GQLConnection,
} from "../typeDefs";
import { map } from "rxjs/operators";

export const Query: QueryResolvers = {
  categories: async (_, __, { categories$ }) => {
    return await firstValueFrom(categories$);
  },
  items: async (_, __, { items$ }) => {
    return await firstValueFrom(items$);
  },
  connections: async (_, __, { connectionData$ }) => {
    return await firstValueFrom(connectionData$);
  },
  serverTime: () => {
    return new Date();
  },
};

export const Mutation: MutationResolvers = {};

export const Subscription: SubscriptionResolvers = {
  categories: {
    subscribe: (_, __, { categories$ }) => {
      return toAsyncIterable(categories$);
    },
    resolve: (x: GQLCategory[]) => x,
  },
  items: {
    subscribe: (_, __, { items$ }) => {
      return toAsyncIterable(items$);
    },
    resolve: (x: GQLItem[]) => x,
  },
  connections: {
    subscribe: (_, __, { connectionData$ }) => {
      return toAsyncIterable(connectionData$);
    },
    resolve: (x: GQLConnection[]) => x,
  },
  serverTime: {
    subscribe: () => {
      return toAsyncIterable(timer(0, 5000).pipe(map(() => new Date())));
    },
    resolve: (x: Date) => x,
  },
};

export const Item: ItemResolvers = {
  children: async ({ name }, __, { items$ }) => {
    if (!name) return [];
    return await firstValueFrom(
      items$.pipe(
        map((items) => {
          return items.filter(({ parents }) =>
            parents.some(
              (parent) => parent.toLowerCase() === name.toLowerCase()
            )
          );
        })
      )
    );
  },
};
