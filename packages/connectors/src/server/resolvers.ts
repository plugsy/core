import {
  QueryResolvers,
  SubscriptionResolvers,
  ItemResolvers,
  Item as GQLItem,
} from "./schema";
import { firstValueFrom } from "rxjs";
import { latestValueFrom as toAsyncIterable } from "rxjs-for-await";
import { Category as GQLCategory, Connection as GQLConnection } from "./schema";
import { map } from "rxjs/operators";
import { addMilliseconds, differenceInMilliseconds } from "date-fns";
import { MutationResolvers } from "./schema";

export const Query: Partial<QueryResolvers> = {
  categories: async (_, __, { itemServer }) => {
    return await firstValueFrom(itemServer.categories$);
  },
  items: async (_, __, { itemServer }) => {
    return await firstValueFrom(itemServer.items$);
  },
  connections: async (_, __, { itemServer }) => {
    return await firstValueFrom(itemServer.connectionData$);
  },
};

export const Mutation: Partial<MutationResolvers> = {
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
