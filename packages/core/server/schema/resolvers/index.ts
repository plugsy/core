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
import differenceInMilliseconds from "date-fns/differenceInMilliseconds";
import addMilliseconds from "date-fns/addMilliseconds";

export const Query: Partial<QueryResolvers> = {
  theme: async (_, __, { theme$ }) => {
    return await firstValueFrom(theme$);
  },
  categories: async (_, __, { itemServer }) => {
    return await firstValueFrom(itemServer.categories$);
  },
  items: async (_, __, { itemServer }) => {
    return await firstValueFrom(itemServer.items$);
  },
  connections: async (_, __, { itemServer }) => {
    return await firstValueFrom(itemServer.connectionData$);
  },
  serverTime: () => {
    return new Date();
  },
};

export const Mutation: MutationResolvers = {
  agentUpdate: async (_, { localTime, connectionData }, { connectionPool }) => {
    const msOut = differenceInMilliseconds(new Date(), localTime);
    connectionData
      .map(({ lastUpdated, ...data }) => ({
        ...data,
        lastUpdated: lastUpdated ? addMilliseconds(lastUpdated, msOut) : null,
      }))
      .forEach(connectionPool.updateExternalConnection);
  },
};

export const Subscription: Partial<SubscriptionResolvers> = {
  theme: {
    subscribe: (_, __, { theme$ }) => {
      return toAsyncIterable(theme$);
    },
    resolve: (x: any[]) => x,
  },
  categories: {
    subscribe: (_, __, { itemServer }) => {
      return toAsyncIterable(itemServer.categories$);
    },
    resolve: (x: GQLCategory[]) => x,
  },
  items: {
    subscribe: (_, __, { itemServer }) => {
      return toAsyncIterable(itemServer.items$);
    },
    resolve: (x: GQLItem[]) => x,
  },
  connections: {
    subscribe: (_, __, { itemServer }) => {
      return toAsyncIterable(itemServer.connectionData$);
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

export const Item: Partial<ItemResolvers> = {
  children: async ({ name }, __, { itemServer }) => {
    if (!name) return [];
    return await firstValueFrom(
      itemServer.items$.pipe(
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
