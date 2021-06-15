import {
  QueryResolvers,
  MutationResolvers,
  SubscriptionResolvers,
  ContainerResolvers,
} from "../typeDefs";
import { firstValueFrom } from "rxjs";
import { latestValueFrom as toAsyncIterable } from "rxjs-for-await";
import {
  Category as GQLCategory,
  Container as GQLContainer,
} from "../typeDefs";
import { DateScalarType } from "../../../lib/apollo/scalars/Date";
import { map } from "rxjs/operators";

export const Query: QueryResolvers = {
  categories: async (_, __, { categories$ }) => {
    return await firstValueFrom(categories$);
  },

  connected: async (_, __, { connected$ }) => {
    const val = await firstValueFrom(connected$);
    return val;
  },

  containers: async (_, __, { containers$ }) => {
    return await firstValueFrom(containers$);
  },
  error: async (_, __, { error$ }) => {
    return await firstValueFrom(error$);
  },
  lastUpdated: async (_, __, { lastUpdated$ }) => {
    return await firstValueFrom(lastUpdated$);
  },
};

export const Mutation: MutationResolvers = {};

export const Subscription: SubscriptionResolvers = {
  connected: {
    subscribe: (_, __, { connected$ }) => {
      return toAsyncIterable(connected$);
    },
    resolve: (x: boolean) => x,
  },
  lastUpdated: {
    subscribe: (_, __, { lastUpdated$ }) => {
      return toAsyncIterable(lastUpdated$);
    },

    resolve: (x: Date | null) => x,
  },
  error: {
    subscribe: (_, __, { error$ }) => {
      return toAsyncIterable(error$);
    },
    resolve: (x: string | null) => x,
  },
  categories: {
    subscribe: (_, __, { categories$ }) => {
      return toAsyncIterable(categories$);
    },
    resolve: (x: GQLCategory[]) => x,
  },
  containers: {
    subscribe: (_, __, { containers$ }) => {
      return toAsyncIterable(containers$);
    },
    resolve: (x: GQLContainer[]) => x,
  },
};

export const Date = DateScalarType;

export const Container: ContainerResolvers = {
  children: async ({ name }, __, { containers$ }) => {
    if (!name) return [];
    return await firstValueFrom(
      containers$.pipe(
        map((containers) =>
          containers.filter(({ parents }) =>
            parents.some(
              (parent) => parent.toLowerCase() === name.toLowerCase()
            )
          )
        )
      )
    );
  },
};
