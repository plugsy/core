import { QueryResolvers, SubscriptionResolvers } from "./theme.generated.graphql";
import { firstValueFrom, timer } from "rxjs";
import { latestValueFrom as toAsyncIterable } from "rxjs-for-await";
import { map } from "rxjs/operators";
import path from "path";

export const Query: Partial<QueryResolvers> = {
  theme: async (_, __, { theme$ }) => {
    return await firstValueFrom(theme$);
  },
};
 
export const Subscription: Partial<SubscriptionResolvers> = {
  theme: {
    subscribe: (_, __, { theme$ }) => {
      return toAsyncIterable(theme$);
    },
    resolve: (x: any[]) => x,
  },
};


export const ThemePlugin: PluginFn = async () => {
    return {
      resolvers: {
        Query,
        Subscription,
      },
      schemaPaths: [path.join(__dirname, "./server-time.core.graphql")],
    };
  };