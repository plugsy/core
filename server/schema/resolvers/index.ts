import {
  QueryResolvers,
  MutationResolvers,
  SubscriptionResolvers,
  ItemResolvers,
  Item as GQLItem,
} from "../typeDefs";
import { firstValueFrom } from "rxjs";
import { latestValueFrom as toAsyncIterable } from "rxjs-for-await";
import {
  Category as GQLCategory,
  Connection as GQLConnection,
} from "../typeDefs";
import { DateScalarType } from "../../../lib/apollo/scalars/Date";
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
};

export const Date = DateScalarType;

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