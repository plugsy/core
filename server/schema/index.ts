import { SchemaLink } from "@apollo/client/link/schema";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { NextPageContext } from "next";
import { initContext } from "./context";

import * as resolvers from "./resolvers";
import indexSchema from "./typeDefs/index.server.graphql";
export const schemas = [indexSchema];

export const schema = makeExecutableSchema({
  typeDefs: schemas,
  resolvers,
});

export const schemaLink = (ctx?: NextPageContext) => {
  return new SchemaLink(serverOptions(ctx));
};

export const serverOptions = (ctx?: NextPageContext) => {
  return {
    schema,
    context: initContext(ctx),
  };
};

export * from "./context";