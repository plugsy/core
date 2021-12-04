import { PluginFn } from "@plugsy/schema";
import path from "path";
import { map, timer } from "rxjs";
import { latestValueFrom as toAsyncIterable } from "rxjs-for-await";
import {
  QueryResolvers,
  SubscriptionResolvers,
} from "./server-time.generated.graphql";

export const Query: Partial<QueryResolvers> = {
  serverTime: () => {
    return new Date();
  },
};

export const Subscription: Partial<SubscriptionResolvers> = {
  serverTime: {
    subscribe: () => {
      return toAsyncIterable(timer(0, 5000).pipe(map(() => new Date())));
    },
    resolve: (x: Date) => x,
  },
};

export const ServerTimePlugin: PluginFn = async () => {
  return {
    resolvers: {
      Query,
      Subscription,
    },
    schemaPaths: [path.join(__dirname, "./server-time.core.graphql")],
  };
};
