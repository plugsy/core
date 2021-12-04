import { makeExecutableSchema } from "@graphql-tools/schema";
import { NextPageContext } from "next";
import { ContextDependencies, initContext } from "./context";
import { DateScalarType } from "../../lib/apollo/scalars/Date";
import { resolvers as scalarResolvers } from "graphql-scalars";
import { PluginFn } from "@plugsy/schema";

import * as resolvers from "./resolvers";
import indexSchema from "@plugsy/schema/dist/index.graphql";
import path from "path";
export const schemas = [indexSchema];

export const schema = makeExecutableSchema({
  typeDefs: schemas,
  resolvers: {
    ...resolvers,
    Void: scalarResolvers.Void,
    JSONObject: scalarResolvers.JSONObject,
    Date: DateScalarType,
  },
});

export const serverOptions = (
  dependencies: ContextDependencies,
  ctx?: NextPageContext
) => {
  return {
    schema,
    context: initContext({ ...dependencies, ctx }),
    
  };
};

export * from "./context";

export const ServerPlugin: PluginFn = async () => {
  return {
    resolvers: 
    schemaPaths: [path.join(__dirname, "./schema/index.core.graphql")],
  };
};
