import { parseISO, formatISO } from "date-fns";
import {
  GraphQLScalarType,
  GraphQLScalarSerializer,
  GraphQLScalarValueParser,
  GraphQLScalarLiteralParser,
} from "graphql";
import { Kind } from "graphql/language";

const serialize: GraphQLScalarSerializer<any> = (value) => {
  return value instanceof Date ? formatISO(value) : null;
};

const parseValue: GraphQLScalarValueParser<any> = (value) => {
  return value == null ? null : parseISO(value);
};

const parseLiteral: GraphQLScalarLiteralParser<any> = (ast) => {
  return ast.kind === Kind.STRING ? parseValue(ast.value) : null;
};

export const DateScalarType = new GraphQLScalarType({
  name: "Date",
  description: "JavaScript Date object as an ISO timestamp",
  serialize,
  parseValue,
  parseLiteral,
});
