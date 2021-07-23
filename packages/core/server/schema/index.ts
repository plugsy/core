import { makeExecutableSchema } from "@graphql-tools/schema";
import { NextPageContext } from "next";
import { ContextDependencies, initContext } from "./context";
import { DateScalarType } from "../../lib/apollo/scalars/Date";
import { resolvers as scalarResolvers } from "graphql-scalars";

import * as resolvers from "./resolvers";
// A bit gross... Yarn Berry won't let us use `import indexSchema from "@plugsy/schema/index.graphql"`
import indexSchema from "../../../schema/dist/index.graphql";
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
