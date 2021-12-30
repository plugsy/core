import {
  QueryResolvers,
  SubscriptionResolvers,
  ItemResolvers,
  Item as GQLItem,
  StatusConnectorsPluginResolvers,
} from "./schema";
import { firstValueFrom } from "rxjs";
import { latestValueFrom as toAsyncIterable } from "rxjs-for-await";
import { Category as GQLCategory, Connection as GQLConnection } from "./schema";
import { map } from "rxjs/operators";
import { addMilliseconds, differenceInMilliseconds } from "date-fns";
import { MutationResolvers } from "./schema";

export const Query: Partial<QueryResolvers> = {
  theme: async (_, __, { theme$ }) => {
    return await firstValueFrom(theme$);
  },

  categories: async (_, __, { statusConnectors: { itemServer } }) => {
    return await firstValueFrom(itemServer.categories$);
  },
  items: async (_, __, { statusConnectors: { itemServer } }) => {
    return await firstValueFrom(itemServer.items$);
  },
  connections: async (_, __, { statusConnectors: { itemServer } }) => {
    return await firstValueFrom(itemServer.connectionData$);
  },
};

export const Mutation: Partial<MutationResolvers> = {
  agentUpdate: async (
    _,
    { localTime, connectionData },
    { statusConnectors: { connectionPool } }
  ) => {
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
  categories: {
    subscribe: (_, __, { statusConnectors: { itemServer } }) => {
      return toAsyncIterable(itemServer.categories$);
    },
    resolve: (x: GQLCategory[]) => x,
  },
  items: {
    subscribe: (_, __, { statusConnectors: { itemServer } }) => {
      return toAsyncIterable(itemServer.items$);
    },
    resolve: (x: GQLItem[]) => x,
  },
  connections: {
    subscribe: (_, __, { statusConnectors: { itemServer } }) => {
      return toAsyncIterable(itemServer.connectionData$);
    },
    resolve: (x: GQLConnection[]) => x,
  },
  theme: {
    subscribe: (_, __, { theme$ }) => {
      return toAsyncIterable(theme$);
    },
    resolve: (x: any[]) => x,
  },
};

export const Item: Partial<ItemResolvers> = {
  children: async ({ name }, __, { statusConnectors: { itemServer } }) => {
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
