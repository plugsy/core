import { InMemoryCache, ApolloClient, ApolloLink } from "@apollo/client";
import ApolloLogger from "apollo-link-logger";
import { IncomingMessage, ServerResponse } from "http";
import { createIsomorphLink } from "./links";
import { DateScalarType } from "./scalars/Date";

export type ResolverContext = {
  req?: IncomingMessage;
  res?: ServerResponse;
};

const createCache = (initialState?: any) => {
  return new InMemoryCache({
    typePolicies: {},
  }).restore(initialState || {});
};

const resolvers: any = {
  Date: DateScalarType,
  DateTime: DateScalarType,
};

export const createApolloClient = (opts?: {
  log?: boolean;
  ssrMode?: boolean;
  initialState?: any;
  links?: ApolloLink[];
}): ApolloClient<any> => {
  const client = new ApolloClient({
    resolvers,
    link: ApolloLink.from([
      ...(opts?.log ? [ApolloLogger] : []),
      ...(opts?.links ?? []),
    ]),
    ssrMode: !!opts?.ssrMode,
    cache: createCache(opts?.initialState),
    defaultOptions: {
      query: {
        errorPolicy: "all",
      },
    },
  });

  return client;
};

export const apolloClient = createApolloClient({
  ssrMode: typeof window === "undefined",
  links: [createIsomorphLink()],
});
