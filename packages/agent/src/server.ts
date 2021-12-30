import { createLogger, loadConfig } from "@plugsy/common";
import {
  ConnectorPlugin,
  ConnectorPluginConfig,
  DEFAULT_CONNECTOR_PLUGIN_CONFIG,
} from "@plugsy/connectors";
import { filter, map, ReplaySubject, share } from "rxjs";
import { Logger } from "winston";
import schema from "./config-schema.json";
import { environment } from "./environment";

export interface Config extends ConnectorPluginConfig {
  loggingLevel?: string;
}

async function tryQuietly(fn: () => any | Promise<any>) {
  return async () => {
    try {
      await fn();
    } catch {}
  };
}

function watchConfig(filePath: string, logger: Logger) {
  logger = logger.child({
    component: "watchConfig",
  });
  const config$ = loadConfig<Config>(
    filePath,
    logger,
    DEFAULT_CONNECTOR_PLUGIN_CONFIG,
    [
      {
        name: "AgentConfig",
        schema,
      },
    ]
  ).pipe(
    share({
      connector: () => new ReplaySubject(1),
      resetOnComplete: true,
      resetOnError: true,
      resetOnRefCountZero: true,
    })
  );
  const loggingLevel$ = config$.pipe(
    map((config) => config.loggingLevel),
    filter(Boolean)
  );

  return {
    loggingLevel$,
    config$,
  };
}

async function startServer() {
  const { localConfigFile, loggingLevel, agentEndpoint } = environment();
  const logger = createLogger(loggingLevel);
  logger.verbose("watchConfig");
  const { config$, loggingLevel$ } = watchConfig(localConfigFile, logger);

  const loggingLevelSubscription = loggingLevel$.subscribe(
    (level) => (logger.level = level)
  );

  const connectorPlugin = await ConnectorPlugin(
    logger.child({ component: "ConnectorPlugin" }),
    "N/A",
    config$.pipe(
      map(({ agent, ...config }) => ({
        ...config,
        agent:
          agent ||
          (agentEndpoint
            ? {
                endpoint: agentEndpoint,
              }
            : undefined),
      }))
    )
  );

  const teardowns = [connectorPlugin.onTeardown];

  async function closeServer() {
    logger.info("Stopping Server");
    teardowns.forEach((fn) => fn?.());
    await tryQuietly(loggingLevelSubscription.unsubscribe);
    logger.info("Server Stopped");
    process.exit(0);
  }

  process.on("SIGTERM", closeServer);
  process.on("SIGINT", closeServer);
  logger.info(`> Agent Started`);
}

startServer();
