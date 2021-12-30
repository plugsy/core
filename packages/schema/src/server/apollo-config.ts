import {
  distinctUntilChanged,
  map,
  Observable,
  combineLatest,
  debounce,
  timer,
  from,
  share,
  withLatestFrom,
} from "rxjs";
import { Logger } from "winston";
import { ApolloServerExpressConfig } from "apollo-server-express";
import path from "path";

import { addResolversToSchema } from "@graphql-tools/schema";
import { loadSchema } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { PlugsyContext, PlugsyConfig, ServerPluginFn } from "./types";
import { nanoid } from "nanoid";
import { stitchSchemas } from "@graphql-tools/stitch";
import { pluginManager$ } from "./plugin-manager";
import { resolvers } from "./resolvers";

const schemaPaths = [path.join(__dirname, "schema/index.core.graphql")];

export const plugsyApolloServerConfig$ = (
  logger: Logger,
  config$: Observable<PlugsyConfig>,
  plugins: { [key: string]: ServerPluginFn<any, any> }
): Observable<ApolloServerExpressConfig> => {
  const pluginConfig$ = config$.pipe(map(({ plugins }) => plugins));
  const components$ = config$.pipe(map(({ plugins }) => plugins));

  const baseSchema$ = from(
    (async () => {
      logger.verbose("Loading base schema", { schemaPaths });
      const schema = await loadSchema(schemaPaths, {
        loaders: [new GraphQLFileLoader()],
      });

      logger.verbose("Adding resolvers to schema");
      return addResolversToSchema({
        schema,
        resolvers,
      });
    })()
  ).pipe(share());

  const plugins$ = pluginManager$({
    logger: logger.child({ component: "pluginManager$" }),
    config$: pluginConfig$,
    types: plugins,
    baseSchemaPaths: schemaPaths,
  }).pipe(
    distinctUntilChanged((previous, current) => {
      const previousSchemaPaths = Object.keys(previous);
      const currentSchemaPaths = Object.keys(current);
      const schemasChanged =
        JSON.stringify(previousSchemaPaths) ===
        JSON.stringify(currentSchemaPaths);
      logger.verbose(`Schemas have ${schemasChanged ? "" : "not "}`, {
        schemasChanged,
        previousSchemaPaths,
        currentSchemaPaths,
      });
      return schemasChanged;
    })
  );

  const schema$ = plugins$.pipe(
    withLatestFrom(baseSchema$),
    map(([plugins, baseSchema]) => [
      ...Object.values(plugins).flatMap(({ schema }) => schema),
      baseSchema,
    ]),
    map((subschemas) =>
      stitchSchemas({
        subschemas,
      })
    )
  );

  const context$ = plugins$.pipe(
    map((plugins) => (): PlugsyContext => {
      const requestId = nanoid(6);
      const pluginContexts = Object.entries(plugins).reduce(
        (accumulator, [id, { plugin }]) => ({
          ...accumulator,
          ...plugin.getContext?.(logger.child({ pluginId: id, requestId })),
        }),
        {} as any
      );
      return {
        ...pluginContexts,
        logger: logger.child({ requestId: nanoid(6) }),
        plugins$,
        components$,
        reload: () => {
          throw new Error("Not yet implemented");
        },
      };
    })
  );

  return combineLatest([schema$, context$]).pipe(
    map(
      ([schema, context]): ApolloServerExpressConfig => ({ schema, context })
    ),
    debounce(() => timer(1000))
  );
};
