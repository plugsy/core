import { WebSocketLink } from "@apollo/client/link/ws";
import { split } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";

export function createIsomorphLink(origin?: string) {
  const { HttpLink } = require("@apollo/client");
  const httpLink = new HttpLink({
    uri: `${origin ?? ""}/graphql`,
    credentials: "include",
  });
  if (typeof window === "undefined") {
    return httpLink;
  } else {
    let scheme = location.protocol === "https:" ? "wss" : "ws";
    const wsLink = new WebSocketLink({
      uri: `${scheme}://${location.host}/graphql`,
      options: {
        lazy: true,
        reconnect: true,
        timeout: 300000,
        minTimeout: 30000,
      },
    });

    return split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      httpLink
    );
  }
}
