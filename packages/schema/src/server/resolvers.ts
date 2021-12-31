import {
  MutationResolvers,
  QueryResolvers,
  SubscriptionResolvers,
} from "./schema";
import { resolvers as scalarResolvers } from "graphql-scalars";
import { firstValueFrom, map, timer } from "rxjs";
import { latestValueFrom as toAsyncIterable } from "rxjs-for-await";

const Query: QueryResolvers = {
  version: () => process.env.npm_package_version ?? "N/A",
  components: async (_, __, { components$ }) =>
    await firstValueFrom(components$),
  loadedPlugins: async (_, __, { plugins$ }) => {
    const plugins = await firstValueFrom(plugins$);
    return Object.keys(plugins);
  },
  theme: async (_, __, { theme$ }) => await firstValueFrom(theme$),
  serverTime: () => {
    return new Date();
  },
};

const Mutation: MutationResolvers = {
  reload: async (_, __, { reload }) => {
    await reload();
  },
};

const Subscription: SubscriptionResolvers = {
  components: {
    subscribe: (_, __, { components$ }) => {
      return toAsyncIterable(components$);
    },
    resolve: (x: any) => x,
  },
  loadedPlugins: {
    subscribe: (_, __, { plugins$ }) => {
      return toAsyncIterable(
        plugins$.pipe(map((plugins) => Object.keys(plugins)))
      );
    },
    resolve: (x: string[]) => x,
  },
  theme: {
    subscribe: (_, __, { theme$ }) => {
      return toAsyncIterable(theme$);
    },
    resolve: (x: any) => x,
  },
  serverTime: {
    subscribe: () => {
      return toAsyncIterable(timer(0, 5000).pipe(map(() => new Date())));
    },
    resolve: (x: Date) => x,
  },
};

export const resolvers = {
  Query,
  Subscription,
  Mutation,
  Void: scalarResolvers.Void,
};
