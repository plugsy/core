import { ConnectorPlugin, ConnectorPluginConfig } from "@plugsy/connectors";
import { Plugin } from "@plugsy/schema";
import {
  map,
  Observable,
  groupBy,
  mergeAll,
  distinctUntilChanged,
  Subject,
  BehaviorSubject,
  switchMap,
  toArray,
} from "rxjs";
import { Logger } from "winston";

import { all as deepMerge } from "deepmerge";
import { nullFilter } from "lib/null-filter";
import { IResolvers } from "apollo-server-express";

interface PluginConfig<T extends string, C> {
  id?: string;
  type: T;
  config: C;
}

export type PlugsyPluginsConfig = PluginConfig<
  "connectors",
  ConnectorPluginConfig
>;

export const pluginManager$ = (
  logger: Logger,
  plugins: Observable<PlugsyPluginsConfig[]>
) => {
  const pluginMap = new Map<
    string,
    { plugin: Plugin; config$: Subject<any> }
  >();
  return plugins.pipe(
    mergeAll(),
    groupBy((config) => config.id ?? `plugin-${config.type}`),
    map((group) => {
      const key = group.key;
      return group.pipe(
        distinctUntilChanged(
          (prev, after) => JSON.stringify(prev) === JSON.stringify(after)
        ),
        switchMap(async ({ config, type }) => {
          const mapResult = pluginMap.get(key);
          if (!mapResult) {
            logger.info(`Initialising plugin: [${type}] ${key}`);
            const config$ = new BehaviorSubject(config);
            switch (type) {
              case "connectors":
                const plugin = await ConnectorPlugin(
                  logger.child({ component: `ConnectorPlugin[${key}]` }),
                  config$
                );
                pluginMap.set(key, { plugin, config$ });
                return plugin;
              default:
                logger.error(`Unknown plugin entered: ${type}`);
                return undefined;
            }
          } else {
            mapResult.config$.next(config);
          }
          return mapResult.plugin;
        }),
        toArray()
      );
    }),
    mergeAll(),
    map((pl) => {
      console.log(pl);
      return pluginMap;
    }),
    map((plugins) => {
      const pluginArr = [...plugins.values()];

      const resolvers = deepMerge(
        pluginArr.map(({ plugin }) => plugin.resolvers).filter(nullFilter)
      ) as IResolvers;

      const schemaPaths = pluginArr
        .flatMap(({ plugin }) => plugin.schemaPaths)
        .filter(nullFilter);

      const context = () =>
        deepMerge(
          pluginArr
            .map(({ plugin }) => plugin.getContext?.())
            .filter(nullFilter)
        );

      const onTeardown = () =>
        pluginArr
          //TODO: I think this needs to be a teardown on the previous value
          // (Do a pipe(startWith(null), pairwise()))
          .forEach(({ plugin }) => plugin.onTeardown?.());
      return {
        resolvers,
        schemaPaths,
        onTeardown,
        context,
      };
    })
  );
};
