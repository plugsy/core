import { NextPageContext } from "next";
import { WebSocketLink } from "@apollo/client/link/ws";
import { split } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";

export function createIsomorphLink(opts?: {
  headers: { [key: string]: string | undefined };
  ctx?: NextPageContext;
}) {
  if (typeof window === "undefined") {
    const { schemaLink } = require("../../../server/schema");
    return schemaLink(opts?.ctx);
  } else {
    const { HttpLink } = require("@apollo/client");
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

    const httpLink = new HttpLink({
      uri: "/graphql",
      credentials: "include",
      ...opts,
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
