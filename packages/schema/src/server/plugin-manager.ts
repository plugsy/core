import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadSchema } from "@graphql-tools/load";
import { addResolversToSchema } from "@graphql-tools/schema";
import { PluginConfig, PluginMap, InitialisedPluginMap } from "./types";
import { Observable, Subject, BehaviorSubject, switchMap } from "rxjs";
import { Logger } from "winston";

export const pluginManager$ = ({
  logger,
  config$,
  types,
  baseSchemaPaths = [],
}: {
  logger: Logger;
  config$: Observable<PluginConfig<any, any>[]>;
  types: PluginMap;
  baseSchemaPaths?: string[];
}): Observable<InitialisedPluginMap> => {
  const configMap: { [key: string]: Subject<any> } = {};
  const pluginMap: InitialisedPluginMap = {};
  return config$.pipe(
    // concatMap(async (plugins) => {
    //   await loadPlugins(
    //     logger.child({ component: "loadPlugins" }),
    //     plugins.map((plugin) => plugin.type)
    //   );
    //   return plugins;
    // }),
    switchMap(async (plugins) => {
      const promises = plugins.map(async ({ id, type, config }) => {
        const key = id ?? `plugin-${type}`;
        const logConfig = { type, pluginId: key };
        const mapConfig = configMap[key];
        const config$ = mapConfig ?? new BehaviorSubject(config);
        if (!mapConfig) {
          logger.info(`Initialising config`, logConfig);
          configMap[key] = config$;
        } else {
          logger.verbose(`Pushing config change`, logConfig);
          config$.next(config);
        }
        const mapPlugin = pluginMap[key];
        if (!mapPlugin) {
          const pluginType = types[type];
          if (!pluginType) {
            throw new Error(`Unable to load plugin type: ${type}`);
          }
          logger.info(`Initialising plugin`, logConfig);
          const plugin = await pluginType(
            logger.child({ pluginId: key, type, component: "plugin" }),
            key,
            config$
          );
          logger.info("Initialising schema", logConfig);
          const schema = await loadSchema(
            [...baseSchemaPaths, ...plugin.schemaPaths],
            {
              loaders: [new GraphQLFileLoader()],
            }
          );

          logger.info("Initialising resolvers", logConfig);
          const schemaWithResolvers = addResolversToSchema(
            schema,
            plugin.resolvers
          );
          const initResult = { type, schema: schemaWithResolvers, plugin };
          pluginMap[key] = initResult;
          return { id: key, ...initResult };
        }
        return { id: key, ...mapPlugin };
      });
      const loadedPlugins = await Promise.all(promises);
      const loadedPluginIds = loadedPlugins.map(({ id }) => id);
      Object.keys(pluginMap).forEach((id) => {
        if (!loadedPluginIds.find((loadedId) => loadedId === id)) {
          logger.verbose("Plugin no longer configured", { id });
          delete pluginMap[id];
        }
      });

      return loadedPlugins.reduce(
        (accumulator, { id, ...plugin }) => ({ ...accumulator, [id]: plugin }),
        {} as typeof pluginMap
      );
    })
  );
};

export type PluginManager = ReturnType<typeof pluginManager$>;
